# Shaker - 智能鸡尾酒推荐系统

基于AI的个性化鸡尾酒推荐Web应用

## 🍸 项目介绍

Shaker是一个智能鸡尾酒推荐系统，通过AI驱动的个性化推荐算法，根据用户的场景、心情、可用材料和口味偏好，智能推荐最适合的鸡尾酒配方。

## ✨ 核心功能

- 🎯 **场景匹配** - 根据聚会、约会、独处等不同场景推荐
- 🎨 **个性化推荐** - 基于心情、口味偏好智能匹配
- 📖 **详细指导** - 完整配方和制作步骤指导
- 🤖 **AI驱动** - 集成Coze API实现智能推荐

## 🏗️ 技术架构

### 前端
- **框架**: 原生HTML/CSS/JavaScript
- **样式**: 响应式设计，支持移动端
- **部署**: Vercel

### 后端
- **框架**: Node.js + Express
- **AI服务**: Coze API
- **部署**: Railway

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/yangzhiying0518/shaker-cocktail-app.git
cd shaker-cocktail-app
```

2. **启动后端**
```bash
cd backend
npm install
npm start
```

3. **启动前端**
```bash
cd frontend
npm install
npm start
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

### 环境变量配置

在 `backend` 目录创建 `.env` 文件：
```env
NODE_ENV=development
PORT=3001
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_coze_bot_id
COZE_API_BASE_URL=https://api.coze.cn
FRONTEND_URL=http://localhost:3000
```

## 📂 项目结构

```
shaker-cocktail-app/
├── backend/           # 后端服务
│   ├── server.js     # 主服务文件
│   ├── package.json  # 依赖配置
│   └── node_modules/ # 依赖包
├── frontend/          # 前端应用
│   ├── index.html    # 主页面
│   ├── server.js     # 静态服务器
│   └── package.json  # 依赖配置
├── 文档/              # 项目文档
└── test_system.js     # 系统测试
```

## 🔧 API接口

### 获取推荐
```
POST /api/recommend
```

请求参数：
```json
{
  "scene": "聚会派对",
  "moods": ["开心愉悦", "兴奋激动"],
  "ingredients": {
    "spirits": ["伏特加", "威士忌"],
    "mixers": ["柠檬汁", "苏打水", "冰块"],
    "tools": ["调酒器", "量杯"]
  },
  "preferences": {
    "alcohol_level": "中度",
    "sweetness": "微甜",
    "acidity": "中酸",
    "style": "清爽"
  }
}
```

### 健康检查
```
GET /api/health
```

### 获取材料列表
```
GET /api/ingredients
```

## 🌐 在线体验

- **前端应用**: [即将部署]
- **API文档**: [即将提供]

## 📝 开发计划

- [x] 基础功能实现
- [x] AI推荐集成
- [x] 响应式界面
- [ ] 用户系统
- [ ] 收藏功能
- [ ] 社交分享

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题请联系：yangzhiying0518@gmail.com
