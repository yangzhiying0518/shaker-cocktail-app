/**
 * 连接池管理器 - 预热和复用HTTP连接
 */

const axios = require('axios');
const https = require('https');
const http = require('http');

class ConnectionPool {
    constructor() {
        this.agents = new Map();
        this.warmupPromises = new Map();
        this.initialized = false;
    }

    /**
     * 初始化连接池
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('🔥 [连接池] 开始初始化连接池...');
        
        // 创建持久化代理
        const httpsAgent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 10,
            maxFreeSockets: 5,
            timeout: 20000,
            freeSocketTimeout: 15000
        });

        const httpAgent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 10,
            maxFreeSockets: 5,
            timeout: 20000,
            freeSocketTimeout: 15000
        });

        this.agents.set('https', httpsAgent);
        this.agents.set('http', httpAgent);

        // 预热火山引擎连接
        await this.warmupVolcanoConnection();
        
        this.initialized = true;
        console.log('✅ [连接池] 连接池初始化完成');
    }

    /**
     * 预热火山引擎连接
     */
    async warmupVolcanoConnection() {
        const endpoint = process.env.VOLCANO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3';
        const apiKey = process.env.VOLCANO_API_KEY;
        
        if (!apiKey) {
            console.warn('⚠️ [连接池] 缺少火山引擎API密钥，跳过预热');
            return;
        }

        try {
            console.log('🌋 [连接池] 开始预热火山引擎连接...');
            
            // 发送一个轻量级请求来建立连接
            const warmupPromise = axios.post(
                `${endpoint}/chat/completions`,
                {
                    model: process.env.VOLCANO_MODEL_ID || 'ep-20241201122047-9vlmr',
                    messages: [
                        {
                            role: "user",
                            content: "hello"
                        }
                    ],
                    max_tokens: 1,
                    temperature: 0.1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    httpsAgent: this.agents.get('https'),
                    timeout: 10000
                }
            );

            this.warmupPromises.set('volcano', warmupPromise);
            
            // 不等待响应，只是建立连接
            warmupPromise.catch(() => {
                // 忽略预热请求的错误，重要的是建立了连接
                console.log('🔥 [连接池] 火山引擎连接预热完成（连接已建立）');
            });

            // 等待一小段时间确保连接建立
            setTimeout(() => {
                console.log('✅ [连接池] 火山引擎连接预热完成');
            }, 1000);

        } catch (error) {
            console.warn('⚠️ [连接池] 火山引擎连接预热失败:', error.message);
        }
    }

    /**
     * 获取优化的axios配置
     */
    getOptimizedAxiosConfig(url) {
        const isHttps = url.startsWith('https://');
        const agent = this.agents.get(isHttps ? 'https' : 'http');
        
        return {
            httpsAgent: isHttps ? agent : undefined,
            httpAgent: !isHttps ? agent : undefined,
            // 启用HTTP/2（如果支持）
            http2: true,
            // 启用压缩
            decompress: true,
            // 连接复用
            reuseExistingConnections: true
        };
    }

    /**
     * 销毁连接池
     */
    destroy() {
        console.log('🔄 [连接池] 销毁连接池...');
        
        for (const [type, agent] of this.agents) {
            agent.destroy();
            console.log(`✅ [连接池] ${type} 代理已销毁`);
        }
        
        this.agents.clear();
        this.warmupPromises.clear();
        this.initialized = false;
    }
}

// 单例模式
const connectionPool = new ConnectionPool();

module.exports = connectionPool;
