/**
 * 输入验证和数据清洗中间件
 */

// 定义有效的枚举值
const VALID_SCENES = [
    '晨间活力', '午后惬意', '夜晚时光', 
    '聚会派对', '约会浪漫', '独处静谧'
];

const VALID_MOODS = [
    '春日愉悦', '雨后忧郁', '午夜思绪', 
    '森林漫步', '星空冥想', '篝火温暖'
];

const VALID_SPIRITS = [
    '威士忌', '伏特加', '金酒', '朗姆酒', '龙舌兰', 
    '白兰地', '利口酒', '香槟', '啤酒', '清酒'
];

const VALID_MIXERS = [
    '柠檬汁', '青柠汁', '橙汁', '蔓越莓汁', '菠萝汁',
    '苏打水', '汤力水', '姜汁汽水', '可乐', '薄荷叶',
    '糖浆', '蜂蜜', '盐', '胡椒', '肉桂'
];

const VALID_TOOLS = [
    '调酒器', '量杯', '搅拌棒', '滤网', '开瓶器',
    '冰桶', '柠檬刀', '装饰签', '高球杯', '马提尼杯'
];

const VALID_PREFERENCES = {
    alcohol_level: ['轻盈', '适中', '浓郁'],
    sweetness: ['清淡', '微甜', '香甜', '浓郁'],
    acidity: ['清淡', '适中', '浓郁']
};

/**
 * 清洗和标准化字符串
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ').substring(0, 100);
}

/**
 * 验证和清洗用户输入
 */
function validateAndSanitizeInput(req, res, next) {
    try {
        const input = req.body;
        
        // 生成请求ID用于追踪
        req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 验证输入是否为对象
        if (!input || typeof input !== 'object') {
            return res.status(400).json({
                success: false,
                error: '无效的请求格式',
                code: 'INVALID_REQUEST_FORMAT',
                requestId: req.requestId
            });
        }

        // 不再强制要求任何字段，允许完全自由的输入

        // 清洗的输入数据
        const cleanInput = {
            scene: '',
            moods: [],
            ingredients: {
                spirits: [],
                mixers: [],
                tools: []
            },
            preferences: {
                alcohol_level: '适中',
                sweetness: '适中',
                acidity: '适中'
            },
            special_requirements: ''
        };

        // 验证和清洗场景（可选）
        if (input.scene && typeof input.scene === 'string') {
            const scene = sanitizeString(input.scene);
            if (VALID_SCENES.includes(scene)) {
                cleanInput.scene = scene;
            } else {
                // 保留用户输入的场景，即使不在预定义列表中
                cleanInput.scene = scene;
            }
        }

        // 验证和清洗心情（可选，最多3个）
        if (Array.isArray(input.moods)) {
            const moods = input.moods
                .map(mood => sanitizeString(mood))
                .filter(mood => mood.length > 0) // 允许任何非空心情
                .slice(0, 3); // 最多3个
            cleanInput.moods = moods;
        }

        // 验证和清洗材料（可选）
        if (input.ingredients && typeof input.ingredients === 'object') {

            // 清洗基酒
            if (Array.isArray(input.ingredients.spirits)) {
                cleanInput.ingredients.spirits = input.ingredients.spirits
                    .map(spirit => sanitizeString(spirit))
                    .filter(spirit => spirit.length > 0) // 允许任何非空基酒
                    .slice(0, 5); // 最多5个
            }

            // 清洗调料
            if (Array.isArray(input.ingredients.mixers)) {
                cleanInput.ingredients.mixers = input.ingredients.mixers
                    .map(mixer => sanitizeString(mixer))
                    .filter(mixer => mixer.length > 0) // 允许任何非空调料
                    .slice(0, 10); // 最多10个
            }

            // 清洗工具
            if (Array.isArray(input.ingredients.tools)) {
                cleanInput.ingredients.tools = input.ingredients.tools
                    .map(tool => sanitizeString(tool))
                    .filter(tool => tool.length > 0) // 允许任何非空工具
                    .slice(0, 8); // 最多8个
            }
        }

        // 验证和清洗偏好设置
        if (input.preferences && typeof input.preferences === 'object') {
            // 酒精度
            const alcoholLevel = sanitizeString(input.preferences.alcohol_level || '');
            if (VALID_PREFERENCES.alcohol_level.includes(alcoholLevel)) {
                cleanInput.preferences.alcohol_level = alcoholLevel;
            }

            // 甜度
            const sweetness = sanitizeString(input.preferences.sweetness || '');
            if (VALID_PREFERENCES.sweetness.includes(sweetness)) {
                cleanInput.preferences.sweetness = sweetness;
            }

            // 酸度
            const acidity = sanitizeString(input.preferences.acidity || '');
            if (VALID_PREFERENCES.acidity.includes(acidity)) {
                cleanInput.preferences.acidity = acidity;
            }
        }

        // 清洗特殊要求
        if (input.special_requirements) {
            cleanInput.special_requirements = sanitizeString(input.special_requirements).substring(0, 500);
        }

        // 记录清洗前后的数据量对比
        console.log(`📋 [${req.requestId}] 输入验证完成:`, {
            原始字段数: Object.keys(input).length,
            清洗后字段数: Object.keys(cleanInput).length,
            心情数量: cleanInput.moods.length,
            基酒数量: cleanInput.ingredients.spirits.length,
            调料数量: cleanInput.ingredients.mixers.length,
            工具数量: cleanInput.ingredients.tools.length
        });

        // 将清洗后的数据存储到请求对象
        req.cleanInput = cleanInput;
        req.originalInput = input;
        
        next();
    } catch (error) {
        console.error('输入验证失败:', error);
        return res.status(500).json({
            success: false,
            error: '输入验证过程中发生错误',
            code: 'VALIDATION_ERROR',
            requestId: req.requestId || 'unknown'
        });
    }
}

/**
 * 请求大小限制中间件
 */
function requestSizeLimit(req, res, next) {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSize = 10 * 1024; // 10KB

    if (contentLength > maxSize) {
        return res.status(413).json({
            success: false,
            error: '请求体过大',
            code: 'REQUEST_TOO_LARGE',
            maxSize: `${maxSize / 1024}KB`
        });
    }

    next();
}

/**
 * 基础安全头设置
 */
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
}

module.exports = {
    validateAndSanitizeInput,
    requestSizeLimit,
    securityHeaders,
    VALID_SCENES,
    VALID_MOODS,
    VALID_SPIRITS,
    VALID_MIXERS,
    VALID_TOOLS,
    VALID_PREFERENCES
};
