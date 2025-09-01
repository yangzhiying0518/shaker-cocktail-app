/**
 * 故事性分析生成器
 * 实现4个阶段的完整故事性体验：回顾→思考→期待→结局
 * 每个阶段都有打字机效果，整体连贯，基于用户具体选择个性化生成
 */

export class StoryAnalysisGenerator {
    constructor() {
        // 4个阶段的情感递进模板
        this.storyPhases = {
            // 阶段1：回顾阶段 - 温暖回顾用户选择
            review: {
                title: "回顾你的选择",
                emotion: "understanding", // 理解
                duration: 3000,
                templates: this.buildReviewTemplates()
            },
            
            // 阶段2：思考分析 - 基于选择深入分析展现专业性
            analysis: {
                title: "深入分析思考", 
                emotion: "professional", // 专业
                duration: 3500,
                templates: this.buildAnalysisTemplates()
            },
            
            // 阶段3：期待铺垫 - 营造即将揭晓的期待感
            anticipation: {
                title: "即将为你揭晓",
                emotion: "excitement", // 期待
                duration: 2500,
                templates: this.buildAnticipationTemplates()
            },
            
            // 阶段4：完美结局 - "我为你调好了三杯鸡尾酒"
            conclusion: {
                title: "完美的答案",
                emotion: "satisfaction", // 满足
                duration: 2000,
                templates: this.buildConclusionTemplates()
            }
        };
    }

    /**
     * 生成完整的4阶段故事性分析
     * @param {Object} userInput - 用户输入数据
     * @returns {Array} 4个阶段的分析内容
     */
    generateStoryAnalysis(userInput) {
        const story = [];
        
        // 阶段1：回顾阶段
        story.push({
            phase: 'review',
            title: this.storyPhases.review.title,
            content: this.generateReviewContent(userInput),
            emotion: this.storyPhases.review.emotion,
            duration: this.storyPhases.review.duration,
            icon: "🌟"
        });

        // 阶段2：思考分析
        story.push({
            phase: 'analysis', 
            title: this.storyPhases.analysis.title,
            content: this.generateAnalysisContent(userInput),
            emotion: this.storyPhases.analysis.emotion,
            duration: this.storyPhases.analysis.duration,
            icon: "🧠"
        });

        // 阶段3：期待铺垫
        story.push({
            phase: 'anticipation',
            title: this.storyPhases.anticipation.title, 
            content: this.generateAnticipationContent(userInput),
            emotion: this.storyPhases.anticipation.emotion,
            duration: this.storyPhases.anticipation.duration,
            icon: "✨"
        });

        // 阶段4：完美结局
        story.push({
            phase: 'conclusion',
            title: this.storyPhases.conclusion.title,
            content: this.generateConclusionContent(userInput),
            emotion: this.storyPhases.conclusion.emotion,
            duration: this.storyPhases.conclusion.duration,
            icon: "🍸"
        });

        return story;
    }

    /**
     * 构建回顾阶段模板
     */
    buildReviewTemplates() {
        return {
            // 场景回顾模板
            scenes: {
                '聚会派对': [
                    "你选择了聚会派对的时光，我能感受到你对欢乐氛围的渴望...",
                    "聚会派对，多么美好的选择！那种与朋友们共享快乐的心情...",
                    "派对时光总是让人期待，你一定想要为这个特别的聚会增添些什么..."
                ],
                '浪漫约会': [
                    "浪漫约会...这是多么温柔的时光，我仿佛能看到你眼中的期待...",
                    "你选择了浪漫约会，那种心跳加速的美好感觉我都懂...",
                    "约会的夜晚总是特别的，你想要为这份浪漫增添完美的点缀..."
                ],
                '独处放松': [
                    "独处放松的时光，这是与自己对话的珍贵时刻...",
                    "你选择了独处放松，我理解那种渴望宁静的心境...",
                    "一个人的时光不是孤独，而是与内心最真实的相遇..."
                ],
                '商务场合': [
                    "商务场合，你需要的是优雅与专业的完美平衡...",
                    "你选择了商务场合，那种既要展现品味又要保持专业的微妙感...",
                    "正式的商务时光，每一个细节都在诉说着你的品格..."
                ],
                '餐前餐后': [
                    "餐前餐后的时光，美食与美酒的完美邂逅即将开始...",
                    "你选择了用餐时光，那种对味蕾体验的精致追求...",
                    "美食配美酒，这是生活中最优雅的仪式感..."
                ],
                '深夜时光': [
                    "深夜时光...这个时候的你，内心一定有很多话想说...",
                    "你选择了深夜时光，那种夜深人静时的特别心境...",
                    "深夜总是让人格外敏感，也格外真实..."
                ]
            },
            
            // 心情回顾模板
            moods: {
                '春日愉悦': "春日愉悦的心情如花朵般绽放，这份活力让人感染...",
                '雨后忧郁': "雨后忧郁的心境如森林般深沉，需要温暖的抚慰...",
                '夏日激情': "夏日激情如火焰般热烈，这份能量值得被好好珍惜...",
                '秋叶宁静': "秋叶宁静的心境如湖水般平和，这份内心的平衡很珍贵...",
                '山峰自信': "山峰自信的力量如高山般坚定，这份能量令人敬佩...",
                '深林沉思': "深林沉思的状态如古树般深邃，这份专注很难得..."
            }
        };
    }

