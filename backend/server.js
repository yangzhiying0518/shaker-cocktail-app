const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AIServiceFactory = require('./services/ai-service-factory');

// 导入优化工具
const connectionPool = require('./utils/connection-pool');
const cacheManager = require('./utils/cache-manager');

// 请求去重管理器
class RequestDeduplicator {
    constructor() {
        this.activeRequests = new Map();
    }

    // 生成请求键
    generateKey(userInput) {
        return require('crypto').createHash('md5')
            .update(JSON.stringify(userInput))
            .digest('hex');
    }

    // 检查是否有相同的进行中请求
    async deduplicateRequest(userInput, processor) {
        const key = this.generateKey(userInput);
        
        // 如果已有相同请求在处理，等待结果
        if (this.activeRequests.has(key)) {
            console.log('🔄 [去重] 发现重复请求，等待结果:', key.substring(0, 12) + '...');
            return await this.activeRequests.get(key);
        }

        // 创建新的请求Promise
        const requestPromise = processor().finally(() => {
            this.activeRequests.delete(key);
        });

        this.activeRequests.set(key, requestPromise);
        console.log('🆕 [去重] 处理新请求:', key.substring(0, 12) + '...');
        
        return await requestPromise;
    }
}

const requestDeduplicator = new RequestDeduplicator();

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
    origin: [
        'https://shaker-cocktail-app.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());

// 创建AI服务实例
const aiProvider = process.env.AI_PROVIDER || 'volcano'; // 默认使用火山引擎
const aiService = AIServiceFactory.createService(aiProvider);

console.log(`🤖 使用AI服务提供商: ${aiProvider.toUpperCase()}`);




// 优化的推荐API - 添加缓存和去重
app.post('/api/recommend', async (req, res) => {
    const startTime = Date.now();
    
    try {
        let userInput = req.body;
        
        // 🎲 空白输入随机化处理
        const isEmpty = !userInput.scene && (!userInput.moods || userInput.moods.length === 0) && 
                       (!userInput.ingredients || Object.keys(userInput.ingredients).length === 0) && 
                       (!userInput.preferences || Object.keys(userInput.preferences).length === 0) && 
                       !userInput.special_requirements;
        
        if (isEmpty) {
            // 为空白输入添加随机时间戳，避免缓存重复
            const randomSeed = Date.now() + Math.random();
            userInput._randomSeed = randomSeed;
            console.log('🎲 [空白输入] 添加随机种子:', randomSeed);
        }
        
        // 不再强制验证字段，允许任意输入

        console.log('📥 收到推荐请求:', userInput);
        
        // 1. 检查缓存
        const cachedResult = cacheManager.get(userInput);
        if (cachedResult) {
            const responseTime = Date.now() - startTime;
            console.log(`⚡ [缓存命中] 响应时间: ${responseTime}ms`);
            
            // 记录缓存命中
            apiMonitor.record('/api/recommend', 'POST', responseTime, true, true, false);
            
            return res.json({
                success: true,
                data: cachedResult,
                cached: true,
                responseTime: responseTime
            });
        }

        // 2. 请求去重处理
        const result = await requestDeduplicator.deduplicateRequest(userInput, async () => {
            console.log(`🤖 使用 ${aiProvider.toUpperCase()} 生成推荐...`);
            
            // 多样性验证重试逻辑
            const maxRetries = 3;
            let lastError = null;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🎯 [尝试 ${attempt}/${maxRetries}] 开始生成推荐...`);
                    
                    // 设置合理的超时时间
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('AI服务响应超时')), 50000) // 50秒超时
                    );
                    
                    const aiPromise = aiService.getCocktailRecommendation(userInput);
                    
                    const recommendations = await Promise.race([aiPromise, timeoutPromise]);
                    
                    console.log(`✅ [尝试 ${attempt}] 推荐生成成功，通过多样性验证`);
                    
                    // 3. 缓存结果
                    cacheManager.set(userInput, recommendations);
                    
                    return recommendations;
                    
                } catch (error) {
                    lastError = error;
                    
                    if (error.message.includes('推荐多样性验证失败')) {
                        console.warn(`⚠️ [尝试 ${attempt}] 多样性验证失败: ${error.message}`);
                        if (attempt < maxRetries) {
                            console.log(`🔄 [重试] 准备第 ${attempt + 1} 次尝试...`);
                            continue; // 重试
                        }
                    } else {
                        // 非多样性验证错误，直接抛出
                        throw error;
                    }
                }
            }
            
            // 所有重试都失败了
            console.error(`❌ [重试失败] ${maxRetries} 次尝试后仍然无法生成多样化推荐`);
            throw new Error(`经过 ${maxRetries} 次尝试，仍无法生成多样化的推荐内容。最后错误: ${lastError.message}`);
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`✅ [推荐完成] 响应时间: ${responseTime}ms`);
        
        // 记录API性能
        apiMonitor.record('/api/recommend', 'POST', responseTime, true, false, false);
        
        res.json({
            success: true,
            data: result,
            cached: false,
            responseTime: responseTime
        });
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ API错误 (${responseTime}ms):`, error.message);
        
        // 不再使用降级方案，直接返回真实的AI服务错误
        
        // 记录API失败
        apiMonitor.record('/api/recommend', 'POST', responseTime, false, false, false);
        
        res.status(500).json({
            success: false,
            error: '推荐服务暂时不可用',
            message: error.message,
            responseTime: responseTime
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Shaker API服务正常运行',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API性能监控
class APIMonitor {
    constructor() {
        this.requests = [];
        this.maxRecords = 1000; // 保留最近1000条记录
    }

    record(endpoint, method, responseTime, success, cached = false) {
        this.requests.push({
            endpoint,
            method,
            responseTime,
            success,
            cached,
            timestamp: new Date().toISOString()
        });

        // 限制记录数量
        if (this.requests.length > this.maxRecords) {
            this.requests = this.requests.slice(-this.maxRecords);
        }
    }

    getStats() {
        const recent = this.requests.slice(-100); // 最近100条
        const successful = recent.filter(r => r.success);
        const cached = recent.filter(r => r.cached);
        
        const avgResponseTime = recent.length > 0 
            ? recent.reduce((sum, r) => sum + r.responseTime, 0) / recent.length 
            : 0;

        return {
            totalRequests: this.requests.length,
            recentRequests: recent.length,
            successRate: recent.length > 0 ? (successful.length / recent.length * 100).toFixed(1) + '%' : '0%',
            cacheHitRate: recent.length > 0 ? (cached.length / recent.length * 100).toFixed(1) + '%' : '0%',
            avgResponseTime: Math.round(avgResponseTime) + 'ms',
            lastUpdated: new Date().toISOString()
        };
    }
}

const apiMonitor = new APIMonitor();

// 系统状态和统计端点
app.get('/api/stats', (req, res) => {
    const cacheStats = cacheManager.getStats();
    const apiStats = apiMonitor.getStats();
    
    res.json({
        success: true,
        data: {
            cache: cacheStats,
            api: apiStats,
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            },
            ai: {
                provider: aiProvider.toUpperCase(),
                connectionPoolReady: true
            }
        },
        timestamp: new Date().toISOString()
    });
});

// 缓存统计端点
app.get('/api/cache/stats', (req, res) => {
    const stats = cacheManager.getStats();
    res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
    });
});

// 清空缓存端点
app.post('/api/cache/clear', (req, res) => {
    cacheManager.clear();
    res.json({
        success: true,
        message: '缓存已清空',
        timestamp: new Date().toISOString()
    });
});

// 获取材料列表接口
app.get('/api/ingredients', (req, res) => {
    res.json({
        spirits: [
            '威士忌', '伏特加', '金酒', '朗姆酒', '龙舌兰', 
            '白兰地', '利口酒', '香槟', '啤酒', '清酒'
        ],
        mixers: [
            '柠檬汁', '青柠汁', '橙汁', '蔓越莓汁', '菠萝汁',
            '苏打水', '汤力水', '姜汁汽水', '可乐', '薄荷叶',
            '糖浆', '蜂蜜', '盐', '胡椒', '肉桂'
        ],
        tools: [
            '调酒器', '量杯', '搅拌棒', '滤网', '开瓶器',
            '冰桶', '柠檬刀', '装饰签', '高球杯', '马提尼杯'
        ]
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('未处理的错误:', error);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, async () => {
    console.log(`🚀 Shaker后端服务启动成功！`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌋 火山引擎模型: ${process.env.VOLCANO_MODEL_ID || 'default_model'}`);
    
    // 初始化连接池
    try {
        await connectionPool.initialize();
        console.log('🔥 连接池预热完成');
    } catch (error) {
        console.warn('⚠️ 连接池初始化失败:', error.message);
    }
    
    // 显示缓存统计
    console.log('💾 缓存管理器已就绪');
    
    // 缓存预热（生产环境启用）
    if (process.env.NODE_ENV === 'production') {
        setTimeout(async () => {
            try {
                await cacheManager.preWarmCache(aiService);
            } catch (error) {
                console.warn('⚠️ 缓存预热失败:', error.message);
            }
        }, 10000); // 10秒后开始预热，给服务器更多启动时间
        console.log('🔥 [生产模式] 缓存预热已启用');
    } else {
        console.log('🔧 [开发模式] 缓存预热已禁用');
    }
});
