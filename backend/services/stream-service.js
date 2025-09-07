/**
 * 流式推荐服务
 * 实现Shaker人设分析 + 鸡尾酒推荐的完整流式体验
 */

const VolcanoService = require('./volcano-service');

class StreamService {
    constructor() {
        // 确保环境变量已加载
        require('dotenv').config();
        this.volcanoService = new VolcanoService();
    }

    /**
     * 优化的流式推荐：分析完成立即展示推荐
     * @param {Object} userInput - 用户输入数据
     * @param {Function} onData - 数据回调函数
     * @param {Function} onError - 错误回调函数
     * @param {Function} onEnd - 结束回调函数
     */
    async streamRecommendation(userInput, onData, onError, onEnd) {
        try {
            // 重置分析发送状态（新请求开始）
            this.analysisAlreadySent = false;
            console.log('🍸 [StreamService] 开始优化流式推荐服务');
            
            // 1. 立即启动推荐生成（后台异步）
            let recommendationResult = null;
            let recommendationReady = false;
            
            const recommendationPromise = this.generateRecommendationsInBackground(userInput)
                .then(result => {
                    recommendationResult = result;
                    recommendationReady = true;
                    console.log('🍸 [后台] 推荐已准备就绪');
                    return result;
                })
                .catch(error => {
                    console.error('❌ [后台] 推荐生成失败:', error);
                    throw error;
                });

            // 2. 开始分析展示（等待分析完成）
            console.log('📝 [前台] 开始分析展示');
            await this.generateSegmentedAnalysis(userInput, onData);
            console.log('✅ [前台] 分析展示完成');
            
            // 3. 分析完成后，检查推荐状态并立即处理
            if (recommendationReady) {
                // 推荐已经准备好，立即展示
                console.log('⚡ 分析完成，推荐已就绪，立即展示');
                this.showRecommendationsImmediately(recommendationResult, onData);
            } else {
                // 推荐还没准备好，显示简短过渡并等待
                console.log('⏳ 分析完成，等待推荐生成完成...');
                onData({
                    type: 'phase_transition',
                    phase: 'waiting_recommendations',
                    message: '正在最后确认配方...'
                });
                
                // 等待推荐完成
                const result = await recommendationPromise;
                this.showRecommendationsImmediately(result, onData);
            }
            
            onEnd();
            
        } catch (error) {
            console.error('❌ [StreamService] 流式服务错误:', error);
            onError(error);
        }
    }