    /**
     * 构建思考分析阶段模板
     */
    buildAnalysisTemplates() {
        return {
            // 专业分析模板
            professional: {
                scene_mood_analysis: [
                    "基于你的场景和心情，我需要在{emotion_intensity}和{social_context}之间找到完美平衡...",
                    "你的选择告诉我，这次调酒需要兼顾{primary_need}和{secondary_need}两个层面...",
                    "从调酒师的角度，{scene}配上{mood}的组合，需要特别考虑{key_factor}..."
                ],
                
                ingredient_analysis: [
                    "你选择的{primary_spirit}为基酒，这为我们的创作奠定了{flavor_foundation}的基调...",
                    "结合你的{mixers}调料选择，我能构建出{complexity_level}的层次结构...",
                    "从你的材料搭配来看，我们可以创造出{unique_characteristic}的独特体验..."
                ],
                
                preference_analysis: [
                    "你对{alcohol_level}酒精度和{sweetness}甜度的偏好，展现了{personality_trait}的品味特征...",
                    "结合{style}的口感风格，我需要在{balance_point}上做精确的调配...",
                    "你的偏好设置让我想到了{inspiration_source}，这给了我很好的创作灵感..."
                ]
            }
        };
    }

    /**
     * 构建期待铺垫阶段模板
     */
    buildAnticipationTemplates() {
        return {
            // 期待感营造
            anticipation_builders: [
                "现在，让我为你揭开这个美妙的答案...",
                "经过深思熟虑，我已经为你准备好了完美的搭配...",
                "所有的元素都在我心中汇聚，答案即将浮现...",
                "就像调酒的最后一刻，所有的精华即将融合...",
                "我能感受到完美配方在我心中成形，马上就要与你分享...",
                "这一刻，我仿佛看到了你品尝时满足的笑容..."
            ],
            
            // 专业铺垫
            professional_buildup: [
                "基于我多年的调酒经验和对你需求的理解...",
                "结合经典调酒理论和你的个性化需求...",
                "运用我对酒类搭配的深度理解...",
                "凭借对味觉平衡的精准把握...",
                "通过对你心境的细致感知..."
            ]
        };
    }

    /**
     * 构建完美结局阶段模板
     */
    buildConclusionTemplates() {
        return {
            // 完美结局模板
            perfect_endings: [
                "我为你调好了三杯鸡尾酒，每一杯都承载着我对你此刻心境的理解...",
                "三杯精心调制的鸡尾酒已经准备就绪，它们将为你的{scene}时光增添完美的色彩...",
                "经过用心调配，我为你准备了三款鸡尾酒，每一款都有它独特的故事...",
                "现在，三杯为你量身定制的鸡尾酒已经完成，它们正等待着与你相遇...",
                "我已经为你调制好了三杯特别的鸡尾酒，每一杯都融入了我对你的关怀..."
            ],
            
            // 情感升华
            emotional_climax: [
                "愿这些鸡尾酒能陪伴你度过美好的时光，就像我用心调制它们一样...",
                "希望每一口都能让你感受到生活的美好，这是我作为调酒师最大的心愿...",
                "让这些鸡尾酒成为你{scene}时光的完美伴侣，为你带来温暖和快乐...",
                "愿这份用心调制的美好，能为你的心情增添一抹亮色...",
                "这不仅仅是三杯鸡尾酒，更是我对你此刻心境的温暖回应..."
            ]
        };
    }

    /**
     * 生成回顾阶段内容
     */
    generateReviewContent(userInput) {
        const { scene, moods } = userInput;
        const templates = this.storyPhases.review.templates;
        
        let content = "";
        
        // 场景回顾
        if (scene && templates.scenes[scene]) {
            const sceneTemplates = templates.scenes[scene];
            content += sceneTemplates[Math.floor(Math.random() * sceneTemplates.length)];
        }
        
        // 心情回顾
        if (moods && moods.length > 0) {
            const primaryMood = moods[0];
            if (templates.moods[primaryMood]) {
                content += " " + templates.moods[primaryMood];
            }
        }
        
        // 如果没有具体信息，使用通用回顾
        if (!content) {
            content = "看着你的选择，我能感受到你此刻内心的期待和对美好时光的向往...";
        }
        
        return content;
    }

