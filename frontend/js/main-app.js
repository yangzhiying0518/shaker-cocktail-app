        // 使用模块化的本地分析生成器（已在js/local-analysis.js中定义）

        // 使用模块化的回顾卡片生成器（已在js/review-card-generator.js中定义）


        // 思考泡泡生成器
        class ThoughtBubbleGenerator {
            constructor() {
                this.positions = ['top-right', 'top-left', 'right', 'left', 'bottom'];
                this.currentPositionIndex = 0;
            }
            
            // 根据泡泡数量智能分配位置
            getOptimalPositions(bubbleCount) {
                if (bubbleCount <= 2) {
                    return ['top-left', 'top-right'];
                } else if (bubbleCount <= 3) {
                    return ['top-left', 'top-right', 'bottom'];
                } else if (bubbleCount <= 4) {
                    return ['top-left', 'top-right', 'left', 'right'];
                } else {
                    return ['top-left', 'top-right', 'left', 'right', 'bottom'];
                }
            }
            
            generateBubbles(userInput) {
                const bubbles = [];
                
                // 先收集所有需要显示的泡泡
                const bubbleData = [
                    { type: 'scene', value: userInput.scene, icon: '⭐' },
                    { type: 'moods', value: userInput.moods, icon: '💫' },
                    { type: 'ingredients', value: userInput.ingredients, icon: '🍋' },
                    { type: 'preferences', value: userInput.preferences, icon: '🍸' },
                    { type: 'special', value: userInput.special_requirements, icon: '✨' }
                ];
                
                // 过滤出有内容的泡泡，如果没有内容也保留（显示兜底文案）
                const validBubbles = bubbleData.filter(bubble => {
                    if (bubble.type === 'ingredients') {
                        return true; // 材料泡泡总是显示
                    }
                    if (bubble.type === 'preferences') {
                        return true; // 偏好泡泡总是显示
                    }
                    return true; // 所有泡泡都显示
                });
                
                // 获取最优位置分配
                const optimalPositions = this.getOptimalPositions(validBubbles.length);
                
                // 创建泡泡并分配位置
                validBubbles.forEach((bubbleData, index) => {
                    const position = optimalPositions[index] || 'bottom';
                    const bubble = this.createBubbleWithPosition(
                        bubbleData.type, 
                        bubbleData.value, 
                        bubbleData.icon, 
                        position
                    );
                    bubbles.push(bubble);
                });
                
                return bubbles;
            }
            
            createBubble(type, value, icon) {
                const position = this.getNextPosition();
                const content = this.formatContent(type, value);
                const title = this.getTitle(type);
                
                return {
                    type,
                    icon,
                    title,
                    content,
                    position,
                    isEmpty: !value || (Array.isArray(value) && value.length === 0)
                };
            }
            
            createBubbleWithPosition(type, value, icon, position) {
                const content = this.formatContent(type, value);
                const title = this.getTitle(type);
                
                return {
                    type,
                    icon,
                    title,
                    content,
                    position,
                    isEmpty: !value || (Array.isArray(value) && value.length === 0)
                };
            }
            
            getNextPosition() {
                const position = this.positions[this.currentPositionIndex];
                this.currentPositionIndex = (this.currentPositionIndex + 1) % this.positions.length;
                return position;
            }
            
            getTitle(type) {
                const titles = {
                    'scene': '场景',
                    'moods': '心情',
                    'ingredients': '材料',
                    'preferences': '偏好',
                    'special': '要求'
                };
                return titles[type] || type;
            }
            
            formatContent(type, value) {
                if (!value || (Array.isArray(value) && value.length === 0) || 
                    (typeof value === 'string' && value.trim() === '')) {
                    return this.getEmptyText(type);
                }
                
                switch (type) {
                    case 'scene':
                        return this.getShakerSceneThought(value);
                    case 'moods':
                        return this.getShakerMoodThought(value);
                    case 'ingredients':
                        return this.getShakerIngredientThought(value);
                    case 'preferences':
                        return this.getShakerPreferenceThought(value);
                    case 'special':
                        return this.getShakerSpecialThought(value);
                    default:
                        return value;
                }
            }
            
            // Shaker场景思考
            getShakerSceneThought(scene) {
                const thoughts = [
                    `${scene}...多么美妙的时刻！我知道该调什么了✨`,
                    `想在${scene}享用呢～我脑海中已经有画面了🌟`,
                    `${scene}让我想起了特别的味道...会很棒的💫`,
                    `${scene}的时候...让我用最贴心的方式呵护你🎭`,
                    `${scene}有它独特的魅力，让我陪伴你度过🌙`,
                    `${scene}时最需要理解和陪伴...温暖你的心💕`,
                    `我能看到你在${scene}的样子...很美呢🌸`
                ];
                return this.getRandomThought(thoughts);
            }

            // Shaker心情思考
            getShakerMoodThought(moods) {
                const moodStr = Array.isArray(moods) ? moods.join('、') : moods;
                const thoughts = [
                    `${moodStr}的感觉...我完全理解！让我温柔捕捉💫`,
                    `想要${moodStr}呢～我会用最贴心的配方拥抱你💕`,
                    `${moodStr}让我想起特别的香气...抚慰心灵✨`,
                    `感受到${moodStr}了～让我用酒来陪伴温暖你🌟`,
                    `${moodStr}的心境...我能看到你内心的色彩💖`,
                    `${moodStr}心情让我心疼...最温柔的治愈🌸`,
                    `${moodStr}...我懂，让这杯酒给你力量💝`
                ];
                return this.getRandomThought(thoughts);
            }

            // Shaker材料思考
            getShakerIngredientThought(ingredients) {
                const parts = [];
                if (ingredients.spirits && ingredients.spirits.length > 0) {
                    parts.push(ingredients.spirits.join('、'));
                }
                if (ingredients.mixers && ingredients.mixers.length > 0) {
                    parts.push(ingredients.mixers.join('、'));
                }
                
                if (parts.length > 0) {
                    const ingredientStr = parts.join('和');
                    const thoughts = [
                        `准备了${ingredientStr}呢！让我发挥创意🍋`,
                        `${ingredientStr}...很好的选择！会很精彩✨`,
                        `看到${ingredientStr}，直觉告诉我会很特别🌟`,
                        `${ingredientStr}...让我完美融合它们💫`,
                        `有了${ingredientStr}，能想象丰富口感了🎭`
                    ];
                    return this.getRandomThought(thoughts);
                } else {
                    return this.getRandomThought([
                        '让我自由选择材料！最好的创作来自直觉✨',
                        '没有限制...我最喜欢了！用经验挑选🌟',
                        '相信我的专业判断～选最适合的💫'
                    ]);
                }
            }

            // Shaker偏好思考
            getShakerPreferenceThought(preferences) {
                const thoughts = [
                    `注意到你的偏好了...精确调配🍸`,
                    `根据你的喜好...能感受到品味✨`,
                    `偏好告诉了我很多...创造独特配方💫`,
                    `从选择中读出了你的理解...很合拍🌟`,
                    `偏好让我更了解你...心灵的交流💕`
                ];
                return this.getRandomThought(thoughts);
            }

            // Shaker特殊要求思考
            getShakerSpecialThought(special) {
                const thoughts = [
                    `特别要求：${special} ✨ 喜欢挑战！`,
                    `${special}...有趣的要求！创新机会🌟`,
                    `关于"${special}"...已经有想法了💫`,
                    `${special}...想起特别技巧，来展示🎭`,
                    `要求"${special}"收到！挑战更有趣✨`
                ];
                return this.getRandomThought(thoughts);
            }

            // 获取随机思考内容
            getRandomThought(thoughts) {
                return thoughts[Math.floor(Math.random() * thoughts.length)];
            }

            getEmptyText(type) {
                const emptyTexts = {
                    'scene': this.getRandomThought([
                        '嗯...还没想好在什么场合喝呢～不过没关系，我会为你选择最适合的氛围！💫',
                        '场景嘛...有时候最美的时刻是意外降临的，让我来创造一个特别的时刻吧！✨',
                        '没有特定场景也很好呢～这样我就能调制一杯适合任何时刻的万能酒！🌟'
                    ]),
                    'moods': this.getRandomThought([
                        '心情嘛...随意就好啦💕 有时候最好的心情是在品尝美酒时自然流露的！',
                        '没有特定心情？那就让这杯酒来为你带来惊喜的心境吧！✨',
                        '心情是会变化的...让我调制一杯能够适应你任何心境的酒！💫'
                    ]),
                    'ingredients': this.getRandomThought([
                        '让我来自由发挥吧！✨ 有时候最好的创作来自于调酒师的直觉和经验！',
                        '没有材料限制...这是我最喜欢的挑战！让我用最棒的组合来惊艳你！🌟',
                        '相信我的选择～我会用最适合的材料为你调制完美的酒！💫'
                    ]),
                    'preferences': this.getRandomThought([
                        '相信我的专业判断～😊 我会根据你的整体需求来调配最合适的口感！',
                        '没有特定偏好也很好～这样我就能展示我的调酒艺术了！✨',
                        '让我来为你探索新的味觉体验吧！有时候惊喜比预期更美妙！💫'
                    ]),
                    'special': this.getRandomThought([
                        '没有特别要求...很好很好！这样我就能专注于调制最经典完美的酒了！✨',
                        '简单就是美～有时候最朴素的要求能带来最纯粹的享受！💫',
                        '没有限制的创作...让我用最纯粹的调酒技艺来感动你吧！🌟'
                    ])
                };
                return emptyTexts[type] || '让我好好想想...🤔';
            }
            

            
            hasIngredients(ingredients) {
                if (!ingredients) return false;
                const { spirits, mixers, tools } = ingredients;
                return (spirits && spirits.length > 0) || (mixers && mixers.length > 0) || (tools && tools.length > 0);
            }
            
            hasPreferences(preferences) {
                if (!preferences) return false;
                return preferences.alcohol_level || preferences.sweetness || preferences.style;
            }
        }
        
        const thoughtBubbleGenerator = new ThoughtBubbleGenerator();

        // 全局状态
        let currentStep = 1;
        let userInput = {
            scene: '',
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
                style: ''
            },
            special_requirements: ''
        };

        // 页面加载完成后执行
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            setupScrollEffects();
            setupSliders();
        });

        // 初始化应用
        function initializeApp() {
            setupScrollEffects();
            setupIntersectionObserver();
            setupEventListeners();
            updateProgressBar(); // 初始化进度条
            // initializeBubblePhysics(); // 关闭气泡物理效果，使用正常布局
        }

        // 设置滚动效果
        function setupScrollEffects() {
            const header = document.querySelector('.header');
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // 更新进度条
                updateProgressBar();
            });
        }

        // 更新进度条
        function updateProgressBar() {
            const sections = [
                'sceneSection',
                'moodSection', 
                'ingredientSection',
                'preferenceSection',
                'requirementSection',
                'recommendSection'
            ];
            
            const indicator = document.querySelector('.progress-indicator');
            let activeSection = 0;
            
            // 找到当前在视窗中的区域
            sections.forEach((sectionId, index) => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    
                    // 如果区域在视窗中间部分
                    if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                        activeSection = index;
                    }
                }
            });
            
            // 更新进度条位置
            if (indicator) {
                const progress = (activeSection / (sections.length - 1)) * 100;
                indicator.style.top = `${progress}%`;
            }
        }

        // 设置滚动动画观察器
        function setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.features-section, .recommendation-section').forEach(el => {
                observer.observe(el);
            });
        }

        // 设置事件监听器
        function setupEventListeners() {
        // 场景选择
            document.querySelector('.scene-grid').addEventListener('click', handleSceneSelection);
            
            // 心情选择
            document.querySelector('.mood-grid').addEventListener('click', handleMoodSelection);
            
            // 材料选择
            document.querySelectorAll('.ingredient-list').forEach(list => {
                list.addEventListener('click', handleIngredientSelection);
            });
            
            // 口感风格选择
            document.querySelector('#step4 .options-grid').addEventListener('click', handleStyleSelection);
            
            // 偏好滑块
            document.querySelectorAll('.slider').forEach(slider => {
                slider.addEventListener('input', handlePreferenceChange);
            });
            
            // 特殊要求便捷输入
            document.querySelector('.requirement-tags .tag-list').addEventListener('click', handleRequirementTagClick);
        }

                        // 处理场景选择
        function handleSceneSelection(e) {
            const card = e.target.closest('.scene-card');
            if (!card) return;
            
            const scene = card.dataset.value;
            
            if (card.classList.contains('selected')) {
                // 如果已选中，则取消选中
                card.classList.remove('selected');
                userInput.scene = '';
            } else {
                // 清除其他选择
                document.querySelectorAll('.scene-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // 选择当前卡片
                card.classList.add('selected');
                userInput.scene = scene;
            }
            
            console.log('选择的场景:', userInput.scene);
        }

                        // 处理心情选择
        function handleMoodSelection(e) {
            const card = e.target.closest('.mood-card');
            if (!card) return;
            
                const mood = card.dataset.value;
                
                if (card.classList.contains('selected')) {
                    // 取消选择
                    card.classList.remove('selected');
                if (userInput.moods) {
                    userInput.moods = userInput.moods.filter(m => m !== mood);
                }
            } else if (!userInput.moods || userInput.moods.length < 3) {
                    // 添加选择
                    card.classList.add('selected');
                if (!userInput.moods) userInput.moods = [];
                userInput.moods.push(mood);
            }
            
            console.log('选择的心情:', userInput.moods);
        }

        // 处理材料选择
        function handleIngredientSelection(e) {
            const tag = e.target.closest('.ingredient-tag');
            if (!tag) return;
            
            const category = e.currentTarget.dataset.category;
            const value = tag.dataset.value;
            
            tag.classList.toggle('selected');
            
            if (tag.classList.contains('selected')) {
                userInput.ingredients[category].push(value);
                } else {
                userInput.ingredients[category] = userInput.ingredients[category].filter(item => item !== value);
            }
        }

        // 处理口感风格选择
        function handleStyleSelection(e) {
            const card = e.target.closest('.option-card');
            if (!card) return;
            
                // 清除其他选择
            document.querySelectorAll('#step4 .options-grid .option-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // 选择当前卡片
                card.classList.add('selected');
            userInput.preferences.style = card.dataset.value;
        }

        // 处理偏好变化
        function handlePreferenceChange(e) {
            const slider = e.target;
            const value = parseInt(slider.value);
            userInput.preferences[slider.id] = value;
        }

        // 处理特殊要求便捷输入
        function handleRequirementTagClick(e) {
            const tag = e.target.closest('.requirement-tag');
            if (!tag) return;
            
            const value = tag.dataset.value;
            const textarea = document.getElementById('specialRequirement');
            const currentText = textarea.value.trim();
            
            // 如果文本框为空，直接添加
            if (!currentText) {
                textarea.value = value;
            } else {
                // 如果已有内容，用逗号分隔添加
                textarea.value = currentText + '，' + value;
            }
            
            // 触发变化事件并聚焦到文本框
            textarea.dispatchEvent(new Event('input'));
            textarea.focus();
            
            // 添加视觉反馈
            tag.style.transform = 'scale(0.95)';
            setTimeout(() => {
                tag.style.transform = '';
            }, 150);
        }

        // 设置滑动条智能反馈
        function setupSliders() {
            const sliders = [
                { 
                    id: 'sweetnessSlider', 
                    valueId: 'sweetnessValue',
                    labels: ['清淡', '淡雅', '清香', '微淡', '清甜', '适中', '微甜', '香甜', '甘甜', '醇甜', '浓郁']
                },
                { 
                    id: 'alcoholSlider', 
                    valueId: 'alcoholValue',
                    labels: ['低度', '轻柔', '温和', '柔顺', '微醇', '中度', '醇厚', '浓烈', '高度', '强劲', '烈性']
                },
                { 
                    id: 'textureSlider', 
                    valueId: 'textureValue',
                    labels: ['清爽', '轻盈', '顺滑', '柔润', '清润', '平衡', '丰富', '醇厚', '浓郁', '厚重', '浓厚']
                }
            ];

            sliders.forEach(sliderConfig => {
                const slider = document.getElementById(sliderConfig.id);
                const valueDisplay = document.getElementById(sliderConfig.valueId);
                
                if (slider && valueDisplay) {
                    // 初始化显示
                    updateSliderValue(slider, valueDisplay, sliderConfig.labels);
                    
                    // 监听变化 - 滑动时显示数值并更新
                    slider.addEventListener('input', () => {
                        updateSliderValue(slider, valueDisplay, sliderConfig.labels);
                        valueDisplay.style.opacity = '1';
                        valueDisplay.style.transform = 'translateX(-50%) translateY(-5px)';
                        
                        // 0.5秒后自动隐藏
                        clearTimeout(slider.hideTimeout);
                        slider.hideTimeout = setTimeout(() => {
                            if (!slider.matches(':hover')) {
                                valueDisplay.style.opacity = '0';
                                valueDisplay.style.transform = 'translateX(-50%)';
                            }
                        }, 500);
                    });
                    
                    // 鼠标移入显示数值
                    slider.addEventListener('mouseenter', () => {
                        clearTimeout(slider.hideTimeout);
                        valueDisplay.style.opacity = '1';
                        valueDisplay.style.transform = 'translateX(-50%) translateY(-5px)';
                    });
                    
                    // 鼠标移出隐藏数值
                    slider.addEventListener('mouseleave', () => {
                        valueDisplay.style.opacity = '0';
                        valueDisplay.style.transform = 'translateX(-50%)';
                    });
                }
            });

            // 设置底部按钮点击功能
            setupSliderButtons();
        }

        // 设置滑块按钮点击功能
        function setupSliderButtons() {
            const sliderButtons = document.querySelectorAll('.slider-label-btn');
            
            sliderButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const sliderId = this.getAttribute('data-slider');
                    const direction = this.getAttribute('data-direction');
                    const slider = document.getElementById(sliderId);
                    
                    if (slider) {
                        const currentValue = parseInt(slider.value);
                        const maxValue = parseInt(slider.max);
                        let newValue;
                        
                        switch(direction) {
                            case 'left':
                                // 向左移动一个档位
                                newValue = Math.max(0, currentValue - 1);
                                break;
                            case 'right':
                                // 向右移动一个档位
                                newValue = Math.min(maxValue, currentValue + 1);
                                break;
                            case 'center':
                                // 回到中间位置
                                newValue = Math.floor(maxValue / 2);
                                break;
                        }
                        
                        // 更新滑块值并触发相同的效果
                        slider.value = newValue;
                        
                        // 触发input事件，使用现有的动画和反馈逻辑
                        const event = new Event('input', { bubbles: true });
                        slider.dispatchEvent(event);
                        
                        // 添加点击反馈动画
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = '';
                        }, 150);
                    }
                });
            });
        }

        function updateSliderValue(slider, valueDisplay, labels) {
            const value = parseInt(slider.value);
            const label = labels[value] || labels[Math.floor(labels.length / 2)];
            valueDisplay.textContent = label;
            
            // 根据数值更新位置，并限制在容器范围内
            const percentage = (value / (slider.max - slider.min)) * 100;
            
            // 限制在10%到90%之间，避免超出容器边界
            const clampedPercentage = Math.max(10, Math.min(90, percentage));
            valueDisplay.style.left = clampedPercentage + '%';
            
            // 确保文字始终水平显示
            valueDisplay.style.transform = 'translateX(-50%)';
            valueDisplay.style.whiteSpace = 'nowrap';
        }

        // 初始化气泡物理效果 - 绝对无重叠的简单网格布局
        function initializeBubblePhysics() {
            const categories = document.querySelectorAll('.ingredient-category');
            
            categories.forEach(category => {
                const tags = category.querySelectorAll('.ingredient-tag');
                const container = category.querySelector('.ingredient-list');
                
                // 等待布局完成
                setTimeout(() => {
                    layoutBubblesNoOverlap(tags, container);
                }, 300);
            });
        }
        
        // 改进的自然分布布局算法
        function layoutBubblesNoOverlap(tags, container) {
            const containerWidth = container.offsetWidth - 30;
            const containerHeight = container.offsetHeight - 30;
            
            // 计算每个标签的实际尺寸，确保文字完整显示
            const tagInfos = Array.from(tags).map(tag => {
                const text = tag.textContent.trim();
                // 增加宽度计算，确保文字完整显示
                const width = Math.max(80, text.length * 12 + 30);
                const height = 40;
                return { tag, width, height, text };
            });
            
            const margin = 12;
            const positions = [];
            
            // 动态换行布局 - 从底部开始，自然换行
            let currentX = margin;
            let currentY = containerHeight - 50; // 从底部开始
            const rowHeight = 55; // 行间距
            
            tagInfos.forEach((info, index) => {
                const { tag, width, height } = info;
                
                // 检查当前行是否能放下这个标签
                if (currentX + width + margin > containerWidth) {
                    // 换到上一行
                    currentX = margin;
                    currentY -= rowHeight;
                    
                    // 如果超出顶部，重新从底部右侧开始
                    if (currentY < 0) {
                        currentY = containerHeight - 50;
                        currentX = containerWidth * 0.6; // 从右侧60%位置开始
                    }
                }
                
                // 添加一些随机偏移让布局更自然
                const xOffset = (Math.random() - 0.5) * 12; // ±6px
                const yOffset = (Math.random() - 0.5) * 12; // ±6px
                
                const finalX = Math.max(margin, Math.min(
                    containerWidth - width - margin,
                    currentX + xOffset
                ));
                
                const finalY = Math.max(margin, Math.min(
                    containerHeight - height - margin,
                    currentY + yOffset
                ));
                
                // 设置位置
                tag.style.left = finalX + 'px';
                tag.style.top = finalY + 'px';
                
                // 添加随机动画延迟
                tag.style.animationDelay = (Math.random() * 3) + 's';
                
                // 记录位置
                positions.push({ x: finalX, y: finalY, width, height });
                
                // 更新X位置
                currentX += width + margin;
            });
        }



        // 重置所有选择
        function resetSelections() {
            userInput = {
                scene: '',
                moods: [],
                ingredients: { spirits: [], mixers: [], tools: [] },
                preferences: { alcohol_level: 50, sweetness: 50, acidity: 50, style: '' },
                special_requirements: ''
            };
            
            // 清除所有选择状态
            document.querySelectorAll('.option-card').forEach(card => {
                    card.classList.remove('selected');
            });
            document.querySelectorAll('.ingredient-tag').forEach(tag => {
                tag.classList.remove('selected');
            });
        }

        // 下一步
        function nextStep() {
            if (currentStep < 5) {
                currentStep++;
                showStep(currentStep);
                updateStepProgress();
            }
        }

        // 上一步
        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
                updateStepProgress();
            }
        }

        // 显示指定步骤
        function showStep(step) {
            // 隐藏所有步骤
            document.querySelectorAll('.step-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示当前步骤
            document.getElementById(`step${step}`).classList.add('active');
        }

        // 更新步骤进度
        function updateStepProgress() {
            const dots = document.querySelectorAll('.progress-dot');
            const lines = document.querySelectorAll('.progress-line');
            
            dots.forEach((dot, index) => {
                const step = index + 1;
                dot.classList.remove('active', 'completed');
                
                if (step < currentStep) {
                    dot.classList.add('completed');
                } else if (step === currentStep) {
                    dot.classList.add('active');
                }
            });
            
            lines.forEach((line, index) => {
                line.classList.remove('active');
                if (index < currentStep - 1) {
                    line.classList.add('active');
                }
            });
        }

        // 获取分段图标
        function getSegmentIcon(focus) {
            const icons = {
                'scene': '🎭',
                'mood': '💫',
                'ingredients': '🍋',
                'preparation': '🍸',
                'general': '✨'
            };
            return icons[focus] || '✨';
        }

        // 更新分析标题，根据用户选择生成温暖贴心的话
        function updateAnalysisTitle(requestData) {
            const titleElement = document.getElementById('analysisTitle');
            if (!titleElement) return;
            
            // 收集用户的选择信息
            const choices = [];
            
            if (requestData.scene) {
                choices.push(`在${requestData.scene}的时候`);
            }
            
            if (requestData.moods && requestData.moods.length > 0) {
                choices.push(`想要${requestData.moods.join('、')}的感觉`);
            }
            
            if (requestData.special_requirements) {
                choices.push(`特别要求${requestData.special_requirements}`);
            }
            
            // 根据选择生成温暖的话
            let message = '';
            if (choices.length === 0) {
                const emptyMessages = [
                    '虽然你没有具体要求，但我能感受到你的期待...',
                    '有时候最美的惊喜来自于未知，让我为你创造...',
                    '你的信任让我很感动，我会用心为你调制...',
                    '没关系，让我用直觉来理解你真正想要的...'
                ];
                message = emptyMessages[Math.floor(Math.random() * emptyMessages.length)];
            } else if (choices.length === 1) {
                const singleMessages = [
                    `我理解你${choices[0]}的想法，让我好好想想...`,
                    `${choices[0]}...我能感受到你内心的渴望...`,
                    `关于${choices[0]}，我已经有了一些温暖的想法...`,
                    `${choices[0]}让我想起了很多美好的可能性...`
                ];
                message = singleMessages[Math.floor(Math.random() * singleMessages.length)];
            } else {
                const multiMessages = [
                    `你告诉我${choices.join('，')}...我都记在心里了...`,
                    `从${choices.join('，')}中，我读出了你的心情...`,
                    `${choices.join('，')}...每个细节都让我更懂你...`,
                    `你的${choices.join('，')}都很打动我，让我用心回应...`
                ];
                message = multiMessages[Math.floor(Math.random() * multiMessages.length)];
            }
            
            titleElement.textContent = message;
        }

        // 温暖话语体验 - 与思考泡泡同步但独立进行
        async function showLocalStoryExperience(requestData) {
            console.log('💕 开始温暖话语体验');
            
            const titleElement = document.getElementById('analysisTitle');
            if (!titleElement) return;
            
            // 开始温暖话语的完整故事
            await showWarmStorySequence(requestData, titleElement);
            
            console.log('💕 温暖话语体验完成');
        }
        
        // 温暖话语序列 - 精简的三段式故事
        async function showWarmStorySequence(requestData, titleElement) {
            // 调整字体样式 - 适中大小
            titleElement.style.fontSize = '1.3rem';
            titleElement.style.lineHeight = '1.6';
            titleElement.style.maxWidth = '600px';
            titleElement.style.margin = '0 auto';
            
            // 🍸 精简的鸡尾酒故事 - 保持原有打字速度
            const storyText = generateConnectedStory(requestData);
            await typewriterStoryText(titleElement, storyText); // 恢复原来的120ms速度
            await new Promise(resolve => setTimeout(resolve, 1500)); // 缩短停留时间
            
            // 🎭 简短的温暖感悟
            const empathyText = generateEmpathy(requestData);
            await typewriterStoryText(titleElement, empathyText);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // ✨ 简洁的结束语
            const finalAnticipationText = generateFinalAnticipation(requestData);
            await typewriterStoryText(titleElement, finalAnticipationText);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // 生成温暖开场 - 让用户感到被理解和欢迎
        function generateWarmOpening(requestData) {
            // 根据用户是否有选择来个性化开场
            const hasScene = requestData.scene;
            const hasMoods = requestData.moods && requestData.moods.length > 0;
            const hasSpecial = requestData.special_requirements;
            
            if (hasScene && hasMoods) {
                const sceneTexts = {
                    '浪漫晚餐': [
                        '浪漫的夜晚总是让人心动，你选择在这样特别的时刻来到这里，我能感受到你内心的温柔...',
                        '浪漫晚餐...多么美好的时光！我仿佛能看到烛光摇曳，你们相视而笑的画面...',
                        '在浪漫的晚餐时光里，每一杯酒都应该是爱的见证，让我为这份美好添上完美的注脚...'
                    ],
                    '朋友聚会': [
                        '和朋友在一起的时光总是那么珍贵，我能感受到你们之间的友谊和欢声笑语...',
                        '朋友聚会...这是多么温暖的场景！真正的友谊就像好酒一样，越品越香...',
                        '有朋友相伴的夜晚从不孤单，让我为你们的友谊调制一杯特别的酒...'
                    ],
                    '独自放松': [
                        '独处的时光同样珍贵，这是与自己对话的美好时刻，我很欣赏你懂得享受独处...',
                        '一个人的时光也可以很精彩，让我陪伴你度过这个安静而美好的夜晚...',
                        '独自品酒是一种优雅的生活态度，我能感受到你内心的从容和智慧...'
                    ]
                };
                
                const sceneMessages = sceneTexts[requestData.scene] || [
                    `${requestData.scene}...这是一个特别的时刻，我能感受到你对这个场合的重视和期待...`
                ];
                return sceneMessages[Math.floor(Math.random() * sceneMessages.length)];
            }
            
            if (hasMoods) {
                const moodStr = requestData.moods.join('、');
                const moodTexts = [
                    `想要${moodStr}的感觉...我完全理解，每个人都有属于自己的情感节拍，让我用酒来回应你的心境...`,
                    `${moodStr}...这些情感都很珍贵，它们构成了你独特的内心世界，我想用最贴心的方式来理解你...`,
                    `感受到你想要${moodStr}的心情了，情感是最真实的语言，让我用调酒的艺术来与你对话...`
                ];
                return moodTexts[Math.floor(Math.random() * moodTexts.length)];
            }
            
            // 没有具体选择时的温暖开场
            const generalTexts = [
                '每个人来到这里都有自己的故事，虽然你没有告诉我太多，但我能感受到你内心的期待...',
                '有时候最美的相遇不需要太多言语，你的到来就是对我最大的信任，让我用心为你服务...',
                '生活中总有一些时刻需要一杯好酒来陪伴，无论你此刻的心情如何，我都想为你带来温暖...'
            ];
            return generalTexts[Math.floor(Math.random() * generalTexts.length)];
        }
        
        // 生成鼓励话语 - 针对具体选择给予肯定和鼓励
        function generateEncouragement(requestData) {
            const encouragements = [];
            
            if (requestData.scene) {
                const sceneEncouragement = {
                    '浪漫晚餐': [
                        '你懂得在重要的时刻为爱情加分，这份用心让人感动。真正的浪漫不在于奢华，而在于那份真诚的心意...',
                        '选择在浪漫晚餐时品酒，说明你是一个懂得生活情趣的人。这样的细致和用心，一定会让这个夜晚更加难忘...'
                    ],
                    '朋友聚会': [
                        '能够珍惜友谊的人总是让人敬佩，你选择和朋友分享美好时光，这份真诚的友情比任何酒都要珍贵...',
                        '真正的朋友就像陈年好酒，越久越香。你们的友谊一定经历了时间的考验，值得用最好的酒来庆祝...'
                    ],
                    '独自放松': [
                        '懂得独处的人往往内心丰富，你选择给自己一个安静的时刻，这是对自己最好的关爱...',
                        '独自品酒需要勇气和智慧，你愿意与自己对话，这份内省的能力很珍贵...'
                    ]
                };
                
                const messages = sceneEncouragement[requestData.scene];
                if (messages) {
                    encouragements.push(messages[Math.floor(Math.random() * messages.length)]);
                }
            }
            
            if (requestData.moods && requestData.moods.length > 0) {
                const moodEncouragement = [
                    '你很诚实地表达了自己的情感需求，这种真诚很难得。情感没有对错，每一种感受都值得被温柔对待...',
                    '能够清楚地知道自己想要什么感觉，说明你很了解自己。这种自我认知是一种智慧...',
                    '你的情感很丰富，这让你的生活更有层次。让我用酒来回应你内心的每一个音符...'
                ];
                encouragements.push(moodEncouragement[Math.floor(Math.random() * moodEncouragement.length)]);
            }
            
            if (requestData.special_requirements) {
                const specialEncouragement = [
                    `你的特殊要求"${requestData.special_requirements}"很有意思，这说明你对自己的需求很明确。我欣赏这种坦诚...`,
                    `关于"${requestData.special_requirements}"这个要求，我能感受到你的用心。每个细节都体现了你对品质的追求...`
                ];
                encouragements.push(specialEncouragement[Math.floor(Math.random() * specialEncouragement.length)]);
            }
            
            if (encouragements.length === 0) {
                const defaultEncouragement = [
                    '虽然你没有说太多，但我能感受到你是一个有品味的人。有时候，简单就是最好的选择...',
                    '你的信任就是对我最大的鼓励。让我用我的专业和热情来回报这份信任...',
                    '每个人都有自己独特的品味，我相信你一定有着不凡的鉴赏力...'
                ];
                return defaultEncouragement[Math.floor(Math.random() * defaultEncouragement.length)];
            }
            
            return encouragements[Math.floor(Math.random() * encouragements.length)];
        }
        
        // 生成调酒师感悟 - 分享专业见解，建立情感连接
        function generateBartenderInsight(requestData) {
            const insights = [
                '在我多年的调酒经历中，我发现每个人都有属于自己的味觉记忆。有些人喜欢清淡如水的简单，有些人偏爱浓烈如火的激情...',
                '调酒其实是一门关于理解的艺术。不仅要理解酒的特性，更要理解人的心境。每一杯酒都承载着调酒师对客人的理解和关怀...',
                '我常常觉得，好的鸡尾酒就像一首诗，有着层次分明的韵律。从第一口的惊艳，到回味时的温柔，每一个瞬间都有它的意义...',
                '这些年来，我见过太多人带着不同的心情来到吧台。有人为了庆祝，有人为了忘却，有人只是想要一个安静的角落...',
                '真正的调酒师不只是在调制饮品，更是在调制情感。每一种配料的选择，都是对客人心境的回应...'
            ];
            
            // 根据用户选择添加个性化感悟
            if (requestData.scene === '浪漫晚餐') {
                const romanticInsights = [
                    '爱情是世界上最美的调味料，它能让最简单的酒变得甘甜。我见过无数对恋人在这里分享美好时光，每一次都让我相信爱情的力量...',
                    '浪漫不在于酒有多昂贵，而在于那份用心。我记得有一对情侣，他们只点了最简单的酒，但那种相视而笑的温柔，比任何珍贵的酒都要动人...'
                ];
                insights.push(...romanticInsights);
            }
            
            if (requestData.scene === '朋友聚会') {
                const friendshipInsights = [
                    '友谊是最珍贵的财富，我见过许多朋友在这里举杯相聚。真正的友谊就像陈年的威士忌，时间越久，味道越醇厚...',
                    '和朋友分享一杯酒，分享的不只是酒的味道，更是彼此的人生。我常常被那些真挚的友情所感动...'
                ];
                insights.push(...friendshipInsights);
            }
            
            if (requestData.scene === '独自放松') {
                const solitudeInsights = [
                    '独处是一种勇气，也是一种智慧。我很欣赏那些能够享受独处时光的人，他们往往有着丰富的内心世界...',
                    '一个人品酒需要的不是孤独，而是与自己的对话。在安静的时刻，我们能听到内心最真实的声音...'
                ];
                insights.push(...solitudeInsights);
            }
            
            return insights[Math.floor(Math.random() * insights.length)];
        }
        
        // 生成期待感 - 营造揭秘前的氛围
        function generateAnticipation(requestData) {
            const anticipationTexts = [
                '现在，让我为你揭开今晚的惊喜。我精心挑选了三款鸡尾酒，每一款都有它独特的故事和魅力...',
                '经过深思熟虑，我为你准备了三个选择。它们就像三种不同的人生体验，等待着你去发现...',
                '我的直觉告诉我，这三款酒中一定有一款会深深打动你。让我们一起来看看它们吧...',
                '三款特别调制的鸡尾酒即将登场，每一款都承载着我对你的理解和祝福...',
                '准备好迎接惊喜了吗？这三杯酒不仅仅是饮品，更是我想要与你分享的故事...'
            ];
            
            // 根据用户选择添加个性化期待
            if (requestData.scene) {
                const sceneAnticipation = {
                    '浪漫晚餐': [
                        '为了这个浪漫的夜晚，我特别选择了三款能够增添爱意的鸡尾酒。它们将为你们的晚餐增添更多甜蜜...',
                        '爱情需要仪式感，这三杯酒就是我为你们准备的浪漫见证...'
                    ],
                    '朋友聚会': [
                        '友谊值得庆祝，这三款酒将为你们的聚会带来更多欢声笑语...',
                        '好朋友配好酒，让这三杯特调为你们的友谊干杯...'
                    ],
                    '独自放松': [
                        '独处的时光需要好酒相伴，这三款精选将陪伴你度过美好的夜晚...',
                        '给自己一个完美的夜晚，这三杯酒是我对你的温柔关怀...'
                    ]
                };
                
                const sceneTexts = sceneAnticipation[requestData.scene];
                if (sceneTexts) {
                    anticipationTexts.push(...sceneTexts);
                }
            }
            
            return anticipationTexts[Math.floor(Math.random() * anticipationTexts.length)];
        }
        
        // 🍸 鸡尾酒故事库 - 精选有趣温暖的调酒小故事
        function generateConnectedStory(requestData) {
            console.log('🎯 [DEBUG] 使用新的故事库生成故事 - v20240908');
            // 故事库：科普、传说、技巧、哲理等多种类型
            const storyLibrary = {
                // 经典传说类
                legends: [
                    "传说中，马提尼的完美比例是调酒师用心跳来计算的。每一滴金酒，都承载着对完美的执着。",
                    "Mojito诞生于古巴的炎热午后，薄荷叶的清香是海明威笔下最浪漫的夏日记忆。",
                    "据说第一杯玛格丽特是为了纪念一位美丽的女子，柠檬的酸涩正如爱情的甜蜜与眷恋。",
                    "血腥玛丽的名字听起来可怕，但它其实是治愈宿醉的温柔良药，就像生活中的苦涩总会转为甘甜。",
                    "威士忌酸的诞生源于一位船长对家乡的思念，每一口都是对远方的深情告白。"
                ],
                
                // 调酒哲学类
                philosophy: [
                    "好的鸡尾酒就像人生，需要恰到好处的平衡。太甜会腻，太苦会涩，刚刚好才是艺术。",
                    "每一次摇晃调酒器，都是在为酒液注入灵魂。节奏快了急躁，慢了寡淡，恰好的韵律才能调出心意。",
                    "冰块在酒中慢慢融化，就像时间在生活中悄然流淌。最美的时刻，往往就在这融化的瞬间。",
                    "调酒师的手艺不在于复杂的技巧，而在于理解每一位客人心中的那份期待。",
                    "一杯好酒的秘密不在于昂贵的原料，而在于调制时那份真诚的心意。"
                ],
                
                // 温暖小贴士类
                tips: [
                    "你知道吗？柠檬皮轻轻一拧，释放的精油能让整杯酒的香气瞬间升华。小细节，大不同。",
                    "真正的调酒师会先品尝每一种原料，因为只有理解了每个元素，才能创造出和谐的整体。",
                    "冰块的大小决定了酒的温度和稀释度，就像生活中的每个选择都会影响最终的结果。",
                    "最好的鸡尾酒往往不是最复杂的，而是最能触动人心的那一杯。简单，但不简陋。",
                    "调酒的黄金法则：先用眼睛品尝，再用鼻子感受，最后才是舌尖的享受。"
                ],
                
                // 情感共鸣类
                emotional: [
                    "每个人的味蕾都有独特的记忆，有人偏爱甜蜜，有人钟情苦涩。我的工作就是找到属于你的那个味道。",
                    "深夜的酒吧里，我见过太多故事。有人为了庆祝，有人为了忘却，但每一杯酒都承载着真实的情感。",
                    "调酒不只是混合液体，更是在调和情绪。一杯好酒能让疲惫的心灵找到片刻的安宁。",
                    "有时候，一杯酒就是一个拥抱，温暖而不多言。让我用这杯酒来陪伴你此刻的心情。",
                    "最好的调酒师不是技艺最精湛的，而是最懂得倾听的那一个。"
                ]
            };
            
            // 根据用户选择进行轻度个性化
            let selectedCategory;
            if (requestData.scene === '浪漫约会') {
                selectedCategory = Math.random() < 0.6 ? 'legends' : 'emotional';
            } else if (requestData.scene === '独处放松') {
                selectedCategory = Math.random() < 0.6 ? 'philosophy' : 'emotional';
            } else if (requestData.scene === '聚会派对') {
                selectedCategory = Math.random() < 0.6 ? 'tips' : 'legends';
            } else {
                // 随机选择类型
                const categories = Object.keys(storyLibrary);
                selectedCategory = categories[Math.floor(Math.random() * categories.length)];
            }
            
            const stories = storyLibrary[selectedCategory];
            const selectedStory = stories[Math.floor(Math.random() * stories.length)];
            console.log('📖 [DEBUG] 选择的故事类型:', selectedCategory, '内容:', selectedStory.substring(0, 20) + '...');
            return selectedStory;
        }
        
        // 🎭 调酒师的温暖感悟 - 多样化的过渡语
        function generateEmpathy(requestData) {
            const warmInsights = [
                "现在，让我为你调制一杯特别的酒。",
                "每一杯酒都有它的故事，就像每个人都有自己的心情。",
                "我为你准备了三个选择，相信其中一杯会打动你。",
                "让我用这三杯酒来回应你的期待。",
                "调酒的魅力就在于每一次都是独特的创作。",
                "好的，让我把这些理解融入到酒杯中。",
                "接下来，是我最喜欢的调制时刻。",
                "我已经在心中勾勒出了几种可能。",
                "让我用专业的直觉为你选择。",
                "这就是调酒师存在的意义。"
            ];
            
            return warmInsights[Math.floor(Math.random() * warmInsights.length)];
        }
        
        // ✨ 最终揭晓时刻 - 多样化的结束语
        function generateFinalAnticipation(requestData) {
            const finalWords = [
                "我为你调好了三杯鸡尾酒。",
                "三杯特别的酒，等你来品尝。",
                "让我们一起看看这三杯酒吧。",
                "完成了，三杯承载着心意的作品。",
                "好了，我的推荐已经准备就绪。",
                "三种不同的可能，都在这里了。",
                "这就是我为你精心挑选的。",
                "我的答案，就在这三杯酒中。",
                "准备好迎接惊喜了吗？",
                "让这三杯酒来诉说我的理解。",
                "调制完毕，请欣赏我的作品。",
                "三杯酒，三种心情，三份用心。"
            ];
            
            return finalWords[Math.floor(Math.random() * finalWords.length)];
        }
        
        // 生成阶段2文本 - 思考分析
        function generateStage2Text(requestData) {
            const analysisTexts = [
                '让我仔细分析你的需求...每种心情都有它专属的味道',
                '基于你的选择，我开始构思完美的配方组合',
                '你的偏好让我想起了几种经典的调酒技法',
                '从你的描述中，我感受到了一种特别的氛围',
                '让我用我的专业经验来解读你内心的渴望'
            ];
            
            // 根据具体选择添加个性化分析
            if (requestData.scene) {
                const sceneAnalysis = [
                    `${requestData.scene}的氛围需要温柔的口感...`,
                    `在${requestData.scene}时，酒精度要恰到好处...`,
                    `${requestData.scene}这个场景让我想到了某种特别的香气...`
                ];
                return sceneAnalysis[Math.floor(Math.random() * sceneAnalysis.length)];
            }
            
            return analysisTexts[Math.floor(Math.random() * analysisTexts.length)];
        }
        
        // 生成阶段3文本 - 期待铺垫
        function generateStage3Text(requestData) {
            const expectationTexts = [
                '基于你的需求，我想到了三种完美的搭配...',
                '我已经有了灵感！三杯不同风格的鸡尾酒正在我脑海中成形',
                '让我为你精心调制三杯特别的酒...每一杯都有它的故事',
                '三种不同的可能性...我相信其中一杯会完美契合你的心境',
                '准备好了吗？我要为你呈现三杯承载着我理解的鸡尾酒'
            ];
            return expectationTexts[Math.floor(Math.random() * expectationTexts.length)];
        }
        
        // 只获取推荐的API调用
        async function getRecommendationsOnly(requestData) {
            console.log('🍸 调用推荐API...');
            
            return new Promise((resolve, reject) => {
                fetch('https://shaker-cocktail-app-production.up.railway.app/api/stream-recommendation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    const recommendations = [];
                    
                    function readStream() {
                        return reader.read().then(({ done, value }) => {
                            if (done) {
                                console.log('✅ 推荐API调用完成');
                                resolve(recommendations);
                                return;
                            }
                            
                            const chunk = decoder.decode(value);
                            const lines = chunk.split('\n');
                            
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        
                                        if (data.type === 'recommendation') {
                                            // 从 data.content.recommendations 中提取推荐数据
                                            if (data.content && data.content.recommendations && data.content.recommendations.length > 0) {
                                                const recommendation = data.content.recommendations[0];
                                                recommendations.push(recommendation);
                                                console.log(`🍸 收到推荐 ${recommendations.length}:`, recommendation.name?.chinese || recommendation.name);
                                            }
                                        }
                                        
                                        if (data.type === 'complete') {
                                            console.log('✅ 推荐完成，共收到:', recommendations.length);
                                            resolve(recommendations);
                                            return;
                                        }
                                    } catch (e) {
                                        console.warn('解析数据失败:', line);
                                    }
                                }
                            }
                            
                            return readStream();
                        });
                    }
                    
                    return readStream();
                })
                .catch(error => {
                    console.error('❌ 推荐API调用失败:', error);
                    reject(error);
                });
            });
        }
        
                // 依次翻卡片展示推荐结果
        async function showRecommendationsSequentially(recommendations) {
            console.log('🃏 开始翻卡片展示推荐结果，共', recommendations.length, '个推荐');
            
            if (!recommendations || recommendations.length === 0) {
                console.error('❌ 没有推荐数据');
                return;
            }
            
            // 更新标题
            const makingTitle = document.querySelector('#cocktailMakingSection .section-title');
            if (makingTitle) {
                makingTitle.textContent = '为你推荐的鸡尾酒';
            }
            
            // 依次展示每张卡片 - 使用Promise.all确保所有卡片都展示完成
            const cardPromises = [];
            const cardCount = Math.min(recommendations.length, 3);
            
            for (let i = 0; i < cardCount; i++) {
                const recommendation = recommendations[i];
                console.log(`🍸 开始展示第${i + 1}张卡片:`, recommendation.name?.chinese || recommendation.chinese || recommendation.name);
                
                // 创建Promise来等待每张卡片展示完成
                const cardPromise = new Promise((resolve) => {
                    setTimeout(async () => {
                        await showSimpleRecommendation(recommendation, i);
                        console.log(`✅ 第${i + 1}张卡片展示完成`);
                        resolve();
                    }, i * 2000); // 每张卡片间隔2秒
                });
                
                cardPromises.push(cardPromise);
            }
            
            // 等待所有卡片展示完成
            await Promise.all(cardPromises);
            
            console.log('✅ 所有卡片翻开完成');
            
            // 计算最后一张卡片完成的时间，然后延迟显示"再来一杯"按钮
            // 最后一张卡片需要额外的时间来完成动画和内容填充
            const lastCardDelay = (cardCount - 1) * 2000; // 最后一张卡片的开始时间
            const cardCompletionTime = 2000; // 每张卡片完成需要的时间
            const extraDelay = 2000; // 额外等待时间让用户欣赏结果
            
            setTimeout(() => {
                console.log('🍸 开始显示再来一杯按钮');
                showAnotherDrinkButton();
            }, extraDelay);
        }

        // 简单展示推荐（无复杂动画）
        async function showSimpleRecommendation(recommendation, index) {
            console.log(`🍸 展示简单推荐 ${index + 1}:`, recommendation);
            
            // 如果推荐数据为空，使用备用数据
            if (!recommendation || typeof recommendation !== 'object') {
                console.warn('⚠️ 推荐数据为空，使用备用数据:', index);
                const fallbackNames = ['经典马提尼', '威士忌酸', '莫吉托'];
                const fallbackEnNames = ['Classic Martini', 'Whiskey Sour', 'Mojito'];
                recommendation = {
                    name: { chinese: fallbackNames[index], english: fallbackEnNames[index] },
                    reason: '根据你的选择为你特别推荐',
                    ingredients: ['基酒', '调味料', '装饰'],
                    taste_profile: '口感平衡，适合品尝',
                    alcohol_content: '适中(约20%)',
                    prep_time: '3分钟',
                    difficulty: '简单'
                };
            }
            
            // 确保卡片存在
            let cardElement = document.getElementById(`makingCard${index}`);
            
            if (!cardElement) {
                console.warn('⚠️ 卡片元素不存在，重新创建:', index);
                const makingGrid = document.getElementById('makingGrid');
                cardElement = createMakingCard(index);
                makingGrid.appendChild(cardElement);
            }
            
            // 1. 开始简单进度条
            startSimpleProgress(index);
            
            // 2. 快速完成进度条（1秒）
            await new Promise(resolve => {
                setTimeout(() => {
                    completeSimpleProgress(index);
                    resolve();
                }, 1000); // 1秒完成
            });
            
            // 3. 直接切换显示内容（无翻转动画）
            switchToContent(index);
            
            // 4. 填充推荐内容
            fillRecommendationContent(recommendation, index);
            
            // 5. 强制确保内容可见（备用方案）
            setTimeout(() => {
                const contentArea = document.getElementById(`recommendationContent${index}`);
                if (contentArea) {
                    contentArea.style.display = 'flex';
                    contentArea.style.opacity = '1';
                    contentArea.style.visibility = 'visible';
                    contentArea.classList.add('visible'); // 添加visible类以显示子元素
                    console.log(`🔧 强制显示内容区域 ${index}`);
                }
            }, 100);
        }

        // 打字机效果展示推荐内容（简洁版）
        async function displayRecommendationWithTypewriter(recommendation, index) {
            console.log(`🎨 打字机展示推荐内容 ${index}:`, recommendation);
            
            const contentArea = document.getElementById(`recommendationContent${index}`);
            
            if (!contentArea) {
                console.error('❌ 内容区域不存在:', index);
                return;
            }
            
            // 显示内容区域
            contentArea.style.display = 'block';
            contentArea.style.opacity = '1';
            
            // 解析推荐数据
            const cocktailNameCn = recommendation.name?.chinese || recommendation.chinese || '神秘鸡尾酒';
            const cocktailNameEn = recommendation.name?.english || recommendation.english || 'Mystery Cocktail';
            const reason = recommendation.reason || '为你特别调制';
            const ingredients = recommendation.recipe?.ingredients || recommendation.ingredients || [];
            const tasteProfile = recommendation.taste_profile || '口感独特，值得品尝';
            const prepTime = recommendation.prep_time || '5分钟';
            const difficulty = recommendation.recipe?.difficulty || recommendation.difficulty || '简单';
            // 优化酒精度显示
            let alcoholContent = recommendation.alcohol_content || '中度(约15%)';
            if (alcoholContent.includes('适中')) {
                alcoholContent = alcoholContent.replace('适中', '中度');
            }
            if (!alcoholContent.includes('%') && !alcoholContent.includes('度')) {
                alcoholContent = `${alcoholContent}(约15%)`;
            }
            
            // 更新底部酒精度信息
            const alcoholInfo = document.getElementById(`alcoholContent${index}`);
            if (alcoholInfo) {
                alcoholInfo.textContent = alcoholContent;
            }
            
            // 逐个展示元素（简洁版，更快节奏）
            await typewriterElement(`nameCn${index}`, cocktailNameCn, 60);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            await typewriterElement(`nameEn${index}`, cocktailNameEn, 50);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await typewriterElement(`reason${index}`, reason, 50);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 展示材料标签
            await displayIngredientTags(ingredients, index);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await typewriterElement(`taste${index}`, tasteProfile, 50);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 展示制作信息
            await displayCocktailInfo(prepTime, difficulty, index);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 最后显示查看详情按钮
            await displayActionButton(recommendation, index);
            
            // 添加点击事件监听器
            const card = document.getElementById(`makingCard${index}`);
            if (card) {
                card.addEventListener('click', () => {
                    // 简单的详情展示
                    alert(`${recommendation.name?.chinese || recommendation.chinese}\n\n${recommendation.reason}\n\n材料：${(recommendation.recipe?.ingredients || []).map(ing => typeof ing === 'string' ? ing : `${ing.name} ${ing.amount || ''}`).join('、')}`);
                });
            }
            
            // 添加可见类
            contentArea.classList.add('visible');
        }
        
        // 打字机效果显示单个元素
        async function typewriterElement(elementId, text, speed = 60) {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            element.textContent = '';
            for (let i = 0; i < text.length; i++) {
                element.textContent += text[i];
                await new Promise(resolve => setTimeout(resolve, speed));
            }
        }
        
                // 展示材料标签
        async function displayIngredientTags(ingredients, index) {
            const container = document.getElementById(`ingredients${index}`);
            if (!container) return;
            
                container.innerHTML = '';
                
            for (let i = 0; i < Math.min(ingredients.length, 5); i++) {
                const ingredient = ingredients[i];
                const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient;
                const ingredientAmount = typeof ingredient === 'object' ? ingredient.amount : '';
                
                const tag = document.createElement('span');
                tag.className = 'ingredient-tag';
                tag.textContent = ingredientAmount ? `${ingredientName} ${ingredientAmount}` : ingredientName;
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(10px) scale(0.9)';
                
                container.appendChild(tag);
                
                // 动画显示
                setTimeout(() => {
                    tag.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0) scale(1)';
                }, i * 150);
                
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        // 展示制作信息
        async function displayCocktailInfo(prepTime, difficulty, index) {
            const container = document.getElementById(`info${index}`);
            if (!container) return;
            
            container.innerHTML = `
                <div class="info-item">
                    <span class="info-icon">⏰</span>
                    <div class="info-label">制作时间</div>
                    <div class="info-value">${prepTime}</div>
                </div>
                <div class="info-item">
                    <span class="info-icon">📊</span>
                    <div class="info-label">难度</div>
                    <div class="info-value">${difficulty}</div>
                </div>
            `;
            
            // 动画显示
            const items = container.querySelectorAll('.info-item');
            items.forEach((item, i) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, i * 150);
            });
        }
        
        // 展示查看详情按钮
        async function displayActionButton(recommendation, index) {
            const container = document.getElementById(`actionButton${index}`);
            if (!container) return;
            
            const button = document.createElement('button');
            button.className = 'view-details-btn';
            button.textContent = '查看详情';
            button.style.opacity = '0';
            button.style.transform = 'translateY(10px)';
            
            button.onclick = () => {
                // 简单的详情展示
                alert(`${recommendation.name?.chinese || recommendation.chinese}\n\n${recommendation.reason}\n\n材料：${(recommendation.recipe?.ingredients || []).map(ing => typeof ing === 'string' ? ing : `${ing.name} ${ing.amount || ''}`).join('、')}`);
            };
            
            container.appendChild(button);
            
            // 动画显示
            setTimeout(() => {
                button.style.transition = 'all 0.4s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 100);
        }

        // 推荐内容的打字机效果
        async function typewriterRecommendationContent(element, content) {
            const { cocktailName, englishName, reason, ingredientText } = content;
            
            // 创建内容结构
            element.innerHTML = `
                <div class="cocktail-name" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-color);"></div>
                <div class="cocktail-name-en" style="font-size: 1rem; opacity: 0.7; margin-bottom: 1rem; font-style: italic;"></div>
                <div class="cocktail-reason" style="margin-bottom: 1rem; font-style: italic; color: var(--text-secondary); line-height: 1.6;"></div>
                <div class="cocktail-recipe" style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;"></div>
            `;
            
            const nameEl = element.querySelector('.cocktail-name');
            const nameEnEl = element.querySelector('.cocktail-name-en');
            const reasonEl = element.querySelector('.cocktail-reason');
            const recipeEl = element.querySelector('.cocktail-recipe');
            
            // 依次打字显示每个部分
            await typewriterText(nameEl, cocktailName, 60);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await typewriterText(nameEnEl, englishName, 50);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await typewriterText(reasonEl, reason, 80);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            await typewriterText(recipeEl, `配方: ${ingredientText}`, 70);
        }

        // 通用打字机效果
        async function typewriterText(element, text, speed = 60) {
            element.textContent = '';
            
            for (let i = 0; i <= text.length; i++) {
                element.textContent = text.slice(0, i);
                
                const char = text[i - 1];
                let currentSpeed = speed;
                
                // 标点符号停顿
                if (char === '，' || char === '、') {
                    currentSpeed = speed * 2;
                } else if (char === '。' || char === '！' || char === '？') {
                    currentSpeed = speed * 3;
                }
                
                await new Promise(resolve => setTimeout(resolve, currentSpeed));
            }
        }

        // 优化推荐结果展示（保留备用）
        async function showRecommendations(recommendations) {
            console.log('🎉 开始展示推荐结果，共', recommendations.length, '个推荐');
            
            if (!recommendations || recommendations.length === 0) {
                console.error('❌ 没有推荐数据');
                return;
            }
            
            // 更新标题
            const makingTitle = document.querySelector('#cocktailMakingSection .section-title');
            if (makingTitle) {
                makingTitle.textContent = '为你推荐的鸡尾酒';
            }
            
            // 逐个显示推荐结果
            for (let i = 0; i < Math.min(recommendations.length, 3); i++) {
                const recommendation = recommendations[i];
                console.log(`🍸 显示第${i + 1}个推荐:`, recommendation.name || recommendation.chinese);
                
                // 延迟显示，营造逐个揭晓的效果
                setTimeout(() => {
                    displayRecommendationCard(recommendation, i);
                }, i * 1000);
            }
            
            console.log('✅ 推荐结果展示完成');
        }
        
        // 显示单个推荐
        async function displaySingleRecommendation(recommendation, index) {
            const container = document.getElementById('recommendationContainer');
            if (!container) return;
            
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
                <div class="recommendation-header">
                    <h3 class="recommendation-name">${recommendation.name}</h3>
                    <div class="recommendation-tags">
                        ${recommendation.tags ? recommendation.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
                <div class="recommendation-content">
                    <p class="recommendation-description">${recommendation.description}</p>
                    <div class="recommendation-details">
                        <div class="ingredients">
                            <h4>配料：</h4>
                            <ul>
                                ${recommendation.ingredients ? recommendation.ingredients.map(ing => `<li>${ing}</li>`).join('') : ''}
                            </ul>
                        </div>
                        <div class="preparation">
                            <h4>调制方法：</h4>
                            <p>${recommendation.preparation || '经典调制'}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加入场动画
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            container.appendChild(card);
            
            // 触发动画
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }

        // Shaker思考泡泡展示
        async function showThoughtBubbles(requestData) {
            console.log('💭 开始Shaker思考泡泡展示');
            
            // 生成思考泡泡数据
            const bubbles = thoughtBubbleGenerator.generateBubbles(requestData);
            console.log('💭 生成泡泡数量:', bubbles.length);
            
            // 显示分析区域
            showSection('shakerAnalysisSection');
            
            // 更新底部文字，根据用户选择内容变化（已移到后续流程中）
            // updateAnalysisTitle(requestData);
            
            // 获取泡泡容器
            const container = document.getElementById('thoughtBubblesContainer');
            
            if (!container) {
                console.error('❌ 找不到思考泡泡容器');
                return;
            }
            
            // 清空容器
            container.innerHTML = '';
            
            // 逐个展示思考泡泡（恢复之前的同时展示效果，但优化时间）
            for (let i = 0; i < bubbles.length; i++) {
                const bubbleData = bubbles[i];
                console.log(`💭 展示第${i + 1}个泡泡: ${bubbleData.title}`);
                
                // 创建泡泡元素
                const bubbleElement = createThoughtBubbleElement(bubbleData);
                container.appendChild(bubbleElement);
                
                // 延迟显示动画（间隔显示）
                setTimeout(() => {
                    bubbleElement.classList.add('show');
                }, i * 800 + 500);
                
                // 添加打字机效果（延长阅读时间）
                setTimeout(async () => {
                    const contentElement = bubbleElement.querySelector('.thought-bubble-content');
                    const originalText = contentElement.getAttribute('data-text');
                    await typewriterEffect(contentElement, originalText, 120); // 与Shaker保持一致的优雅速度
                }, i * 800 + 1500);
                
                // 等待当前泡泡完成（延长停留时间让用户看完）
                await new Promise(resolve => setTimeout(resolve, 3500)); // 增加到3.5秒
            }
            
            // 所有泡泡显示完毕，停留更久让用户充分阅读
            await new Promise(resolve => setTimeout(resolve, 5000)); // 延长到5秒
            
            // 逐个隐藏泡泡（更慢的隐藏节奏）
            const bubbleElements = container.querySelectorAll('.thought-bubble');
            for (let i = 0; i < bubbleElements.length; i++) {
                setTimeout(() => {
                    bubbleElements[i].classList.add('hide');
                }, i * 400);
            }
            
            // 等待所有泡泡隐藏完毕
            await new Promise(resolve => setTimeout(resolve, bubbleElements.length * 400 + 800));
            
            console.log('✅ 思考泡泡展示完毕');
            return { completed: true, bubbleCount: bubbles.length };
        }

        // 创建思考泡泡元素 - 简洁森林版本
        function createThoughtBubbleElement(bubbleData) {
            const bubble = document.createElement('div');
            bubble.className = `thought-bubble position-${bubbleData.position}`;
            bubble.innerHTML = `
                <div class="thought-bubble-header">
                    <span class="thought-bubble-icon">${bubbleData.icon}</span>
                    <h4 class="thought-bubble-title">${bubbleData.title}</h4>
                </div>
                <p class="thought-bubble-content ${bubbleData.isEmpty ? 'empty' : ''}" data-text="${bubbleData.content}"></p>
            `;
            
            return bubble;
        }



        // 温暖的打字机效果（用于泡泡）
        async function typewriterEffect(element, text, speed = 50) {
            element.textContent = '';
            element.style.position = 'relative';
            
            // 添加光标
            const cursor = document.createElement('span');
            cursor.style.cssText = `
                display: inline-block;
                width: 2px;
                height: 1.2em;
                background: linear-gradient(to bottom, #228B22, #32CD32);
                margin-left: 2px;
                animation: cursorBlink 1s infinite;
                border-radius: 1px;
            `;
            element.appendChild(cursor);
            
            for (let i = 0; i <= text.length; i++) {
                const char = text[i];
                element.textContent = text.slice(0, i);
                element.appendChild(cursor);
                
                // 为标点符号添加更长的停顿
                let currentSpeed = speed;
                if (char === '。' || char === '！' || char === '？') {
                    currentSpeed = speed * 2;
                } else if (char === '，' || char === '、') {
                    currentSpeed = speed * 1.5;
                } else if (char === '...' || char === '…') {
                    currentSpeed = speed * 3;
                }
                
                // 随机添加一些"思考"停顿
                if (Math.random() < 0.1) {
                    currentSpeed = speed * 2;
                }
                
                await new Promise(resolve => setTimeout(resolve, currentSpeed));
            }
            
            // 移除光标
            setTimeout(() => {
                if (cursor.parentNode) {
                    cursor.remove();
                }
            }, 1000);
        }

        // 高级回顾卡片展示
        async function showReviewCards(requestData) {
            console.log('🎴 开始高级回顾卡片展示');
            
            // 生成卡片数据
            const cards = reviewCardGenerator.generateCards(requestData);
            console.log('🎴 生成卡片数量:', cards.length);
            
            // 直接显示分析区域（回顾卡片在分析区域内）
            showSection('shakerAnalysisSection');
            
            // 获取容器
            const container = document.getElementById('reviewCardsContainer');
            
            if (!container) {
                console.error('❌ 找不到回顾卡片容器');
                return;
            }
            
            // 显示容器
            container.style.display = 'block';
            
            // 清空容器
            container.innerHTML = '';
            
            // 提前显示摘要区域（为飘移做准备）
            const summaryArea = document.getElementById('choicesSummary');
            if (summaryArea) {
                summaryArea.style.display = 'block';
                setTimeout(() => {
                    summaryArea.classList.add('show');
                }, 100);
            }
            
            // 逐个展示每张卡片
            for (let i = 0; i < cards.length; i++) {
                const cardData = cards[i];
                console.log(`🎴 展示第${i + 1}张卡片: ${cardData.title}`);
                
                // 创建当前卡片
                const cardElement = createReviewCardElement(cardData);
                container.appendChild(cardElement);
                
                // 延迟一下让DOM更新
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // 播放进入动画
                cardElement.classList.add('entering');
                
                // 等待进入动画完成
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // 开始温暖的回忆效果
                const titleElement = cardElement.querySelector('.review-card-title');
                const contentElement = cardElement.querySelector('.review-card-content');
                
                const titleText = titleElement.getAttribute('data-text');
                const contentText = contentElement.getAttribute('data-text');
                
                // 温暖地显示标题
                await warmTitleReveal(titleElement, titleText);
                
                // 短暂停顿
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 真正的打字机效果
                await realTypewriterEffect(contentElement, contentText, 70);
                
                // 适度的阅读时间
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // 所有卡片都飘移到摘要区域（除了最后一张，最后一张单独处理）
                if (i < cards.length - 1) {
                    // 飘移到摘要区域
                    await floatCardToSummary(cardElement, cardData);
                    
                    // 短暂间隔
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
            
            // 最后一张卡片的特殊处理 - 飘移到摘要区域
            const lastCard = container.querySelector('.review-card');
            if (lastCard) {
                // 额外停留时间
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // 获取最后一张卡片的数据
                const lastCardData = cards[cards.length - 1];
                
                // 飘移到摘要区域
                await floatCardToSummary(lastCard, lastCardData);
            }
            
            console.log('✅ 高级回顾卡片展示完毕');
            return { completed: true, cardCount: cards.length };
        }

        // 创建回顾卡片元素
        function createReviewCardElement(cardData) {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.setAttribute('data-card-type', cardData.type);
            card.innerHTML = `
                <div class="review-card-header">
                    <span class="review-card-icon">${cardData.icon}</span>
                    <h3 class="review-card-title" data-text="${cardData.title}"></h3>
                </div>
                <p class="review-card-content ${cardData.isEmpty ? 'empty' : ''}" data-text="${cardData.content}"></p>
            `;
            return card;
        }

        // 创建摘要卡片
        function createSummaryCard(cardData) {
            const summaryCard = document.createElement('div');
            summaryCard.className = 'summary-card';
            summaryCard.innerHTML = `
                <span class="summary-card-icon">${cardData.icon}</span>
                <span class="summary-card-content" title="${cardData.content}">${cardData.content}</span>
            `;
            return summaryCard;
        }

        // 卡片飘移到摘要区域
        async function floatCardToSummary(cardElement, cardData) {
            console.log('🎈 开始飘移卡片:', cardData.title);
            
            // 获取目标位置
            const summaryArea = document.getElementById('summaryCards');
            if (!summaryArea) {
                console.error('❌ 找不到摘要区域');
                return;
            }
            
            // 获取卡片当前位置
            const cardRect = cardElement.getBoundingClientRect();
            const summaryRect = summaryArea.getBoundingClientRect();
            
            // 设置卡片为固定定位，保持当前位置
            cardElement.classList.add('floating');
            cardElement.style.position = 'fixed';
            cardElement.style.top = cardRect.top + 'px';
            cardElement.style.left = cardRect.left + 'px';
            cardElement.style.width = cardRect.width + 'px';
            cardElement.style.height = cardRect.height + 'px';
            
            // 延迟一下让样式生效
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 使用CSS动画向上飘移
            cardElement.classList.add('floating-up');
            
            console.log('🎈 开始向上飘移动画');
            
            // 等待飘移动画完成
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 在摘要区域创建简化版卡片
            const summaryCard = createSummaryCard(cardData);
            summaryArea.appendChild(summaryCard);
            
            // 移除原卡片
            cardElement.remove();
            
            console.log('✅ 卡片飘移完成');
        }

        // 温暖的标题显示效果
        async function warmTitleReveal(element, text) {
            element.textContent = text;
            element.classList.add('warm-reveal');
            
            // 等待动画完成
            await new Promise(resolve => setTimeout(resolve, 1200));
        }

        // 真正的打字机效果 - 从左到右逐字显示
        async function realTypewriterEffect(element, text, speed = 80) {
            element.innerHTML = '';
            element.classList.add('real-typing', 'typing-container');
            
            // 创建光标
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            element.appendChild(cursor);
            
            // 逐字显示
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const charSpan = document.createElement('span');
                charSpan.className = 'typing-text';
                charSpan.textContent = char;
                
                // 在光标前插入字符
                element.insertBefore(charSpan, cursor);
                
                // 延迟显示字符
                await new Promise(resolve => setTimeout(resolve, 50));
                charSpan.classList.add('visible');
                
                // 根据字符类型调整速度
                let currentSpeed = speed;
                if (char === '，' || char === '。' || char === '！' || char === '？') {
                    currentSpeed = speed * 2.5; // 标点符号后停顿更久
                } else if (char === ' ') {
                    currentSpeed = speed * 0.3; // 空格快一些
                } else if (Math.random() < 0.15) {
                    currentSpeed = speed * 1.8; // 随机停顿，模拟思考
                }
                
                await new Promise(resolve => setTimeout(resolve, currentSpeed));
            }
            
            // 保持光标闪烁一会儿
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 移除光标
            cursor.remove();
            element.classList.remove('real-typing');
        }

        // 逐字温暖打字效果（备用方案）
        async function slowWarmTyping(element, text, speed = 150) {
            element.textContent = '';
            element.style.borderRight = '2px solid rgba(143, 188, 143, 0.6)';
            
            // 添加随机的停顿，模拟回忆的感觉
            for (let i = 0; i <= text.length; i++) {
                element.textContent = text.slice(0, i);
                
                // 在标点符号处稍作停顿
                const currentChar = text[i - 1];
                let currentSpeed = speed;
                
                if (currentChar === '，' || currentChar === '。' || currentChar === '、') {
                    currentSpeed = speed * 2; // 标点符号后停顿更久
                } else if (currentChar === ' ') {
                    currentSpeed = speed * 0.5; // 空格处稍快
                } else if (Math.random() < 0.1) {
                    currentSpeed = speed * 1.5; // 随机停顿，模拟思考
                }
                
                await new Promise(resolve => setTimeout(resolve, currentSpeed));
            }
            
            // 移除光标
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 800);
        }

        // 智能分行函数
        function smartLineBreak(text, maxLength) {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            for (const word of words) {
                if ((currentLine + word).length <= maxLength) {
                    currentLine += (currentLine ? ' ' : '') + word;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        lines.push(word);
                    }
                }
            }
            
            if (currentLine) {
                lines.push(currentLine);
            }
            
            return lines;
        }

        // 显示本地预分析
        async function showLocalAnalysis(requestData) {
            console.log('⚡ 显示本地预分析');
            
            // 更新标题
            const analysisTitle = document.getElementById('analysisTitle');
            if (analysisTitle) {
                analysisTitle.textContent = 'Shaker正在理解你的需求...';
            }
            
            // 生成本地分析
            const segments = localAnalysis.generateLocalAnalysis(requestData);
            
            // 获取分段容器
            const segmentsContainer = document.getElementById('analysisSegments');
            if (!segmentsContainer) {
                console.error('❌ 找不到分段容器');
                return;
            }
            
            // 清空容器
            segmentsContainer.innerHTML = '';
            
            // 添加本地分析标识
            const badge = document.createElement('div');
            badge.className = 'local-analysis-badge';
            badge.textContent = '即时分析';
            segmentsContainer.appendChild(badge);
            
            // 逐个显示分段
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                
                // 创建分段元素
                const segmentElement = document.createElement('div');
                segmentElement.className = 'analysis-segment';
                segmentElement.innerHTML = `
                    <div class="segment-header">
                        <span class="segment-icon">${segment.icon}</span>
                        <h3 class="segment-title">${segment.title}</h3>
                    </div>
                    <p class="segment-content">${segment.content}</p>
                `;
                
                segmentsContainer.appendChild(segmentElement);
                
                // 延迟显示动画
                setTimeout(() => {
                    segmentElement.classList.add('show');
                }, i * 300);
            }
            
            // 等待所有动画完成
            await new Promise(resolve => setTimeout(resolve, segments.length * 300 + 500));
            
            console.log('✅ 本地预分析显示完成');
        }

        // 异步API调用（存储结果）
        async function startStreamRecommendationAsync(requestData) {
            console.log('🔄 启动异步API调用');
            
            const storedResult = {
                analysisSegments: [],
                recommendations: [],
                completed: false
            };
            
            return new Promise((resolve, reject) => {
                fetch('https://shaker-cocktail-app-production.up.railway.app/api/stream-recommendation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`API调用失败: ${response.status}`);
                    }
                    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    
                    const readStream = async () => {
                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                
                                if (done) {
                                    console.log('✅ API流式读取完成');
                                    storedResult.completed = true;
                                    resolve(storedResult);
                                    break;
                                }
                                
                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() || '';
                                
                                for (const line of lines) {
                                    if (line.trim() && line.startsWith('data: ')) {
                                        try {
                                            const data = JSON.parse(line.slice(6));
                                            
                                            // 存储不同类型的数据
                                            if (data.type === 'segmented_analysis') {
                                                storedResult.analysisSegments = data.segments;
                                                console.log('📦 存储分析数据:', data.segments.length, '段');
                                            } else if (data.type === 'recommendation') {
                                                storedResult.recommendations.push(data);
                                                console.log('📦 存储推荐数据:', storedResult.recommendations.length);
                                            }
                                            
                                        } catch (parseError) {
                                            console.warn('⚠️ 解析API数据失败:', parseError);
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('❌ 读取API流失败:', error);
                            reject(error);
                        }
                    };
                    
                    readStream();
                })
                .catch(error => {
                    console.error('❌ API调用失败:', error);
                    reject(error);
                });
            });
        }

        // 展示存储的分析结果
        async function displayStoredAnalysisResult(apiResult) {
            console.log('📊 展示存储的API结果:', apiResult);
            
            // 更新标题
            const analysisTitle = document.getElementById('analysisTitle');
            if (analysisTitle) {
                analysisTitle.textContent = 'Shaker的深度分析';
            }
            
            // 展示分析段落
            if (apiResult.analysisSegments && apiResult.analysisSegments.length > 0) {
                await showAnalysisSegments(apiResult.analysisSegments);
            }
            
            // 等待一下，然后展示推荐
            setTimeout(() => {
                if (apiResult.recommendations && apiResult.recommendations.length > 0) {
                    showSection('cocktailMakingSection');
                    displayRecommendations(apiResult.recommendations);
                }
            }, 1500);
        }

        // 展示分析段落
        async function showAnalysisSegments(segments) {
            const segmentsContainer = document.getElementById('analysisSegments');
            if (!segmentsContainer) return;
            
            segmentsContainer.innerHTML = '';
            
            // 添加AI分析标识
            const aiBadge = document.createElement('div');
            aiBadge.className = 'local-analysis-badge';
            aiBadge.style.background = 'var(--accent-gold)';
            aiBadge.innerHTML = '🤖 AI深度分析';
            segmentsContainer.appendChild(aiBadge);
            
            // 逐个显示分段
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const segmentElement = document.createElement('div');
                segmentElement.className = 'analysis-segment';
                segmentElement.innerHTML = `
                    <div class="segment-header">
                        <span class="segment-icon">${getSegmentIcon(segment.focus)}</span>
                        <h3 class="segment-title">${segment.title}</h3>
                    </div>
                    <p class="segment-content">${segment.content}</p>
                `;
                
                segmentsContainer.appendChild(segmentElement);
                
                // 延迟显示动画
                setTimeout(() => {
                    segmentElement.classList.add('show');
                }, i * 300);
            }
        }


        // 显示指定区域
        function showSection(sectionId) {
            const sections = ['heroSection', 'featuresSection', 'recommendationSection', 'loadingSection', 'shakerAnalysisSection', 'cocktailMakingSection', 'resultsSection'];
            
            sections.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                if (id === sectionId) {
                    element.style.display = 'block';
                        // 滚动到显示的区域
                        setTimeout(() => {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 100);
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

        // 完整故事体验 - 包含思考泡泡和四个阶段的故事
        async function showCompleteStoryExperience(requestData) {
            console.log('🎭 开始完整故事体验');
            
            // 1. 先显示思考泡泡
            await showThoughtBubbles(requestData);
            
            // 2. 直接开始优化后的故事体验
            await showWarmStoryExperience(requestData);
            
            console.log('✅ 完整故事体验完成');
        }

        // 温暖故事体验 - 四个阶段的故事性内容
        async function showWarmStoryExperience(requestData) {
            console.log('📖 开始温暖故事体验');
            
            const titleElement = document.getElementById('analysisTitle');
            
            if (!titleElement) {
                console.error('❌ 找不到故事展示元素');
                return;
            }
            
            // 隐藏分析文本区域，只用标题展示
            const analysisText = document.getElementById('shakerAnalysisText');
            if (analysisText) {
                analysisText.style.display = 'none';
            }
            
            // 阶段1：鸡尾酒故事 - 有趣温暖的调酒故事
            const stage1Text = generateConnectedStory(requestData);
            await typewriterTitleText(titleElement, stage1Text);
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // 阶段2：温暖感悟 - 简短而有温度的话语
            const stage2Text = generateEmpathy(requestData);
            await typewriterTitleText(titleElement, stage2Text);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 阶段3：简洁结束语 - 准备揭晓
            const stage3Text = generateFinalAnticipation(requestData);
            await typewriterTitleText(titleElement, stage3Text);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            console.log('✅ 温暖故事体验完成');
        }
        
        // 生成故事阶段1：回顾阶段
        function generateStoryStage1(requestData) {
            const scene = requestData.scene || '未知场景';
            const moods = Array.isArray(requestData.moods) ? requestData.moods.join('、') : '平静';
            
            const templates = [
                `好的，让我回想一下...你告诉我在${scene}的时候，想要${moods}的感觉，这让我想起了那些美好的时光...`,
                `嗯...${scene}，${moods}...我能感受到你内心的渴望，就像森林中的微风轻抚过树叶...`,
                `让我想想...在${scene}时光里，你希望感受${moods}，这份心情我都记在心里了...`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        // 生成故事阶段2：思考分析
        function generateStoryStage2(requestData) {
            const preferences = requestData.preferences || {};
            const alcoholLevel = preferences.alcohol_level || '中度';
            const sweetness = preferences.sweetness || '微甜';
            
            const templates = [
                `现在，基于你的偏好...${alcoholLevel}酒精度配上${sweetness}的口感，我想到了几种绝妙的组合。每一种都有它独特的魅力...`,
                `接下来，你喜欢${sweetness}、${alcoholLevel}的调配，这让我联想到森林深处那些隐秘的配方。让我为你精心挑选...`,
                `然后是口味...${alcoholLevel}的烈度，${sweetness}的温柔，这样的平衡就像自然界的和谐，我知道该为你调制什么了...`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        // 生成故事阶段3：期待铺垫
        function generateStoryStage3(requestData) {
            const specialReq = requestData.special_requirements;
            
            const templates = [
                `很好...我已经在心中构思好了三杯特别的鸡尾酒，每一杯都承载着我对你的理解。${specialReq ? `特别是你提到的"${specialReq}"，我会特别用心...` : ''}`,
                `完美...三种不同的风味，三种不同的情感表达，我相信其中一定有一杯能触动你的心弦...`,
                `就是这样...就像调酒师的魔法一样，我要为你变出三杯完美的鸡尾酒。准备好迎接惊喜了吗？`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        // 标题专用打字机效果 - 自然说话节奏
        async function typewriterTitleText(element, text, speed = 100) {
            // 清空并准备
            element.innerHTML = '';
            
            // 创建优雅的光标
            const cursor = document.createElement('span');
            cursor.className = 'title-cursor';
            cursor.style.cssText = `
                display: inline-block;
                width: 2px;
                height: 1em;
                background: linear-gradient(135deg, var(--forest-green), var(--warm-green));
                margin-left: 4px;
                border-radius: 1px;
                animation: elegantBlink 1s ease-in-out infinite;
                box-shadow: 0 0 6px rgba(143, 188, 143, 0.4);
                vertical-align: baseline;
            `;
            
            element.appendChild(cursor);
            
            for (let i = 0; i <= text.length; i++) {
                element.textContent = text.slice(0, i);
                element.appendChild(cursor);
                
                const char = text[i - 1];
                let currentSpeed = speed;
                
                // 自然说话节奏 - 标点符号停顿
                if (char === '。' || char === '！' || char === '？') {
                    currentSpeed = speed * 6; // 句号停顿更久
                } else if (char === '，' || char === '、') {
                    currentSpeed = speed * 3; // 逗号中等停顿
                } else if (char === '...' || char === '…') {
                    currentSpeed = speed * 8; // 省略号最久
                } else if (char === ' ') {
                    currentSpeed = speed * 0.5; // 空格快一点
                }
                
                // 随机添加自然停顿（模拟思考）
                if (Math.random() < 0.08) {
                    currentSpeed = speed * 2;
                }
                
                await new Promise(resolve => setTimeout(resolve, currentSpeed));
            }
            
            // 保持光标闪烁一会儿，然后淡出
            await new Promise(resolve => setTimeout(resolve, 1200));
            cursor.style.animation = 'fadeOut 1s ease-out forwards';
            setTimeout(() => {
                if (cursor.parentNode) {
                    cursor.remove();
                }
            }, 1000);
        }

        // 故事专用打字机效果 - 更慢更有感情（保留备用）
        async function typewriterStoryText(element, text, speed = 120) {
            element.innerHTML = '';
            
            // 创建优雅的光标
            const cursor = document.createElement('span');
            cursor.className = 'elegant-cursor';
            cursor.style.cssText = `
                display: inline-block;
                width: 3px;
                height: 1.2em;
                background: linear-gradient(135deg, var(--forest-green), var(--warm-green));
                margin-left: 3px;
                border-radius: 2px;
                animation: elegantBlink 1.2s ease-in-out infinite;
                box-shadow: 0 0 8px rgba(143, 188, 143, 0.3);
            `;
            
            element.appendChild(cursor);
            
            for (let i = 0; i <= text.length; i++) {
                element.textContent = text.slice(0, i);
                element.appendChild(cursor);
                
                const char = text[i - 1];
                let currentSpeed = speed;
                
                // 标点符号停顿更久，营造思考感
                if (char === '。' || char === '！' || char === '？') {
                    currentSpeed = speed * 4;
                } else if (char === '，' || char === '、') {
                    currentSpeed = speed * 2;
                } else if (char === '...' || char === '…') {
                    currentSpeed = speed * 5;
                }
                
                await new Promise(resolve => setTimeout(resolve, currentSpeed));
            }
            
            // 优雅地移除光标
            cursor.style.animation = 'fadeOut 0.8s ease-out forwards';
            setTimeout(() => {
                if (cursor.parentNode) {
                    cursor.remove();
                }
            }, 800);
        }

        // 流式推荐状态
        let streamState = {
            analysisText: '',
            currentRecommendationIndex: 0,
            recommendations: [],
            eventSource: null
        };

                // 获取推荐 - 优化后的并行处理流程
        async function getRecommendation() {
            // 收集特殊要求
            userInput.special_requirements = document.getElementById('specialRequirement').value;
            
            // 准备请求数据
            const requestData = {
                scene: userInput.scene,
                moods: userInput.moods,
                ingredients: userInput.ingredients,
                    preferences: {
                    alcohol_level: getAlcoholLevelText(userInput.preferences.alcohol_level),
                    sweetness: getSweetnessText(userInput.preferences.sweetness),
                    acidity: getAcidityText(userInput.preferences.acidity),
                    style: userInput.preferences.style || '清爽'
                },
                special_requirements: userInput.special_requirements
                };

                try {
                console.log('🍸 开始优化后的并行推荐流程:', requestData);
                
                // 重置状态
                streamState.analysisText = '';
                streamState.currentRecommendationIndex = 0;
                streamState.recommendations = [];
                
                // 显示分析区域
                showSection('shakerAnalysisSection');
                
                // 🚀 关键优化：立即并行启动API调用和故事展示
                console.log('🔄 并行启动：API调用 + 故事体验');
                const apiPromise = getRecommendationsOnly(requestData);
                const storyPromise = showCompleteStoryExperience(requestData);
                
                // 等待Shaker说完话就立即滚动，不等API
                console.log('⏳ 等待Shaker故事体验完成...');
                await storyPromise;
                
                console.log('✅ Shaker说话完成，立即滚动到推荐区域');
                
                // 立即滚动到推荐区域，显示加载状态
                showSection('cocktailMakingSection');
                setTimeout(() => {
                    const makingSection = document.getElementById('cocktailMakingSection');
                    if (makingSection) {
                        makingSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 300);
                
                // 先显示3个加载中的卡片
                initializeMakingCards(3);
                
                // API在后台完成后更新卡片
                apiPromise.then(async (recommendations) => {
                    console.log('✅ API返回完成，开始展示推荐:', recommendations.length, '个推荐');
                    await showRecommendationsSequentially(recommendations);
                }).catch(error => {
                    console.error('❌ API调用失败:', error);
                    // 这里可以显示错误状态
                });
                
            } catch (error) {
                console.error('❌ 推荐流程失败:', error);
                alert('获取推荐失败，请检查后端服务是否启动');
                showSection('recommendSection');
            }
        }

        // 启动流式推荐 - 使用POST请求而不是GET参数
        async function startStreamRecommendation(requestData) {
            console.log('🚀 启动流式推荐连接...');
            
            return new Promise((resolve, reject) => {
                // 使用fetch进行POST请求来建立SSE连接
                fetch('https://shaker-cocktail-app-production.up.railway.app/api/stream-recommendation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache'
                        },
                    body: JSON.stringify(requestData)
                }).then(response => {
                    console.log('📡 收到响应:', response.status, response.statusText);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    
                    function readStream() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                console.log('🏁 流式读取完成');
                                resolve();
                                return;
                            }
                            
                            const chunk = decoder.decode(value, { stream: true });
                            console.log('📥 收到数据块:', chunk.substring(0, 100) + '...');
                            
                            const lines = chunk.split('\n');
                            
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const jsonStr = line.slice(6).trim();
                                        if (jsonStr) {
                                            const data = JSON.parse(jsonStr);
                                            console.log('✅ 解析成功:', data.type, data);
                                            handleStreamData(data);
                                        }
                                    } catch (error) {
                                        console.error('❌ 解析SSE数据失败:', error, 'Line:', line);
                                    }
                                }
                            }
                            
                            readStream();
                        }).catch(error => {
                            console.error('❌ 读取流失败:', error);
                            reject(error);
                        });
                    }
                    
                    readStream();
                }).catch(error => {
                    console.error('❌ 建立流式连接失败:', error);
                    reject(error);
                });
                
                // 设置超时
                setTimeout(() => {
                    console.warn('⏰ 流式连接超时');
                    reject(new Error('连接超时'));
                }, 120000); // 120秒超时
            });
        }

        // 处理流式数据
        function handleStreamData(data) {
            console.log('📦 收到流式数据:', data.type, data);
            
            switch (data.type) {
                case 'connected':
                    console.log('🔗 连接成功:', data.message);
                    break;
                    
                case 'segmented_analysis':
                    console.log('🎯 开始处理分段分析数据');
                    handleSegmentedAnalysis(data);
                    break;
                    
                case 'thought_segment':
                    handleOptimizedThoughtSegment(data);
                    break;
                    
                case 'analysis':
                    handleAnalysisData(data);
                    break;
                    
                case 'phase_transition':
                    handleOptimizedPhaseTransition(data);
                    break;
                    
                case 'recommendation':
                    handleSequentialRecommendationData(data);
                    break;
                    
                case 'complete':
                    handleStreamComplete();
                    break;
                    
                case 'done':
                    console.log('✅ 流式推荐完成');
                    break;
                    
                case 'error':
                    console.error('❌ 服务器错误:', data.message);
                    alert('推荐服务出现错误: ' + data.message);
                    break;
                    
                default:
                    console.warn('🤔 未知数据类型:', data.type, data);
                    break;
            }
        }

        // 处理分段分析（完整版本 - 符合原始需求）
        function handleSegmentedAnalysis(data) {
            console.log('🧠 收到AI分段分析数据:', data);
            
            if (!data.segments || !Array.isArray(data.segments)) {
                console.error('❌ 分段数据格式错误:', data);
                return;
            }
            
            // 更新标题为AI分析
            const analysisTitle = document.getElementById('analysisTitle');
            if (analysisTitle) {
                analysisTitle.textContent = 'Shaker的深度分析';
            }
            
            // 获取分段容器
            const segmentsContainer = document.getElementById('analysisSegments');
            if (!segmentsContainer) {
                console.error('❌ 找不到分段容器');
                return;
            }
            
            // 移除本地分析标识
            const localBadge = segmentsContainer.querySelector('.local-analysis-badge');
            if (localBadge) {
                localBadge.remove();
            }
            
            // 添加AI分析标识
            const aiBadge = document.createElement('div');
            aiBadge.className = 'local-analysis-badge';
            aiBadge.style.background = 'var(--accent-gold)';
            aiBadge.innerHTML = '<span>🤖</span>AI深度分析';
            segmentsContainer.insertBefore(aiBadge, segmentsContainer.firstChild);
            
            // 清空现有分段（保留标识）
            const existingSegments = segmentsContainer.querySelectorAll('.analysis-segment');
            existingSegments.forEach(segment => segment.remove());
            
            // 显示AI分段
            data.segments.forEach((segment, index) => {
                const segmentElement = document.createElement('div');
                segmentElement.className = 'analysis-segment';
                segmentElement.innerHTML = `
                    <div class="segment-header">
                        <span class="segment-icon">${getSegmentIcon(segment.focus)}</span>
                        <h3 class="segment-title">${segment.title}</h3>
                    </div>
                    <p class="segment-content">${segment.content}</p>
                `;
                
                segmentsContainer.appendChild(segmentElement);
                
                // 延迟显示动画
                setTimeout(() => {
                    segmentElement.classList.add('show');
                }, index * 200);
            });
            
            // 强制显示分析区域
            const analysisSection = document.getElementById('shakerAnalysisSection');
            const analysisContent = document.getElementById('shakerAnalysisText');
            
            if (!analysisSection || !analysisContent || !analysisTitle) {
                console.error('❌ DOM元素缺失');
                return;
            }
            
            // 显示分析区域
            analysisSection.style.display = 'block';
            analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            console.log('✅ 开始逐段显示', data.segments.length, '个分段');
            
            // 逐段显示（按照原始需求：4段，每段4秒间隔，250ms打字速度）
            data.segments.forEach((segment, index) => {
                setTimeout(() => {
                    console.log(`🎬 开始显示第${index + 1}段:`, segment.title, segment.content);
                    
                    // 1. 标题切换特效（淡入淡出）
                    analysisTitle.style.transition = 'opacity 0.3s ease';
                    analysisTitle.style.opacity = '0';
                    
                    setTimeout(() => {
                        analysisTitle.textContent = segment.title || '分析中...';
                        analysisTitle.style.opacity = '1';
                        console.log('📝 标题已更新:', segment.title);
                    }, 300);
                    
                    // 2. 清空内容
                    analysisContent.innerHTML = '';
                    console.log('🧹 内容已清空');
                    
                    // 3. 慢速打字显示内容（250ms每字符，符合人类打字速度）
                    setTimeout(() => {
                        console.log('⌨️ 开始打字效果:', segment.content);
                        slowTypeWriter(analysisContent, segment.content, 250, () => {
                            console.log(`✅ 第${index + 1}段分析完成:`, segment.title);
                            
                            // 更新Shaker情感
                            const shakerAvatar = document.querySelector('.shaker-avatar');
                            if (shakerAvatar) {
                                updateShakerEmotion(shakerAvatar, getEmotionByFocus(segment.focus));
                                console.log('😊 Shaker情感已更新:', getEmotionByFocus(segment.focus));
                            }
                        });
                    }, 600);
                    
                }, index * 4000); // 每段间隔4秒（原始需求）
            });
        }

        // 根据分析焦点获取情感
        function getEmotionByFocus(focus) {
            const emotionMap = {
                'scene': 'understanding',
                'mood': 'empathy', 
                'ingredients': 'caring',
                'preparation': 'excitement'
            };
            return emotionMap[focus] || 'understanding';
        }

                // 慢速打字机效果（优化版）
        function slowTypeWriter(element, text, speed = 250, callback) {
            console.log('⌨️ slowTypeWriter 开始:', {element, text, speed});
            
            if (!element) {
                console.error('❌ slowTypeWriter: element为空');
                return;
            }
            
            if (!text) {
                console.error('❌ slowTypeWriter: text为空');
                return;
            }
            
            let index = 0;
            element.innerHTML = '';
            
            const timer = setInterval(() => {
                if (index < text.length) {
                    element.innerHTML += text.charAt(index);
                    index++;
                    
                    // 标点符号后额外停顿
                    const char = text.charAt(index - 1);
                    if (char === '。' || char === '！' || char === '？') {
                        setTimeout(() => {}, speed * 2);
                    } else if (char === '，' || char === '、') {
                        setTimeout(() => {}, speed * 1.5);
                    }
                    } else {
                    clearInterval(timer);
                    console.log('⌨️ slowTypeWriter 完成:', text);
                    if (callback) callback();
                }
            }, speed);
        }

        // 处理逐个推荐数据（新的揭秘逻辑）
        let recommendationQueue = [];
        let currentRevealIndex = 0;

        function handleSequentialRecommendationData(data) {
            console.log('🍸 收到推荐数据（逐个揭秘）:', data.index, data.content);
            
            // 将推荐加入队列
            recommendationQueue[data.index] = {
                index: data.index,
                content: data.content,
                glassType: data.glassType
            };
            
            console.log('📝 推荐队列状态:', recommendationQueue.length, '当前揭秘索引:', currentRevealIndex);
        }

        // 启动逐个揭秘过程
        function startSequentialReveal() {
            console.log('🎬 开始逐个揭秘推荐');
            
            // 确保3个卡片都已创建
            initializeMakingCards();
            
            // 逐个揭秘
            const revealNext = () => {
                if (currentRevealIndex < 3 && recommendationQueue[currentRevealIndex]) {
                    const recommendation = recommendationQueue[currentRevealIndex];
                    
                    console.log(`🎯 揭秘第${currentRevealIndex + 1}个推荐`);
                    
                    // 启动该卡片的调制动画
                    startMakingAnimation(currentRevealIndex);
                    
                    // 4秒后完成并显示内容
                    setTimeout(() => {
                        displayRecommendationInCard(currentRevealIndex, recommendation.content.recommendations[0]);
                        currentRevealIndex++;
                        
                        // 800ms后揭秘下一个
                        setTimeout(revealNext, 800);
                    }, 4000);
                } else {
                    console.log('✅ 所有推荐揭秘完成');
                }
            };
            
            revealNext();
        }

        // 优化的思考片段处理
        function handleOptimizedThoughtSegment(data) {
            console.log('🧠 收到优化思考片段:', data.content);
            
            // 显示分析区域
            showSection('shakerAnalysisSection');
            
            // 更新分析内容
            const analysisContent = document.getElementById('analysisContent');
            const analysisTitle = document.getElementById('analysisTitle');
            
            if (analysisContent && analysisTitle) {
                analysisTitle.textContent = 'Shaker正在理解你的需求';
                
                // 使用打字机效果显示内容
                typeWriterEffect(analysisContent, data.content, 60, () => {
                    console.log('✅ 优化分析显示完成');
                });
                
                // 更新Shaker头像情感
                updateShakerEmotion(data.emotion || 'understanding');
            }
        }

        // 优化的阶段转换处理
        function handleOptimizedPhaseTransition(data) {
            console.log('🔄 优化阶段转换:', data.phase);
            
            if (data.phase === 'recommendations') {
                // 更新分析标题
                const analysisTitle = document.getElementById('analysisTitle');
                if (analysisTitle) {
                    analysisTitle.style.transition = 'opacity 0.3s ease';
                    analysisTitle.style.opacity = '0';
                    
                    setTimeout(() => {
                        analysisTitle.textContent = '✨ 理解完成，开始为你调制';
                        analysisTitle.style.opacity = '1';
                    }, 300);
                }
                
                // 显示调制区域并启动逐个揭秘
                setTimeout(() => {
                    showSection('cocktailMakingSection');
                    
                    // 滚动到调制区域
                    document.getElementById('cocktailMakingSection')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // 重置揭秘状态
                    currentRevealIndex = 0;
                    recommendationQueue = [];
                    
                    // 启动逐个揭秘过程
                    setTimeout(() => {
                        startSequentialReveal();
                    }, 1000);
                    
                }, 1000);
            }
        }

        // 优化的推荐数据处理 - 实时展示
        function handleOptimizedRecommendationData(data) {
            console.log('🍸 收到优化推荐:', data.index, data.content);
            
            if (data.content && data.content.recommendations && data.content.recommendations.length > 0) {
                const recommendation = data.content.recommendations[0];
                
                console.log('🎯 推荐详情:', recommendation);
                
                // 立即处理推荐，无延迟
                console.log('⚡ 立即处理推荐:', data.index);
                
                // 确保对应的卡片存在
                let cardElement = document.getElementById(`makingCard${data.index}`);
                if (!cardElement) {
                    console.log('🔧 创建缺失的卡片:', data.index);
                    const makingGrid = document.getElementById('makingGrid');
                    cardElement = createMakingCard(data.index);
                    makingGrid.appendChild(cardElement);
                }
                
                // 立即启动调制动画
                startMakingAnimation(data.index);
                
                // 2秒后显示推荐内容（动画进行中）
                setTimeout(() => {
                    console.log('📝 显示优化推荐内容:', data.index);
                    displayRecommendationInCard(data.index, recommendation);
                }, 2000);
                
            } else {
                console.warn('🤔 推荐数据格式异常:', data);
            }
        }

        // 处理分段思考
        function handleThoughtSegment(data) {
            console.log('🧠 收到思考片段:', data.segment, data.emotion, data.content);
            
            const analysisElement = document.getElementById('shakerAnalysisText');
            const shakerAvatar = document.querySelector('.shaker-avatar');
            const sectionTitle = document.querySelector('#shakerAnalysisSection .section-title');
            
            console.log('🎯 找到元素:', {
                analysisElement: !!analysisElement,
                shakerAvatar: !!shakerAvatar,
                sectionTitle: !!sectionTitle
            });
            
            if (!analysisElement) {
                console.error('❌ 找不到 shakerAnalysisText 元素');
                return;
            }
            
            // 更新标题显示进度
            if (sectionTitle) {
                const titles = [
                    'Shaker正在理解你的选择...',
                    'Shaker正在分析你的心情...',
                    'Shaker正在思考最佳搭配...',
                    'Shaker正在准备推荐...'
                ];
                const titleIndex = Math.min(data.segment, titles.length - 1);
                sectionTitle.textContent = titles[titleIndex];
            }
            
            // 更新Shaker表情
            if (shakerAvatar) {
                updateShakerEmotion(shakerAvatar, data.emotion);
            }
            
            // 累积显示内容，不清除之前的
            const currentContent = analysisElement.textContent || '';
            const newContent = currentContent + (currentContent ? ' ' : '') + data.content;
            
            console.log('⌨️ 开始打字机效果:', data.content.substring(0, 50) + '...');
            
            // 打字机效果显示新内容
            typeWriterEffect(analysisElement, newContent, 80, () => {
                console.log('✅ 思考片段显示完成:', data.segment);
            });
        }

        // 更新Shaker情感表情
        function updateShakerEmotion(avatarElement, emotion) {
            const emotionEmojis = {
                'understanding': '🤗',  // 理解
                'empathy': '🥺',        // 共情
                'caring': '😊',         // 关怀
                'excitement': '✨',     // 兴奋
                'comfort': '🫂'         // 安慰
            };
            
            const emoji = emotionEmojis[emotion] || '🧙‍♂️';
            avatarElement.textContent = emoji;
            
            // 添加情感动画
            avatarElement.style.animation = 'none';
            setTimeout(() => {
                avatarElement.style.animation = 'gentlePulse 2s ease-in-out infinite';
            }, 10);
        }

        // 打字机效果 - 更慢更温暖
        function typeWriterEffect(element, text, speed = 80, callback) {
            let i = 0;
            element.innerHTML = '<span class="typing-cursor"></span>';
            
            function typeChar() {
                if (i < text.length) {
                    const currentText = text.substring(0, i + 1);
                    element.innerHTML = currentText + '<span class="typing-cursor"></span>';
                    i++;
                    
                    // 根据字符调整速度，标点符号停顿更久
                    let charSpeed = speed;
                    const char = text[i - 1];
                    if (char === '。' || char === '！' || char === '？') {
                        charSpeed = speed * 3; // 句号停顿更久
                    } else if (char === '，' || char === '、') {
                        charSpeed = speed * 2; // 逗号适中停顿
                    } else if (char === '.' && text.substring(i-3, i) === '...') {
                        charSpeed = speed * 4; // 省略号停顿很久
                    }
                    
                    setTimeout(typeChar, charSpeed);
                    } else {
                    // 打字完成，移除光标
                    element.innerHTML = text;
                    if (callback) callback();
                }
            }
            
            typeChar();
        }

        // 处理真实API分析数据 - 累积显示
        function handleAnalysisData(data) {
            console.log('🔍 处理分析数据:', data.content);
            
            if (data.content) {
                streamState.analysisText += data.content;
                
                const analysisElement = document.getElementById('shakerAnalysisText');
                if (analysisElement) {
                    // 直接显示累积的内容，保持打字光标
                    analysisElement.innerHTML = streamState.analysisText + '<span class="typing-cursor"></span>';
                    
                    // 自动滚动
                    analysisElement.scrollTop = analysisElement.scrollHeight;
                } else {
                    console.error('❌ 找不到 shakerAnalysisText 元素');
                }
            }
        }

        // 处理阶段转换
        function handlePhaseTransition(data) {
            console.log('🔄 阶段转换:', data.message);
            
            // 更新分析区域标题
            const sectionTitle = document.querySelector('#shakerAnalysisSection .section-title');
            if (sectionTitle) {
                sectionTitle.textContent = '分析完成！准备为你调制鸡尾酒...';
            }
            
            // 移除打字光标
            const analysisElement = document.getElementById('shakerAnalysisText');
            if (analysisElement) {
                const currentText = analysisElement.textContent || streamState.analysisText;
                analysisElement.innerHTML = currentText;
            }
            
            // 平滑滚动到调制区域并显示
            setTimeout(() => {
                showSection('cocktailMakingSection');
                
                // 自动滚动到调制区域
                setTimeout(() => {
                    const makingSection = document.getElementById('cocktailMakingSection');
                    if (makingSection) {
                        makingSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 300);
                
                initializeMakingCards();
            }, 1500); // 给用户更多时间阅读完整分析
        }

        // 初始化调制卡片 - 支持动态数量
        function initializeMakingCards(recommendationCount = 3) {
            const makingGrid = document.getElementById('makingGrid');
            
            // 总是清空并重新创建，确保状态正确
            makingGrid.innerHTML = '';
            
            // 设置动态布局属性
            makingGrid.setAttribute('data-count', recommendationCount.toString());
            console.log(`🎯 设置调制网格布局为 ${recommendationCount} 个推荐`);
            
            // 创建指定数量的调制卡片
            for (let i = 0; i < recommendationCount; i++) {
                const card = createMakingCard(i);
                makingGrid.appendChild(card);
            }
            
            console.log(`✅ 调制卡片初始化完成 - ${recommendationCount}张空白卡片已创建`);
        }

        // 创建简洁卡片 - 严格按照第二个截图
        function createMakingCard(index) {
            const card = document.createElement('div');
            card.className = 'simple-cocktail-card';
            card.id = `makingCard${index}`;
            
            const glassTypes = ['🍸', '🍹', '🥃'];
            const glass = glassTypes[index % 3];
            
            card.innerHTML = `
                <!-- 制作进度区域 -->
                <div class="making-progress-section" id="progressSection${index}">
                    <div class="cocktail-glass-icon">${glass}</div>
                    <div class="making-status-text" id="statusText${index}">正在调制中...</div>
                    <div class="simple-progress-bar">
                        <div class="progress-fill" id="progressFill${index}"></div>
                </div>
                </div>
                
                <!-- 推荐内容区域 - 极简设计风格 -->
                <div class="recommendation-content-area" id="recommendationContent${index}" style="display: none;">
                    <!-- 移除右上角酒精度标签 -->
                    
                    <!-- 鸡尾酒名称 - 居中显示 -->
                    <div class="cocktail-header">
                        <h3 class="cocktail-name-cn" id="nameCn${index}">鸡尾酒名称</h3>
                        <p class="cocktail-name-en" id="nameEn${index}">Cocktail Name</p>
                    </div>
                    
                    <!-- 推荐理由 -->
                    <div class="info-section">
                        <div class="info-label">
                            <span class="info-icon">✨</span>
                            <span>推荐理由：</span>
                        </div>
                        <p class="info-content" id="reason${index}">为你特别推荐</p>
                    </div>
                    
                    <!-- 主要材料 -->
                    <div class="info-section">
                        <div class="info-label">
                            <span class="info-icon">✓</span>
                            <span>主要材料：</span>
                        </div>
                        <div class="ingredients-list" id="ingredients${index}"></div>
                    </div>
                    
                    <!-- 口感特点 -->
                    <div class="info-section">
                        <div class="info-label">
                            <span class="info-icon">🍷</span>
                            <span>口感特点：</span>
                        </div>
                        <p class="info-content" id="taste${index}">口感独特</p>
                    </div>
                    
                    <!-- 底部信息 - 单行布局 -->
                    <div class="bottom-info">
                        <div class="bottom-left">
                            <div class="time-info">
                                <div class="info-icon">⏱</div>
                                <div class="info-value" id="prepTime${index}">5分钟</div>
                            </div>
                            <div class="difficulty-info">
                                <div class="info-icon">📊</div>
                                <div class="info-value" id="difficulty${index}">简单</div>
                            </div>
                        </div>
                        <div class="bottom-right">
                            <button class="details-btn" id="actionButton${index}">详情</button>
                        </div>
                    </div>
                </div>
            `;
            
            return card;
        }

        // 启动调制动画（增强版）
        function startMakingAnimation(index) {
            console.log(`🎬 启动现代制作动画 ${index}`);
            
            const card = document.getElementById(`makingCard${index}`);
            const glassIcon = document.getElementById(`glassIcon${index}`);
            const makingAnimation = document.getElementById(`makingAnimation${index}`);
            const progressSection = document.getElementById(`progressSection${index}`);
            const statusText = document.getElementById(`statusText${index}`);
            const progressFill = document.getElementById(`progressFill${index}`);
            const contentArea = document.getElementById(`recommendationContent${index}`);
            
            if (!card || !glassIcon || !makingAnimation || !progressFill) {
                console.error('❌ 制作动画元素不存在:', index);
                return;
            }
            
            // 显示进度区域，隐藏内容区域
            if (progressSection) progressSection.style.display = 'block';
            if (contentArea) contentArea.style.display = 'none';
            
            // 设置不同的调酒动效
            const animationTypes = ['shake', 'stir', 'garnish'];
            const statusTexts = [
                '正在摇制调配...', 
                '正在精心搅拌...', 
                '正在添加装饰...'
            ];
            
            const animationType = animationTypes[index % 3];
            makingAnimation.className = `making-animation ${animationType}`;
            if (statusText) statusText.textContent = statusTexts[index % 3];
            
            // 玻璃杯轻微动效
            if (glassIcon) {
                glassIcon.style.animation = 'gentle-bounce 2s ease-in-out infinite';
            }
            
            // 进度条动画
            let progress = 0;
            const duration = 3000; // 3秒制作时间
            const interval = 50;
            const increment = (100 / duration) * interval;
            
            const progressInterval = setInterval(() => {
                progress += increment + Math.random() * 2; // 略有随机性
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    // 制作完成
                    setTimeout(() => {
                    completeMakingAnimation(index);
                    }, 300);
                }
                progressFill.style.width = progress + '%';
            }, interval);
        }

        // 快速制作动画（API数据已准备好）
        function startQuickMakingAnimation(index) {
            console.log(`🎬 启动快速制作动画 ${index}`);
            
            const card = document.getElementById(`makingCard${index}`);
            const glassIcon = document.getElementById(`glassIcon${index}`);
            const makingAnimation = document.getElementById(`makingAnimation${index}`);
            const progressSection = document.getElementById(`progressSection${index}`);
            const statusText = document.getElementById(`statusText${index}`);
            const progressFill = document.getElementById(`progressFill${index}`);
            const contentArea = document.getElementById(`recommendationContent${index}`);
            
            if (!card || !glassIcon || !makingAnimation || !progressFill) {
                console.error('❌ 制作动画元素不存在:', index);
                return;
            }
            
            // 显示进度区域，隐藏内容区域
            if (progressSection) progressSection.style.display = 'block';
            if (contentArea) contentArea.style.display = 'none';
            
            // 设置不同的调酒动效
            const animationTypes = ['shake', 'stir', 'garnish'];
            const statusTexts = [
                '正在摇制调配...', 
                '正在精心搅拌...', 
                '正在添加装饰...'
            ];
            
            const animationType = animationTypes[index % 3];
            makingAnimation.className = `making-animation ${animationType}`;
            if (statusText) statusText.textContent = statusTexts[index % 3];
            
            // 启动酒杯动画
            if (glassIcon) {
                glassIcon.style.animation = `${animationType} 1.5s ease-in-out infinite`;
            }
            
            // 快速进度条动画（因为数据已准备好）
            let progress = 0;
            const duration = 1500; // 1.5秒快速制作时间
            const interval = 50;
            const increment = (100 / duration) * interval;
            
            const progressInterval = setInterval(() => {
                progress += increment + Math.random() * 5; // 快速增长
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                }
                progressFill.style.width = progress + '%';
            }, interval);
            
            // 保存interval ID以便后续清理
            card.dataset.progressInterval = progressInterval;
            
            console.log(`✅ 快速制作动画已启动: ${animationType}`);
        }

        // 完成快速制作
        function completeQuickMaking(index) {
            console.log(`✅ 完成快速制作 ${index}`);
            
            const card = document.getElementById(`makingCard${index}`);
            const glassIcon = document.getElementById(`glassIcon${index}`);
            const progressFill = document.getElementById(`progressFill${index}`);
            const statusText = document.getElementById(`statusText${index}`);
            
            // 清理进度条动画
            if (card && card.dataset.progressInterval) {
                clearInterval(parseInt(card.dataset.progressInterval));
                delete card.dataset.progressInterval;
            }
            
            // 完成进度条
            if (progressFill) {
                progressFill.style.width = '100%';
            }
            
            // 停止酒杯动画
            if (glassIcon) {
                glassIcon.style.animation = 'none';
            }
            
            // 更新状态文字
            if (statusText) {
                statusText.textContent = '制作完成！';
            }
        }

        // 简单进度条
        function startSimpleProgress(index) {
            console.log(`📊 开始简单进度条 ${index}`);
            
            const progressFill = document.getElementById(`progressFill${index}`);
            const statusText = document.getElementById(`statusText${index}`);
            
            if (!progressFill) {
                console.error('❌ 进度条元素不存在:', index);
                return;
            }
            
            // 更新状态文字
            if (statusText) {
                statusText.textContent = '正在调制中...';
            }
            
            // 简单进度条动画
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20 + 10; // 快速增长
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressFill.style.width = progress + '%';
            }, 100);
        }

        function completeSimpleProgress(index) {
            console.log(`✅ 完成简单进度条 ${index}`);
            
            const progressFill = document.getElementById(`progressFill${index}`);
            const statusText = document.getElementById(`statusText${index}`);
            
            // 完成进度条
            if (progressFill) {
                progressFill.style.width = '100%';
            }
            
            // 更新状态文字
            if (statusText) {
                statusText.textContent = '调制完成！';
            }
        }

        // 直接切换显示内容（无动画）
        function switchToContent(index) {
            console.log(`🔄 切换显示内容 ${index}`);
            
            const progressSection = document.getElementById(`progressSection${index}`);
            const contentArea = document.getElementById(`recommendationContent${index}`);
            
            console.log(`🔍 切换元素检查:`, {
                progressSection: !!progressSection,
                contentArea: !!contentArea,
                progressSectionDisplay: progressSection?.style.display,
                contentAreaDisplay: contentArea?.style.display
            });
            
            if (!progressSection || !contentArea) {
                console.error('❌ 切换元素不存在:', index, {
                    progressSection: !!progressSection,
                    contentArea: !!contentArea
                });
                return;
            }
            
            // 直接切换，无动画
            progressSection.style.display = 'none';
            contentArea.style.display = 'flex';
            contentArea.style.opacity = '1';
            contentArea.classList.add('visible'); // 添加visible类以显示子元素
            
            console.log(`✅ 切换完成:`, {
                progressSectionDisplay: progressSection.style.display,
                contentAreaDisplay: contentArea.style.display,
                contentAreaOpacity: contentArea.style.opacity,
                hasVisibleClass: contentArea.classList.contains('visible')
            });
        }

        // 填充推荐内容（无打字机效果）
        function fillRecommendationContent(recommendation, index) {
            console.log(`📝 填充推荐内容 ${index}:`, recommendation);
            console.log(`🔍 推荐数据详情:`, JSON.stringify(recommendation, null, 2));
            
            // 解析推荐数据
            const cocktailNameCn = recommendation.name?.chinese || recommendation.chinese || '神秘鸡尾酒';
            const cocktailNameEn = recommendation.name?.english || recommendation.english || 'Mystery Cocktail';
            const reason = recommendation.reason || '为你特别调制';
            const ingredients = recommendation.recipe?.ingredients || recommendation.ingredients || [];
            const tasteProfile = recommendation.taste_profile || '口感独特，值得品尝';
            const prepTime = recommendation.prep_time || '5分钟';
            const difficulty = recommendation.recipe?.difficulty || recommendation.difficulty || '简单';
            // 优化酒精度显示
            let alcoholContent = recommendation.alcohol_content || '中度(约15%)';
            if (alcoholContent.includes('适中')) {
                alcoholContent = alcoholContent.replace('适中', '中度');
            }
            if (!alcoholContent.includes('%') && !alcoholContent.includes('度')) {
                alcoholContent = `${alcoholContent}(约15%)`;
            }
            
            console.log(`🎯 解析结果:`, {
                cocktailNameCn, cocktailNameEn, reason, ingredients, tasteProfile, prepTime, difficulty, alcoholContent
            });
            
            // 填充内容
            const nameCn = document.getElementById(`nameCn${index}`);
            const nameEn = document.getElementById(`nameEn${index}`);
            const reasonEl = document.getElementById(`reason${index}`);
            const tasteEl = document.getElementById(`taste${index}`);
            const prepTimeEl = document.getElementById(`prepTime${index}`);
            const difficultyEl = document.getElementById(`difficulty${index}`);
            const ingredientsEl = document.getElementById(`ingredients${index}`);
            
            console.log(`🔍 DOM元素检查:`, {
                nameCn: !!nameCn,
                nameEn: !!nameEn,
                reasonEl: !!reasonEl,
                tasteEl: !!tasteEl,
                prepTimeEl: !!prepTimeEl,
                difficultyEl: !!difficultyEl,
                ingredientsEl: !!ingredientsEl
            });
            
            // 酒精度信息已移除，不再需要设置
            
            if (nameCn) {
                nameCn.textContent = cocktailNameCn;
                console.log(`✅ 设置中文名: ${cocktailNameCn}`);
            } else {
                console.error(`❌ 找不到中文名元素: nameCn${index}`);
            }
            
            if (nameEn) {
                nameEn.textContent = cocktailNameEn;
                console.log(`✅ 设置英文名: ${cocktailNameEn}`);
            } else {
                console.error(`❌ 找不到英文名元素: nameEn${index}`);
            }
            
            if (reasonEl) {
                reasonEl.textContent = reason;
                console.log(`✅ 设置推荐理由: ${reason}`);
            } else {
                console.error(`❌ 找不到推荐理由元素: reason${index}`);
            }
            
            if (tasteEl) {
                tasteEl.textContent = tasteProfile;
                console.log(`✅ 设置口感: ${tasteProfile}`);
            } else {
                console.error(`❌ 找不到口感元素: taste${index}`);
            }
            
            if (prepTimeEl) {
                prepTimeEl.textContent = prepTime;
                console.log(`✅ 设置制作时间: ${prepTime}`);
            } else {
                console.error(`❌ 找不到制作时间元素: prepTime${index}`);
            }
            
            if (difficultyEl) {
                difficultyEl.textContent = difficulty;
                console.log(`✅ 设置难度: ${difficulty}`);
            } else {
                console.error(`❌ 找不到难度元素: difficulty${index}`);
            }
            
            // 填充材料标签
            if (ingredientsEl) {
                ingredientsEl.innerHTML = '';
                
                // 如果没有材料数据，使用默认材料
                let displayIngredients = ingredients;
                if (!ingredients || ingredients.length === 0) {
                    displayIngredients = ['基酒', '调味料'];
                }
                
                // 显示前3个材料，保持简洁
                displayIngredients.slice(0, 3).forEach(ingredient => {
                    const tag = document.createElement('span');
                    tag.className = 'ingredient-tag';
                    
                    // 处理不同格式的材料数据
                    let ingredientText = '';
                    if (typeof ingredient === 'string') {
                        ingredientText = ingredient;
                    } else if (ingredient && ingredient.name) {
                        ingredientText = ingredient.name;
                        if (ingredient.amount) {
                            ingredientText += ` ${ingredient.amount}`;
                        }
                    } else {
                        ingredientText = String(ingredient);
                    }
                    
                    tag.textContent = ingredientText;
                    ingredientsEl.appendChild(tag);
                });
                
                console.log(`✅ 填充材料标签: ${displayIngredients.length}个`);
            }
            
            // 添加点击事件
            const card = document.getElementById(`makingCard${index}`);
            const actionButton = document.getElementById(`actionButton${index}`);
            
            const showDetails = (e) => {
                e.stopPropagation();
                showCocktailDetails({
                    nameCn: cocktailNameCn,
                    nameEn: cocktailNameEn,
                    reason: reason,
                    ingredients: ingredients,
                    tasteProfile: tasteProfile,
                    prepTime: prepTime,
                    difficulty: difficulty,
                    alcoholContent: alcoholContent
                });
            };
            
            // 给整个卡片添加点击事件
            if (card) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    showDetails(e);
                    console.log('🔘 卡片被点击，显示详情');
                });
            }
            
            // 按钮也添加点击事件（双重保险）
            if (actionButton) {
                actionButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showDetails(e);
                    console.log('🔘 查看详情按钮被点击');
                });
            }
        }

        // 显示鸡尾酒详情
        function showCocktailDetails(cocktail) {
            console.log('🔍 显示详情，接收到的数据:', cocktail);
            
            // 数据验证和默认值
            const safeData = {
                nameCn: cocktail.nameCn || '未知鸡尾酒',
                nameEn: cocktail.nameEn || 'Unknown Cocktail',
                reason: cocktail.reason || '暂无推荐理由',
                ingredients: cocktail.ingredients || [],
                instructions: cocktail.instructions || [
                    '将所有材料加入调酒器中',
                    '加入适量冰块，充分摇匀',
                    '过滤倒入杯中，装饰后即可享用'
                ],
                tasteProfile: cocktail.tasteProfile || '暂无口感描述',
                prepTime: cocktail.prepTime || '未知',
                difficulty: cocktail.difficulty || '未知',
                alcoholContent: cocktail.alcoholContent || '未知'
            };
            
            console.log('✅ 处理后的安全数据:', safeData);
            
            // 创建详情弹窗
            const modal = document.createElement('div');
            modal.className = 'cocktail-details-modal';
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="closeCocktailDetails()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${safeData.nameCn}</h2>
                        <p class="english-name">${safeData.nameEn}</p>
                        <button class="close-btn" onclick="closeCocktailDetails()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h3>🍸 基本信息</h3>
                            <div class="info-cards-grid">
                                <div class="info-card">
                                    <div class="info-icon">⏰</div>
                                    <div class="info-content">
                                        <div class="info-label">制作时间</div>
                                        <div class="info-value">${safeData.prepTime}</div>
                                    </div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">📊</div>
                                    <div class="info-content">
                                        <div class="info-label">难度等级</div>
                                        <div class="info-value">${safeData.difficulty}</div>
                                    </div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">🍺</div>
                                    <div class="info-content">
                                        <div class="info-label">酒精度</div>
                                        <div class="info-value">${safeData.alcoholContent}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>✨ 推荐理由</h3>
                            <p>${safeData.reason}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>🥃 所需材料</h3>
                            <div class="ingredients-detail">
                                ${safeData.ingredients.map(ing => {
                                    const name = typeof ing === 'string' ? ing : (ing.name || ing);
                                    const amount = typeof ing === 'object' ? (ing.amount || '') : '';
                                    return `<div class="ingredient-item">
                                        <span class="ingredient-name">${name}</span>
                                        ${amount ? `<span class="ingredient-amount">${amount}</span>` : ''}
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>📝 制作方法</h3>
                            <div class="instructions-list">
                                ${(safeData.instructions || [
                                    '将所有材料加入调酒器中',
                                    '加入适量冰块，充分摇匀',
                                    '过滤倒入杯中，装饰后即可享用'
                                ]).map((step, index) => 
                                    `<div class="instruction-step">
                                        <div class="step-number">${index + 1}</div>
                                        <div class="step-text">${step}</div>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>👅 口感特点</h3>
                            <p>${safeData.tasteProfile}</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 添加动画效果
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
        
        // 关闭详情弹窗
        function closeCocktailDetails() {
            const modal = document.querySelector('.cocktail-details-modal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        }

        // 食材下落动画
        function startIngredientAnimation(index) {
            const container = document.getElementById(`ingredientsContainer${index}`);
            const ingredients = ['🍋', '🧊', '🌿', '🍯', '🥃', '🍊'];
            
            let ingredientIndex = 0;
            const ingredientInterval = setInterval(() => {
                if (ingredientIndex < ingredients.length) {
                    createFallingIngredient(container, ingredients[ingredientIndex]);
                    ingredientIndex++;
                } else {
                    clearInterval(ingredientInterval);
                }
            }, 600); // 每600ms一个食材
        }

        // 增强的食材下落动画
        function startEnhancedIngredientAnimation(index) {
            const container = document.getElementById(`ingredientsContainer${index}`);
            const ingredients = ['🧊', '🍋', '🌿', '🍯', '🥃', '🧊', '🍊'];
            
            let ingredientIndex = 0;
            const ingredientInterval = setInterval(() => {
                if (ingredientIndex < ingredients.length) {
                    createEnhancedFallingIngredient(container, ingredients[ingredientIndex], ingredientIndex);
                    ingredientIndex++;
                } else {
                    clearInterval(ingredientInterval);
                }
            }, 500); // 更频繁的食材下落
        }

        // 创建增强的下落食材
        function createEnhancedFallingIngredient(container, ingredient, index) {
            const element = document.createElement('div');
            element.className = 'falling-ingredient enhanced';
            element.textContent = ingredient;
            element.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                left: ${20 + (index * 15) % 60}%;
                top: -20px;
                animation: enhancedFall 2s ease-in-out forwards, 
                          rotate360 2s linear infinite,
                          sparkle 1s ease-in-out infinite;
                z-index: 5;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            `;
            
            container.appendChild(element);
            
            // 2.5秒后移除元素
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 2500);
        }

        // 创建下落食材
        function createFallingIngredient(container, emoji) {
            const ingredient = document.createElement('div');
            ingredient.className = 'falling-ingredient';
            ingredient.textContent = emoji;
            ingredient.style.left = Math.random() * 80 + 10 + '%';
            
            container.appendChild(ingredient);
            
            // 动画结束后移除
            setTimeout(() => {
                if (ingredient.parentNode) {
                    ingredient.parentNode.removeChild(ingredient);
                }
            }, 2000);
        }

        // 完成调制动画
        function completeMakingAnimation(index) {
            console.log(`✅ 完成制作动画 ${index}`);
            
            const card = document.getElementById(`makingCard${index}`);
            const glassIcon = document.getElementById(`glassIcon${index}`);
            const makingAnimation = document.getElementById(`makingAnimation${index}`);
            const progressSection = document.getElementById(`progressSection${index}`);
            const statusText = document.getElementById(`statusText${index}`);
            
            // 停止所有动画
            if (glassIcon) {
                glassIcon.style.animation = '';
            }
            if (makingAnimation) {
                makingAnimation.className = 'making-animation';
            }
            if (statusText) {
                statusText.textContent = '调制完成！';
            }
            
            // 短暂显示完成状态
            setTimeout(() => {
                // 隐藏进度区域
                if (progressSection) {
                    progressSection.style.display = 'none';
                }
                
                // 准备显示内容
                console.log(`🎯 准备显示推荐内容 ${index}`);
            }, 800);
        }

        // 处理推荐数据 - 逐个流式显示
        function handleRecommendationData(data) {
            console.log('🍸 收到推荐:', data.index, data.content);
            
            if (data.content && data.content.recommendations && data.content.recommendations.length > 0) {
                const recommendation = data.content.recommendations[0];
                
                console.log('🎯 推荐详情:', recommendation);
                
                // 立即开始处理推荐（不重复初始化卡片）
                console.log('🎬 立即开始处理推荐:', data.index);
                
                // 确保对应的卡片存在
                let cardElement = document.getElementById(`makingCard${data.index}`);
                if (!cardElement) {
                    console.log('🔧 创建缺失的卡片:', data.index);
                    const makingGrid = document.getElementById('makingGrid');
                    cardElement = createMakingCard(data.index);
                    makingGrid.appendChild(cardElement);
                }
                
                // 先启动调制动画
                setTimeout(() => {
                    startMakingAnimation(data.index);
                }, data.index * 500);
                
                // 动画进行中显示推荐内容
                setTimeout(() => {
                    console.log('📝 显示推荐内容:', data.index);
                    displayRecommendationInCard(data.index, recommendation);
                }, data.index * 500 + 2500); // 动画2.5秒后显示内容
                
            } else {
                console.warn('🤔 推荐数据格式异常:', data);
            }
        }

        // 在卡片中流式显示推荐
        function displayRecommendationInCard(index, recommendation) {
            console.log('🍸 显示推荐卡片:', index, recommendation);
            
            // 多次尝试获取DOM元素，确保稳定性
            let contentElement = document.getElementById(`recommendationContent${index}`);
            let cardElement = document.getElementById(`makingCard${index}`);
            
            // 如果元素不存在，尝试重新创建
            if (!cardElement) {
                console.warn('⚠️ 卡片元素不存在，重新创建:', index);
                const makingGrid = document.getElementById('makingGrid');
                cardElement = createMakingCard(index);
                makingGrid.appendChild(cardElement);
                contentElement = document.getElementById(`recommendationContent${index}`);
            }
            
            console.log('🎯 DOM元素检查:', {
                contentElement: !!contentElement,
                cardElement: !!cardElement,
                contentElementId: contentElement?.id,
                cardElementId: cardElement?.id,
                cardElementParent: cardElement?.parentElement?.id
            });
            
            if (contentElement && recommendation) {
                // 停止调制动画
                try {
                    completeMakingAnimation(index);
                } catch (e) {
                    console.warn('⚠️ 停止动画失败:', e);
                }
                
                // 确保卡片和内容容器都可见
                if (cardElement) {
                    cardElement.style.display = 'block';
                    cardElement.classList.remove('making');
                    cardElement.style.visibility = 'visible';
                }
                
                // 构建完整内容
                console.log('🔍 推荐数据结构:', recommendation);
                const cocktailName = recommendation.name?.chinese || recommendation.chinese || '神秘鸡尾酒';
                const englishName = recommendation.name?.english || recommendation.english || 'Mystery Cocktail';
                const reason = recommendation.reason || '为你特别调制';
                const ingredients = recommendation.recipe?.ingredients || recommendation.ingredients || [];
                const ingredientText = ingredients.map(ing => 
                    typeof ing === 'string' ? ing : `${ing.name || ing} ${ing.amount || ''}`
                ).join(', ') || '秘密配方';
                
                console.log('📝 内容解析结果:', {
                    cocktailName, englishName, reason, ingredientText
                });
                
                const fullContent = `
                    <div class="cocktail-name" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-color);">
                        ${cocktailName}
                    </div>
                    <div class="cocktail-name-en" style="font-size: 1rem; opacity: 0.7; margin-bottom: 1rem; font-style: italic;">
                        ${englishName}
                    </div>
                    <div class="cocktail-reason" style="margin-bottom: 1rem; font-style: italic; color: var(--text-secondary); line-height: 1.6;">
                        ${reason}
                    </div>
                    <div class="cocktail-recipe" style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">
                        <strong>配方:</strong> ${ingredientText}
                    </div>
                `;
                
                // 设置内容并锁定样式
                contentElement.innerHTML = fullContent;
                
                // 强制样式，防止被任何其他代码覆盖
                const lockedStyles = `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                    transition: all 0.5s ease !important;
                    padding: 1rem !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                    border-radius: 15px !important;
                    margin-top: 1rem !important;
                    position: relative !important;
                    z-index: 10 !important;
                `;
                
                contentElement.style.cssText = lockedStyles;
                
                // 额外保护：定期检查并恢复样式
                const protectionInterval = setInterval(() => {
                    if (contentElement && contentElement.parentElement) {
                        if (contentElement.style.display === 'none' || contentElement.style.visibility === 'hidden') {
                            console.log('🛡️ 检测到推荐内容被隐藏，恢复显示:', index);
                            contentElement.style.cssText = lockedStyles;
                        }
                    } else {
                        clearInterval(protectionInterval);
                    }
                }, 1000);
                
                // 5秒后停止保护
                setTimeout(() => clearInterval(protectionInterval), 5000);
                
                console.log('✅ 推荐卡片显示完成并加锁保护:', index, cocktailName);
            } else {
                console.error('❌ 推荐卡片显示失败:', { 
                    contentElement: !!contentElement, 
                    recommendation: !!recommendation,
                    recommendationKeys: recommendation ? Object.keys(recommendation) : 'null',
                    makingGridChildren: document.getElementById('makingGrid')?.children.length
                });
            }
        }

        // 处理流式完成
        function handleStreamComplete() {
            console.log('🎉 流式推荐完成');
            
            // 不切换section，保持推荐卡片可见
            console.log('✅ 推荐流程完成，保持当前显示状态');
            
            // 延迟显示"再来一杯"按钮
            setTimeout(() => {
                showAnotherDrinkButton();
            }, 2000); // 2秒后显示，让用户先欣赏推荐结果
        }

        // 显示"再来一杯"按钮
        function showAnotherDrinkButton() {
            console.log('🍸 显示再来一杯浮动按钮');
            
            // 检查是否已经存在按钮，避免重复添加
            if (document.querySelector('.another-drink-float-btn')) {
                console.log('⚠️ 再来一杯按钮已存在，跳过添加');
                return;
            }
            
            const floatButton = document.createElement('div');
            floatButton.className = 'another-drink-float-btn';
            floatButton.innerHTML = `
                <button class="float-btn-inner" onclick="startAnotherDrink()" title="重新开始推荐，探索更多美妙鸡尾酒">
                    <span class="float-btn-icon">🌿</span>
                    <span class="float-btn-text">重新探索</span>
                </button>
            `;
            
            // 插入到body末尾，使用固定定位
            document.body.appendChild(floatButton);
            console.log('✅ 再来一杯浮动按钮已添加到右下角');
        }

        // 重新开始推荐流程
        function startAnotherDrink() {
            console.log('🔄 用户点击再来一杯，重启流程');
            
            try {
                // 1. 重置应用状态（如果存在）
                if (typeof userInput !== 'undefined') {
                    resetUserInput();
                }
                
                // 2. 重置UI状态
                resetUIState();
                
                // 3. 先显示首页，再滚动
                showSection('heroSection');
                
                // 4. 确保滚动到页面最顶部
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    console.log('✅ 已重启到首页');
                }, 100);
                
            } catch (error) {
                console.error('❌ 重启流程失败:', error);
                // 降级方案：直接刷新页面
                window.location.reload();
            }
        }

        // 重置用户输入数据
        function resetUserInput() {
            if (typeof userInput !== 'undefined') {
                userInput.scene = null;
                userInput.moods = [];
                userInput.ingredients = {
                    spirits: [],
                    mixers: [],
                    tools: []
                };
                userInput.preferences = {
                    alcohol_level: 50,
                    sweetness: 50,
                    acidity: 50,
                    style: null
                };
                userInput.special_requirements = '';
            }
            console.log('✅ 用户输入数据已重置');
        }

        // 重置UI状态
        function resetUIState() {
            // 清理推荐结果
            const makingGrid = document.getElementById('makingGrid');
            if (makingGrid) {
                makingGrid.innerHTML = '';
            }
            
            // 隐藏所有推荐流程相关的section
            const recommendationSections = [
                'shakerAnalysisSection',
                'cocktailMakingSection', 
                'resultsSection',
                'loadingSection'
            ];
            
            recommendationSections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'none';
                    console.log(`🔒 已隐藏section: ${sectionId}`);
                }
            });
            
            // 重置所有选择状态
            document.querySelectorAll('.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 重置滑块到默认值
            resetSliders();
            
            // 清空特殊要求输入框
            const specialRequirement = document.getElementById('specialRequirement');
            if (specialRequirement) {
                specialRequirement.value = '';
            }
            
            // 重置流式状态
            if (typeof streamState !== 'undefined') {
                streamState.analysisText = '';
                streamState.currentRecommendationIndex = 0;
                streamState.recommendations = [];
                if (streamState.eventSource) {
                    streamState.eventSource.close();
                    streamState.eventSource = null;
                }
            }
            
            // 清理分析内容区域
            const analysisContent = document.querySelector('.analysis-content');
            if (analysisContent) {
                analysisContent.innerHTML = '';
            }
            
            // 清理Shaker分析文本区域
            const shakerAnalysisText = document.getElementById('shakerAnalysisText');
            if (shakerAnalysisText) {
                shakerAnalysisText.innerHTML = '';
                shakerAnalysisText.textContent = '';
                console.log('🧹 已清理Shaker分析文本');
            }
            
            // 隐藏Shaker分析区域
            const shakerAnalysisSection = document.getElementById('shakerAnalysisSection');
            if (shakerAnalysisSection) {
                shakerAnalysisSection.style.display = 'none';
                console.log('🙈 已隐藏Shaker分析区域');
            }
            
            // 清理评论卡片容器
            const reviewContainer = document.querySelector('.review-cards-container');
            if (reviewContainer) {
                reviewContainer.innerHTML = '';
            }
            
            // 清理浮动按钮
            const floatButton = document.querySelector('.another-drink-float-btn');
            if (floatButton) {
                floatButton.remove();
                console.log('🗑️ 已清理浮动按钮');
            }
            
            console.log('✅ UI状态已完全重置');
        }

        // 重置滑块到默认值
        function resetSliders() {
            const sliders = [
                { id: 'alcoholLevel', value: 50 },
                { id: 'sweetness', value: 50 },
                { id: 'acidity', value: 50 }
            ];
            
            sliders.forEach(({ id, value }) => {
                const slider = document.getElementById(id);
                const display = document.getElementById(id + 'Value');
                if (slider) {
                    slider.value = value;
                    if (display) {
                        display.textContent = value;
                    }
                }
            });
        }

        // 显示推荐结果
        function displayRecommendations(recommendations) {
            showSection('resultsSection');

            const container = document.getElementById('resultsGrid');
            container.innerHTML = '';

            recommendations.forEach((cocktail, index) => {
                const card = document.createElement('div');
                card.className = 'cocktail-card glass-card';
                card.innerHTML = `
                    <h3 class="cocktail-title">${cocktail.name.chinese}</h3>
                    <p class="cocktail-subtitle">${cocktail.name.english}</p>
                    <p class="cocktail-reason">${cocktail.reason}</p>
                    <div class="cocktail-meta">
                        <span>🏷️ ${cocktail.recipe.difficulty}</span>
                        <span>⏱️ ${cocktail.prep_time}</span>
                        <span>🍺 ${cocktail.alcohol_content}</span>
                    </div>
                `;
                
                card.addEventListener('click', () => {
                    showCocktailDetails(cocktail);
                });
                
                container.appendChild(card);
            });
            
            // 滚动到结果区域
            document.getElementById('resultsSection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }



        // 工具函数
        function getAlcoholLevelText(value) {
            if (value < 33) return '低度';
            if (value < 67) return '中度';
            return '高度';
        }

        function getSweetnessText(value) {
            if (value < 33) return '不甜';
            if (value < 67) return '微甜';
            return '很甜';
        }

        function getAcidityText(value) {
            if (value < 33) return '不酸';
            if (value < 67) return '适中';
            return '很酸';
        }

        // 暴露全局函数供HTML调用
        window.getRecommendation = getRecommendation;
        window.closeCocktailDetails = closeCocktailDetails;
        window.startAnotherDrink = startAnotherDrink;
