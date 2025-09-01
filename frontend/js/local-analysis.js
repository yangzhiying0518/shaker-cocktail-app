/**
 * 本地分析生成器
 * 在等待AI响应期间，提供即时的本地分析展示
 */

export class LocalAnalysisGenerator {
    constructor() {
        // 场景分析模板
        this.sceneTemplates = {
            '聚会派对': [
                '聚会的热闹氛围需要能点燃气氛的特调',
                '派对时光，选择充满活力的鸡尾酒最合适',
                '欢乐聚会，来一杯能带动气氛的调酒吧'
            ],
            '浪漫约会': [
                '浪漫约会的美好时光值得精心调制',
                '约会夜晚，优雅的鸡尾酒是完美选择',
                '浪漫氛围中，温柔的口感最能传达心意'
            ],
            '独处放松': [
                '独处时光，享受宁静与内心的对话',
                '一个人的夜晚，温和舒缓的口感最合适',
                '放松的独处时光，来一杯治愈心灵的调酒'
            ],
            '商务场合': [
                '商务场合需要优雅而不失专业的选择',
                '正式场合，经典调配展现品味与格调',
                '商务聚会，选择成熟稳重的鸡尾酒'
            ],
            '餐前餐后': [
                '餐前开胃或餐后消食，都有完美的搭配',
                '用餐时光，选择能提升味蕾体验的调酒',
                '美食配美酒，让味觉体验更加丰富'
            ],
            '深夜时光': [
                '深夜的静谧时光，适合细细品味的调酒',
                '夜深人静时，温暖的酒香最能慰藉心灵',
                '深夜时分，让醇厚的口感伴你入眠'
            ]
        };

        // 心情分析模板 - 森林主题
        this.moodTemplates = {
            '春日愉悦': '你的愉悦心情如春花般绽放，值得用清爽的调酒来庆祝这份活力',
            '雨后忧郁': '雨后森林般的沉静心境，需要温暖醇厚的酒香来抚慰心灵',
            '夏日激情': '如火焰般热烈的激情，需要充满活力的调配来匹配这份期待',
            '秋叶宁静': '秋日般平和的心境，温和的口感最能呼应这份内心的平衡',
            '山峰自信': '如高山般坚定的自信，需要有力量感的调酒来彰显这份能量',
            '深林沉思': '如古树般深邃的思考，醇厚的酒香能陪伴这份专注的沉思'
        };

        // 材料分析模板
        this.ingredientTemplates = {
            // 基酒分析
            spirits: {
                '威士忌': '威士忌的醇厚与复杂，是调制经典鸡尾酒的绝佳选择',
                '伏特加': '伏特加的纯净与中性，为创意调配提供了无限可能',
                '朗姆酒': '朗姆酒的甜美与热情，带来热带风情的美妙体验',
                '金酒': '金酒的草本香气，为调酒增添了清新的植物气息',
                '龙舌兰': '龙舌兰的独特风味，带来墨西哥风情的热烈感受',
                '白兰地': '白兰地的优雅与深度，展现法式浪漫的精致品味'
            },
            // 调料分析
            mixers: {
                '柠檬汁': '新鲜柠檬汁的酸爽，为调酒带来清新的活力',
                '青柠汁': '青柠的独特酸味，增添了热带风情的层次感',
                '橙汁': '橙汁的甜美与维C，为调酒注入阳光般的温暖',
                '蔓越莓汁': '蔓越莓的酸甜平衡，带来浆果的天然香甜',
                '苏打水': '苏打水的清爽气泡，为调酒增添轻盈的口感',
                '汤力水': '汤力水的苦甜平衡，是经典调酒的完美伴侣'
            }
        };

        // 偏好分析模板
        this.preferenceTemplates = {
            alcohol_level: {
                '低度': '温和的酒精度让你能更好地品味调酒的层次与香气',
                '中度': '适中的酒精度在口感与醇香之间找到完美平衡',
                '高度': '浓郁的酒精度带来更加醇厚深沉的品鉴体验'
            },
            sweetness: {
                '不甜': '清爽不甜的口感，让你能品味到最纯粹的调酒精髓',
                '微甜': '微妙的甜味如春风拂面，温柔而不失层次',
                '很甜': '甜美的口感如蜜糖般温暖，带来治愈的美好感受'
            },
            style: {
                '清爽': '清爽的风格如晨露般纯净，带来清新的感官体验',
                '浓郁': '浓郁的风格层次丰富，每一口都有新的发现',
                '平衡': '平衡的调配展现调酒师的精湛技艺，和谐而完美',
                '创新': '创新的搭配打破传统，为你带来意想不到的惊喜'
            }
        };
    }