    /**
     * 生成思考分析阶段内容
     */
    generateAnalysisContent(userInput) {
        const { scene, moods, ingredients, preferences } = userInput;
        const templates = this.storyPhases.analysis.templates.professional;
        
        // 分析用户的情感强度和社交环境
        const emotionIntensity = this.analyzeEmotionIntensity(moods);
        const socialContext = this.analyzeSocialContext(scene);
        const primaryNeed = this.identifyPrimaryNeed(scene, moods);
        const keyFactor = this.identifyKeyFactor(scene, moods, preferences);
        
        // 构建分析内容
        let content = "";
        
        // 场景心情分析
        const sceneAnalysisTemplate = templates.scene_mood_analysis[0];
        content = sceneAnalysisTemplate
            .replace('{emotion_intensity}', emotionIntensity)
            .replace('{social_context}', socialContext)
            .replace('{primary_need}', primaryNeed)
            .replace('{scene}', scene || '你的场景')
            .replace('{mood}', moods?.[0] || '你的心情')
            .replace('{key_factor}', keyFactor);
            
        return content;
    }

    /**
     * 生成期待铺垫阶段内容
     */
    generateAnticipationContent(userInput) {
        const templates = this.storyPhases.anticipation.templates;
        
        // 随机选择期待感营造模板
        const anticipationBuilder = templates.anticipation_builders[
            Math.floor(Math.random() * templates.anticipation_builders.length)
        ];
        
        // 随机选择专业铺垫
        const professionalBuildup = templates.professional_buildup[
            Math.floor(Math.random() * templates.professional_buildup.length)
        ];
        
        return `${professionalBuildup} ${anticipationBuilder}`;
    }

    /**
     * 生成完美结局阶段内容
     */
    generateConclusionContent(userInput) {
        const { scene } = userInput;
        const templates = this.storyPhases.conclusion.templates;
        
        // 选择完美结局模板
        let perfectEnding = templates.perfect_endings[
            Math.floor(Math.random() * templates.perfect_endings.length)
        ];
        
        // 替换场景变量
        if (scene) {
            perfectEnding = perfectEnding.replace('{scene}', scene);
        }
        
        // 添加情感升华
        const emotionalClimax = templates.emotional_climax[
            Math.floor(Math.random() * templates.emotional_climax.length)
        ];
        
        return `${perfectEnding} ${emotionalClimax.replace('{scene}', scene || '此刻')}`;
    }

    /**
     * 分析情感强度
     */
    analyzeEmotionIntensity(moods) {
        if (!moods || moods.length === 0) return "平和的情感";
        
        const intensityMap = {
            '春日愉悦': '轻快的活力',
            '雨后忧郁': '深沉的情感',
            '夏日激情': '热烈的激情',
            '秋叶宁静': '宁静的平和',
            '山峰自信': '坚定的力量',
            '深林沉思': '深邃的思考'
        };
        
        return intensityMap[moods[0]] || '独特的情感';
    }

    /**
     * 分析社交环境
     */
    analyzeSocialContext(scene) {
        const contextMap = {
            '聚会派对': '热闹的社交氛围',
            '浪漫约会': '亲密的二人世界',
            '独处放松': '私人的静谧空间',
            '商务场合': '正式的商务环境',
            '餐前餐后': '优雅的用餐时光',
            '深夜时光': '深夜的个人时间'
        };
        
        return contextMap[scene] || '特殊的环境氛围';
    }

    /**
     * 识别主要需求
     */
    identifyPrimaryNeed(scene, moods) {
        // 基于场景和心情识别主要需求
        if (scene === '聚会派对') return '活跃气氛';
        if (scene === '浪漫约会') return '营造浪漫';
        if (scene === '独处放松') return '舒缓心情';
        if (scene === '商务场合') return '展现品味';
        if (scene === '餐前餐后') return '提升味觉';
        if (scene === '深夜时光') return '陪伴思考';
        
        return '满足心境';
    }

    /**
     * 识别关键因素
     */
    identifyKeyFactor(scene, moods, preferences) {
        // 综合分析关键调配因素
        const factors = [];
        
        if (preferences?.alcohol_level === '高度') factors.push('酒精浓度');
        if (preferences?.sweetness === '很甜') factors.push('甜度平衡');
        if (preferences?.style === '清爽') factors.push('口感清新度');
        if (moods?.includes('雨后忧郁')) factors.push('情感抚慰');
        if (scene === '浪漫约会') factors.push('视觉美感');
        
        return factors.length > 0 ? factors[0] : '整体和谐度';
    }

    /**
     * 获取阶段配置
     */
    getPhaseConfig(phase) {
        return this.storyPhases[phase] || null;
    }

    /**
     * 验证用户输入完整性
     */
    validateUserInput(userInput) {
        const hasScene = !!userInput.scene;
        const hasMoods = userInput.moods && userInput.moods.length > 0;
        const hasIngredients = userInput.ingredients && (
            userInput.ingredients.spirits?.length > 0 ||
            userInput.ingredients.mixers?.length > 0 ||
            userInput.ingredients.tools?.length > 0
        );
        
        return {
            completeness: hasScene && hasMoods ? 'high' : hasScene || hasMoods ? 'medium' : 'low',
            hasScene,
            hasMoods,
            hasIngredients
        };
    }
}

// 创建全局实例
export const storyAnalysis = new StoryAnalysisGenerator();
