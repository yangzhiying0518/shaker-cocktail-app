/**
 * Shaker UI组件库
 * 封装可复用的UI组件和动画效果
 */

import { APP_CONFIG } from './app-config.js';

// 基础UI组件类
export class UIComponent {
    constructor(element) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.listeners = [];
    }

    // 添加事件监听器
    on(event, handler, options = {}) {
        if (this.element) {
            this.element.addEventListener(event, handler, options);
            this.listeners.push({ event, handler, options });
        }
        return this;
    }

    // 移除所有事件监听器
    destroy() {
        this.listeners.forEach(({ event, handler, options }) => {
            if (this.element) {
                this.element.removeEventListener(event, handler, options);
            }
        });
        this.listeners = [];
    }

    // 显示元素
    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.element.style.opacity = '1';
        }
        return this;
    }

    // 隐藏元素
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.element.style.opacity = '0';
        }
        return this;
    }

    // 切换显示状态
    toggle() {
        if (this.element) {
            const isVisible = this.element.style.display !== 'none';
            return isVisible ? this.hide() : this.show();
        }
        return this;
    }

    // 添加CSS类
    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
        }
        return this;
    }

    // 移除CSS类
    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
        }
        return this;
    }

    // 切换CSS类
    toggleClass(className) {
        if (this.element) {
            this.element.classList.toggle(className);
        }
        return this;
    }

    // 设置HTML内容
    html(content) {
        if (this.element) {
            this.element.innerHTML = content;
        }
        return this;
    }

    // 设置文本内容
    text(content) {
        if (this.element) {
            this.element.textContent = content;
        }
        return this;
    }
}

// 动画工具类
export class AnimationUtils {
    // 直接显示文本（临时禁用打字机效果用于调试）
    static async typeWriter(element, text, speed = APP_CONFIG.ANIMATION_DURATION.TYPING_SPEED) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            // 深度清理和标准化文本
            const cleanText = text
                .replace(/\r\n/g, '\n')  // 标准化换行符
                .replace(/\r/g, '\n')
                .replace(/\n+/g, ' ')    // 将换行符转为空格
                .replace(/\s+/g, ' ')    // 合并多个空格
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // 移除控制字符
                .replace(/([a-zA-Z\u4e00-\u9fff])\s+([a-zA-Z\u4e00-\u9fff])/g, '$1$2') // 去除中英文字符间的异常空格
                .replace(/([！？。，、；：])\s+/g, '$1') // 去除标点符号后的异常空格
                .replace(/\s+([！？。，、；：])/g, '$1') // 去除标点符号前的异常空格
                .trim();

            // 临时：直接显示文本，不使用打字机效果
            console.log('🐛 [调试] 显示清理后的文本:', cleanText);
            element.textContent = cleanText;
            
