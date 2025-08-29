/**
 * Coze API服务类
 */

const axios = require('axios');
const BaseAIService = require('./base-ai-service');

class CozeService extends BaseAIService {
    constructor() {
        super();
        this.apiKey = process.env.COZE_API_KEY;
        this.botId = process.env.COZE_BOT_ID;
        this.baseURL = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
    }

    async getCocktailRecommendation(userInput) {
        try {
            console.log('🤖 [Coze] 调用API，用户输入:', JSON.stringify(userInput, null, 2));
            
            const response = await axios.post(
                `${this.baseURL}/v3/chat`,
                {
                    bot_id: this.botId,
                    user_id: `shaker-user-${Date.now()}`,
                    stream: false,
                    auto_save_history: false,
                    additional_messages: [{
                        role: "user",
                        content: JSON.stringify(userInput),
                        content_type: "text"
                    }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            console.log('✅ [Coze] API响应状态:', response.status);
            
            return this.parseCozeResponse(response.data);
        } catch (error) {
            console.error('❌ [Coze] API调用失败:', error.response?.data || error.message);
            return this.getFallbackRecommendations(userInput);
        }
    }

    parseCozeResponse(data) {
        try {
            if (data?.messages && data.messages.length > 0) {
                const botMessage = data.messages.find(msg => msg.role === 'assistant' || msg.type === 'answer');
                if (botMessage?.content) {
                    const recommendations = JSON.parse(botMessage.content);
                    if (recommendations?.recommendations && Array.isArray(recommendations.recommendations)) {
                        console.log('✅ [Coze] 成功解析推荐结果');
                        return recommendations;
                    }
                }
            }
            throw new Error('响应格式不正确');
        } catch (error) {
            console.warn('⚠️ [Coze] 解析失败，使用降级方案');
            return this.getFallbackRecommendations();
        }
    }
}

module.exports = CozeService;
