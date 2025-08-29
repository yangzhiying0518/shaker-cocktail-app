/**
 * 火山引擎AI服务类
 */

const axios = require('axios');
const BaseAIService = require('./base-ai-service');

class VolcanoService extends BaseAIService {
    constructor() {
        super();
        this.apiKey = process.env.VOLCANO_API_KEY;
        this.endpoint = process.env.VOLCANO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3';
        this.modelId = process.env.VOLCANO_MODEL_ID || 'ep-20241201122047-9vlmr'; // 默认模型ID
    }

    async getCocktailRecommendation(userInput) {
        try {
            console.log('🌋 [火山引擎] 调用API，用户输入:', JSON.stringify(userInput, null, 2));
            
            const prompt = this.buildPrompt(userInput);
            
            const response = await axios.post(
                `${this.endpoint}/chat/completions`,
                {
                    model: this.modelId,
                    messages: [
                        {
                            role: "system",
                            content: this.getSystemPrompt()
                        },
                        {
                            role: "user", 
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.9
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            console.log('✅ [火山引擎] API响应状态:', response.status);
            
            return this.parseVolcanoResponse(response.data, userInput);
        } catch (error) {
            console.error('❌ [火山引擎] API调用失败:', error.response?.data || error.message);
            return this.getFallbackRecommendations(userInput);
        }
    }

    buildPrompt(userInput) {
        return `请根据以下用户需求推荐鸡尾酒：

场景：${userInput.scene}
心情：${userInput.moods?.join('、')}
可用材料：
- 基酒：${userInput.ingredients?.spirits?.join('、') || '无特定要求'}
- 调料：${userInput.ingredients?.mixers?.join('、') || '无特定要求'}
- 工具：${userInput.ingredients?.tools?.join('、') || '基础工具'}

偏好设置：
- 酒精度：${userInput.preferences?.alcohol_level || '中度'}
- 甜度：${userInput.preferences?.sweetness || '适中'}
- 酸度：${userInput.preferences?.acidity || '适中'}
- 口感风格：${userInput.preferences?.style || '清爽'}

特殊要求：${userInput.special_requirements || '无'}

请返回JSON格式的推荐结果，包含3-5个推荐，每个推荐包含完整的配方信息。`;
    }

    getSystemPrompt() {
        return `你是一位专业的调酒师AI助手，精通各种鸡尾酒配方和调酒技巧。

请根据用户的场景、心情、材料和偏好，推荐最适合的鸡尾酒。

响应格式要求：
1. 返回标准JSON格式
2. 推荐3-5款不同风格的鸡尾酒
3. 每款酒包含：中英文名称、推荐理由、完整配方、制作步骤、口感描述、视觉效果、制作时间、酒精度

JSON结构示例：
{
  "recommendations": [
    {
      "name": {
        "chinese": "威士忌酸",
        "english": "Whiskey Sour"
      },
      "reason": "适合当前场景的推荐理由",
      "recipe": {
        "ingredients": [
          {"name": "威士忌", "amount": "60ml"},
          {"name": "柠檬汁", "amount": "30ml"}
        ],
        "tools": ["调酒器", "柠檬榨汁器"],
        "difficulty": "简单"
      },
      "instructions": ["步骤1", "步骤2"],
      "taste_profile": "口感描述",
      "visual": "视觉效果描述",
      "prep_time": "制作时间",
      "alcohol_content": "酒精度",
      "serving_temp": "饮用温度",
      "best_time": "最佳时机"
    }
  ]
}

要求：
- 配方真实可行，用量准确
- 推荐理由切合用户需求
- 制作步骤清晰易懂
- 考虑材料的可获得性`;
    }

    parseVolcanoResponse(data, userInput) {
        try {
            if (data?.choices?.[0]?.message?.content) {
                const content = data.choices[0].message.content;
                console.log('🌋 [火山引擎] 原始响应:', content);
                
                // 尝试解析JSON
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const recommendations = JSON.parse(jsonMatch[0]);
                    if (recommendations?.recommendations && Array.isArray(recommendations.recommendations)) {
                        console.log('✅ [火山引擎] 成功解析推荐结果');
                        return recommendations;
                    }
                }
            }
            throw new Error('响应格式不正确');
        } catch (error) {
            console.warn('⚠️ [火山引擎] 解析失败，使用降级方案');
            return this.getFallbackRecommendations(userInput);
        }
    }
}

module.exports = VolcanoService;
