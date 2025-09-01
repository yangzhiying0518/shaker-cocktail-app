/**
 * 测试真实的API调用 - 模拟我们应用的请求
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.VOLCANO_API_KEY;
const MODEL_ID = process.env.VOLCANO_MODEL_ID;
const ENDPOINT = process.env.VOLCANO_ENDPOINT;

const systemPrompt = `你是专业调酒师AI，根据用户场景、心情、材料和偏好推荐鸡尾酒。

必须返回JSON格式：
{
  "recommendations": [
    {
      "name": {"chinese": "中文名", "english": "English Name"},
      "reason": "推荐理由",
      "recipe": {
        "ingredients": [{"name": "材料", "amount": "用量", "type": "类型"}],
        "tools": ["工具"],
        "difficulty": "简单"
      },
      "instructions": ["制作步骤"],
      "taste_profile": "口感描述",
      "visual": "视觉效果",
      "prep_time": "制作时间",
      "alcohol_content": "酒精度"
    }
  ]
}

要求：推荐3款不同风格的鸡尾酒，配方真实，优先使用用户提供的材料。`;

const userPrompt = `场景: 午后惬意
心情: 春日愉悦
基酒: 伏特加
调料: 柠檬汁
工具: 调酒器
偏好: 酒精度适中, 甜度微甜, 酸度适中

请推荐3款适合的鸡尾酒。`;

async function testRealAPI() {
    console.log('🧪 测试真实API调用');
    console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : '未设置'}`);
    console.log(`🎯 Model ID: ${MODEL_ID}`);
    console.log(`🌐 Endpoint: ${ENDPOINT}`);
    
    console.log(`\n📝 System Prompt 长度: ${systemPrompt.length} 字符`);
    console.log(`📝 User Prompt 长度: ${userPrompt.length} 字符`);
    
    const startTime = Date.now();
    
    try {
        console.log('\n⏱️ 开始API调用...');
        
        const response = await axios.post(
            `${ENDPOINT}/chat/completions`,
            {
                model: MODEL_ID,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user", 
                        content: userPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                top_p: 0.9
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 60000 // 60秒超时
            }
        );
        
        const responseTime = Date.now() - startTime;
        console.log(`\n✅ 成功! 耗时: ${responseTime}ms`);
        console.log(`📊 状态码: ${response.status}`);
        console.log(`📝 响应内容:`);
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.log(`\n❌ 失败! 耗时: ${responseTime}ms`);
        console.log(`🔥 错误类型: ${error.code || 'Unknown'}`);
        console.log(`📝 错误信息: ${error.message}`);
        
        if (error.response) {
            console.log(`📊 状态码: ${error.response.status}`);
            console.log(`📝 响应内容:`);
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

testRealAPI();
