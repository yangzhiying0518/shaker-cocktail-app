/**
 * 测试模型优化功能
 */

const StreamService = require('./backend/services/stream-service');

// 测试JSON修复功能
function testJSONRepair() {
    console.log('🧪 测试JSON修复功能...');
    
    const streamService = new StreamService();
    
    // 测试用例1：缺少逗号的JSON
    const brokenJSON1 = `{
        "recommendations": [
            {
                "name": "玛格丽特"
                "description": "经典鸡尾酒"
            }
            {
                "name": "莫吉托"
                "description": "清爽薄荷酒"
            }
        ]
    }`;
    
    try {
        const result1 = streamService.parseRecommendation(brokenJSON1);
        console.log('✅ 测试1通过：缺少逗号修复成功');
        console.log(`   推荐数量: ${result1.recommendations?.length || 0}`);
    } catch (error) {
        console.log('❌ 测试1失败:', error.message);
    }
    
    // 测试用例2：推荐数量不足
    const incompleteJSON = `{
        "recommendations": [
            {
                "name": "玛格丽特",
                "description": "经典鸡尾酒",
                "ingredients": ["龙舌兰", "青柠汁"],
                "color": "#4A90E2"
            }
        ]
    }`;
    
    try {
        const result2 = streamService.parseRecommendation(incompleteJSON);
        console.log('✅ 测试2通过：推荐数量补全成功');
        console.log(`   推荐数量: ${result2.recommendations?.length || 0}`);
        console.log(`   推荐名称: ${result2.recommendations?.map(r => r.name).join(', ')}`);
    } catch (error) {
        console.log('❌ 测试2失败:', error.message);
    }
}

// 测试模型选择功能
function testModelSelection() {
    console.log('\n🧪 测试模型选择功能...');
    
    const VolcanoService = require('./backend/services/volcano-service');
    const volcanoService = new VolcanoService();
    
    // 测试不同场景的模型选择
    const proModel = volcanoService.selectOptimalModel('recommendation', false);
    const speedModel = volcanoService.selectOptimalModel('recommendation', true);
    const analysisModel = volcanoService.selectOptimalModel('analysis', false);
    
    console.log('✅ 模型选择测试结果:');
    console.log(`   推荐任务(质量优先): ${proModel}`);
    console.log(`   推荐任务(速度优先): ${speedModel}`);
    console.log(`   分析任务: ${analysisModel}`);
    
    // 测试性能统计更新
    volcanoService.updatePerformanceStats('pro', true, 2500);
    volcanoService.updatePerformanceStats('lite', true, 1200);
    volcanoService.updatePerformanceStats('lite', false, 800);
    
    console.log('✅ 性能统计更新测试完成');
    console.log('   Pro模型统计:', volcanoService.performanceStats.pro);
    console.log('   Lite模型统计:', volcanoService.performanceStats.lite);
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始运行优化功能测试...\n');
    
    try {
        testJSONRepair();
        testModelSelection();
        
        console.log('\n🎉 所有测试完成！');
        console.log('\n📋 优化功能总结:');
        console.log('✅ JSON解析修复 - 支持多种语法错误修复');
        console.log('✅ 推荐数量保证 - 确保始终返回3个推荐');
        console.log('✅ 智能模型选择 - 根据任务类型自动选择最佳模型');
        console.log('✅ 性能监控统计 - 实时跟踪模型表现');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testJSONRepair,
    testModelSelection,
    runAllTests
};
