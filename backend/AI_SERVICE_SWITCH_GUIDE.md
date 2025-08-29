# AI服务切换指南

## 概述

Shaker后端现已支持多种AI服务提供商，您可以轻松在不同的AI服务之间切换，无需修改代码。

## 支持的AI服务

### 1. Coze API (默认)
- **提供商**: 字节跳动 Coze 平台
- **特点**: 专业的AI聊天机器人平台
- **适用场景**: 稳定的推荐服务

### 2. 火山引擎 (Volcano Engine)
- **提供商**: 字节跳动火山引擎
- **特点**: 企业级AI大模型服务
- **适用场景**: 高性能、可扩展的AI服务

## 快速切换指南

### 方式一：环境变量切换

1. **使用Coze服务** (默认)
   ```bash
   # 在 .env 文件中设置
   AI_PROVIDER=coze
   COZE_API_KEY=your_coze_api_key
   COZE_BOT_ID=your_bot_id
   COZE_API_BASE_URL=https://api.coze.cn
   ```

2. **切换到火山引擎**
   ```bash
   # 在 .env 文件中设置
   AI_PROVIDER=volcano
   VOLCANO_API_KEY=your_volcano_api_key
   VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
   VOLCANO_MODEL_ID=your_model_id
   ```

### 方式二：运行时切换

```bash
# 启动时指定AI服务提供商
AI_PROVIDER=volcano npm start

# 或者
AI_PROVIDER=coze npm start
```

## 配置说明

### Coze配置参数

| 参数 | 说明 | 必需 | 示例 |
|------|------|------|------|
| `COZE_API_KEY` | Coze API密钥 | ✅ | `coze_xxxxxx` |
| `COZE_BOT_ID` | 机器人ID | ✅ | `7234567890` |
| `COZE_API_BASE_URL` | API基础URL | ❌ | `https://api.coze.cn` |

### 火山引擎配置参数

| 参数 | 说明 | 必需 | 示例 |
|------|------|------|------|
| `VOLCANO_API_KEY` | 火山引擎API密钥 | ✅ | `volcano_xxxxxx` |
| `VOLCANO_ENDPOINT` | API端点 | ❌ | `https://ark.cn-beijing.volces.com/api/v3` |
| `VOLCANO_MODEL_ID` | 模型ID | ❌ | `ep-20241201122047-9vlmr` |

## 服务特性对比

| 特性 | Coze | 火山引擎 |
|------|------|----------|
| **响应速度** | 快速 | 极快 |
| **准确度** | 高 | 很高 |
| **稳定性** | 稳定 | 非常稳定 |
| **成本** | 中等 | 灵活 |
| **自定义能力** | 中等 | 高 |
| **企业级功能** | 基础 | 完整 |

## 切换步骤详解

### 1. 从Coze切换到火山引擎

```bash
# 1. 停止当前服务
pm2 stop shaker-backend
# 或者 Ctrl+C 停止开发服务器

# 2. 修改环境变量
echo "AI_PROVIDER=volcano" >> .env
echo "VOLCANO_API_KEY=your_key_here" >> .env
echo "VOLCANO_MODEL_ID=your_model_id" >> .env

# 3. 重启服务
npm start
```

### 2. 从火山引擎切换回Coze

```bash
# 1. 停止当前服务
pm2 stop shaker-backend

# 2. 修改环境变量
sed -i 's/AI_PROVIDER=volcano/AI_PROVIDER=coze/g' .env

# 3. 重启服务
npm start
```

## 验证切换结果

### 1. 检查日志输出

启动服务后，在控制台查看：
```
🤖 使用AI服务提供商: VOLCANO
```
或
```
🤖 使用AI服务提供商: COZE
```

### 2. 测试API调用

```bash
curl -X POST http://localhost:3001/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "独处放松",
    "moods": ["平静放松"],
    "ingredients": {
      "spirits": ["威士忌"],
      "mixers": ["柠檬汁"],
      "tools": ["调酒器"]
    },
    "preferences": {
      "alcohol_level": "中度",
      "sweetness": "微甜",
      "acidity": "适中",
      "style": "清爽"
    }
  }'
```

### 3. 检查推荐响应

不同AI服务的响应格式完全一致，确保前端无需任何修改。

## 故障排除

### 常见问题

1. **切换后无响应**
   - 检查新的API密钥是否正确
   - 确认网络连接到对应的AI服务端点
   - 查看错误日志定位具体问题

2. **推荐质量下降**
   - 不同AI服务的风格可能略有差异
   - 可以通过调整Prompt来优化结果
   - 查看降级方案是否被触发

3. **性能问题**
   - 检查API响应时间
   - 监控服务器资源使用情况
   - 考虑调整超时设置

### 调试模式

```bash
# 启用详细日志
DEBUG=shaker:* npm start

# 或设置日志级别
LOG_LEVEL=debug npm start
```

## 最佳实践

1. **生产环境切换**
   - 在低峰期进行切换
   - 提前准备回滚方案
   - 监控切换后的服务状态

2. **配置管理**
   - 使用配置管理工具
   - 定期备份环境配置
   - 文档化所有配置变更

3. **监控告警**
   - 设置AI服务可用性监控
   - 配置响应时间告警
   - 监控错误率变化

## 技术架构

### 设计模式

采用**工厂模式**和**策略模式**，确保：
- 统一的接口规范
- 灵活的服务切换
- 良好的可扩展性

### 代码结构

```
backend/services/
├── ai-service-factory.js    # AI服务工厂
├── base-ai-service.js       # 基础抽象类
├── coze-service.js          # Coze服务实现
└── volcano-service.js       # 火山引擎服务实现
```

### 扩展新服务

如需添加新的AI服务提供商：

1. 继承`BaseAIService`类
2. 实现`getCocktailRecommendation`方法
3. 在工厂类中注册新服务
4. 更新配置文档

---

*最后更新: 2024-08-29*  
*版本: v1.0*
