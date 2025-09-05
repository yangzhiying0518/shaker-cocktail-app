/**
 * Shaker 应用配置文件
 * 集中管理所有配置项和常量
 */

// API配置
export const API_CONFIG = {
    BASE_URL: 'http://localhost:3001',
    ENDPOINTS: {
        RECOMMEND: '/api/recommend',
        STREAM_RECOMMEND: '/api/stream-recommendation',
        INGREDIENTS: '/api/ingredients',
        HEALTH: '/api/health',
        STATS: '/api/stats'
    },
    TIMEOUT: 30000
};

// 应用状态配置
export const APP_CONFIG = {
    MAX_MOODS: 3,
    MAX_REQUIREMENTS: 5,
    ANIMATION_DURATION: {
        FAST: 200,
        NORMAL: 500,
        SLOW: 1000,
        TYPING_SPEED: 80
    },
    SECTIONS: [
        'heroSection',
        'sceneSection', 
        'moodSection',
        'ingredientSection',
        'preferenceSection',
        'requirementSection',
        'recommendSection'
    ]
};

// 选项数据
export const OPTIONS_DATA = {
    SCENES: [
        { value: '聚会派对', label: '聚会派对', icon: '🎉', description: '朋友聚会，节日庆祝' },
        { value: '浪漫约会', label: '浪漫约会', icon: '💕', description: '二人世界，烛光晚餐' },
        { value: '独处放松', label: '独处放松', icon: '🛋️', description: '个人时光，舒缓放松' },
        { value: '商务场合', label: '商务场合', icon: '💼', description: '客户招待，商务宴请' },
        { value: '餐前餐后', label: '餐前餐后', icon: '🍽️', description: '开胃酒，餐后消化' },
        { value: '深夜时光', label: '深夜时光', icon: '🌙', description: '深夜独酌，静思时刻' }
    ],
    
    MOODS: [
        { value: '春日愉悦', label: '春日愉悦', icon: '🌻', description: '心情如春花般绽放，充满活力' },
        { value: '雨后忧郁', label: '雨后忧郁', icon: '🌧️', description: '如雨后森林般沉静，需要抚慰' },
        { value: '夏日激情', label: '夏日激情', icon: '☀️', description: '如火焰般热烈，充满期待' },
        { value: '秋叶宁静', label: '秋叶宁静', icon: '🍂', description: '如秋日般平和，寻求内心平衡' },
        { value: '山峰自信', label: '山峰自信', icon: '⛰️', description: '如高山般坚定，充满力量' },
        { value: '深林沉思', label: '深林沉思', icon: '🌳', description: '如古树般深邃，专注思考' }
    ],
    
    STYLES: [
        { value: '清爽', label: '清爽', icon: '🌿', description: '清新淡雅，口感轻盈' },
        { value: '浓郁', label: '浓郁', icon: '🍯', description: '厚重饱满，层次丰富' },
        { value: '顺滑', label: '顺滑', icon: '🥛', description: '丝滑柔和，温润细腻' },
        { value: '刺激', label: '刺激', icon: '⚡', description: '强烈冲击，印象深刻' }
    ]
};

// 材料分类数据
export const INGREDIENTS_DATA = {
    spirits: [
        '威士忌', '伏特加', '金酒', '朗姆酒', '龙舌兰', 
        '白兰地', '利口酒', '香槟', '啤酒', '清酒'
    ],
    mixers: [
        '柠檬汁', '青柠汁', '橙汁', '蔓越莓汁', '菠萝汁',
        '苏打水', '汤力水', '姜汁汽水', '可乐', '薄荷叶',
        '糖浆', '蜂蜜', '盐', '胡椒', '肉桂'
    ],
    tools: [
        '调酒器', '量杯', '搅拌棒', '滤网', '开瓶器',
        '冰桶', '柠檬刀', '装饰签', '高球杯', '马提尼杯'
    ]
};

// UI文本配置
export const UI_TEXT = {
    SECTIONS: {
        HERO: {
            TITLE: 'Shaker',
            SUBTITLE: '智能鸡尾酒推荐专家',
            DESCRIPTION: '基于AI的个性化鸡尾酒推荐，为您的每一个场景调制完美的那一杯',
            CTA: '开始推荐之旅'
        },
        SCENE: {
            TITLE: '选择您的场景',
            SUBTITLE: '告诉我们您现在的情境'
        },
        MOOD: {
            TITLE: '描述您的心情',
            SUBTITLE: '可以选择多个心情（最多3个）'
        },
        INGREDIENT: {
            TITLE: '选择可用材料',
            SUBTITLE: '告诉我们您手头有什么'
        },
        PREFERENCE: {
            TITLE: '设置口味偏好',
            SUBTITLE: '调节您的个人喜好'
        },
        REQUIREMENT: {
            TITLE: '特殊要求',
            SUBTITLE: '还有什么特别的需求吗？（可选）'
        }
    },
    
    PREFERENCES: {
        ALCOHOL_LEVEL: '酒精度',
        SWEETNESS: '甜度', 
        ACIDITY: '酸度'
    },
    
    LOADING: {
        ANALYZING: 'Shaker正在分析您的需求...',
        THINKING: 'Shaker正在思考...',
        PREPARING: '正在为您调制推荐...'
    }
};
