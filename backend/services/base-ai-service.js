/**
 * AI服务基类 - 定义统一接口和降级方案
 */

class BaseAIService {
    constructor() {
        this.fallbackRecommendations = this.initializeFallbackRecommendations();
    }

    /**
     * 获取鸡尾酒推荐 - 抽象方法，子类必须实现
     * @param {Object} userInput 用户输入数据
     * @returns {Promise<Object>} 推荐结果
     */
    async getCocktailRecommendation(userInput) {
        throw new Error('子类必须实现getCocktailRecommendation方法');
    }

    /**
     * 获取降级推荐方案
     * @param {Object} userInput 用户输入数据
     * @returns {Object} 降级推荐结果
     */
    getFallbackRecommendations(userInput = {}) {
        const sceneRecommendations = {
            "聚会派对": this.getPartyRecommendations(),
            "浪漫约会": this.getRomanticRecommendations(),
            "独处放松": this.getRelaxRecommendations(),
            "商务场合": this.getBusinessRecommendations(),
            "餐前餐后": this.getDiningRecommendations(),
            "深夜时光": this.getMidnightRecommendations()
        };

        const scene = userInput.scene || "独处放松";
        const recommendations = sceneRecommendations[scene] || this.getDefaultRecommendations();
        
        // 随机选择3个推荐
        const shuffled = recommendations.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        return {
            recommendations: selected.map(rec => this.formatRecommendation(rec, userInput))
        };
    }

    formatRecommendation(recommendation, userInput) {
        return {
            name: recommendation.name,
            reason: `根据您的${userInput.scene || '场景'}和${userInput.moods?.join('、') || '心情'}，推荐这款${recommendation.style}的鸡尾酒`,
            recipe: recommendation.recipe,
            instructions: recommendation.instructions,
            taste_profile: recommendation.taste_profile,
            visual: recommendation.visual,
            prep_time: recommendation.prep_time,
            alcohol_content: recommendation.alcohol_content,
            serving_temp: recommendation.serving_temp,
            best_time: recommendation.best_time
        };
    }

    initializeFallbackRecommendations() {
        return {
            party: this.getPartyRecommendations(),
            romantic: this.getRomanticRecommendations(),
            relax: this.getRelaxRecommendations(),
            business: this.getBusinessRecommendations(),
            dining: this.getDiningRecommendations(),
            midnight: this.getMidnightRecommendations()
        };
    }

