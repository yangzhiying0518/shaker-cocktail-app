const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static(__dirname));

// 默认路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 前端服务已启动!`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🎉 Shaker应用已准备就绪!`);
});
