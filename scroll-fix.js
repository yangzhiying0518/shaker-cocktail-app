// 滚动冲突修复方案
// 需要修改的两个地方：

// 1. 修改 showSection 函数 - 移除自动滚动
function showSection(sectionId) {
    const sections = ['heroSection', 'featuresSection', 'recommendationSection', 'loadingSection', 'shakerAnalysisSection', 'cocktailMakingSection', 'resultsSection'];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
        if (id === sectionId) {
            element.style.display = 'block';
            // ❌ 移除这部分自动滚动逻辑
            // setTimeout(() => {
            //     element.scrollIntoView({
            //         behavior: 'smooth',
            //         block: 'start'
            //     });
            // }, 100);
        } else {
            // 特殊处理：保持分析区域始终可见
            if (id === 'shakerAnalysisSection') {
                // 分析区域一旦显示就保持可见
                const analysisSection = document.getElementById('shakerAnalysisSection');
                if (analysisSection && analysisSection.style.display === 'block') {
                    return; // 不隐藏已显示的分析区域
                }
            }
            
            // 保持调制区域在推荐阶段可见
            if (sectionId === 'cocktailMakingSection' || sectionId === 'resultsSection') {
                if (id === 'cocktailMakingSection') {
                    return;
                }
            }
        element.style.display = 'none';
        }
        }
    });
}

// 2. 优化推荐阶段的滚动参数
// 在 Shaker说完话后的滚动逻辑中：
console.log('✅ Shaker说话完成，立即滚动到推荐区域');

// 立即滚动到推荐区域，显示加载状态
showSection('cocktailMakingSection');
setTimeout(() => {
    const makingSection = document.getElementById('cocktailMakingSection');
    if (makingSection) {
        makingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'  // ✅ 改为 'start' 确保完全展示标题
        });
    }
}, 500);  // ✅ 延长到500ms，确保DOM更新完成
