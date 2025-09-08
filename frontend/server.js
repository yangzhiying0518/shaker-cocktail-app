const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 配置静态文件服务 - 强健的生产环境配置
app.use('/css', express.static(path.join(__dirname, 'css'), {
    setHeaders: (res, filePath) => {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        console.log(`✅ 服务CSS文件: ${filePath}`);
    }
}));

app.use('/js', express.static(path.join(__dirname, 'js'), {
    setHeaders: (res, filePath) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        console.log(`✅ 服务JS文件: ${filePath}`);
    }
}));

// 其他静态文件（图片、字体等）
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        // 设置通用缓存
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        console.log(`📁 服务静态文件: ${filePath}`);
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
