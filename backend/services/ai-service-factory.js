/**
 * AI服务工厂 - 支持多种AI服务提供商
 * 当前支持：Coze API、火山引擎
 */

const CozeService = require('./coze-service');
const VolcanoService = require('./volcano-service');

class AIServiceFactory {
    static createService(provider = 'coze') {
        switch (provider.toLowerCase()) {
            case 'coze':
                return new CozeService();
            case 'volcano':
            case 'volcengine':
                return new VolcanoService();
            default:
                throw new Error(`不支持的AI服务提供商: ${provider}`);
        }
    }
}

module.exports = AIServiceFactory;
