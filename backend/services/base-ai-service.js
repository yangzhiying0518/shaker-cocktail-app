/**
 * AI服务基类 - 定义统一接口和降级方案
 */

class BaseAIService {
    constructor() {
        // 降级方案已移除，不再初始化
    }

    /**
     * 获取鸡尾酒推荐 - 抽象方法，子类必须实现
     * @param {Object} userInput 用户输入数据
     * @returns {Promise<Object>} 推荐结果
     */
    async getCocktailRecommendation(userInput) {
        throw new Error('子类必须实现getCocktailRecommendation方法');
    }

    // 降级方案已移除 - 直接抛出错误让前端处理

    // 所有降级推荐方法已移除
}

module.exports = BaseAIService;
