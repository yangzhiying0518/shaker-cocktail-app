# Shaker API接口文档

## 📋 文档信息
| 项目 | 内容 |
|------|------|
| **产品名称** | Shaker |
| **版本号** | v2.0 - 森林主题版本 |
| **文档版本** | v2.0 |
| **创建日期** | 2025-01-08 |
| **API基础URL** | https://shaker-cocktail-app-production.up.railway.app |
| **文档状态** | ✅ 已完成 |

---

## 🌐 API概览

Shaker v2.0 提供RESTful API接口，支持智能鸡尾酒推荐、流式响应、缓存优化等功能。

### 🔗 基础信息
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **超时时间**: 30秒（推荐接口50秒）

### 🔐 认证方式
- 无需认证，公开API
- 内置频率限制：每IP每15分钟100次请求

---

## 📡 API接口列表

### 1. 健康检查接口

#### `GET /api/health`
检查API服务状态

**请求示例:**
```bash
curl -X GET "https://shaker-cocktail-app-production.up.railway.app/api/health"
```

**响应示例:**
```json
{
  "status": "ok",
  "message": "Shaker API服务正常运行",
  "timestamp": "2025-01-08T10:30:00.000Z",
  "environment": "production"
}
```

---

### 2. 获取材料列表接口

#### `GET /api/ingredients`
获取所有可用的调酒材料分类

**请求示例:**
```bash
curl -X GET "https://shaker-cocktail-app-production.up.railway.app/api/ingredients"
```

**响应示例:**
```json
{
  "spirits": [
    "威士忌", "伏特加", "金酒", "朗姆酒", "龙舌兰", 
    "白兰地", "利口酒", "香槟", "啤酒", "清酒"
  ],
  "mixers": [
    "柠檬汁", "青柠汁", "橙汁", "蔓越莓汁", "菠萝汁",
    "苏打水", "汤力水", "姜汁汽水", "可乐", "薄荷叶",
    "糖浆", "蜂蜜", "盐", "胡椒", "肉桂"
  ],
  "tools": [
    "调酒器", "量杯", "搅拌棒", "滤网", "开瓶器",
    "冰桶", "柠檬刀", "装饰签", "高球杯", "马提尼杯"
  ]
}
```

---

### 3. 智能推荐接口

#### `POST /api/recommend`
基于用户输入生成鸡尾酒推荐

**请求参数:**
```json
{
  "scene": "聚会派对",
  "moods": ["春日愉悦", "夏日激情"],
  "ingredients": {
    "spirits": ["威士忌", "伏特加"],
    "mixers": ["柠檬汁", "苏打水"],
    "tools": ["调酒器", "量杯"]
  },
  "preferences": {
    "alcohol_level": "中度",
    "sweetness": "微甜",
    "acidity": "适中",
    "style": "清爽"
  },
  "special_requirements": "希望颜值高一些"
}
```

**请求示例:**
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
      "acidity": "适中",
      "style": "清爽"
    }
  }'
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "priority": "最适合",
        "name": {
          "chinese": "威士忌酸",
          "english": "Whiskey Sour"
        },
        "glassType": "🥃",
        "reason": "秋叶宁静的心境配上威士忌的醇厚，柠檬的清香带来温暖的平衡感",
        "recipe": {
          "ingredients": [
            {"name": "威士忌", "amount": "60ml"},
            {"name": "柠檬汁", "amount": "30ml"},
            {"name": "糖浆", "amount": "15ml"}
          ],
          "tools": ["调酒器", "量杯", "滤网"],
          "difficulty": "简单"
        },
        "instructions": [
          "在调酒器中加入威士忌、柠檬汁和糖浆",
          "加入冰块，用力摇晃15秒",
          "通过滤网倒入岩石杯中",
          "用柠檬片装饰即可"
        ],
        "taste_profile": "酸甜平衡，威士忌的醇厚与柠檬的清香完美融合",
        "visual": "金黄色泽，柠檬片装饰，简约优雅",
        "prep_time": "3分钟",
        "alcohol_content": "18%",
        "best_time": "傍晚独处时光"
      }
    ]
  },
  "cached": false,
  "responseTime": 8500
}
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| scene | string | 否 | 使用场景：聚会派对/浪漫约会/独处放松/商务场合/餐前餐后/深夜时光 |
| moods | array | 否 | 心情状态：春日愉悦/雨后忧郁/夏日激情/秋叶宁静/山峰自信/深林沉思 |
| ingredients | object | 否 | 可用材料 |
| ingredients.spirits | array | 否 | 基酒列表 |
| ingredients.mixers | array | 否 | 调料列表 |
| ingredients.tools | array | 否 | 工具列表 |
| preferences | object | 否 | 偏好设置 |
| preferences.alcohol_level | string | 否 | 酒精度：低度/中度/高度 |
| preferences.sweetness | string | 否 | 甜度：不甜/微甜/很甜 |
| preferences.acidity | string | 否 | 酸度：不酸/适中/很酸 |
| preferences.style | string | 否 | 风格：清爽/浓郁/顺滑/刺激 |
| special_requirements | string | 否 | 特殊要求 |

