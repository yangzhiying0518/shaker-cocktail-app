#!/usr/bin/env node

/**
 * 多样性验证修复测试脚本
 * 测试修复后的多样性验证机制是否工作正常
 */

const axios = require('axios');

// 配置
const API_BASE_URL = 'https://shaker-cocktail-app-production.up.railway.app';
// const API_BASE_URL = 'http://localhost:3001'; // 本地测试时使用

// 测试用例
const testCases = [
    {
        name: '独处放松场景 - 威士忌偏好',
        description: '测试在独处放松场景下，允许适度的威士忌重复',
        input: {
            scene: '独处放松',
            moods: ['秋叶宁静'],
            ingredients: {
                spirits: ['威士忌'],
                mixers: ['柠檬汁', '蜂蜜'],
                tools: ['调酒器']
            },
            preferences: {
                alcohol_level: '中度',
                sweetness: '微甜',
                acidity: '适中'
            },
            special_requirements: '喜欢威士忌的温暖感觉'
        }
    },
    {
        name: '聚会派对场景 - 多样化需求',
        description: '测试聚会场景下的强制多样化',
        input: {
            scene: '聚会派对',
            moods: ['春日愉悦', '夏日热情'],
            ingredients: {
                spirits: ['金酒', '伏特加', '朗姆酒'],
                mixers: ['柠檬汁', '青柠汁', '苏打水'],
                tools: ['调酒器', '搅拌棒']
            },
            preferences: {
                alcohol_level: '中度',
                sweetness: '适中',
                acidity: '微酸'
            }
        }
    },
    {
        name: '空白输入测试',
        description: '测试完全空白输入的多样性处理',
        input: {}
    },
    {
        name: '浪漫约会场景',
        description: '测试浪漫场景的精致推荐',
        input: {
            scene: '浪漫约会',
            moods: ['温柔月光'],
            preferences: {
                alcohol_level: '轻度',
                sweetness: '甜润',
                acidity: '微酸'
            },
            special_requirements: '希望有香槟或特色酒'
        }
    }
];

/**
 * 执行单个测试用例
 */
async function runTestCase(testCase, index) {
    console.log(`\n🧪 [测试 ${index + 1}] ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`📥 输入:`, JSON.stringify(testCase.input, null, 2));
    
    try {
        const startTime = Date.now();
        
        const response = await axios.post(`${API_BASE_URL}/api/recommend`, testCase.input, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60秒超时
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.data.success) {
            console.log(`✅ [成功] 响应时间: ${responseTime}ms`);
            
            const recommendations = response.data.data.recommendations;
            console.log(`📊 推荐数量: ${recommendations.length}`);
            
            // 分析推荐结果
            analyzeRecommendations(recommendations);
            
            return {
                success: true,
                responseTime,
                recommendations: recommendations.length,
                cached: response.data.cached || false
            };
        } else {
            console.log(`❌ [失败] ${response.data.error || '未知错误'}`);
            return {
                success: false,
                error: response.data.error
            };
        }
        
    } catch (error) {
        console.log(`💥 [异常] ${error.message}`);
        if (error.response?.data) {
            console.log(`📄 错误详情:`, error.response.data);
        }
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 分析推荐结果的多样性
 */
function analyzeRecommendations(recommendations) {
    console.log('\n📋 [多样性分析] ==========================================');
    
    // 基酒分析
    const spirits = recommendations.map((rec, index) => {
        const ingredients = rec.recipe?.ingredients || [];
        const spirit = ingredients.find(ing => 
            ing.name.includes('威士忌') || ing.name.includes('金酒') || 
            ing.name.includes('朗姆') || ing.name.includes('龙舌兰') || 
            ing.name.includes('伏特加') || ing.name.includes('白兰地') ||
            ing.name.includes('白酒') || ing.name.includes('清酒') || 
            ing.name.includes('利口酒') || ing.name.includes('香槟')
        );
        const spiritName = spirit?.name || '未知';
        console.log(`🍸 推荐${index + 1}: ${rec.name?.chinese} - 基酒: ${spiritName}`);
        return spiritName;
    });
    
    const uniqueSpirits = [...new Set(spirits.filter(s => s !== '未知'))];
    console.log(`📊 基酒多样性: ${uniqueSpirits.length}/${spirits.length} (${(uniqueSpirits.length/spirits.length*100).toFixed(1)}%)`);
    
    // 优先级分析
    const priorities = recommendations.map(rec => rec.priority || '');
    const uniquePriorities = [...new Set(priorities.filter(p => p))];
    console.log(`⭐ 优先级多样性: ${uniquePriorities.length}种不同 (${priorities.join(', ')})`);
    
    // 复杂度分析
    const difficulties = recommendations.map(rec => rec.recipe?.difficulty || '未知');
    const uniqueDifficulties = [...new Set(difficulties.filter(d => d !== '未知'))];
    console.log(`🛠️ 制作复杂度: ${uniqueDifficulties.length}种不同 (${difficulties.join(', ')})`);
    
    // 名称唯一性
    const names = recommendations.map(rec => rec.name?.chinese || '未知');
    const uniqueNames = [...new Set(names.filter(n => n !== '未知'))];
    const nameUnique = uniqueNames.length === names.length;
    console.log(`🏷️ 名称唯一性: ${nameUnique ? '✅ 完全不同' : '❌ 存在重复'}`);
    
    console.log('========================================== [分析结束]\n');
}

/**
 * 主测试函数
 */
async function runAllTests() {
    console.log('🚀 开始多样性验证修复测试');
    console.log(`🌐 API地址: ${API_BASE_URL}`);
    console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
    
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
        const result = await runTestCase(testCases[i], i);
        results.push({
            testCase: testCases[i].name,
            ...result
        });
        
        // 测试间隔，避免请求过于频繁
        if (i < testCases.length - 1) {
            console.log('⏳ 等待3秒后继续下一个测试...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // 生成测试报告
    generateTestReport(results);
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
    console.log('\n📊 [测试报告] ==========================================');
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = (successCount / totalCount * 100).toFixed(1);
    
    console.log(`✅ 成功率: ${successCount}/${totalCount} (${successRate}%)`);
    
    const avgResponseTime = results
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) / 
        results.filter(r => r.responseTime).length;
    
    if (avgResponseTime) {
        console.log(`⚡ 平均响应时间: ${avgResponseTime.toFixed(0)}ms`);
    }
    
    console.log('\n📋 详细结果:');
    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
        const cache = result.cached ? '(缓存)' : '';
        console.log(`   ${index + 1}. ${status} ${result.testCase} - ${time} ${cache}`);
        if (!result.success && result.error) {
            console.log(`      错误: ${result.error}`);
        }
    });
    
    console.log('\n🎯 修复效果评估:');
    if (successRate >= 80) {
        console.log('   🟢 修复效果良好 - 多样性验证机制工作正常');
    } else if (successRate >= 60) {
        console.log('   🟡 修复效果一般 - 仍有部分问题需要调整');
    } else {
        console.log('   🔴 修复效果不佳 - 需要进一步优化');
    }
    
    console.log('========================================== [报告结束]');
}

// 运行测试
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('💥 测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests, runTestCase, analyzeRecommendations };
