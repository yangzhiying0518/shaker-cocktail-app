// Railway API测试脚本
const axios = require('axios');

// Railway域名
const RAILWAY_URL = 'https://shaker-cocktail-app-production.up.railway.app';

async function testRailwayAPI() {
    console.log('🧪 测试Railway部署的API...');
    console.log(`🌐 测试地址: ${RAILWAY_URL}`);
    
    try {
        // 1. 测试健康检查
        console.log('\n1️⃣ 测试健康检查...');
        const healthResponse = await axios.get(`${RAILWAY_URL}/api/health`, {
            timeout: 10000
        });
        console.log('✅ 健康检查成功:', healthResponse.data);
        
        // 2. 测试推荐API
        console.log('\n2️⃣ 测试推荐API...');
        const testData = {
            scene: "午后惬意",
            moods: ["春日愉悦"],
            ingredients: ["伏特加"],
            preferences: {
                alcohol_level: "适中",
                sweetness: "微甜",
                acidity: "适中",
                style: "清爽"
            },
            special_requirements: "测试火山引擎API"
        };
        
        const recommendResponse = await axios.post(`${RAILWAY_URL}/api/recommend`, testData, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ 推荐API成功!');
        console.log('📊 响应数据:', JSON.stringify(recommendResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ API测试失败:');
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('错误信息:', error.response.data);
        } else {
            console.error('网络错误:', error.message);
        }
    }
}

// 运行测试
testRailwayAPI();