            // 立即完成
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    // 淡入动画
    static fadeIn(element, duration = APP_CONFIG.ANIMATION_DURATION.NORMAL) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms ease-in-out`;

            // 强制重绘
            element.offsetHeight;

            element.style.opacity = '1';

            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    // 淡出动画
    static fadeOut(element, duration = APP_CONFIG.ANIMATION_DURATION.NORMAL) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '0';

            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    // 滑动进入
    static slideIn(element, direction = 'up', duration = APP_CONFIG.ANIMATION_DURATION.NORMAL) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            const transforms = {
                up: 'translateY(30px)',
                down: 'translateY(-30px)',
                left: 'translateX(30px)',
                right: 'translateX(-30px)'
            };

            element.style.transform = transforms[direction] || transforms.up;
            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `all ${duration}ms ease-out`;

            // 强制重绘
            element.offsetHeight;

            element.style.transform = 'translate(0, 0)';
            element.style.opacity = '1';

            setTimeout(() => {
                element.style.transition = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }

    // 缩放进入
    static scaleIn(element, duration = APP_CONFIG.ANIMATION_DURATION.NORMAL) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.style.transform = 'scale(0.8)';
            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `all ${duration}ms ease-out`;

            // 强制重绘
            element.offsetHeight;

            element.style.transform = 'scale(1)';
            element.style.opacity = '1';

            setTimeout(() => {
                element.style.transition = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }

    // 脉冲动画
    static pulse(element, duration = 1000) {
        if (!element) return;

        element.style.animation = `pulse ${duration}ms ease-in-out`;

        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // 抖动动画
    static shake(element, duration = 500) {
        if (!element) return;

        element.style.animation = `shake ${duration}ms ease-in-out`;

        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
}

// 进度条组件
export class ProgressBar extends UIComponent {
    constructor(selector, options = {}) {
        super(selector);
        this.options = {
            animated: true,
            showPercent: false,
            ...options
        };
        this.value = 0;
    }

    setValue(value, animated = this.options.animated) {
        this.value = Math.max(0, Math.min(100, value));

        if (this.element) {
            const fill = this.element.querySelector('.progress-fill');
            if (fill) {
                if (animated) {
                    fill.style.transition = 'width 0.3s ease-out';
                }
                fill.style.width = `${this.value}%`;

                if (this.options.showPercent) {
                    const percentElement = this.element.querySelector('.progress-percent');
                    if (percentElement) {
                        percentElement.textContent = `${Math.round(this.value)}%`;
                    }
                }
            }
        }

        return this;
    }

    getValue() {
        return this.value;
    }
}

// 模态框组件
export class Modal extends UIComponent {
    constructor(selector, options = {}) {
        super(selector);
        this.options = {
            closeOnOverlay: true,
            closeOnEscape: true,
            ...options
        };
        this.isOpen = false;
        this.init();
    }

    init() {
        if (this.options.closeOnOverlay) {
            this.on('click', (e) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }

        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        // 关闭按钮
        const closeBtn = this.element?.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }

    open() {
        if (!this.element || this.isOpen) return this;

        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.element.style.display = 'flex';

        AnimationUtils.fadeIn(this.element, 200);

        const content = this.element.querySelector('.modal-content');
        if (content) {
            AnimationUtils.scaleIn(content, 300);
        }

        return this;
    }

    close() {
        if (!this.element || !this.isOpen) return this;

        this.isOpen = false;
        document.body.style.overflow = '';

        AnimationUtils.fadeOut(this.element, 200);

        return this;
    }

    setContent(content) {
        const contentElement = this.element?.querySelector('.modal-body');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        return this;
    }
}

// 通知组件
export class Toast extends UIComponent {
    static container = null;

    static show(message, type = 'info', duration = 3000) {
        // 创建容器
        if (!Toast.container) {
            Toast.container = document.createElement('div');
            Toast.container.className = 'toast-container';
            Toast.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(Toast.container);
        }

        // 创建Toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: var(--bg-glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-natural);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
            box-shadow: var(--shadow-soft);
            transform: translateX(100%);
            transition: all 0.3s ease-out;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;

        Toast.container.appendChild(toast);

        // 动画进入
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // 自动消失
        if (duration > 0) {
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }

        return toast;
    }

    static success(message, duration) {
        return Toast.show(message, 'success', duration);
    }

    static error(message, duration) {
        return Toast.show(message, 'error', duration);
    }

    static warning(message, duration) {
        return Toast.show(message, 'warning', duration);
    }

    static info(message, duration) {
        return Toast.show(message, 'info', duration);
    }
}

// 加载组件
export class Loading extends UIComponent {
    constructor(selector, options = {}) {
        super(selector);
        this.options = {
            message: '加载中...',
            spinner: true,
            ...options
        };
    }

    show(message = this.options.message) {
        if (!this.element) return this;

        const content = `
            <div class="loading-content" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                padding: 2rem;
            ">
                ${this.options.spinner ? `
                    <div class="loading-spinner" style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid var(--border-natural);
                        border-top: 3px solid var(--forest-green);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                ` : ''}
                <div class="loading-message" style="
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                ">${message}</div>
            </div>
        `;

        this.element.innerHTML = content;
        this.element.style.display = 'flex';
        AnimationUtils.fadeIn(this.element, 200);

        return this;
    }

    hide() {
        if (!this.element) return this;

        AnimationUtils.fadeOut(this.element, 200);
        return this;
    }

    setMessage(message) {
        const messageElement = this.element?.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        return this;
    }
}

// 工具函数
export const UIUtils = {
    // 平滑滚动到元素
    scrollToElement(element, offset = 0) {
        if (!element) return;

        const targetPosition = element.offsetTop + offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // 获取元素在视口中的位置
    getElementPosition(element) {
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
        };
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 格式化时间
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};
