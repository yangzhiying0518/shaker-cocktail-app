/**
 * 火山引擎API测试脚本
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.VOLCANO_API_KEY;
const MODEL_ID = process.env.VOLCANO_MODEL_ID;

// 可能的API端点
const endpoints = [
    'https://ark.cn-beijing.volces.com/api/v3',
    'https://ark.cn-beijing.volces.com/api/v1', 
    'https://maas.volcengineapi.com',
    'https://api.volcengine.com/api/v3'
];

async function testEndpoint(endpoint) {
    console.log(`\n🧪 测试端点: ${endpoint}`);
    
    try {
        const response = await axios.post(
            `${endpoint}/chat/completions`,
            {
                model: MODEL_ID,
                messages: [
                    {
                        role: "user",
                        content: "Hello, 请简单回复一句话测试"
                    }
                ],
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log(`✅ 成功! 状态: ${response.status}`);
        console.log(`📝 响应: ${JSON.stringify(response.data, null, 2)}`);
        return true;
        
    } catch (error) {
        console.log(`❌ 失败: ${error.message}`);
        if (error.response) {
            console.log(`   状态码: ${error.response.status}`);
            console.log(`   响应: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return false;
    }
}

async function main() {
    console.log('🔍 火山引擎API端点测试');
    console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : '未设置'}`);
    console.log(`🎯 Model ID: ${MODEL_ID}`);
    
    for (const endpoint of endpoints) {
        const success = await testEndpoint(endpoint);
        if (success) {
            console.log(`\n🎉 找到可用端点: ${endpoint}`);
            break;
        }
        
        // 等待1秒再测试下一个
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

main().catch(console.error);