    getPartyRecommendations() {
        return [
            {
                name: { chinese: "莫吉托", english: "Mojito" },
                style: "清爽活力",
                recipe: {
                    ingredients: [
                        { name: "白朗姆酒", amount: "50ml" },
                        { name: "青柠汁", amount: "30ml" },
                        { name: "薄荷叶", amount: "8-10片" },
                        { name: "白糖", amount: "2茶匙" },
                        { name: "苏打水", amount: "适量" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["调酒器", "量杯"],
                    difficulty: "简单"
                },
                instructions: [
                    "在高球杯中放入薄荷叶和白糖，轻轻捣压释放薄荷香味",
                    "加入青柠汁和朗姆酒，搅拌均匀",
                    "填满冰块，用苏打水补至杯口",
                    "用薄荷枝装饰"
                ],
                taste_profile: "清爽薄荷香配柠檬酸甜，口感轻盈",
                visual: "淡绿色透明酒液，薄荷叶点缀其中",
                prep_time: "5分钟",
                alcohol_content: "中度（约12%）",
                serving_temp: "冰饮",
                best_time: "适合聚会时分享"
            },
            {
                name: { chinese: "玛格丽特", english: "Margarita" },
                style: "经典热情",
                recipe: {
                    ingredients: [
                        { name: "银龙舌兰", amount: "50ml" },
                        { name: "青柠汁", amount: "25ml" },
                        { name: "橙皮酒", amount: "20ml" },
                        { name: "盐", amount: "适量（杯口装饰）" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["调酒器", "滤网"],
                    difficulty: "中等"
                },
                instructions: [
                    "用青柠片湿润玛格丽特杯边缘，蘸取海盐",
                    "将所有液体材料加入调酒器中",
                    "加入冰块，剧烈摇晃15秒",
                    "过滤倒入装饰好的杯中"
                ],
                taste_profile: "酸甜平衡，龙舌兰香气浓郁",
                visual: "金黄色酒液，盐边装饰经典",
                prep_time: "3分钟",
                alcohol_content: "中高度（约18%）",
                serving_temp: "冰饮",
                best_time: "派对高潮时刻"
            }
        ];
    }

    getRomanticRecommendations() {
        return [
            {
                name: { chinese: "法式75", english: "French 75" },
                style: "优雅浪漫",
                recipe: {
                    ingredients: [
                        { name: "金酒", amount: "30ml" },
                        { name: "柠檬汁", amount: "15ml" },
                        { name: "糖浆", amount: "10ml" },
                        { name: "香槟", amount: "适量" },
                        { name: "柠檬片", amount: "1片（装饰）" }
                    ],
                    tools: ["调酒器", "香槟杯"],
                    difficulty: "简单"
                },
                instructions: [
                    "将金酒、柠檬汁和糖浆加入调酒器",
                    "加冰摇匀，过滤倒入香槟杯",
                    "用香槟补至杯口",
                    "柠檬片装饰"
                ],
                taste_profile: "柠檬清香与香槟气泡的完美结合",
                visual: "金黄色气泡酒液，优雅柠檬装饰",
                prep_time: "4分钟",
                alcohol_content: "中度（约15%）",
                serving_temp: "冰饮",
                best_time: "浪漫晚餐时光"
            }
        ];
    }

    getRelaxRecommendations() {
        return [
            {
                name: { chinese: "威士忌酸", english: "Whiskey Sour" },
                style: "舒缓经典",
                recipe: {
                    ingredients: [
                        { name: "威士忌", amount: "60ml" },
                        { name: "柠檬汁", amount: "30ml" },
                        { name: "糖浆", amount: "15ml" },
                        { name: "蛋白", amount: "半个（可选）" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["调酒器", "滤网"],
                    difficulty: "简单"
                },
                instructions: [
                    "将所有材料加入调酒器中",
                    "加冰剧烈摇晃15秒",
                    "过滤倒入古典杯中",
                    "可用樱桃装饰"
                ],
                taste_profile: "威士忌的温暖与柠檬的清新平衡",
                visual: "金黄色酒液，泡沫丰富",
                prep_time: "3分钟",
                alcohol_content: "中高度（约20%）",
                serving_temp: "冰饮",
                best_time: "独处放松时光"
            }
        ];
    }

    getBusinessRecommendations() {
        return [
            {
                name: { chinese: "马天尼", english: "Martini" },
                style: "专业优雅",
                recipe: {
                    ingredients: [
                        { name: "金酒", amount: "60ml" },
                        { name: "干味美思", amount: "10ml" },
                        { name: "橄榄", amount: "1-2颗" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["调酒器", "马天尼杯"],
                    difficulty: "中等"
                },
                instructions: [
                    "将金酒和干味美思加入调酒器",
                    "加冰搅拌30秒",
                    "过滤倒入冰镇的马天尼杯",
                    "用橄榄装饰"
                ],
                taste_profile: "干净利落，金酒香气突出",
                visual: "清澈透明，橄榄点缀经典",
                prep_time: "2分钟",
                alcohol_content: "高度（约30%）",
                serving_temp: "冰饮",
                best_time: "商务社交场合"
            }
        ];
    }

    getDiningRecommendations() {
        return [
            {
                name: { chinese: "内格罗尼", english: "Negroni" },
                style: "开胃经典",
                recipe: {
                    ingredients: [
                        { name: "金酒", amount: "30ml" },
                        { name: "甜味美思", amount: "30ml" },
                        { name: "金巴利", amount: "30ml" },
                        { name: "橙皮", amount: "1片" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["古典杯", "搅拌棒"],
                    difficulty: "简单"
                },
                instructions: [
                    "在古典杯中加入冰块",
                    "倒入所有酒类材料",
                    "轻柔搅拌10秒",
                    "挤压橙皮释放香气后投入"
                ],
                taste_profile: "苦甜平衡，层次丰富",
                visual: "深红色酒液，橙皮香气扑鼻",
                prep_time: "2分钟",
                alcohol_content: "高度（约24%）",
                serving_temp: "冰饮",
                best_time: "餐前开胃"
            }
        ];
    }

    getMidnightRecommendations() {
        return [
            {
                name: { chinese: "教父", english: "Godfather" },
                style: "深邃醇厚",
                recipe: {
                    ingredients: [
                        { name: "苏格兰威士忌", amount: "50ml" },
                        { name: "杏仁利口酒", amount: "25ml" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["古典杯"],
                    difficulty: "非常简单"
                },
                instructions: [
                    "在古典杯中加入冰块",
                    "倒入威士忌和杏仁利口酒",
                    "轻轻搅拌即可"
                ],
                taste_profile: "威士忌的烟熏配杏仁的甜香",
                visual: "琥珀色酒液，简约经典",
                prep_time: "1分钟",
                alcohol_content: "高度（约25%）",
                serving_temp: "冰饮",
                best_time: "深夜思考时光"
            }
        ];
    }

    getDefaultRecommendations() {
        return [
            {
                name: { chinese: "柠檬薄荷苏打", english: "Lemon Mint Soda" },
                style: "清新简单",
                recipe: {
                    ingredients: [
                        { name: "柠檬汁", amount: "30ml" },
                        { name: "薄荷叶", amount: "5-6片" },
                        { name: "糖浆", amount: "15ml" },
                        { name: "苏打水", amount: "适量" },
                        { name: "冰块", amount: "适量" }
                    ],
                    tools: ["高球杯"],
                    difficulty: "非常简单"
                },
                instructions: [
                    "在杯中轻压薄荷叶",
                    "加入柠檬汁和糖浆",
                    "填入冰块，用苏打水补满",
                    "轻柔搅拌"
                ],
                taste_profile: "清新薄荷配柠檬酸甜",
                visual: "清澈透明，薄荷绿意盎然",
                prep_time: "2分钟",
                alcohol_content: "无酒精",
                serving_temp: "冰饮",
                best_time: "任何时候"
            }
        ];
    }
}

module.exports = BaseAIService;
