/**
 * Shaker API客户端
 * 统一管理所有API调用，包含错误处理和重试机制
 */

import { API_CONFIG } from './app-config.js';

class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.activeRequests = new Map();
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请稍后重试');
            }
            
            throw error;
        }
    }

    // 获取推荐（非流式）
    async getRecommendation(userInput) {
        try {
            console.log('📤 发送推荐请求:', userInput);
            
            const response = await this.request(API_CONFIG.ENDPOINTS.RECOMMEND, {
                method: 'POST',
                body: JSON.stringify(userInput)
            });

            console.log('📥 收到推荐响应:', response);
            return response;
        } catch (error) {
            console.error('❌ 推荐请求失败:', error);
            throw error;
        }
    }


    // 获取材料列表
    async getIngredients() {
        try {
            const response = await this.request(API_CONFIG.ENDPOINTS.INGREDIENTS);
            return response;
        } catch (error) {
            console.error('❌ 获取材料列表失败:', error);
            throw error;
        }
    }

    // 健康检查
    async healthCheck() {
        try {
            const response = await this.request(API_CONFIG.ENDPOINTS.HEALTH);
            return response;
        } catch (error) {
            console.error('❌ 健康检查失败:', error);
            throw error;
        }
    }

    // 获取系统统计
    async getStats() {
        try {
            const response = await this.request(API_CONFIG.ENDPOINTS.STATS);
            return response;
        } catch (error) {
            console.error('❌ 获取统计失败:', error);
            throw error;
        }
    }

    // 请求去重（防止重复请求）
    async deduplicatedRequest(key, requestFn) {
        if (this.activeRequests.has(key)) {
            console.log('🔄 等待重复请求结果:', key);
            return await this.activeRequests.get(key);
        }

        const promise = requestFn().finally(() => {
            this.activeRequests.delete(key);
        });

        this.activeRequests.set(key, promise);
        return await promise;
    }

    // 带重试的请求
    async requestWithRetry(endpoint, options = {}, maxRetries = 2) {
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`🔄 重试请求 (${attempt}/${maxRetries}):`, endpoint);
                    // 指数退避
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
                
                return await this.request(endpoint, options);
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ 请求失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`, error.message);
                
                // 如果是客户端错误，不重试
                if (error.message.includes('4')) {
                    break;
                }
            }
        }
        
        throw lastError;
    }
}

// 创建API客户端实例
export const apiClient = new APIClient();

// 便捷方法
export const api = {
    // 推荐相关
    getRecommendation: (userInput) => apiClient.getRecommendation(userInput),
    
    // 数据相关
    getIngredients: () => apiClient.getIngredients(),
    
    // 系统相关
    healthCheck: () => apiClient.healthCheck(),
    getStats: () => apiClient.getStats()
};
