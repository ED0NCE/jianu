const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
// 中间件配置
app.use(cors()); // 解决跨域问题
app.use(bodyParser.json()); // 解析JSON请求体

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});