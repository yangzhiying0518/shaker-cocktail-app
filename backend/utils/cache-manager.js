/**
 * 智能缓存管理器 - 基于用户输入相似度的缓存策略
 */

const crypto = require('crypto');

class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100; // 最大缓存条目数
        this.ttl = 30 * 60 * 1000; // 30分钟TTL
        this.hitCount = 0;
        this.missCount = 0;
        
        // 定期清理过期缓存
        setInterval(() => this.cleanup(), 5 * 60 * 1000); // 每5分钟清理一次
    }

    /**
     * 生成用户输入的缓存键
     */
    generateCacheKey(userInput) {
        // 标准化用户输入
        const normalized = this.normalizeUserInput(userInput);
        
        // 生成基于内容的哈希
        const hash = crypto.createHash('md5')
            .update(JSON.stringify(normalized))
            .digest('hex');
            
        return `user_input_${hash}`;
    }

    /**
     * 标准化用户输入（用于相似度匹配）
     */
    normalizeUserInput(userInput) {
        return {
            // 新版前端字段
            selections: userInput.selections?.map(s => s.toLowerCase().trim()).sort(),
            customInput: userInput.customInput?.toLowerCase().trim(),
            
            // 旧版字段（向后兼容）
            scene: userInput.scene?.toLowerCase().trim(),
            moods: userInput.moods?.map(mood => mood.toLowerCase().trim()).sort(),
            spirits: userInput.ingredients?.spirits?.map(s => s.toLowerCase().trim()).sort(),
            mixers: userInput.ingredients?.mixers?.map(m => m.toLowerCase().trim()).sort(),
            alcohol_level: userInput.preferences?.alcohol_level?.toLowerCase().trim(),
            sweetness: userInput.preferences?.sweetness?.toLowerCase().trim(),
            style: userInput.preferences?.style?.toLowerCase().trim(),
            
            // 🎲 随机种子（用于空白输入多样性）
            _randomSeed: userInput._randomSeed
        };
    }

    /**
     * 计算两个用户输入的相似度
     */
    calculateSimilarity(input1, input2) {
        const norm1 = this.normalizeUserInput(input1);
        const norm2 = this.normalizeUserInput(input2);
        
        let score = 0;
        let totalFields = 0;

        // 新版字段匹配
        // 选择匹配 (权重: 35%)
        if (norm1.selections && norm2.selections) {
            totalFields += 3.5;
            const intersection = norm1.selections.filter(sel => norm2.selections.includes(sel));
            score += (intersection.length / Math.max(norm1.selections.length, norm2.selections.length)) * 3.5;
        }

        // 自定义输入匹配 (权重: 30%)
        if (norm1.customInput && norm2.customInput) {
            totalFields += 3;
            if (norm1.customInput === norm2.customInput) {
                score += 3;
            } else {
                // 简单的文本相似度检查
                const similarity = this.calculateTextSimilarity(norm1.customInput, norm2.customInput);
                score += similarity * 3;
            }
        }

        // 旧版字段匹配（向后兼容）
        // 场景匹配 (权重: 30%)
        if (norm1.scene && norm2.scene) {
            totalFields += 3;
            if (norm1.scene === norm2.scene) score += 3;
        }

        // 心情匹配 (权重: 25%)
        if (norm1.moods && norm2.moods) {
            totalFields += 2.5;
            const intersection = norm1.moods.filter(mood => norm2.moods.includes(mood));
            score += (intersection.length / Math.max(norm1.moods.length, norm2.moods.length)) * 2.5;
        }

        // 基酒匹配 (权重: 20%)
        if (norm1.spirits && norm2.spirits) {
            totalFields += 2;
            const intersection = norm1.spirits.filter(spirit => norm2.spirits.includes(spirit));
            score += (intersection.length / Math.max(norm1.spirits.length, norm2.spirits.length)) * 2;
        }

        // 偏好匹配 (权重: 25%)
        const preferences = ['alcohol_level', 'sweetness', 'style'];
        preferences.forEach(pref => {
            if (norm1[pref] && norm2[pref]) {
                totalFields += 0.83; // 2.5 / 3
                if (norm1[pref] === norm2[pref]) score += 0.83;
            }
        });

        return totalFields > 0 ? score / totalFields : 0;
    }

    /**
     * 计算两个文本的相似度（简单的词汇重叠度）
     */
    calculateTextSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        
        const words1 = text1.replace(/[^\u4e00-\u9fa5\w]/g, '').split('');
        const words2 = text2.replace(/[^\u4e00-\u9fa5\w]/g, '').split('');
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return union.length > 0 ? intersection.length / union.length : 0;
    }

    /**
     * 查找相似的缓存条目
     */
    findSimilarCache(userInput, threshold = 0.8) {
        let bestMatch = null;
        let bestScore = 0;

        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) continue;
            
            const similarity = this.calculateSimilarity(userInput, entry.userInput);
            
            if (similarity > threshold && similarity > bestScore) {
                bestScore = similarity;
                bestMatch = { key, entry, similarity };
            }
        }

        return bestMatch;
    }

    /**
     * 获取缓存
     */
    get(userInput) {
        // 首先尝试精确匹配
        const exactKey = this.generateCacheKey(userInput);
        const exactEntry = this.cache.get(exactKey);
        
        if (exactEntry && !this.isExpired(exactEntry)) {
            exactEntry.lastAccessed = Date.now();
            exactEntry.accessCount++;
            this.hitCount++;
            console.log('✅ [缓存] 精确命中:', exactKey.substring(0, 16) + '...');
            return exactEntry.data;
        }

        // 尝试相似度匹配
        const similarMatch = this.findSimilarCache(userInput);
        if (similarMatch) {
            const { entry, similarity } = similarMatch;
            entry.lastAccessed = Date.now();
            entry.accessCount++;
            this.hitCount++;
            console.log(`✅ [缓存] 相似匹配 (${(similarity * 100).toFixed(1)}%):`, similarMatch.key.substring(0, 16) + '...');
            return entry.data;
        }

        // 缓存未命中
        this.missCount++;
        console.log('❌ [缓存] 未命中');
        return null;
    }

    /**
     * 设置缓存
     */
    set(userInput, data) {
        const key = this.generateCacheKey(userInput);
        
        // 🎲 空白输入检测和特殊处理
        const isEmpty = !userInput.scene && (!userInput.moods || userInput.moods.length === 0) && 
                       (!userInput.ingredients || Object.keys(userInput.ingredients).length === 0) && 
                       (!userInput.preferences || Object.keys(userInput.preferences).length === 0) && 
                       !userInput.special_requirements;
        
        // 如果缓存已满，删除最旧的条目
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        const entry = {
            userInput,
            data,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 1,
            // 空白输入使用较短的TTL (5分钟 vs 默认30分钟)
            ttl: isEmpty ? 5 * 60 * 1000 : 30 * 60 * 1000
        };
        
        if (isEmpty) {
            console.log('🎲 [缓存] 空白输入使用短期缓存: 5分钟');
        }

        this.cache.set(key, entry);
        console.log('💾 [缓存] 已缓存:', key.substring(0, 16) + '...');
    }

    /**
     * 检查缓存是否过期
     */
    isExpired(entry) {
        // 使用条目自己的TTL，而不是全局TTL
        const entryTTL = entry.ttl || this.ttl;
        return Date.now() - entry.createdAt > entryTTL;
    }

    /**
     * 清理过期缓存
     */
    cleanup() {
        const beforeSize = this.cache.size;
        let cleanedCount = 0;

        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 [缓存] 清理了 ${cleanedCount} 个过期条目 (${beforeSize} → ${this.cache.size})`);
        }
    }

    /**
     * 淘汰最旧的缓存条目
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            console.log('🗑️ [缓存] 淘汰最旧条目:', oldestKey.substring(0, 16) + '...');
        }
    }


    /**
     * 清空缓存
     */
    clear() {
        this.cache.clear();
        this.hitCount = 0;
        this.missCount = 0;
        console.log('🧹 [缓存] 已清空所有缓存');
    }

    /**
     * 缓存预热 - 为常见场景预生成推荐
     */
    async preWarmCache(aiService) {
        if (!aiService) {
            console.log('⚠️ [缓存预热] 未提供AI服务，跳过预热');
            return;
        }

        console.log('🔥 [缓存预热] 开始预热常见场景...');
        
        const commonScenarios = [
            {
                scene: '聚会派对',
                moods: ['春日愉悦'],
                ingredients: { spirits: ['伏特加'], mixers: ['柠檬汁'], tools: ['调酒器'] },
                preferences: { alcohol_level: '中度', sweetness: '微甜', acidity: '适中' }
            },
            {
                scene: '浪漫约会',
                moods: ['春日愉悦'],
                ingredients: { spirits: ['威士忌'], mixers: ['柠檬汁'], tools: ['调酒器'] },
                preferences: { alcohol_level: '中度', sweetness: '微甜', acidity: '适中' }
            },
            {
                scene: '独处放松',
                moods: ['秋叶宁静'],
                ingredients: { spirits: ['威士忌'], mixers: ['柠檬汁'], tools: ['调酒器'] },
                preferences: { alcohol_level: '中度', sweetness: '微甜', acidity: '适中' }
            }
        ];

        let preWarmedCount = 0;
        
        for (const scenario of commonScenarios) {
            try {
                // 检查是否已有缓存
                if (this.get(scenario)) {
                    console.log(`✅ [缓存预热] 场景"${scenario.scene}"已有缓存，跳过`);
                    continue;
                }

                // 生成推荐并缓存
                console.log(`🔄 [缓存预热] 预热场景: ${scenario.scene}`);
                const recommendations = await aiService.getCocktailRecommendation(scenario);
                this.set(scenario, recommendations);
                preWarmedCount++;
                
                // 避免过于频繁的请求
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.warn(`⚠️ [缓存预热] 场景"${scenario.scene}"预热失败:`, error.message);
            }
        }
        
        console.log(`🔥 [缓存预热] 完成，预热了 ${preWarmedCount} 个场景`);
    }

    /**
     * 获取缓存统计信息 - 增强版
     */
    getStats() {
        const total = this.hitCount + this.missCount;
        const hitRate = total > 0 ? (this.hitCount / total * 100).toFixed(1) : 0;
        
        // 计算内存使用量
        let memoryUsage = 0;
        for (const [key, entry] of this.cache) {
            memoryUsage += JSON.stringify(entry).length;
        }
        
        // 找到最旧的条目
        let oldestEntry = null;
        for (const [key, entry] of this.cache) {
            if (!oldestEntry || entry.createdAt < oldestEntry.createdAt) {
                oldestEntry = entry;
            }
        }
        
        return {
            totalEntries: this.cache.size,
            maxSize: this.maxSize,
            hitCount: this.hitCount,
            missCount: this.missCount,
            hitRate: `${hitRate}%`,
            memoryUsage: `${(memoryUsage / 1024).toFixed(1)}KB`,
            ttl: `${this.ttl / 60000}分钟`,
            oldestEntry: oldestEntry ? new Date(oldestEntry.createdAt).toISOString() : null
        };
    }
}

// 单例模式
const cacheManager = new CacheManager();

module.exports = cacheManager;
