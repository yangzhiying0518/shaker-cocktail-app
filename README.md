# 🌿 Shaker - 温暖的森林调酒师

> **在我的小脑袋瓜里，有你最完美的那一杯，它懂你，让我来告诉你。**

Shaker是一个基于AI的智能鸡尾酒推荐系统，采用温暖的森林主题设计，通过4阶段故事性分析为用户提供个性化的鸡尾酒推荐体验。

## ✨ 产品特色

### 🌿 森林主题设计
- **温暖自然**：完整的绿色调色彩系统，营造治愈氛围
- **玻璃态效果**：现代化的视觉设计，森林背景动画
- **响应式设计**：完美适配移动端和桌面端

### 📱 垂直滚动体验
- **连续滚动**：移除步骤按钮，实现流畅的垂直滚动体验
- **智能进度**：右侧进度指示器智能跟随用户滚动
- **平滑动画**：CSS3动画和Intersection Observer优化

### 💚 混合分析架构
- **本地分析**：即时生成个性化分析，无等待感
- **云端推荐**：火山引擎AI提供深度推荐
- **故事性体验**：4阶段情感递进分析（回顾→思考→期待→结局）

### 🎯 智能推荐
- **多维度分析**：场景、心情、材料、偏好综合考虑
- **个性化生成**：基于用户具体选择的温暖文案
- **专业配方**：详细的材料用量和制作步骤

## 🚀 快速开始

### 在线体验
访问 [Shaker在线版本](https://shaker-forest-theme.vercel.app) 立即体验

### 本地运行

#### 前端启动
```bash
cd frontend
npm install
npm start
# 访问 http://localhost:3000
```

#### 后端启动
```bash
cd backend
npm install
npm start
# API服务运行在 http://localhost:3001
```

## 🏗️ 技术架构

### 前端技术栈
- **核心技术**：Vanilla JavaScript + HTML5 + CSS3
- **设计系统**：森林主题CSS变量系统
- **状态管理**：AppState类 + 观察者模式
- **动画系统**：CSS3动画 + Intersection Observer

### 后端技术栈
- **Web框架**：Node.js + Express
- **AI服务**：火山引擎API（支持多服务商切换）
- **缓存系统**：内存缓存 + HTTP缓存
- **性能优化**：请求去重 + 连接池管理

### 部署方案
- **前端**：Vercel（全球CDN加速）
- **后端**：Railway（容器化部署）
- **域名**：自定义域名 + HTTPS

## 📁 项目结构

```
shaker/
├── frontend/                 # 前端应用
│   ├── index.html           # 主页面
│   ├── css/
│   │   └── styles.css       # 森林主题样式
│   └── js/
│       ├── app-state.js     # 状态管理
│       ├── ui-components.js # UI组件
│       ├── local-analysis.js # 本地分析
│       ├── story-analysis-generator.js # 故事性分析
│       ├── thought-bubble-generator.js # 思考气泡
│       └── api-client.js    # API通信
├── backend/                 # 后端服务
│   ├── server.js           # 主服务器
│   ├── services/
│   │   ├── ai-service-factory.js # AI服务工厂
│   │   ├── volcano-service.js    # 火山引擎服务
│   │   └── stream-service.js     # 流式服务
│   └── utils/
│       ├── cache-manager.js      # 缓存管理
│       └── connection-pool.js    # 连接池
├── 文档/                    # 项目文档
│   ├── 需求文档.md
│   ├── 技术规格.md
│   ├── API接口文档.md
│   └── 项目规划.md
└── README.md               # 项目说明
```

## 🎮 使用指南

### 基本流程
1. **选择时光**：6种场景（聚会派对、浪漫约会、独处放松等）
2. **描述心情**：6种森林主题心情（春日愉悦、秋叶宁静等）
3. **选择材料**：基酒、调味料、工具三大分类
4. **设置偏好**：酒精度、甜度、酸度滑块调节
5. **特殊要求**：文本输入或快捷标签选择
6. **享受分析**：4阶段故事性分析体验
7. **获得推荐**：3个个性化鸡尾酒推荐

### 功能特色
- **完全自由输入**：支持从零开始到详细引导的多种模式
- **即时反馈**：本地分析提供即时的个性化反馈
- **温暖体验**：Shaker像朋友一样理解和关怀用户
- **专业推荐**：详细的配方、步骤和制作指导

## 🔧 API接口

### 主要接口
- `GET /api/health` - 健康检查
- `GET /api/ingredients` - 获取材料列表
- `POST /api/recommend` - 智能推荐
- `POST /api/stream-recommendation` - 流式推荐
- `GET /api/stats` - 系统统计

### 请求示例
```bash
curl -X POST "https://shaker-cocktail-app-production.up.railway.app/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "独处放松",
    "moods": ["秋叶宁静"],
    "ingredients": {
      "spirits": ["威士忌"],
      "mixers": ["柠檬汁"],
      "tools": ["调酒器"]
    },
    "preferences": {
      "alcohol_level": "中度",
      "sweetness": "微甜",
      "acidity": "适中"
    }
  }'
```

详细API文档请查看 [API接口文档](文档/API接口文档.md)

## 📊 性能指标

### 用户体验
- **页面加载**：< 3秒
- **操作响应**：< 200ms
- **推荐速度**：平均8秒
- **缓存命中率**：> 70%

### 系统性能
- **API可用性**：> 99%
- **推荐成功率**：> 95%
- **并发支持**：100+用户
- **错误恢复**：完善的降级机制

## 🎨 设计系统

### 森林色彩
- **主色调**：深森林绿 (#1a2e1a) 到 温暖浅绿 (#8fbc8f)
- **背景色**：温暖米色 (#f8f5f0) 到 森林绿 (#e8f5e8)
- **强调色**：叶片绿 (#9acd32) 和 温暖棕 (#8b4513)

### 动画效果
- **森林背景**：叶片摇摆动画 (forestSway)
- **月光效果**：闪烁动画 (leafDance)
- **卡片交互**：悬停和点击动画
- **滚动跟随**：进度指示器智能跟随

## 🔄 版本历史

### v2.0 (2025-01-08) - 森林主题版
- ✅ 完整的森林主题设计系统
- ✅ 垂直滚动体验优化
- ✅ 本地分析+云端推荐混合架构
- ✅ 4阶段故事性分析体验
- ✅ 火山引擎AI服务集成
- ✅ 多层缓存和性能优化

### v1.0 (2024-08-28) - MVP版本
- ✅ 基础推荐功能
- ✅ 用户输入界面
- ✅ AI推荐集成
- ✅ 结果展示

## 🤝 贡献指南

### 开发环境
1. Node.js 18+
2. npm 或 yarn
3. 现代浏览器（Chrome 90+）

### 代码规范
- JavaScript ES6+
- CSS3 变量系统
- 语义化HTML5
- 响应式设计

### 提交规范
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 样式
- refactor: 重构
- test: 测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **项目负责人**：郭锐
- **技术支持**：通过 GitHub Issues
- **产品反馈**：欢迎提出改进建议

---

**🌿 让Shaker为你调制每一杯完美的鸡尾酒 🍸**
