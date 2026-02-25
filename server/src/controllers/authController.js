const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return require('../utils/response').sendResponse(res, 400, '该用户名已被注册');
    }

    // 👈 2. 核心修复：先加密，再存入
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword, // 存入加密后的密码
      role: 'merchant' // 强制锁定为商户
    });

    await user.save();
    require('../utils/response').sendResponse(res, 200, '注册成功');
  } catch (error) {
    console.error('注册错误:', error);
    require('../utils/response').sendResponse(res, 500, '注册失败');
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendResponse(res, 401, '账号或密码错误');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    sendResponse(res, 200, '登录成功', { token, role: user.role }); 
  } catch (error) {
    sendResponse(res, 500, '服务器内部错误');
  }
};