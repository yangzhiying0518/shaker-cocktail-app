const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 配置静态文件服务 - 修复MIME类型问题
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        // 确保CSS文件正确的MIME类型
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        // 确保JS文件正确的MIME类型
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        // 设置缓存头
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

// 路由配置
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 备用路由 - 原版本
app.get('/original', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 优化版本
app.get('/optimized', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-optimized.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 前端服务已启动!`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🎉 Shaker应用已准备就绪!`);
});