    /**
     * 生成分段分析（新的优化方法）
     */
    async generateSegmentedAnalysis(userInput, onData) {
        // 防重复调用检查
        if (this.analysisAlreadySent) {
            console.log('🔄 [StreamService] 分段分析已发送，跳过重复调用');
            return { success: true, skipped: true };
        }
        
        console.log('🧠 [StreamService] 开始生成分段分析');
        
        const segmentedPrompt = this.buildSegmentedAnalysisPrompt(userInput);
        
        return new Promise((resolve, reject) => {
            let fullResponse = '';
            
            this.volcanoService.streamChat(
                segmentedPrompt,
                (chunk) => {
                    const chunkContent = chunk.content || '';
                    fullResponse += chunkContent;
                },
                (error) => {
                    console.error('❌ [StreamService] 分段分析错误:', error);
                    reject(error);
                },
                () => {
                    console.log('✅ [StreamService] 分段分析完成');
                    
                    // 检查是否有重复的JSON块 - 使用更安全的检测方式
                    const segmentCount = (fullResponse.match(/"segments"/g) || []).length;
                    if (segmentCount > 1) {
                        // 只取第一个完整的JSON块
                        const firstJsonEnd = fullResponse.indexOf(']}') + 2;
                        if (firstJsonEnd > 1) {
                            fullResponse = fullResponse.substring(0, firstJsonEnd);
                        }
                    }
                    
                    try {
                        const analysisData = JSON.parse(fullResponse);
                        
                        // 只发送一次分段数据
                        if (!this.analysisAlreadySent) {
                            this.analysisAlreadySent = true;
                            console.log('📤 [StreamService] 发送分段分析数据');
                            onData({
                                type: 'segmented_analysis',
                                segments: analysisData.segments
                            });
                        } else {
                            console.log('⚠️ [StreamService] 分段分析重复调用被阻止');
                        }
                        
                        resolve({ success: true });
                    } catch (error) {
                        console.warn('⚠️ [StreamService] 分段分析解析失败');
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * 构建分段分析Prompt
     */
    buildSegmentedAnalysisPrompt(userInput) {
        const { scene, moods, ingredients, preferences, special_requirements } = userInput;
        
        return `你是Shaker，专业而温暖的调酒师。请对用户需求进行简洁分析。

用户信息：
- 场景：${scene || '随意'}
- 心情：${moods?.join('、') || '随意'}  
- 材料：${ingredients?.spirits?.join('、') || '无特定要求'}
- 偏好：${preferences?.alcohol_level || '中度'}酒精
${special_requirements ? `- 要求：${special_requirements}` : ''}

请生成4段简洁的分析，每段20字以内，语言自然流畅。

返回格式：
{
  "segments": [
    {
      "title": "理解你的场景选择",
      "content": "场景分析文字（20字以内，自然流畅）",
      "focus": "scene"
    },
    {
      "title": "感受你的心情状态",
      "content": "心情理解文字（20字以内，自然流畅）", 
      "focus": "mood"
    },
    {
      "title": "分析你的材料准备",
      "content": "材料点评文字（20字以内，自然流畅）",
      "focus": "ingredients"
    },
    {
      "title": "为你量身调制",
      "content": "调制准备文字（20字以内，自然流畅）",
      "focus": "preparation"
    }
  ]
}

重要：确保每段content都是完整、连贯的中文句子，语法正确，表达清晰。`;
    }

    /**
     * 统一的流式分析和推荐生成
     */
    async streamUnifiedAnalysisAndRecommendation(userInput, onData, onError, onEnd) {
        console.log('🧠 [StreamService] 开始统一流式分析和推荐');
        
        const unifiedPrompt = this.buildUnifiedPrompt(userInput);
        let currentRecommendationIndex = 0;
        let jsonBuffer = '';
        let analysisPhase = true;
        
        return new Promise((resolve, reject) => {
            this.volcanoService.streamChat(
                unifiedPrompt,
                (chunk) => {
                    const content = chunk.content || '';
                    jsonBuffer += content;
                    
                    // 尝试解析JSON对象
                    this.parseStreamingData(jsonBuffer, (parsedData) => {
                        if (parsedData.type === 'analysis') {
                            // 处理分析数据
                            onData({
                                type: 'thought_segment',
                                segment: 0,
                                content: parsedData.content,
                                emotion: 'understanding',
                                duration: 2000
                            });
                            
                            if (analysisPhase) {
                                analysisPhase = false;
                                // 发送阶段转换
                                setTimeout(() => {
                                    onData({
                                        type: 'phase_transition',
                                        phase: 'recommendations',
                                        message: '分析完成，开始调制推荐...'
                                    });
                                }, 2000);
                            }
                        } else if (parsedData.type === 'recommendation') {
                            // 处理推荐数据
                            onData({
                                type: 'recommendation',
                                index: currentRecommendationIndex++,
                                content: { recommendations: [parsedData.content] },
                                glassType: parsedData.content.glassType || '🍸'
                            });
                        }
                        
                        // 清除已解析的部分
                        jsonBuffer = jsonBuffer.substring(jsonBuffer.indexOf('}') + 1);
                    });
                },
                (error) => {
                    console.error('❌ [StreamService] 统一API错误:', error);
                    reject(error);
                },
                () => {
                    console.log('✅ [StreamService] 统一流式完成');
                    
                    // 发送完成信号
                    onData({
                        type: 'complete',
                        message: '推荐完成'
                    });
                    
                    onEnd();
                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * 解析流式JSON数据 - 改进版
     */
    parseStreamingData(buffer, onParsed) {
        // 寻找完整的JSON对象
        let braceCount = 0;
        let startIndex = -1;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];
            
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            
            if (char === '"') {
                inString = !inString;
                continue;
            }
            
            if (inString) continue;
            
            if (char === '{') {
                if (braceCount === 0) {
                    startIndex = i;
                }
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                
                if (braceCount === 0 && startIndex !== -1) {
                    const jsonStr = buffer.substring(startIndex, i + 1);
                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.type) {
                            onParsed(parsed);
                        }
                    } catch (e) {
                        console.warn('⚠️ JSON解析失败:', jsonStr);
                    }
                    startIndex = -1;
                }
            }
        }
    }

    /**
     * 构建统一的分析和推荐Prompt
     */
    buildUnifiedPrompt(userInput) {
        const { scene, moods, ingredients, preferences } = userInput;
        
        return `你是Shaker，温暖的森林调酒师。请分析用户需求并推荐3款鸡尾酒。

用户选择：
- 场景：${scene}
- 心情：${moods?.join('、') || '未指定'}
- 材料：基酒${ingredients?.spirits?.join('、') || '无'}，调料${ingredients?.mixers?.join('、') || '无'}
- 偏好：${preferences?.alcohol_level || '中度'}酒精，${preferences?.style || '清爽'}风格

请按以下JSON格式流式输出：

1. 先输出分析（50字内温暖理解）：
{"type":"analysis","content":"理解用户的心情和需求..."}

2. 再逐个输出3个推荐：
{"type":"recommendation","content":{"name":{"chinese":"中文名","english":"English"},"glassType":"🍸","reason":"推荐理由30字内","recipe":{"ingredients":[{"name":"材料","amount":"用量"}]}}}

要求：分析体现关怀，推荐精准匹配，配方真实可行。`;
    }

    /**
     * 生成有人味的分段思考
     */
    async generateShakerThoughts(userInput, onData) {
        console.log('🧠 [StreamService] 开始生成Shaker分段思考');
        
        const thoughts = this.buildShakerThoughts(userInput);
        
        for (let i = 0; i < thoughts.length; i++) {
            const thought = thoughts[i];
            
            // 发送思考段落
            onData({
                type: 'thought_segment',
                segment: i,
                content: thought.content,
                emotion: thought.emotion,
                duration: thought.duration
            });
            
            // 等待指定时间
            await new Promise(resolve => setTimeout(resolve, thought.duration));
        }
        
        console.log('✅ [StreamService] Shaker思考完成');
        return { success: true };
    }

    /**
     * 后台生成推荐（不阻塞前端显示）
     */
    async generateRecommendationsInBackground(userInput) {
        console.log('🔄 [StreamService] 后台开始生成推荐');
        
        const recommendationPrompt = this.buildRecommendationPrompt(userInput);
        
        return new Promise((resolve, reject) => {
            let fullResponse = '';
            let chunkCount = 0;
            
            this.volcanoService.streamChat(
                recommendationPrompt,
                (chunk) => {
                    chunkCount++;
                    const content = chunk.content || '';
                    fullResponse += content;
                    
                    // 更智能的提前检测：减少无效解析尝试
                    if (fullResponse.length > 800 && chunkCount % 15 === 0) {
                        try {
                            // 快速检查是否包含完整的推荐结构
                            if (this.hasCompleteRecommendationStructure(fullResponse)) {
                                const testResult = this.parseRecommendation(fullResponse);
                                if (testResult && testResult.recommendations && testResult.recommendations.length >= 1) {
                                    console.log(`✅ [StreamService] 提前检测到推荐 (${testResult.recommendations.length}个)`);
                                    resolve(testResult);
                                    return;
                                }
                            }
                        } catch (e) {
                            // 只记录非预期的错误
                            if (!e.message.includes('JSON内容看起来不完整') && 
                                !e.message.includes('内容太短') && 
                                !e.message.includes('所有解析策略都失败了')) {
                                console.log('🔄 [StreamService] 提前检测失败:', e.message.substring(0, 50) + '...');
                            }
                        }
                    }
                },
                (error) => {
                    console.error('❌ [StreamService] 后台推荐生成错误:', error);
                    // 禁用降级方案，直接上抛错误
                    reject(error);
                },
                () => {
                    console.log('✅ [StreamService] 后台推荐生成完成');
                    
                    try {
                        const recommendations = this.parseRecommendation(fullResponse);
                        resolve(recommendations);
                    } catch (error) {
                        console.warn('⚠️ [StreamService] 推荐解析失败');
                        // 禁用降级方案，直接抛错
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * 构建有人味的分段思考内容
     */
    buildShakerThoughts(userInput) {
        const { scene, moods, ingredients, preferences } = userInput;
        
        // 情感分析：根据场景+心情判断用户状态
        const emotionalState = this.analyzeEmotionalState(scene, moods, preferences);
        
        const thoughts = [
            {
                content: this.generateSceneThought(scene, emotionalState),
                emotion: 'understanding',
                duration: 3000
            },
            {
                content: this.generateMoodThought(moods, emotionalState),
                emotion: 'empathy',
                duration: 3000
            },
            {
                content: this.generatePreferenceThought(preferences, ingredients, emotionalState),
                emotion: 'caring',
                duration: 3000
            },
            {
                content: this.generatePreparationThought(emotionalState),
                emotion: 'excitement',
                duration: 2000
            }
        ];
        
        return thoughts;
    }

    /**
     * 分析用户情感状态
     */
    analyzeEmotionalState(scene, moods, preferences) {
        const moodKeywords = moods.join(' ').toLowerCase();
        const sceneKeywords = scene.toLowerCase();
        const alcoholLevel = preferences.alcohol_level;
        
        // 判断是否需要安慰
        const needsComfort = moodKeywords.includes('疲惫') || 
                           moodKeywords.includes('忧郁') || 
                           moodKeywords.includes('孤独') ||
                           moodKeywords.includes('压力');
        
        // 判断是否庆祝心情
        const isCelebrating = moodKeywords.includes('兴奋') || 
                            moodKeywords.includes('开心') ||
                            moodKeywords.includes('愉悦');
        
        // 判断是否深夜独处
        const isLateNight = sceneKeywords.includes('深夜') || 
                          sceneKeywords.includes('独处');
        
        // 判断酒精需求强度
        const needsStrongDrink = alcoholLevel === '高度' && (needsComfort || isLateNight);
        
        return {
            needsComfort,
            isCelebrating,
            isLateNight,
            needsStrongDrink,
            emotionalIntensity: needsComfort ? 'high' : isCelebrating ? 'medium' : 'low'
        };
    }

    /**
     * 生成场景共鸣思考
     */
    generateSceneThought(scene, emotionalState) {
        const sceneResponses = {
            '聚会派对': [
                "看到你选择了聚会派对，我能感受到你想要融入欢乐氛围的心情...",
                "聚会的热闹总是让人期待，我想为你调制一款能点燃气氛的特调..."
            ],
            '浪漫约会': [
                "浪漫约会呢...这是多么美好的时光，我仿佛能看到你眼中的期待...",
                "约会的紧张和兴奋，我都懂。让我为这个特别的夜晚准备点什么..."
            ],
            '独处放松': emotionalState.needsComfort ? [
                "独处的时光...有时候我们都需要一个人静静地待着，我理解这种感觉...",
                "一个人的夜晚不代表孤独，有时候这是最好的自我陪伴时间..."
            ] : [
                "独处放松，这是多么珍贵的me time，享受与自己对话的时光...",
                "一个人的时光总是特别宁静，让我为你调制一杯温暖的陪伴..."
            ],
            '深夜时光': [
                "深夜时光...这个时候的你，是在思考什么呢？夜晚总是让人格外敏感...",
                "深夜的静谧有种特别的魔力，让人更容易触碰到内心深处..."
            ]
        };
        
        const responses = sceneResponses[scene] || [
            `看到你选择了"${scene}"，我能感受到你此刻的心境...`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 生成心情理解思考
     */
    generateMoodThought(moods, emotionalState) {
        const moodText = moods.join('、');
        
        if (emotionalState.needsComfort) {
            return `感受到你的"${moodText}"...朋友，我想告诉你，这些感觉都是正常的。让我用一杯温暖的酒来拥抱你的心情...`;
        } else if (emotionalState.isCelebrating) {
            return `"${moodText}"的你让我也感到开心！这种美好的心情值得用一杯特别的酒来庆祝...`;
        } else {
            return `此刻的"${moodText}"让我想到，每种心情都有它的美好。让我为你找到最契合的那一杯...`;
        }
    }

    /**
     * 生成偏好洞察思考
     */
    generatePreferenceThought(preferences, ingredients, emotionalState) {
        const style = preferences.style || '清爽';
        const alcoholLevel = preferences.alcohol_level || '中度';
        const spirits = ingredients.spirits || [];
        
        if (emotionalState.needsStrongDrink) {
            return `你对"${style}"的偏好，加上${alcoholLevel}的酒精度选择...我明白，有时候我们需要一些力量来面对内心的波澜...`;
        } else {
            return `你偏爱"${style}"的口感，这告诉我你是个有品味的人。${spirits.length > 0 ? `而且选择了${spirits.join('、')}，` : ''}我已经有了完美的想法...`;
        }
    }

    /**
     * 生成调制准备思考
     */
    generatePreparationThought(emotionalState) {
        if (emotionalState.needsComfort) {
            return "现在，让我用心为你调制几款能温暖心灵的鸡尾酒...每一滴都带着我的关怀...";
        } else if (emotionalState.isCelebrating) {
            return "让我为你调制几款充满活力的鸡尾酒...每一杯都承载着这份美好的心情...";
        } else {
            return "让我为你调制几款特别的鸡尾酒...每一款都是为此刻的你量身定制...";
        }
    }

    /**
     * 流式生成Shaker分析（保留原方法作为备用）
     */
    async streamShakerAnalysis(userInput, onData) {
        const analysisPrompt = this.buildShakerAnalysisPrompt(userInput);
        
        return new Promise((resolve, reject) => {
            this.volcanoService.streamChat(
                analysisPrompt,
                (chunk) => {
                    // 转发分析数据
                    onData({
                        type: 'analysis',
                        content: chunk.content || '',
                        delta: chunk
                    });
                },
                (error) => {
                    console.error('❌ [StreamService] 分析阶段错误:', error);
                    reject(error);
                },
                () => {
                    console.log('✅ [StreamService] 分析阶段完成');
                    resolve();
                }
            );
        });
    }

    /**
     * 流式生成鸡尾酒推荐
     */
    async streamCocktailRecommendations(userInput, onData) {
        const recommendationPrompt = this.buildRecommendationPrompt(userInput);
        
        return new Promise((resolve, reject) => {
            let currentRecommendation = '';
            let recommendationIndex = 0;
            
            this.volcanoService.streamChat(
                recommendationPrompt,
                (chunk) => {
                    const content = chunk.content || '';
                    currentRecommendation += content;
                    
                    // 检测是否完成一个推荐
                    if (this.isRecommendationComplete(currentRecommendation)) {
                        const recommendation = this.parseRecommendation(currentRecommendation);
                        
                        onData({
                            type: 'recommendation',
                            index: recommendationIndex,
                            content: recommendation,
                            glassType: this.getGlassType(recommendation)
                        });
                        
                        recommendationIndex++;
                        currentRecommendation = '';
                    } else {
                        // 发送增量内容
                        onData({
                            type: 'recommendation_delta',
                            index: recommendationIndex,
                            content: content
                        });
                    }
                },
                (error) => {
                    console.error('❌ [StreamService] 推荐阶段错误:', error);
                    reject(error);
                },
                () => {
                    console.log('✅ [StreamService] 推荐阶段完成');
                    resolve();
                }
            );
        });
    }

    /**
     * 构建Shaker分析提示词
     */
    buildShakerAnalysisPrompt(userInput) {
        return `你是Shaker，一位温暖的森林调酒师，拥有深厚的调酒经验和敏锐的洞察力。

用户的选择：
- 场景：${userInput.scene}
- 心情：${userInput.moods?.join('、') || '未指定'}
- 可用材料：
  * 基酒：${userInput.ingredients?.spirits?.join('、') || '无特定要求'}
  * 调料：${userInput.ingredients?.mixers?.join('、') || '无特定要求'}
  * 工具：${userInput.ingredients?.tools?.join('、') || '基础工具'}
- 偏好设置：
  * 酒精度：${userInput.preferences?.alcohol_level || '中度'}
  * 甜度：${userInput.preferences?.sweetness || '适中'}
  * 酸度：${userInput.preferences?.acidity || '适中'}
  * 口感风格：${userInput.preferences?.style || '清爽'}

请以Shaker的身份，用150字左右温暖地分析用户的内心需求和当前状态。要求：

1. 体现对用户心情和场景的深度理解
2. 语言温暖、诗意，像关心朋友一样
3. 展现你作为森林调酒师的专业洞察
4. 最后说"让我为你调制几款特别的鸡尾酒..."
5. 符合森林主题的自然、治愈风格

直接输出分析内容，不要任何格式标记。`;
    }

    /**
     * 构建推荐提示词
     */
    buildRecommendationPrompt(userInput) {
        const inputMode = this.getInputMode(userInput);
        
        return `作为Shaker，基于对用户的理解，请推荐3款鸡尾酒。

用户信息：
- 场景：${userInput.scene || '未指定'}
- 心情：${userInput.moods?.join('、') || '未指定'}
- 材料偏好：${JSON.stringify(userInput.ingredients)}
- 口味偏好：${JSON.stringify(userInput.preferences)}
- 特殊要求：${userInput.special_requirements || '无'}
- 输入模式：${inputMode}

请按以下JSON格式返回恰好3款推荐：

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

推荐策略：
- 第1款：最适合当前需求的选择
- 第2款：最有创意灵感的推荐
- 第3款：经典选择或意外惊喜

每款酒的priority标识必须不同。只返回JSON格式，不要其他内容。`;
    }

    getInputMode(userInput) {
        const hasScene = !!userInput.scene;
        const hasMoods = userInput.moods?.length > 0;
        const hasIngredients = userInput.ingredients?.spirits?.length > 0 || 
                             userInput.ingredients?.mixers?.length > 0 || 
                             userInput.ingredients?.tools?.length > 0;
        const hasSpecialReq = !!userInput.special_requirements;
        
        const selectionCount = [hasScene, hasMoods, hasIngredients, hasSpecialReq].filter(Boolean).length;
        
        if (selectionCount === 0) return '完全自由模式';
        if (selectionCount <= 2) return '最少信息模式';
        return '引导模式';
    }

    /**
     * 检测推荐是否完成
     */
    isRecommendationComplete(content) {
        // 简单检测：包含完整的JSON结构
        try {
            const parsed = JSON.parse(content);
            return parsed.recommendations && Array.isArray(parsed.recommendations);
        } catch {
            return false;
        }
    }

    /**
     * 流式JSON解析器 - 处理分段数据
     */
    parseRecommendation(content) {
        try {
            // 基础清理内容
            let cleanContent = content.trim()
                .replace(/```json\s*|\s*```/g, '')
                .replace(/```\s*|\s*```/g, '')
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/^\uFEFF/, '')
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
            
            // 快速预检查 - 避免无效解析
            if (cleanContent.length < 100 || !cleanContent.includes('"recommendations"')) {
                throw new Error('Content too short or missing recommendations');
            }
            
            // 主要策略：查找JSON边界
            const start = cleanContent.indexOf('{');
            const end = cleanContent.lastIndexOf('}');
            
            if (start !== -1 && end !== -1 && start < end) {
                const jsonStr = cleanContent.substring(start, end + 1);
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
                        console.log(`✅ [StreamService] JSON解析成功，推荐数量: ${parsed.recommendations.length}`);
                        return parsed;
                    }
                } catch (parseError) {
                    // 继续尝试修复策略
                }
            }
            
            // 备用策略：基础修复后再试
            const repaired = this.basicJSONRepair(cleanContent);
            const parsed = JSON.parse(repaired);
            
            if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
                console.log(`✅ [StreamService] 修复后JSON解析成功`);
                return parsed;
            }
            
            throw new Error('No valid recommendations found');
            
        } catch (error) {
            // 简化错误日志，只记录关键信息
            console.error('❌ [StreamService] JSON解析失败:', {
                error: error.message,
                contentLength: content.length,
                hasRecommendations: content.includes('"recommendations"'),
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * 快速检查是否包含完整的推荐结构
     */
    hasCompleteRecommendationStructure(content) {
        // 检查必要的字段
        const requiredFields = ['"recommendations"', '"priority"', '"name"', '"reason"'];
        const hasAllFields = requiredFields.every(field => content.includes(field));
        
        if (!hasAllFields) return false;
        
        // 检查至少有一个完整的推荐对象结构
        const priorityCount = (content.match(/"priority":/g) || []).length;
        const nameCount = (content.match(/"name":/g) || []).length;
        const reasonCount = (content.match(/"reason":/g) || []).length;
        
        // 至少要有一个完整的推荐
        return priorityCount >= 1 && nameCount >= 1 && reasonCount >= 1;
    }

    /**
     * 检查JSON内容是否看起来完整 - 优化版本，更宽松的检查
     */
    looksComplete(content) {
        // 基本长度检查 - 降低阈值
        if (content.length < 200) return false;
        
        // 检查基本结构
        const hasRecommendations = content.includes('"recommendations"');
        if (!hasRecommendations) return false;
        
        // 更宽松的推荐数量检查 - 至少1个即可尝试解析
        const priorityMatches = content.match(/"priority":/g);
        if (!priorityMatches || priorityMatches.length < 1) return false;
        
        // 检查是否包含基本的推荐结构
        const hasName = content.includes('"name"');
        const hasReason = content.includes('"reason"');
        if (!hasName || !hasReason) return false;
        
        // 更宽松的JSON结构平衡检查
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;
        
        // 允许更多未闭合的括号（流式传输特性）
        const braceBalance = openBraces - closeBraces;
        const bracketBalance = openBrackets - closeBrackets;
        
        // 如果括号基本平衡或者只是轻微不平衡，就尝试解析
        return (braceBalance <= 3) && (bracketBalance <= 1) && (braceBalance >= 0) && (bracketBalance >= 0);
    }

    /**
     * 简化的JSON提取策略
     */
    tryMultipleExtractionStrategies(content) {
        const strategies = [];
        
        // 策略1: 标准的开始和结束大括号
        const startIndex = content.indexOf('{');
        const lastIndex = content.lastIndexOf('}');
        if (startIndex !== -1 && lastIndex !== -1 && startIndex < lastIndex) {
            strategies.push(content.substring(startIndex, lastIndex + 1));
        }
        
        // 策略2: 尝试基本修复
        const repairedContent = this.basicJSONRepair(content);
        if (repairedContent !== content) {
            strategies.push(repairedContent);
        }
        
        return strategies;
    }

    /**
     * 查找匹配的大括号
     */
    findMatchingBrace(text) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            
            if (char === '"') {
                inString = !inString;
                continue;
            }
            
            if (inString) continue;
            
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return i;
                }
            }
        }
        
        return -1;
    }

    /**
     * 增强的JSON修复 - 处理流式传输的不完整JSON
     */
    basicJSONRepair(content) {
        let repaired = content;
        
        // 1. 清理常见的流式传输问题
        repaired = repaired
            // 移除可能的markdown标记
            .replace(/```json\s*|\s*```/g, '')
            // 移除BOM和控制字符
            .replace(/^\uFEFF/, '')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
            // 标准化换行符
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();
        
        // 2. 修复常见的JSON语法问题
        repaired = repaired
            // 修复末尾多余逗号
            .replace(/,(\s*[}\]])/g, '$1')
            // 修复未闭合的字符串（在行尾添加引号）
            .replace(/:\s*"([^"]*?)$/gm, ': "$1"')
            // 修复缺失的逗号（在}或]后面，如果下一行是"开头）
            .replace(/([}\]])\s*\n\s*"/g, '$1,\n"');
        
        // 3. 智能闭合未完成的JSON结构
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;
        
        // 如果有未闭合的结构，尝试智能闭合
        if (openBraces > closeBraces) {
            // 检查最后一个字符，如果是逗号，先移除
            if (repaired.endsWith(',')) {
                repaired = repaired.slice(0, -1);
            }
            repaired += '}'.repeat(openBraces - closeBraces);
        }
        
        if (openBrackets > closeBrackets) {
            repaired += ']'.repeat(openBrackets - closeBrackets);
        }
        
        // 4. 特殊处理：如果JSON看起来被截断在字符串中间，尝试修复
        if (repaired.includes('"') && !this.isStringClosed(repaired)) {
            repaired = this.fixUnclosedStrings(repaired);
        }
        
        return repaired;
    }
    
    /**
     * 检查字符串是否正确闭合
     */
    isStringClosed(content) {
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            
            if (char === '"') {
                inString = !inString;
            }
        }
        
        return !inString;
    }
    
    /**
     * 修复未闭合的字符串
     */
    fixUnclosedStrings(content) {
        // 简单策略：如果最后一个引号没有配对，添加闭合引号
        const quotes = content.match(/"/g) || [];
        if (quotes.length % 2 === 1) {
            // 找到最后一个未闭合的字符串位置
            const lastQuoteIndex = content.lastIndexOf('"');
            const afterQuote = content.substring(lastQuoteIndex + 1);
            
            // 如果引号后面只有空白字符或者看起来像是被截断的内容，添加闭合引号
            if (/^\s*$/.test(afterQuote) || /^[^"]*$/.test(afterQuote)) {
                return content + '"';
            }
        }
        
        return content;
    }

    /**
     * 简化的JSON解析方法
     */
    attemptJSONParse(jsonStr) {
        // 直接尝试解析
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // 基本清理和修复
            let fixedJson = jsonStr
                .replace(/^\uFEFF/, '') // 移除BOM
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // 移除控制字符
                .replace(/,(\s*[}\]])/g, '$1') // 修复末尾逗号
                .replace(/\s+/g, ' ') // 标准化空格
                .trim();

            try {
                return JSON.parse(fixedJson);
            } catch (e2) {
                throw new Error(`JSON解析失败: ${e.message}`);
            }
        }
    }



    /**
     * 获取酒杯类型
     */
    getGlassType(recommendation) {
        if (recommendation?.recommendations?.[0]?.glassType) {
            return recommendation.recommendations[0].glassType;
        }
        // 随机选择一个酒杯
        const glasses = ['🍸', '🍹', '🥃'];
        return glasses[Math.floor(Math.random() * glasses.length)];
    }

    /**
     * 立即展示推荐结果
     * @param {Object} recommendationResult - 推荐结果
     * @param {Function} onData - 数据回调函数
     */
    showRecommendationsImmediately(recommendationResult, onData) {
        // 发送阶段转换（无等待感的文案）
        onData({
            type: 'phase_transition',
            phase: 'recommendations',
            message: '✨ 为您揭晓完美搭配！'
        });

        // 立即逐个展示推荐
        if (recommendationResult && recommendationResult.recommendations) {
            recommendationResult.recommendations.forEach((recommendation, index) => {
                onData({
                    type: 'recommendation',
                    index: index,
                    content: { recommendations: [recommendation] },
                    glassType: recommendation.glassType || this.getGlassType({ recommendations: [recommendation] })
                });
            });
        }
        
        // 发送完成信号
        onData({
            type: 'complete',
            message: '推荐完成'
        });
    }

    /**
     * 降级推荐方案
     */
    getFallbackRecommendation() {
        throw new Error('Fallback disabled by configuration');
    }
}

module.exports = StreamService;

