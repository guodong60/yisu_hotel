const Member = require('../models/Member');
const jwt = require('jsonwebtoken');

const SECRET = 'yisu_mobile_secret_key'; // 密钥

exports.register = async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    
    // 增加了一层保护：检查用户名是否已经被注册过
    const existUser = await Member.findOne({ username });
    if (existUser) {
      return require('../utils/response').sendResponse(res, 400, '用户名已被注册，请换一个');
    }

    const member = await Member.create({ username, password, phone });
    require('../utils/response').sendResponse(res, 200, '注册成功');
  } catch (error) {
    console.error('注册报错:', error);
    require('../utils/response').sendResponse(res, 500, '注册失败，请检查服务器日志');
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const member = await Member.findOne({ username, password });
    
    // 账号密码不对，返回 401
    if (!member) {
      return require('../utils/response').sendResponse(res, 401, '账号或密码错误');
    }
    
    // 👇 修复了之前的语法错误，并生成真正的 token
    const token = jwt.sign({ id: member._id, username: member.username }, SECRET);
    
    require('../utils/response').sendResponse(res, 200, '登录成功', { token, userInfo: member });
  } catch (error) {
    console.error('登录报错:', error);
    require('../utils/response').sendResponse(res, 500, '登录模块出现异常');
  }
};