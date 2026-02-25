const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/response');

const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return sendResponse(res, 401, '未提供 Token，请先登录');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      
      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return sendResponse(res, 403, '权限不足，拒绝访问');
      }
      next();
    } catch (err) {
      sendResponse(res, 401, 'Token 无效或已过期');
    }
  };
};
module.exports = authMiddleware;