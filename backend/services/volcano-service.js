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
        this.modelId = process.env.VOLCANO_MODEL_ID || 'doubao-1-5-pro-32k-250115'; // 默认使用Pro模型
        
        // 智能模型选择：根据任务复杂度选择合适的模型
        this.models = {
            pro: 'doubao-1-5-pro-32k-250115',      // 高质量，适合复杂JSON生成
            lite: 'doubao-1-5-lite-32k-250115'     // 高速度，适合简单任务
        };
        
        // 性能监控：记录不同模型的表现
        this.performanceStats = {
            pro: { successRate: 0, avgResponseTime: 0, totalRequests: 0 },
            lite: { successRate: 0, avgResponseTime: 0, totalRequests: 0 }
        };
    }

    /**
     * 智能选择最佳模型
     * @param {string} taskType - 任务类型 ('recommendation', 'analysis')
     * @param {boolean} prioritizeSpeed - 是否优先考虑速度
     * @returns {string} 选择的模型ID
     */
    selectOptimalModel(taskType = 'recommendation', prioritizeSpeed = false) {
        // 对于推荐任务，默认使用Pro模型确保JSON质量
        if (taskType === 'recommendation') {
            if (prioritizeSpeed && this.performanceStats.lite.successRate > 0.8) {
                console.log('🚀 [火山引擎] 选择Lite模型（优先速度）');
                return this.models.lite;
            } else {
                console.log('💎 [火山引擎] 选择Pro模型（优先质量）');
                return this.models.pro;
            }
        }
        
        // 对于其他任务，可以使用Lite模型
        return this.models.lite;
    }

    /**
     * 更新性能统计
     */
    updatePerformanceStats(modelType, success, responseTime) {
        const stats = this.performanceStats[modelType];
        if (stats) {
            stats.totalRequests++;
            stats.avgResponseTime = (stats.avgResponseTime * (stats.totalRequests - 1) + responseTime) / stats.totalRequests;
            stats.successRate = success ? 
                (stats.successRate * (stats.totalRequests - 1) + 1) / stats.totalRequests :
                (stats.successRate * (stats.totalRequests - 1)) / stats.totalRequests;
        }
    }

    async getCocktailRecommendation(userInput) {
        const startTime = Date.now();
        let selectedModel = this.selectOptimalModel('recommendation');
        let modelType = selectedModel === this.models.pro ? 'pro' : 'lite';
        
        try {
            console.log('🌋 [火山引擎] 开始API调用');
            console.log('📥 [火山引擎] 用户输入:', JSON.stringify(userInput, null, 2));
            console.log(`🎯 [火山引擎] 选择模型: ${selectedModel}`);
            console.log(`⚙️ [火山引擎] 模型参数: temperature=${0.8}, max_tokens=${2000}, top_p=${0.9}`);
            
            const prompt = this.buildPrompt(userInput);
            console.log('📝 [火山引擎] 构建的提示词长度:', prompt.length, '字符');
            
            const response = await axios.post(
                `${this.endpoint}/chat/completions`,
                {
                    model: selectedModel,
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
                    temperature: 0.8, // 平衡创意和稳定性
                    max_tokens: 2000,
                    top_p: 0.9, // 适度的采样多样性
                    // 移除frequency_penalty和presence_penalty，避免影响JSON结构
                    // 保持随机种子确保多样性
                    seed: Math.floor(Math.random() * 1000000) + Date.now()
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
            console.log('📊 [火山引擎] 响应数据大小:', JSON.stringify(response.data).length, '字符');
            
            const result = this.parseVolcanoResponse(response.data, userInput);
            
            // 更新性能统计
            const responseTime = Date.now() - startTime;
            this.updatePerformanceStats(modelType, true, responseTime);
            console.log(`📊 [火山引擎] 响应时间: ${responseTime}ms, 模型: ${modelType}`);
            
            return result;
        } catch (error) {
            // 更新失败统计
            const responseTime = Date.now() - startTime;
            this.updatePerformanceStats(modelType, false, responseTime);
            
            console.error('❌ [火山引擎] API调用失败');
            console.error('🔍 [火山引擎] 错误详情:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            console.log(`📊 [火山引擎] 失败响应时间: ${responseTime}ms, 模型: ${modelType}`);
            
            throw new Error(`火山引擎API调用失败: ${error.message}`);
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

请返回JSON格式的推荐结果，包含恰好3个推荐，每个推荐包含完整的配方信息。`;
    }

    getSystemPrompt() {
        return `你是Shaker，一位专业而温暖的调酒师。
## 核心要求
- 精通全球鸡尾酒文化与调制技艺
- 每次推荐恰好3款鸡尾酒，必须完全不同
- 推荐理由要富有情感和专业性（40-70字）
- 所有配方必须真实可行，用量准确

## 多样性要求（严格执行）
**三款推荐必须在以下方面完全不同：**
1. **基酒类型**：威士忌、金酒、朗姆酒、龙舌兰、伏特加等不能重复
2. **推荐理由**：表达方式、情感角度必须独特，严禁雷同
3. **口感特点**：酸甜苦辣、浓淡厚薄必须有明显区别
4. **视觉效果**：颜色、装饰要形成对比
5. **制作难度**：简单、中等、困难要有层次

## 推荐策略
- 第一款：贴合当前情感，温暖治愈系
- 第二款：提升层次，优雅精致系  
- 第三款：惊喜创新，个性突破系

## 响应格式（严格JSON，不要其他内容）
{
  "recommendations": [
    {
      "priority": "最治愈/最经典/最创意",
      "name": {
        "chinese": "中文名称",
        "english": "English Name"
      },
      "glassType": "🍸",
      "reason": "推荐理由（40-70字，富有情感和专业洞察）",
      "recipe": {
        "ingredients": [
          {"name": "材料名", "amount": "用量"}
        ],
        "tools": ["所需工具"],
        "difficulty": "简单/中等/困难"
      },
      "instructions": ["详细制作步骤"],
      "taste_profile": "具体口感描述",
      "visual": "视觉效果描述", 
      "prep_time": "制作时间",
      "alcohol_content": "酒精度",
      "best_time": "最佳饮用时机"
    }
  ]
}`;
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
        console.log('🔍 [火山引擎] 开始解析响应');
        
        try {
            if (!data?.choices?.[0]?.message?.content) {
                console.error('❌ [火山引擎] 响应数据结构异常:', JSON.stringify(data, null, 2));
                throw new Error('API响应数据结构异常');
            }
            
            const content = data.choices[0].message.content;
            console.log('📄 [火山引擎] 原始响应长度:', content.length, '字符');
            console.log('📄 [火山引擎] 原始响应内容:', content.substring(0, 200) + '...');
            
            // 尝试解析JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ [火山引擎] 未找到JSON格式内容');
                console.error('🔍 [火山引擎] 完整响应:', content);
                throw new Error('响应中未找到JSON格式内容');
            }
            
            console.log('🔍 [火山引擎] 提取的JSON长度:', jsonMatch[0].length, '字符');
            
            const recommendations = JSON.parse(jsonMatch[0]);
            console.log('✅ [火山引擎] JSON解析成功');
            
            if (!recommendations?.recommendations || !Array.isArray(recommendations.recommendations)) {
                console.error('❌ [火山引擎] 推荐数据结构异常:', JSON.stringify(recommendations, null, 2));
                throw new Error('推荐数据结构不正确');
            }
            
            console.log(`📊 [火山引擎] 解析到 ${recommendations.recommendations.length} 个推荐`);
            
            // 验证推荐多样性
            const validatedRecommendations = this.validateRecommendationDiversity(recommendations);
            console.log('✅ [火山引擎] 推荐解析和验证完成');
            
            return validatedRecommendations;
            
        } catch (error) {
            console.error('❌ [火山引擎] JSON解析失败:', error.message);
            console.error('🔍 [火山引擎] 原始响应内容:', data?.choices?.[0]?.message?.content);
            throw new Error(`AI响应解析失败: ${error.message}`);
        }
    }

    /**
     * 验证推荐的多样性，确保没有重复
     */
    validateRecommendationDiversity(recommendations) {
        console.log('🔍 [多样性验证] 开始验证推荐多样性');
        const recs = recommendations.recommendations;
        
        // 检查基酒是否重复
        const spirits = recs.map((rec, index) => {
            const ingredients = rec.recipe?.ingredients || [];
            const spirit = ingredients.find(ing => 
                ing.name.includes('威士忌') || ing.name.includes('金酒') || 
                ing.name.includes('朗姆') || ing.name.includes('龙舌兰') || 
                ing.name.includes('伏特加') || ing.name.includes('白兰地')
            );
            const spiritName = spirit?.name || '未知';
            console.log(`🍸 [多样性验证] 推荐${index + 1} 基酒: ${spiritName}`);
            return spiritName;
        });
        
        // 检查推荐理由
        const reasons = recs.map((rec, index) => {
            const reason = rec.reason || '';
            console.log(`💭 [多样性验证] 推荐${index + 1} 理由长度: ${reason.length}字`);
            return reason;
        });
        
        // 检查优先级标识
        const priorities = recs.map((rec, index) => {
            const priority = rec.priority || '';
            console.log(`⭐ [多样性验证] 推荐${index + 1} 优先级: ${priority}`);
            return priority;
        });
        
        // 验证基酒多样性
        const spiritDuplicates = spirits.filter((spirit, index) => spirits.indexOf(spirit) !== index);
        if (spiritDuplicates.length > 0) {
            console.error('❌ [多样性检查] 发现基酒重复:', spiritDuplicates);
            throw new Error(`推荐多样性验证失败：基酒重复 - ${spiritDuplicates.join(', ')}`);
        } else {
            console.log('✅ [多样性验证] 基酒类型完全不同');
        }
        
        // 验证优先级多样性
        const priorityDuplicates = priorities.filter((priority, index) => priorities.indexOf(priority) !== index);                                                                                                  
        if (priorityDuplicates.length > 0) {
            console.error('❌ [多样性检查] 发现优先级重复:', priorityDuplicates);
            throw new Error(`推荐多样性验证失败：优先级重复 - ${priorityDuplicates.join(', ')}`);
        } else {
            console.log('✅ [多样性验证] 优先级标识完全不同');
        }
        
        // 检查推荐理由相似度
        const reasonSimilarity = this.checkReasonSimilarity(reasons);
        console.log(`📊 [多样性验证] 推荐理由相似度: ${(reasonSimilarity * 100).toFixed(1)}%`);
        if (reasonSimilarity > 0.7) {
            console.error('❌ [多样性检查] 推荐理由相似度过高:', reasonSimilarity);
            throw new Error(`推荐多样性验证失败：推荐理由相似度过高 ${(reasonSimilarity * 100).toFixed(1)}%`);
        } else {
            console.log('✅ [多样性验证] 推荐理由差异化良好');
        }
        
        // 检查鸡尾酒名称是否重复
        const names = recs.map((rec, index) => {
            const nameCn = rec.name?.chinese || '';
            const nameEn = rec.name?.english || '';
            console.log(`🏷️ [多样性验证] 推荐${index + 1} 名称: ${nameCn} (${nameEn})`);
            return nameCn;
        });
        
        const nameDuplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (nameDuplicates.length > 0) {
            console.error('❌ [多样性检查] 发现鸡尾酒名称重复:', nameDuplicates);
            throw new Error(`推荐多样性验证失败：鸡尾酒名称重复 - ${nameDuplicates.join(', ')}`);
        } else {
            console.log('✅ [多样性验证] 鸡尾酒名称完全不同');
        }
        
        console.log('✅ [多样性验证] 验证完成');
        return recommendations;
    }

    /**
     * 检查推荐理由的相似度
     */
    checkReasonSimilarity(reasons) {
        if (reasons.length < 2) return 0;
        
        let totalSimilarity = 0;
        let comparisons = 0;
        
        for (let i = 0; i < reasons.length; i++) {
            for (let j = i + 1; j < reasons.length; j++) {
                const similarity = this.calculateTextSimilarity(reasons[i], reasons[j]);
                totalSimilarity += similarity;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    }

    /**
     * 计算两个文本的相似度（简单的词汇重叠度）
     */
    calculateTextSimilarity(text1, text2) {
        const words1 = text1.replace(/[^\u4e00-\u9fa5\w]/g, '').split('');
        const words2 = text2.replace(/[^\u4e00-\u9fa5\w]/g, '').split('');
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return union.length > 0 ? intersection.length / union.length : 0;
    }
}

module.exports = VolcanoService;
