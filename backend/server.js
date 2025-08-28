const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://shaker-cocktail-app.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// Coze API服务
class CozeService {
    constructor() {
        this.apiKey = process.env.COZE_API_KEY;
        this.botId = process.env.COZE_BOT_ID;
        this.baseURL = process.env.COZE_API_BASE_URL;
    }

    async getCocktailRecommendation(userInput) {
        try {
            console.log('调用Coze API，用户输入:', JSON.stringify(userInput, null, 2));
            console.log('Coze API配置检查:');
            console.log('- API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : '未设置');
            console.log('- Bot ID:', this.botId || '未设置');
            console.log('- Base URL:', this.baseURL || '未设置');
            
            if (!this.apiKey || !this.botId || !this.baseURL) {
                throw new Error('Coze API配置不完整');
            }
            
            const response = await axios.post(
                `${this.baseURL}/v3/chat`,
                {
                    bot_id: this.botId,
                    user_id: `shaker-user-${Date.now()}`,
                    stream: false,
                    auto_save_history: true,
                    additional_messages: [{
                        role: "user",
                        content: JSON.stringify(userInput),
                        content_type: "text"
                    }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Coze API响应状态:', response.status);
            console.log('Coze API完整响应:', JSON.stringify(response.data, null, 2));
            
            // 尝试多种响应格式解析
            if (response.data) {
                let botContent = null;
                
                // 格式1: messages数组
                if (response.data.messages && response.data.messages.length > 0) {
                    const botMessage = response.data.messages.find(msg => msg.role === 'assistant' || msg.type === 'answer');
                    if (botMessage) {
                        botContent = botMessage.content;
                        console.log('从messages找到内容:', botContent);
                    }
                }
                
                // 格式2: 直接在data中
                if (!botContent && response.data.content) {
                    botContent = response.data.content;
                    console.log('从data.content找到内容:', botContent);
                }
                
                // 格式3: 在data.data中
                if (!botContent && response.data.data) {
                    botContent = response.data.data;
                    console.log('从data.data找到内容:', botContent);
                }
                
                if (botContent) {
                    try {
                        // 如果是字符串，尝试JSON解析
                        let recommendations;
                        if (typeof botContent === 'string') {
                            recommendations = JSON.parse(botContent);
                        } else {
                            recommendations = botContent;
                        }
                        
                        // 验证推荐格式
                        if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
                            console.log('成功解析AI推荐:', JSON.stringify(recommendations, null, 2));
                            return recommendations;
                        } else {
                            console.log('推荐格式不正确');
                            throw new Error('AI推荐格式不正确');
                        }
                    } catch (parseError) {
                        console.error('解析AI响应失败:', parseError);
                        console.error('原始内容:', botContent);
                        throw new Error('AI响应解析失败');
                    }
                } else {
                    console.log('没有找到有效的响应内容');
                    throw new Error('AI没有返回有效内容');
                }
            } else {
                console.log('响应数据为空');
                throw new Error('AI响应数据为空');
            }
        } catch (error) {
            console.error('Coze API调用失败:', error.response?.data || error.message);
            throw error;
        }
    }

    getFallbackRecommendations(userInput) {
        // 根据场景生成不同的推荐
        const sceneRecommendations = {
            "聚会派对": [
                { name: "伏特加柠檬气泡", spirit: "伏特加", style: "清爽活力" },
                { name: "威士忌苏打", spirit: "威士忌", style: "经典时尚" },
                { name: "柠檬薄荷特调", spirit: "伏特加", style: "清新怡人" }
            ],
            "浪漫约会": [
                { name: "威士忌蜂蜜", spirit: "威士忌", style: "温暖甜蜜" },
                { name: "伏特加玫瑰", spirit: "伏特加", style: "浪漫优雅" },
                { name: "经典马天尼", spirit: "伏特加", style: "成熟魅力" }
            ],
            "独处放松": [
                { name: "威士忌纯饮", spirit: "威士忌", style: "深度品味" },
                { name: "柠檬威士忌", spirit: "威士忌", style: "舒缓平静" },
                { name: "伏特加橙汁", spirit: "伏特加", style: "轻松愉悦" }
            ],
            "深夜时光": [
                { name: "深夜威士忌", spirit: "威士忌", style: "沉思专注" },
                { name: "月光伏特加", spirit: "伏特加", style: "神秘优雅" },
                { name: "夜猫子特调", spirit: "威士忌", style: "创意灵感" }
            ]
        };

        const defaults = [
            { name: "经典莫吉托", spirit: "朗姆酒", style: "经典清爽" },
            { name: "伏特加柠檬", spirit: "伏特加", style: "简约时尚" },
            { name: "威士忌苏打", spirit: "威士忌", style: "成熟稳重" }
        ];

        const recommendations = sceneRecommendations[userInput.scene] || defaults;
        const selectedRec = recommendations[Math.floor(Math.random() * recommendations.length)];

        return {
            recommendations: [
                {
                    name: {
                        chinese: selectedRec.name,
                        english: selectedRec.name.replace(/[\u4e00-\u9fa5]/g, 'Classic Cocktail')
                    },
                    reason: `根据您的${userInput.scene}场景和${userInput.moods?.join('、') || '心情'}，推荐这款${selectedRec.style}的鸡尾酒`,
                    recipe: {
                        ingredients: [
                            {"name": "白朗姆酒", "amount": "50ml"},
                            {"name": "青柠汁", "amount": "30ml"},
                            {"name": "薄荷叶", "amount": "8-10片"},
                            {"name": "白糖", "amount": "2茶匙"},
                            {"name": "苏打水", "amount": "适量"},
                            {"name": "冰块", "amount": "适量"}
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
                    best_time: "适合任何时候饮用"
                }
            ]
        };
    }
}

const cozeService = new CozeService();

// 启动时检查环境变量
console.log('=== 服务启动时环境变量检查 ===');
console.log('COZE_API_KEY:', process.env.COZE_API_KEY ? `${process.env.COZE_API_KEY.substring(0, 15)}...` : '未设置');
console.log('COZE_BOT_ID:', process.env.COZE_BOT_ID || '未设置');
console.log('COZE_API_BASE_URL:', process.env.COZE_API_BASE_URL || '未设置');
console.log('NODE_ENV:', process.env.NODE_ENV || '未设置');
console.log('=== 环境变量检查完成 ===');

// API路由
app.post('/api/recommend', async (req, res) => {
    try {
        const userInput = req.body;
        
        // 验证必需字段
        if (!userInput.scene || !userInput.moods || !userInput.ingredients) {
            return res.status(400).json({
                error: '缺少必需字段：scene, moods, ingredients'
            });
        }

        console.log('收到推荐请求:', userInput);
        
        try {
            const recommendations = await cozeService.getCocktailRecommendation(userInput);
            
            res.json({
                success: true,
                data: recommendations
            });
        } catch (apiError) {
            console.error('Coze API调用失败:', apiError.message);
            res.status(500).json({
                success: false,
                error: 'AI服务暂时不可用',
                message: apiError.message
            });
        }
        
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误',
            message: error.message
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Shaker API服务正常运行',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// 获取材料列表接口
app.get('/api/ingredients', (req, res) => {
    res.json({
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
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('未处理的错误:', error);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Shaker后端服务启动成功！`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 环境: ${process.env.NODE_ENV}`);
    console.log(`🤖 Coze Bot ID: ${process.env.COZE_BOT_ID}`);
});
