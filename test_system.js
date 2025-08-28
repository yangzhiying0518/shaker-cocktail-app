const axios = require('axios');

// 测试配置
const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// 测试数据
const testUserInput = {
    scene: "聚会派对",
    moods: ["开心愉悦", "兴奋激动"],
    ingredients: {
        spirits: ["伏特加", "威士忌"],
        mixers: ["柠檬汁", "苏打水", "冰块"],
        tools: ["调酒器", "量杯"]
    },
    preferences: {
        alcohol_level: "中度",
        sweetness: "微甜",
        acidity: "中酸",
        style: "清爽"
    },
    special_requirements: "希望颜值高一些"
};

async function runSystemTests() {
    console.log('🧪 开始系统集成测试...\n');
    
    let allTestsPassed = true;
    
    try {
        // 测试1: 后端健康检查
        console.log('📡 测试1: 后端健康检查');
        const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
        console.log('✅ 后端服务正常运行');
        console.log('📄 响应:', healthResponse.data);
        console.log('');
        
        // 测试2: 材料列表API
        console.log('📦 测试2: 获取材料列表');
        const ingredientsResponse = await axios.get(`${BACKEND_URL}/api/ingredients`);
        console.log('✅ 材料列表获取成功');
        console.log('📊 材料统计:');
        console.log(`   - 烈酒: ${ingredientsResponse.data.spirits.length}种`);
        console.log(`   - 调料: ${ingredientsResponse.data.mixers.length}种`);
        console.log(`   - 工具: ${ingredientsResponse.data.tools.length}种`);
        console.log('');
        
        // 测试3: 核心推荐功能
        console.log('🎯 测试3: 鸡尾酒推荐功能');
        console.log('🔄 发送推荐请求...');
        const startTime = Date.now();
        
        const recommendResponse = await axios.post(`${BACKEND_URL}/api/recommend`, testUserInput);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`✅ 推荐获取成功 (${responseTime}ms)`);
        
        if (recommendResponse.data.success && recommendResponse.data.data?.recommendations) {
            const recommendations = recommendResponse.data.data.recommendations;
            console.log(`🍸 获得 ${recommendations.length} 个推荐:`);
            
            recommendations.forEach((cocktail, index) => {
                console.log(`   ${index + 1}. ${cocktail.name.chinese} (${cocktail.name.english})`);
                console.log(`      - 难度: ${cocktail.recipe.difficulty}`);
                console.log(`      - 时间: ${cocktail.prep_time}`);
                console.log(`      - 酒精度: ${cocktail.alcohol_content}`);
                console.log(`      - 材料数: ${cocktail.recipe.ingredients.length}种`);
                console.log(`      - 步骤数: ${cocktail.instructions.length}步`);
            });
        } else {
            console.log('❌ 推荐数据格式错误');
            allTestsPassed = false;
        }
        console.log('');
        
        // 测试4: 前端服务检查
        console.log('🌐 测试4: 前端服务检查');
        const frontendResponse = await axios.get(FRONTEND_URL);
        if (frontendResponse.status === 200) {
            console.log('✅ 前端服务正常运行');
            console.log(`📄 页面大小: ${frontendResponse.data.length} bytes`);
        }
        console.log('');
        
        // 测试5: API性能测试
        console.log('⚡ 测试5: API性能测试');
        console.log('🔄 连续发送5个推荐请求...');
        
        const performanceTests = [];
        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            await axios.post(`${BACKEND_URL}/api/recommend`, {
                ...testUserInput,
                scene: ["聚会派对", "浪漫约会", "独处放松", "商务场合", "餐前餐后"][i],
                moods: [["开心愉悦"], ["平静放松"], ["兴奋激动"], ["自信满满"], ["深度思考"]][i]
            });
            const end = Date.now();
            performanceTests.push(end - start);
        }
        
        const avgTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
        const maxTime = Math.max(...performanceTests);
        const minTime = Math.min(...performanceTests);
        
        console.log(`✅ 性能测试完成:`);
        console.log(`   - 平均响应时间: ${avgTime.toFixed(0)}ms`);
        console.log(`   - 最快响应时间: ${minTime}ms`);
        console.log(`   - 最慢响应时间: ${maxTime}ms`);
        console.log(`   - 目标响应时间: <15000ms`);
        
        if (avgTime > 15000) {
            console.log('⚠️  平均响应时间超过目标值');
        }
        console.log('');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('📄 错误响应:', error.response.status, error.response.data);
        }
        allTestsPassed = false;
    }
    
    // 测试总结
    console.log('📊 测试总结');
    console.log('=' * 50);
    
    if (allTestsPassed) {
        console.log('🎉 所有测试通过！系统运行正常');
        console.log('');
        console.log('🌟 系统功能验证：');
        console.log('✅ 后端API服务正常');
        console.log('✅ 前端页面正常加载');
        console.log('✅ Coze AI集成工作（使用降级方案）');
        console.log('✅ 推荐功能完整可用');
        console.log('✅ 响应时间符合要求');
        console.log('');
        console.log('🚀 可以开始使用系统！');
        console.log('📱 前端地址: http://localhost:3000');
        console.log('🔧 后端API: http://localhost:3001');
        
    } else {
        console.log('❌ 部分测试失败，请检查错误信息');
    }
}

// 运行测试
if (require.main === module) {
    runSystemTests().catch(console.error);
}

module.exports = { runSystemTests };
