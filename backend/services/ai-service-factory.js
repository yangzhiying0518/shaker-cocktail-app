/**
 * AI服务工厂 - 支持多种AI服务提供商
 * 当前支持：火山引擎
 */

const VolcanoService = require('./volcano-service');

class AIServiceFactory {
    static createService(provider = 'volcano') {
        switch (provider.toLowerCase()) {
            case 'volcano':
            case 'volcengine':
                return new VolcanoService();
            default:
                throw new Error(`不支持的AI服务提供商: ${provider}，当前仅支持volcano`);
        }
    }
}

module.exports = AIServiceFactory;
