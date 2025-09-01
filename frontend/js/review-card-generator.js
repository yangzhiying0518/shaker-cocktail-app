/**
 * 评论卡片生成器 - 4阶段故事性体验
 */

export class ReviewCardGenerator {
    constructor() {
        this.phases = {
            review: { title: "回顾你的选择", icon: "🌟", emotion: "understanding", duration: 3000 },
            analysis: { title: "深入分析思考", icon: "🧠", emotion: "professional", duration: 3500 },
            anticipation: { title: "即将为你揭晓", icon: "✨", emotion: "excitement", duration: 2500 },
            conclusion: { title: "完美的答案", icon: "🍸", emotion: "satisfaction", duration: 2000 }
        };

        this.emotionStyles = {
            understanding: { bgColor: 'rgba(143, 188, 143, 0.1)', textColor: '#4a7c59' },
            professional: { bgColor: 'rgba(34, 139, 34, 0.1)', textColor: '#2d5016' },
            excitement: { bgColor: 'rgba(154, 205, 50, 0.15)', textColor: '#228b22' },
            satisfaction: { bgColor: 'rgba(245, 245, 220, 0.2)', textColor: '#8b4513' }
        };
    }

    async generateReviewSequence(userInput, container, onPhaseComplete = null) {
        const { storyAnalysis } = await import('./story-analysis-generator.js');
        const storyContent = storyAnalysis.generateStoryAnalysis(userInput);
        
        container.innerHTML = '';
        
        for (let i = 0; i < storyContent.length; i++) {
            const phase = storyContent[i];
            const card = this.createPhaseCard(phase, i);
            container.appendChild(card);
            
            await this.animateCardIn(card);
            await this.typeWriterEffect(card.querySelector('.card-content'), phase.content, phase.duration);
            
            if (onPhaseComplete) onPhaseComplete(phase.phase, i + 1, storyContent.length);
            if (i < storyContent.length - 1) await this.wait(800);
        }
        
        await this.finalizeSequence(container);
        return { success: true, phases: storyContent.length };
    }

    createPhaseCard(phase, index) {
        const card = document.createElement('div');
        card.className = `review-card phase-${phase.phase}`;
        
        const emotionStyle = this.emotionStyles[phase.emotion];
        card.style.backgroundColor = emotionStyle.bgColor;
        card.style.color = emotionStyle.textColor;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        card.innerHTML = `
            <div class="card-header">
                <span class="phase-icon">${phase.icon}</span>
                <h3 class="phase-title">${phase.title}</h3>
                <span class="phase-number">${index + 1}/4</span>
            </div>
            <div class="card-content">
                <p class="phase-text"></p>
                <div class="typing-cursor">|</div>
            </div>
        `;
        
        return card;
    }

    async animateCardIn(card) {
        return new Promise(resolve => {
            card.style.transition = 'all 0.6s ease-out';
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                setTimeout(resolve, 600);
            });
        });
    }

    async typeWriterEffect(contentElement, text, duration) {
        const textElement = contentElement.querySelector('.phase-text');
        const cursor = contentElement.querySelector('.typing-cursor');
        
        cursor.style.opacity = '1';
        cursor.style.animation = 'blink 1s infinite';
        
        const typingSpeed = Math.max(30, Math.min(80, duration / text.length));
        
        return new Promise(resolve => {
            let currentIndex = 0;
            const typeInterval = setInterval(() => {
                if (currentIndex < text.length) {
                    textElement.textContent = text.substring(0, currentIndex + 1);
                    currentIndex++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        cursor.style.opacity = '0';
                        resolve();
                    }, 500);
                }
            }, typingSpeed);
        });
    }

    async finalizeSequence(container) {
        container.classList.add('sequence-complete');
        
        const continueHint = document.createElement('div');
        continueHint.className = 'continue-hint';
        continueHint.innerHTML = `
            <div class="hint-content">
                <span class="hint-icon">👇</span>
                <span class="hint-text">现在让我为你揭晓完美的鸡尾酒...</span>
            </div>
        `;
        
        container.appendChild(continueHint);
        setTimeout(() => {
            continueHint.style.opacity = '1';
            continueHint.style.transform = 'translateY(0)';
        }, 100);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearReviewCards(container) {
        const cards = container.querySelectorAll('.review-card, .continue-hint');
        cards.forEach(card => {
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '0';
            setTimeout(() => card.parentNode?.removeChild(card), 300);
        });
        setTimeout(() => container.classList.remove('sequence-complete'), 300);
    }
}

export const reviewCards = new ReviewCardGenerator();