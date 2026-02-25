require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes/index');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // 让前端能通过 /uploads/xxx.png 访问图片
connectDB();

app.get('/', (req, res) => {
    res.send('🎉 欢迎来到易宿酒店预订平台 API 接口服务！系统运行正常！');
  });
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务端已启动: http://localhost:${PORT}`);
});