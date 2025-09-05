/**
 * Shaker 应用状态管理
 * 使用简单的状态管理模式，保持数据一致性
 */

class AppState {
    constructor() {
        this.state = {
            // 用户输入数据
            userInput: {
                scene: null,
                moods: [],
                ingredients: {
                    spirits: [],
                    mixers: [],
                    tools: []
                },
                preferences: {
                    alcohol_level: 50,
                    sweetness: 50,
                    acidity: 50,
                    style: null
                },
                special_requirements: ''
            },
            
            // UI状态
            ui: {
                currentSection: 'heroSection',
                isLoading: false,
                isStreaming: false,
                streamingPhase: null,
                errorMessage: null
            },
            
            // 推荐结果
            recommendations: {
                data: null,
                cached: false,
                fallback: false,
                responseTime: null
            }
        };
        
        this.listeners = new Map();
    }

    // 获取状态
    get(path) {
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    // 设置状态
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;
        
        // 导航到目标对象
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        // 设置值
        current[lastKey] = value;
        
        // 通知监听器
        this.notify(path, value);
    }

    // 更新状态（合并对象）
    update(path, updates) {
        const current = this.get(path);
        if (typeof current === 'object' && current !== null) {
            const newValue = { ...current, ...updates };
            this.set(path, newValue);
        } else {
            this.set(path, updates);
        }
    }

    // 添加到数组
    addToArray(path, item) {
        const array = this.get(path) || [];
        if (!array.includes(item)) {
            this.set(path, [...array, item]);
        }
    }

    // 从数组移除
    removeFromArray(path, item) {
        const array = this.get(path) || [];
        this.set(path, array.filter(i => i !== item));
    }

    // 清空状态
    reset() {
        this.state.userInput = {
            scene: null,
            moods: [],
            ingredients: {
                spirits: [],
                mixers: [],
                tools: []
            },
            preferences: {
                alcohol_level: 50,
                sweetness: 50,
                acidity: 50,
                style: null
            },
            special_requirements: ''
        };
        
        this.state.recommendations = {
            data: null,
            cached: false,
            fallback: false,
            responseTime: null
        };
        
        this.notify('reset', null);
    }

    // 订阅状态变化
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
        
        // 返回取消订阅的函数
        return () => {
            const callbacks = this.listeners.get(path);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    // 通知监听器
    notify(path, value) {
        // 通知精确路径的监听器
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
        
        // 通知父路径的监听器
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            if (this.listeners.has(parentPath)) {
                this.listeners.get(parentPath).forEach(callback => {
                    try {
                        callback(this.get(parentPath), parentPath);
                    } catch (error) {
                        console.error('State listener error:', error);
                    }
                });
            }
        }
    }

    // 验证用户输入（现在总是有效，允许完全自由的输入）
    validateUserInput() {
        return {
            isValid: true, // 总是有效，支持完全自由的输入
            mode: this.getInputMode()
        };
    }

    // 判断用户输入模式
    getInputMode() {
        const { scene, moods, ingredients, special_requirements } = this.state.userInput;
        
        // 计算用户输入的丰富程度
        const hasScene = !!scene;
        const hasMoods = moods.length > 0;
        const hasIngredients = ingredients.spirits.length > 0 || ingredients.mixers.length > 0 || ingredients.tools.length > 0;
        const hasSpecialReq = !!special_requirements;
        
        const selectionCount = [hasScene, hasMoods, hasIngredients, hasSpecialReq].filter(Boolean).length;
        
        if (selectionCount === 0) return 'free_style'; // 完全自由模式
        if (selectionCount <= 2) return 'minimal'; // 最少信息模式
        return 'guided'; // 引导模式
    }

    // 获取完整的推荐请求数据
    getRecommendationData() {
        const { userInput } = this.state;
        return {
            scene: userInput.scene,
            moods: userInput.moods,
            ingredients: userInput.ingredients,
            preferences: {
                alcohol_level: this.getAlcoholLevelText(userInput.preferences.alcohol_level),
                sweetness: this.getSweetnessText(userInput.preferences.sweetness),
                acidity: this.getAcidityText(userInput.preferences.acidity),
                style: userInput.preferences.style
            },
            special_requirements: userInput.special_requirements || undefined
        };
    }

    // 辅助方法：转换数值为文本
    getAlcoholLevelText(value) {
        if (value < 33) return '低度';
        if (value < 67) return '中度';
        return '高度';
    }

    getSweetnessText(value) {
        if (value < 33) return '不甜';
        if (value < 67) return '微甜';
        return '很甜';
    }

    getAcidityText(value) {
        if (value < 33) return '不酸';
        if (value < 67) return '适中';
        return '很酸';
    }

    // 调试方法
    debug() {
        console.log('Current State:', JSON.stringify(this.state, null, 2));
        console.log('Active Listeners:', Array.from(this.listeners.keys()));
    }
}

// 创建全局状态实例
export const appState = new AppState();

// 在开发环境下暴露到全局，方便调试
if (typeof window !== 'undefined') {
    window.appState = appState;
}