---

### 4. 流式推荐接口

#### `POST /api/stream-recommendation`
实时流式鸡尾酒推荐，支持Server-Sent Events

**请求参数:** 同 `/api/recommend`

**请求示例:**
```bash
curl -X POST "https://shaker-cocktail-app-production.up.railway.app/api/stream-recommendation" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "scene": "浪漫约会",
    "moods": ["春日愉悦"]
  }'
```

**响应格式:** Server-Sent Events (SSE)

**响应事件类型:**

1. **连接成功**
```
data: {"type":"connected","message":"Shaker开始为您分析..."}
```

2. **分段分析**
```
data: {"type":"segmented_analysis","segments":[{"title":"理解你的场景选择","content":"浪漫约会的美好时光值得精心调制","focus":"scene"}]}
```

3. **阶段转换**
```
data: {"type":"phase_transition","phase":"recommendations","message":"分析完成，开始调制推荐..."}
```

4. **推荐结果**
```
data: {"type":"recommendation","index":0,"content":{"recommendations":[...]},"glassType":"🍸"}
```

5. **完成信号**
```
data: {"type":"complete","message":"推荐完成"}
```

6. **错误处理**
```
data: {"type":"error","message":"推荐服务暂时不可用","source":"ai_service_error"}
```

---

### 5. 系统统计接口

#### `GET /api/stats`
获取系统运行状态和性能统计

**请求示例:**
```bash
curl -X GET "https://shaker-cocktail-app-production.up.railway.app/api/stats"
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "cache": {
      "totalEntries": 156,
      "hitRate": "78.5%",
      "memoryUsage": "12.3MB",
      "oldestEntry": "2025-01-08T09:15:30.000Z"
    },
    "api": {
      "totalRequests": 1247,
      "recentRequests": 89,
      "successRate": "96.8%",
      "cacheHitRate": "45.2%",
      "avgResponseTime": "3200ms",
      "lastUpdated": "2025-01-08T10:30:00.000Z"
    },
    "system": {
      "uptime": 86400,
      "memory": {
        "rss": 67108864,
        "heapTotal": 45088768,
        "heapUsed": 32505856,
        "external": 1089536
      },
      "nodeVersion": "v18.17.0",
      "platform": "linux"
    },
    "ai": {
      "provider": "VOLCANO",
      "connectionPoolReady": true
    }
  },
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

---

### 6. 缓存管理接口

#### `GET /api/cache/stats`
获取缓存统计信息

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalEntries": 156,
    "hitRate": "78.5%",
    "memoryUsage": "12.3MB",
    "oldestEntry": "2025-01-08T09:15:30.000Z"
  },
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

#### `POST /api/cache/clear`
清空所有缓存

**响应示例:**
```json
{
  "success": true,
  "message": "缓存已清空",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

---

## 🚨 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息",
  "responseTime": 1500
}
```

### 常见错误码

| HTTP状态码 | 错误类型 | 说明 |
|------------|----------|------|
| 400 | Bad Request | 请求参数错误 |
| 429 | Too Many Requests | 请求频率超限 |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | AI服务不可用 |

### 错误示例
```json
{
  "success": false,
  "error": "推荐服务暂时不可用",
  "message": "AI服务响应超时",
  "responseTime": 50000
}
```

---

## 🔧 技术特性

### 性能优化
- **多层缓存**: 内存缓存 + HTTP缓存
- **请求去重**: 防止重复请求
- **流式响应**: 减少等待时间
- **连接池**: 优化网络连接

### 可靠性保障
- **错误恢复**: 完善的降级机制
- **超时处理**: 合理的超时设置
- **重试机制**: 智能重试策略
- **监控告警**: 实时性能监控

### 扩展性设计
- **服务工厂**: 支持多AI服务商
- **模块化架构**: 易于功能扩展
- **配置化**: 运行时配置切换

---

## 📊 使用统计

### 推荐质量
- **推荐成功率**: ≥95%
- **用户满意度**: ≥85%
- **响应时间**: 平均8秒

### 系统性能
- **API可用性**: ≥99%
- **缓存命中率**: ≥70%
- **并发支持**: 100+用户

---

## 🔄 版本更新

### v2.0 (2025-01-08)
- ✅ 新增流式推荐接口
- ✅ 优化缓存系统
- ✅ 增加系统统计接口
- ✅ 完善错误处理

### v1.0 (2024-08-28)
- ✅ 基础推荐接口
- ✅ 材料列表接口
- ✅ 健康检查接口

---

**联系方式**: 如有问题请联系开发团队
**更新频率**: 随功能迭代实时更新