    /**
     * 生成本地分析
     * @param {Object} userInput - 用户输入数据
     * @returns {Array} 分析段落数组
     */
    generateLocalAnalysis(userInput) {
        const segments = [];

        // 1. 场景分析
        if (userInput.scene) {
            const sceneAnalysis = this.analyzeScene(userInput.scene);
            segments.push({
                title: "理解你的场景选择",
                content: sceneAnalysis,
                focus: "scene",
                icon: "🎭"
            });
        }

        // 2. 心情分析
        if (userInput.moods && userInput.moods.length > 0) {
            const moodAnalysis = this.analyzeMoods(userInput.moods);
            segments.push({
                title: "感受你的心情状态",
                content: moodAnalysis,
                focus: "mood",
                icon: "💫"
            });
        }

        // 3. 材料分析
        if (this.hasIngredients(userInput.ingredients)) {
            const ingredientAnalysis = this.analyzeIngredients(userInput.ingredients);
            segments.push({
                title: "分析你的材料准备",
                content: ingredientAnalysis,
                focus: "ingredients",
                icon: "🍋"
            });
        }

        // 4. 偏好分析
        const preferenceAnalysis = this.analyzePreferences(userInput.preferences);
        segments.push({
            title: "为你量身调制",
            content: preferenceAnalysis,
            focus: "preparation",
            icon: "🍸"
        });

        // 如果没有足够的信息，添加通用分析
        if (segments.length < 3) {
            segments.push({
                title: "专业调酒师的洞察",
                content: "每一杯鸡尾酒都是一个故事，让我为你调制专属的美好时光",
                focus: "general",
                icon: "✨"
            });
        }

        return segments;
    }

    /**
     * 分析场景
     */
    analyzeScene(scene) {
        const templates = this.sceneTemplates[scene];
        if (templates) {
            return templates[Math.floor(Math.random() * templates.length)];
        }
        return `${scene}的时光值得用心调制的鸡尾酒来陪伴`;
    }

    /**
     * 分析心情
     */
    analyzeMoods(moods) {
        const primaryMood = moods[0];
        const template = this.moodTemplates[primaryMood];
        
        if (template) {
            return template;
        }
        
        if (moods.length > 1) {
            return `你此刻的${moods.join('、')}心情，需要细心调配的鸡尾酒来呼应`;
        }
        
        return `感受到你的${primaryMood}，让我用调酒的艺术来诠释这份心境`;
    }

    /**
     * 分析材料
     */
    analyzeIngredients(ingredients) {
        const { spirits, mixers } = ingredients;
        
        // 优先分析基酒
        if (spirits && spirits.length > 0) {
            const spirit = spirits[0];
            const template = this.ingredientTemplates.spirits[spirit];
            if (template) {
                return template;
            }
        }
        
        // 然后分析调料
        if (mixers && mixers.length > 0) {
            const mixer = mixers[0];
            const template = this.ingredientTemplates.mixers[mixer];
            if (template) {
                return template;
            }
        }
        
        return '你选择的材料组合很有趣，让我为你创造独特的调配';
    }

    /**
     * 分析偏好
     */
    analyzePreferences(preferences) {
        const { alcohol_level, sweetness, style } = preferences;
        
        // 优先分析风格
        if (style && this.preferenceTemplates.style[style]) {
            return this.preferenceTemplates.style[style];
        }
        
        // 然后分析甜度
        if (sweetness && this.preferenceTemplates.sweetness[sweetness]) {
            return this.preferenceTemplates.sweetness[sweetness];
        }
        
        // 最后分析酒精度
        if (alcohol_level && this.preferenceTemplates.alcohol_level[alcohol_level]) {
            return this.preferenceTemplates.alcohol_level[alcohol_level];
        }
        
        return '根据你的偏好，我将为你调制最适合的鸡尾酒';
    }

    /**
     * 检查是否有材料信息
     */
    hasIngredients(ingredients) {
        if (!ingredients) return false;
        
        const { spirits, mixers, tools } = ingredients;
        return (spirits && spirits.length > 0) || 
               (mixers && mixers.length > 0) || 
               (tools && tools.length > 0);
    }

    /**
     * 生成快速预览文本
     */
    generateQuickPreview(userInput) {
        const { scene, moods } = userInput;
        
        if (scene && moods && moods.length > 0) {
            return `正在为你的${scene}时光和${moods[0]}心情调制专属鸡尾酒...`;
        } else if (scene) {
            return `正在为你的${scene}时光精心调制...`;
        } else if (moods && moods.length > 0) {
            return `正在根据你的${moods[0]}心情调制...`;
        }
        
        return '正在为你量身调制专属鸡尾酒...';
    }
}

// 创建全局实例
export const localAnalysis = new LocalAnalysisGenerator();

