/**
 * Shaker思考气泡生成器
 * 实现Shaker调酒师思考过程的可视化展示
 */

export class ThoughtBubbleGenerator {
    constructor() {
        // 思考气泡的样式配置
        this.bubbleStyles = {
            small: { size: 'small', duration: 1500, opacity: 0.7 },
            medium: { size: 'medium', duration: 2000, opacity: 0.8 },
            large: { size: 'large', duration: 2500, opacity: 0.9 }
        };

        // 思考内容模板
        this.thoughtTemplates = {
            review: ["让我回想一下...", "你的选择很有趣...", "我理解你的心情..."],
            analysis: ["需要考虑酒精度...", "口感平衡很重要...", "这个搭配会很棒..."],
            anticipation: ["就是这个感觉！", "完美的组合...", "我有灵感了！"],
            conclusion: ["大功告成！", "完美！", "你一定会满意的！"]
        };

        // 思考气泡的表情符号
        this.thoughtEmojis = {
            review: ['🤔', '💭', '🧐', '😌'],
            analysis: ['⚗️', '🔬', '⚖️', '🎯', '💡'],
            anticipation: ['✨', '🌟', '💫', '🎉'],
            conclusion: ['🎊', '🥳', '😊', '👌', '🍸']
        };
    }

    /**
     * 为指定阶段生成思考气泡序列
     */
    generateThoughtSequence(phase, duration, userInput = {}) {
        const thoughtCount = this.calculateThoughtCount(phase, duration);
        const sequence = [];
        
        for (let i = 0; i < thoughtCount; i++) {
            const thought = this.generateSingleThought(phase, i, thoughtCount, userInput);
            const timing = this.calculateThoughtTiming(i, thoughtCount, duration);
            
            sequence.push({
                id: `thought_${phase}_${i}`,
                content: thought.content,
                emoji: thought.emoji,
                style: thought.style,
                delay: timing.delay,
                duration: timing.duration,
                position: this.calculateBubblePosition(i, thoughtCount)
            });
        }
        
        return sequence;
    }

    calculateThoughtCount(phase, duration) {
        const baseCount = { review: 2, analysis: 4, anticipation: 3, conclusion: 2 };
        const durationFactor = Math.max(0.5, Math.min(2, duration / 3000));
        return Math.round(baseCount[phase] * durationFactor);
    }

    generateSingleThought(phase, index, total, userInput) {
        const templates = this.thoughtTemplates[phase];
        const emojis = this.thoughtEmojis[phase];
        
        const content = templates[Math.floor(Math.random() * templates.length)];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const style = this.selectBubbleStyle(index, total);
        
        return { content, emoji, style };
    }

    selectBubbleStyle(index, total) {
        if (index === 0 || index === total - 1) {
            return this.bubbleStyles.large;
        }
        const styles = ['small', 'medium'];
        const styleKey = styles[Math.floor(Math.random() * styles.length)];
        return this.bubbleStyles[styleKey];
    }

    calculateThoughtTiming(index, total, totalDuration) {
        const interval = totalDuration / (total + 1);
        const delay = interval * (index + 1);
        const duration = Math.min(1500, interval * 0.8);
        return { delay, duration };
    }

    calculateBubblePosition(index, total) {
        const angles = [];
        for (let i = 0; i < total; i++) {
            angles.push((360 / total) * i + (Math.random() - 0.5) * 60);
        }
        
        const angle = angles[index];
        const distance = 60 + Math.random() * 40;
        const x = Math.cos(angle * Math.PI / 180) * distance;
        const y = Math.sin(angle * Math.PI / 180) * distance;
        
        return { x, y, angle };
    }

    createBubbleElement(thought) {
        const bubble = document.createElement('div');
        bubble.className = `thought-bubble thought-bubble-${thought.style.size}`;
        bubble.id = thought.id;
        
        bubble.style.transform = `translate(${thought.position.x}px, ${thought.position.y}px)`;
        bubble.style.opacity = '0';
        
        bubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-emoji">${thought.emoji}</span>
                <span class="bubble-text">${thought.content}</span>
            </div>
            <div class="bubble-tail"></div>
        `;
        
        return bubble;
    }

    async showThoughtSequence(container, sequence) {
        const bubbleElements = [];
        
        sequence.forEach(thought => {
            const bubbleElement = this.createBubbleElement(thought);
            container.appendChild(bubbleElement);
            bubbleElements.push({ element: bubbleElement, thought });
        });
        
        const promises = bubbleElements.map(({ element, thought }) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.animateBubbleIn(element, thought.style);
                    setTimeout(() => {
                        this.animateBubbleOut(element);
                        setTimeout(() => {
                            if (element.parentNode) {
                                element.parentNode.removeChild(element);
                            }
                            resolve();
                        }, 300);
                    }, thought.duration);
                }, thought.delay);
            });
        });
        
        return Promise.all(promises);
    }

    animateBubbleIn(element, style) {
        element.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        element.style.opacity = style.opacity;
        element.style.transform += ' scale(1)';
        
        setTimeout(() => {
            element.style.animation = 'bubbleFloat 2s ease-in-out infinite';
        }, 300);
    }

    animateBubbleOut(element) {
        element.style.transition = 'all 0.3s ease-in';
        element.style.opacity = '0';
        element.style.transform += ' scale(0.8) translateY(-10px)';
    }

    clearAllBubbles(container) {
        const bubbles = container.querySelectorAll('.thought-bubble');
        bubbles.forEach(bubble => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        });
    }
}

export const thoughtBubbles = new ThoughtBubbleGenerator();