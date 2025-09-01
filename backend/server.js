const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AIServiceFactory = require('./services/ai-service-factory');
const StreamService = require('./services/stream-service');

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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// 创建AI服务实例
const aiProvider = process.env.AI_PROVIDER || 'volcano'; // 默认使用火山引擎
const aiService = AIServiceFactory.createService(aiProvider);
const streamService = new StreamService();

console.log(`🤖 使用AI服务提供商: ${aiProvider.toUpperCase()}`);



// 优化的流式推荐API - 添加缓存检查
app.post('/api/stream-recommendation', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const userInput = req.body;
        
        // 不再强制验证字段，允许任意输入

        console.log('🍸 收到流式推荐请求:', userInput);
        
        // 设置SSE响应头
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // 发送连接成功信号
        res.write(`data: ${JSON.stringify({
            type: 'connected',
            message: 'Shaker开始为您分析...'
        })}\n\n`);

        // 检查缓存 - 如果有缓存，快速返回
        const cachedResult = cacheManager.get(userInput);
        if (cachedResult) {
            const responseTime = Date.now() - startTime;
            console.log(`⚡ [流式缓存命中] 响应时间: ${responseTime}ms`);
            
            // 模拟分析过程（快速版本）
            res.write(`data: ${JSON.stringify({
                type: 'segmented_analysis',
                segments: [
                    { title: '理解您的需求', content: '基于之前的分析，我已经了解您的偏好...', focus: 'scene' },
                    { title: '准备推荐', content: '正在为您调制最适合的鸡尾酒...', focus: 'preparation' }
                ]
            })}\n\n`);
            
            setTimeout(() => {
                res.write(`data: ${JSON.stringify({
                    type: 'phase_transition',
                    phase: 'recommendations',
                    message: '分析完成，开始调制推荐...'
                })}\n\n`);
                
                // 发送缓存的推荐结果
                if (cachedResult.recommendations) {
                    cachedResult.recommendations.forEach((recommendation, index) => {
                        setTimeout(() => {
                            res.write(`data: ${JSON.stringify({
                                type: 'recommendation',
                                index: index,
                                content: { recommendations: [recommendation] },
                                glassType: recommendation.glassType || '🍸'
                            })}\n\n`);
                        }, index * 800);
                    });
                    
                    setTimeout(() => {
                        res.write(`data: ${JSON.stringify({
                            type: 'complete',
                            message: '推荐完成（来自缓存）',
                            cached: true
                        })}\n\n`);
                        res.end();
                    }, cachedResult.recommendations.length * 800 + 500);
                }
            }, 1500);
            
            return;
        }

        // 使用去重处理流式请求
        await requestDeduplicator.deduplicateRequest(userInput, async () => {
            return new Promise((resolve, reject) => {
                // 启动流式推荐服务
                streamService.streamRecommendation(
                    userInput,
                    // onData - 数据回调
                    (data) => {
                        res.write(`data: ${JSON.stringify(data)}\n\n`);
                    },
                    // onError - 错误回调
                    (error) => {
                        console.error('❌ 流式推荐错误:', error);
                        
                        // 检查连接状态再写入
                        if (!res.headersSent && !res.destroyed) {
                            try {
                                res.write(`data: ${JSON.stringify({
                                    type: 'error',
                                    message: `Shaker遇到了一些困难: ${error.message}`,
                                    source: 'ai_service_error'
                                })}\n\n`);
                                res.end();
                            } catch (writeError) {
                                console.log('⚠️ 响应流已关闭，跳过错误写入');
                            }
                        }
                        reject(error);
                    },
                    // onEnd - 结束回调
                    () => {
                        const responseTime = Date.now() - startTime;
                        console.log(`✅ 流式推荐完成 (${responseTime}ms)`);
                        res.write(`data: ${JSON.stringify({
                            type: 'done',
                            responseTime: responseTime
                        })}\n\n`);
                        res.end();
                        resolve();
                    }
                );
            });
        });
        
    } catch (error) {
        console.error('流式API错误:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            message: '服务器内部错误: ' + error.message
        })}\n\n`);
        res.end();
    }
});

// 优化的推荐API - 添加缓存和去重
app.post('/api/recommend', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const userInput = req.body;
        
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
            
            // 设置更短的超时时间
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('AI服务响应超时')), 25000) // 25秒超时
            );
            
            const aiPromise = aiService.getCocktailRecommendation(userInput);
            
            const recommendations = await Promise.race([aiPromise, timeoutPromise]);
            
            // 3. 缓存结果
            cacheManager.set(userInput, recommendations);
            
            return recommendations;
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
});
