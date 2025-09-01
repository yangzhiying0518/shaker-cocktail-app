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
                    timeout: 45000
                }
            );

            console.log('✅ [火山引擎] API响应状态:', response.status);
            
            return this.parseVolcanoResponse(response.data, userInput);
        } catch (error) {
            console.error('❌ [火山引擎] API调用失败:', error.response?.data || error.message);
            throw error; // 直接抛出错误，不使用降级方案
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
        return `你是Shaker，一位温暖而富有经历故事的调酒师。当你和别人聊天时，你是对方最贴心、阳光、充满正能量的朋友。

## 核心特质
- 🌟 适应性强：无论用户提供多少信息，都能说出有温度的话来温暖对方
- 🎭 情感敏锐：善于从细微线索捕捉用户真实情绪需求  
- 🍸 专业知识：精通全球鸡尾酒文化与调制技艺
- 💚 温暖关怀：像多年知己一样关心用户的感受
- 🎨 创意灵感：能够突破常规，带来惊喜的推荐

## 推荐原则
- 固定3款推荐：每次都推荐恰好3款鸡尾酒
- 优先级标识：为每款酒添加不同的推荐角度
- 真实配方：所有配方必须真实可行，用量准确
- 温暖交流：推荐理由要体现关怀和理解

## 响应格式（严格JSON）
{
  "recommendations": [
    {
      "priority": "最适合",
      "name": {
        "chinese": "中文名称",
        "english": "English Name"
      },
      "glassType": "🍸",
      "reason": "温暖贴心的推荐理由（50字内）",
      "recipe": {
        "ingredients": [
          {"name": "材料名", "amount": "用量"}
        ],
        "tools": ["所需工具"],
        "difficulty": "简单/中等/困难"
      },
      "instructions": ["制作步骤1", "制作步骤2"],
      "taste_profile": "口感描述",
      "visual": "视觉效果描述", 
      "prep_time": "制作时间",
      "alcohol_content": "酒精度",
      "best_time": "最佳饮用时机"
    }
  ]
}

## 优先级标识选项
- 最适合、最贴心、最温暖
- 最有灵感、最创意、最惊喜
- 最经典、最简单、最特别
- 最放松、最提神、最治愈

## 特殊处理情况
- 完全空白输入：推荐"今日特调"，展现Shaker的个性
- 模糊需求："心情不好"、"随便来一杯" → 理解情感，温暖回应
- 只有文字要求：从文字中理解深层需求
- AI无法理解：坦诚回应，但仍尝试推荐，保持Shaker人设

## 重要提醒
1. 永远只返回JSON格式，不要其他内容
2. 每款推荐都要有不同的priority标识
3. 保持温暖专业的调酒师身份
4. 配方和制作步骤要完全真实可行
5. 推荐理由要体现对用户的关怀理解

*每一次互动都是帮助用户发现美好生活的机会* ✨`;
    }

    /**
     * 流式聊天方法
     * @param {string} prompt - 提示词
     * @param {Function} onData - 数据回调
     * @param {Function} onError - 错误回调
     * @param {Function} onEnd - 结束回调
     */
    async streamChat(prompt, onData, onError, onEnd) {
        try {
            console.log('🌋 [火山引擎] 开始流式聊天');
            
            const axios = require('axios');
            
            const response = await axios.post(
                `${this.endpoint}/chat/completions`,
                {
                    model: this.modelId,
                    messages: [
                        {
                            role: "system",
                            content: "你是一位专业的调酒师AI助手，精通各种鸡尾酒配方和调酒技巧。"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    stream: true,
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.9
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream',
                    timeout: 30000
                }
            );

            console.log('✅ [火山引擎] 流式连接建立成功');

            response.data.on('data', (chunk) => {
                try {
                    const lines = chunk.toString().split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            
                            if (data === '[DONE]') {
                                console.log('🏁 [火山引擎] 流式响应完成');
                                onEnd();
                                return;
                            }
                            
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed?.choices?.[0]?.delta?.content;
                                
                                if (content) {
                                    onData({
                                        content: content,
                                        raw: parsed
                                    });
                                }
                            } catch (parseError) {
                                // 忽略解析错误，继续处理下一行
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ [火山引擎] 数据处理错误:', error);
                }
            });

            response.data.on('error', (error) => {
                console.error('❌ [火山引擎] 流式连接错误:', error);
                onError(error);
            });

            response.data.on('end', () => {
                console.log('🔚 [火山引擎] 流式连接结束');
                onEnd();
            });

        } catch (error) {
            console.error('❌ [火山引擎] 流式聊天失败:', error.response?.data || error.message);
            onError(error);
        }
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
