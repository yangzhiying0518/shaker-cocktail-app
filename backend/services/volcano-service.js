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
            
            const recommendations = this.safeJsonParse(jsonMatch[0]);
            console.log('✅ [火山引擎] JSON解析成功');
            
            if (!recommendations?.recommendations || !Array.isArray(recommendations.recommendations)) {
                console.error('❌ [火山引擎] 推荐数据结构异常:', JSON.stringify(recommendations, null, 2));
                throw new Error('推荐数据结构不正确');
            }
            
            console.log(`📊 [火山引擎] 解析到 ${recommendations.recommendations.length} 个推荐`);
            
            // 验证推荐多样性，传入用户输入以进行智能验证
            const validatedRecommendations = this.validateRecommendationDiversity(recommendations, userInput);
            console.log('✅ [火山引擎] 推荐解析和验证完成');
            
            return validatedRecommendations;
            
        } catch (error) {
            console.error('❌ [火山引擎] JSON解析失败:', error.message);
            console.error('🔍 [火山引擎] 原始响应内容:', data?.choices?.[0]?.message?.content);
            throw new Error(`AI响应解析失败: ${error.message}`);
        }
    }

    /**
     * 安全解析JSON，带容错处理
     * @param {string} jsonStr - JSON字符串
     * @returns {Object} - 解析后的对象
     */
    safeJsonParse(jsonStr) {
        console.log('🔧 [JSON解析] 开始安全解析JSON...');
        
        // 尝试直接解析
        try {
            const result = JSON.parse(jsonStr);
            console.log('✅ [JSON解析] 直接解析成功');
            return result;
        } catch (error) {
            console.log('⚠️ [JSON解析] 直接解析失败，尝试修复:', error.message);
        }
        
        // 尝试修复常见的JSON格式问题
        try {
            console.log('🔄 [JSON解析] 尝试修复JSON格式问题...');
            let fixed = jsonStr;
            
            // 1. 修复数组和对象末尾的多余逗号
            fixed = fixed.replace(/,(\s*[\]}])/g, '$1');
            
            // 2. 修复ingredients数组中的多余逗号（针对当前具体错误）
            fixed = fixed.replace(/("amount":\s*"[^"]*"),(\s*\])/g, '$1$2');
            
            // 3. 修复缺少key的值（如 "薄荷叶", "适量" -> "薄荷叶", "amount": "适量"）
            fixed = fixed.replace(/("name":\s*"[^"]*"),\s*"([^"]*)"(\s*\})/g, '$1, "amount": "$2"$3');
            
            // 3. 移除可能的注释
            fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
            fixed = fixed.replace(/\/\/.*$/gm, '');
            
            const result = JSON.parse(fixed);
            console.log('✅ [JSON解析] 修复后解析成功');
            return result;
        } catch (error) {
            console.error('❌ [JSON解析] 修复后解析仍失败:', error.message);
            
            // 显示错误位置的上下文
            const errorMatch = error.message.match(/position (\d+)/);
            if (errorMatch) {
                const pos = parseInt(errorMatch[1]);
                const start = Math.max(0, pos - 50);
                const end = Math.min(jsonStr.length, pos + 50);
                console.error('🔍 [JSON解析] 错误位置上下文:', jsonStr.substring(start, end));
            }
            
            throw new Error(`JSON解析失败，已尝试修复: ${error.message}`);
        }
    }

    /**
     * 验证推荐的多样性，采用更灵活的验证策略
     * @param {Object} recommendations - 推荐结果
     * @param {Object} userInput - 用户输入，用于智能验证
     */
    validateRecommendationDiversity(recommendations, userInput = {}) {
        console.log('🔍 [多样性验证] 开始验证推荐多样性');
        const recs = recommendations.recommendations;
        
        // 检查用户是否指定了特定的基酒
        const userSpirits = userInput.ingredients?.spirits || [];
        const hasSpecificSpirits = userSpirits.length > 0;
        console.log(`🎯 [多样性验证] 用户指定基酒: ${hasSpecificSpirits ? userSpirits.join(', ') : '无'}`);
        
        // 如果用户只指定了一种基酒，放宽多样性要求
        const shouldRelaxSpiritDiversity = hasSpecificSpirits && userSpirits.length === 1;
        console.log(`🔧 [多样性验证] 放宽基酒多样性要求: ${shouldRelaxSpiritDiversity}`);
        
        // 检查基酒分布
        const spirits = recs.map((rec, index) => {
            const ingredients = rec.recipe?.ingredients || [];
            const spirit = ingredients.find(ing => 
                ing.name.includes('威士忌') || ing.name.includes('金酒') || 
                ing.name.includes('朗姆') || ing.name.includes('龙舌兰') || 
                ing.name.includes('伏特加') || ing.name.includes('白兰地') ||
                ing.name.includes('白酒') || ing.name.includes('清酒') || 
                ing.name.includes('利口酒') || ing.name.includes('香槟')
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
        
        // 🔧 改进的基酒多样性验证 - 允许适度重复，但不能全部相同
        const uniqueSpirits = [...new Set(spirits.filter(s => s !== '未知'))];
        const validSpiritsCount = spirits.filter(s => s !== '未知').length;
        
        console.log(`📊 [多样性分析] 基酒分布: ${spirits.join(', ')}`);
        console.log(`📊 [多样性分析] 不同基酒数量: ${uniqueSpirits.length}/${validSpiritsCount}`);
        
        // 智能基酒多样性验证
        if (shouldRelaxSpiritDiversity) {
            // 用户指定了单一基酒，允许所有推荐使用相同基酒
            console.log(`✅ [多样性验证] 用户指定单一基酒，允许基酒重复 (${uniqueSpirits.length}种基酒)`);
        } else if (validSpiritsCount >= 3 && uniqueSpirits.length === 1) {
            // 用户没有指定特定基酒，但所有推荐都使用相同基酒
            console.error('❌ [多样性检查] 所有推荐使用相同基酒:', uniqueSpirits[0]);
            throw new Error(`推荐多样性验证失败：所有推荐都使用${uniqueSpirits[0]}，缺乏多样性`);
        } else {
            console.log(`✅ [多样性验证] 基酒多样性合理 (${uniqueSpirits.length}种不同基酒)`);
        }
        
        // 验证优先级多样性 - 允许部分重复
        const uniquePriorities = [...new Set(priorities.filter(p => p))];
        if (priorities.length >= 3 && uniquePriorities.length === 1) {
            console.warn('⚠️ [多样性检查] 所有推荐使用相同优先级:', uniquePriorities[0]);
            // 优先级重复不再作为致命错误，只记录警告
        } else {
            console.log(`✅ [多样性验证] 优先级标识合理 (${uniquePriorities.length}种不同优先级)`);
        }
        
        // 🔧 改进的推荐理由相似度检查 - 提高阈值，降低严格程度
        const reasonSimilarity = this.checkReasonSimilarity(reasons);
        console.log(`📊 [多样性验证] 推荐理由相似度: ${(reasonSimilarity * 100).toFixed(1)}%`);
        if (reasonSimilarity > 0.85) { // 从0.7提高到0.85
            console.error('❌ [多样性检查] 推荐理由相似度过高:', reasonSimilarity);
            throw new Error(`推荐多样性验证失败：推荐理由相似度过高 ${(reasonSimilarity * 100).toFixed(1)}%`);
        } else {
            console.log('✅ [多样性验证] 推荐理由差异化良好');
        }
        
        // 检查鸡尾酒名称是否重复 - 这个保持严格
        const names = recs.map((rec, index) => {
            const nameCn = rec.name?.chinese || '';
            const nameEn = rec.name?.english || '';
            console.log(`🏷️ [多样性验证] 推荐${index + 1} 名称: ${nameCn} (${nameEn})`);
            return nameCn;
        });
        
        const nameDuplicates = names.filter((name, index) => names.indexOf(name) !== index && name);
        if (nameDuplicates.length > 0) {
            console.error('❌ [多样性检查] 发现鸡尾酒名称重复:', nameDuplicates);
            throw new Error(`推荐多样性验证失败：鸡尾酒名称重复 - ${nameDuplicates.join(', ')}`);
        } else {
            console.log('✅ [多样性验证] 鸡尾酒名称完全不同');
        }
        
        // 🔧 新增：检查制作复杂度多样性
        const difficulties = recs.map(rec => rec.recipe?.difficulty || '未知');
        const uniqueDifficulties = [...new Set(difficulties.filter(d => d !== '未知'))];
        console.log(`📊 [多样性分析] 制作复杂度分布: ${difficulties.join(', ')}`);
        console.log(`✅ [多样性验证] 复杂度多样性: ${uniqueDifficulties.length}种不同难度`);
        
        // 🔧 新增：生成多样性验证报告
        this.generateDiversityReport(recs, spirits, priorities, reasons, difficulties);
        
        console.log('✅ [多样性验证] 验证完成 - 采用灵活策略');
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
     * 计算两个文本的相似度（改进的语义相似度算法）
     */
    calculateTextSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        if (text1 === text2) return 1;
        
        // 🔧 改进1: 按词汇分割而不是字符分割
        const words1 = this.extractKeywords(text1);
        const words2 = this.extractKeywords(text2);
        
        if (words1.length === 0 || words2.length === 0) return 0;
        
        // 🔧 改进2: 使用Jaccard相似度，但加入权重
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        const jaccardSimilarity = union.length > 0 ? intersection.length / union.length : 0;
        
        // 🔧 改进3: 长度差异惩罚 - 长度差异大的文本相似度降低
        const lengthDiff = Math.abs(text1.length - text2.length);
        const maxLength = Math.max(text1.length, text2.length);
        const lengthPenalty = lengthDiff / maxLength;
        
        // 🔧 改进4: 综合相似度计算
        const finalSimilarity = jaccardSimilarity * (1 - lengthPenalty * 0.3);
        
        return Math.max(0, finalSimilarity);
    }
    
    /**
     * 提取文本关键词（改进的分词逻辑）
     */
    extractKeywords(text) {
        // 移除标点符号，保留中文、英文、数字
        const cleanText = text.replace(/[^\u4e00-\u9fa5\w\s]/g, ' ');
        
        // 按空格和常见分隔符分割
        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        
        // 对中文进行简单的双字分割
        const chineseWords = [];
        for (const word of words) {
            if (/[\u4e00-\u9fa5]/.test(word)) {
                // 中文按双字分割
                for (let i = 0; i < word.length - 1; i++) {
                    chineseWords.push(word.substr(i, 2));
                }
                // 也保留完整词汇
                if (word.length >= 2) {
                    chineseWords.push(word);
                }
            } else {
                // 英文单词直接使用
                chineseWords.push(word.toLowerCase());
            }
        }
        
        // 去重并过滤停用词
        const stopWords = ['的', '了', '在', '是', '和', '与', '或', '但', '而', '这', '那', '一个', 'the', 'a', 'an', 'and', 'or', 'but'];
        return [...new Set(chineseWords)].filter(word => 
            word.length > 1 && !stopWords.includes(word)
        );
    }
    
    /**
     * 生成详细的多样性验证报告
     */
    generateDiversityReport(recommendations, spirits, priorities, reasons, difficulties) {
        console.log('\n📋 [多样性报告] ==========================================');
        
        // 基酒分析
        const uniqueSpirits = [...new Set(spirits.filter(s => s !== '未知'))];
        const spiritStats = {};
        spirits.forEach(spirit => {
            spiritStats[spirit] = (spiritStats[spirit] || 0) + 1;
        });
        
        console.log('🍸 基酒分析:');
        Object.entries(spiritStats).forEach(([spirit, count]) => {
            const status = count > 1 ? '⚠️ 重复' : '✅ 唯一';
            console.log(`   ${spirit}: ${count}次 ${status}`);
        });
        console.log(`   多样性评分: ${uniqueSpirits.length}/${spirits.length} (${(uniqueSpirits.length/spirits.length*100).toFixed(1)}%)`);
        
        // 优先级分析
        const uniquePriorities = [...new Set(priorities.filter(p => p))];
        const priorityStats = {};
        priorities.forEach(priority => {
            if (priority) priorityStats[priority] = (priorityStats[priority] || 0) + 1;
        });
        
        console.log('\n⭐ 优先级分析:');
        Object.entries(priorityStats).forEach(([priority, count]) => {
            const status = count > 1 ? '⚠️ 重复' : '✅ 唯一';
            console.log(`   ${priority}: ${count}次 ${status}`);
        });
        
        // 理由相似度分析
        console.log('\n💭 推荐理由相似度矩阵:');
        for (let i = 0; i < reasons.length; i++) {
            for (let j = i + 1; j < reasons.length; j++) {
                const similarity = this.calculateTextSimilarity(reasons[i], reasons[j]);
                const status = similarity > 0.85 ? '❌ 过高' : similarity > 0.6 ? '⚠️ 中等' : '✅ 良好';
                console.log(`   推荐${i+1} vs 推荐${j+1}: ${(similarity*100).toFixed(1)}% ${status}`);
            }
        }
        
        // 复杂度分析
        const uniqueDifficulties = [...new Set(difficulties.filter(d => d !== '未知'))];
        console.log('\n🛠️ 制作复杂度分析:');
        console.log(`   分布: ${difficulties.join(' | ')}`);
        console.log(`   多样性: ${uniqueDifficulties.length}种不同难度`);
        
        // 鸡尾酒名称分析
        const names = recommendations.map(rec => rec.name?.chinese || '未知');
        const uniqueNames = [...new Set(names.filter(n => n !== '未知'))];
        console.log('\n🏷️ 鸡尾酒名称分析:');
        console.log(`   名称: ${names.join(' | ')}`);
        console.log(`   唯一性: ${uniqueNames.length}/${names.length} ${uniqueNames.length === names.length ? '✅ 完全不同' : '❌ 存在重复'}`);
        
        // 综合评分
        const diversityScore = this.calculateDiversityScore(spirits, priorities, reasons, difficulties, names);
        console.log(`\n🎯 综合多样性评分: ${diversityScore.toFixed(1)}/100`);
        console.log('========================================== [报告结束]\n');
    }
    
    /**
     * 计算综合多样性评分
     */
    calculateDiversityScore(spirits, priorities, reasons, difficulties, names) {
        let score = 0;
        
        // 基酒多样性 (30分)
        const uniqueSpirits = [...new Set(spirits.filter(s => s !== '未知'))];
        const spiritScore = (uniqueSpirits.length / Math.max(spirits.length, 1)) * 30;
        score += spiritScore;
        
        // 优先级多样性 (20分)
        const uniquePriorities = [...new Set(priorities.filter(p => p))];
        const priorityScore = (uniquePriorities.length / Math.max(priorities.length, 1)) * 20;
        score += priorityScore;
        
        // 理由相似度 (25分) - 相似度越低分数越高
        const avgSimilarity = this.checkReasonSimilarity(reasons);
        const reasonScore = Math.max(0, (1 - avgSimilarity)) * 25;
        score += reasonScore;
        
        // 复杂度多样性 (15分)
        const uniqueDifficulties = [...new Set(difficulties.filter(d => d !== '未知'))];
        const difficultyScore = (uniqueDifficulties.length / Math.max(difficulties.length, 1)) * 15;
        score += difficultyScore;
        
        // 名称唯一性 (10分)
        const uniqueNames = [...new Set(names.filter(n => n !== '未知'))];
        const nameScore = (uniqueNames.length === names.length ? 1 : 0) * 10;
        score += nameScore;
        
        return Math.min(100, Math.max(0, score));
    }
}

module.exports = VolcanoService;
