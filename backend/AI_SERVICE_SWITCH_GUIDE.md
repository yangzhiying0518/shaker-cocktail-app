# AI服务配置指南

## 概述

Shaker后端使用火山引擎作为AI服务提供商，提供高性能的鸡尾酒推荐服务。

## 支持的AI服务

### 火山引擎 (Volcano Engine)
- **提供商**: 字节跳动火山引擎
- **特点**: 企业级AI大模型服务
- **适用场景**: 高性能、可扩展的AI推荐服务

## 配置指南

### 环境变量配置

在 `.env` 文件中设置火山引擎配置：

```bash
# AI服务提供商
AI_PROVIDER=volcano

# 火山引擎配置
VOLCANO_API_KEY=your_volcano_api_key
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
VOLCANO_MODEL_ID=your_model_id
```

### 启动服务

```bash
# 启动Shaker后端服务
npm start
```

## 配置说明

### 火山引擎配置参数

| 参数 | 说明 | 必需 | 示例 |
|------|------|------|------|
| `VOLCANO_API_KEY` | 火山引擎API密钥 | ✅ | `volcano_xxxxxx` |
| `VOLCANO_ENDPOINT` | API端点 | ❌ | `https://ark.cn-beijing.volces.com/api/v3` |
| `VOLCANO_MODEL_ID` | 模型ID | ❌ | `ep-20241201122047-9vlmr` |

## 服务特性

| 特性 | 火山引擎 |
|------|----------|
| **响应速度** | 极快 |
| **准确度** | 很高 |
| **稳定性** | 非常稳定 |
| **成本** | 灵活 |
| **自定义能力** | 高 |
| **企业级功能** | 完整 |

## 验证配置

### 1. 检查服务状态

启动服务后，查看控制台输出：

```
🤖 使用AI服务提供商: VOLCANO
🌋 火山引擎模型: your_model_id
```

### 2. 测试API调用

```bash
curl -X POST http://localhost:3001/api/health
```

预期响应：
```json
{
  "status": "ok",
  "message": "Shaker API服务正常运行",
  "timestamp": "2025-01-08T..."
}
```

### 3. 测试推荐功能

```bash
curl -X POST http://localhost:3001/api/recommend \
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
      "acidity": "适中",
      "style": "清爽"
    }
  }'
```

## 故障排除

### 常见问题

1. **API密钥错误**
   - 检查 `VOLCANO_API_KEY` 是否正确
   - 确认API密钥有效且未过期

2. **模型ID错误**
   - 验证 `VOLCANO_MODEL_ID` 是否存在
   - 检查模型权限设置

3. **网络连接问题**
   - 确认服务器可以访问火山引擎API端点
   - 检查防火墙和代理设置

4. **响应超时**
   - 检查网络连接稳定性
   - 考虑调整超时设置

### 日志分析

查看详细日志：

```bash
# 查看服务日志
tail -f backend/logs/info.log

# 查看错误日志
tail -f backend/logs/error.log
```

## 性能优化

### 推荐配置

- **生产环境**: 使用专用的火山引擎模型ID
- **开发环境**: 可以使用共享模型进行测试
- **缓存策略**: 启用智能缓存以提高响应速度

### 监控指标

- API响应时间
- 推荐成功率
- 错误率统计
- 缓存命中率

---

**注意**: 确保在生产环境中妥善保护API密钥，不要将其提交到版本控制系统中。