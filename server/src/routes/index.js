const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // 引入路径处理模块
const fs = require('fs');
const authController = require('../controllers/authController');
const merchantController = require('../controllers/merchantController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const clientController = require('../controllers/clientController');
const clientAuthController = require('../controllers/clientAuthController'); // 引入新控制器

// 配置 multer 图片上传
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // 如果没有 uploads 文件夹则自动创建
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 图片上传接口
router.post('/upload', authMiddleware(), upload.single('file'), (req, res) => {
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  require('../utils/response').sendResponse(res, 200, '上传成功', { url: fileUrl });
});

// 公开：认证接口
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// 商户接口 (拦截校验 merchant)
router.post('/merchant/hotels', authMiddleware(['merchant']), merchantController.createHotel);
router.get('/merchant/hotels', authMiddleware(['merchant']), merchantController.getMyHotels);

// 管理员接口 (拦截校验 admin)
router.put('/admin/hotels/:id/audit', authMiddleware(['admin']), adminController.auditHotel);
router.put('/admin/hotels/:id/status', authMiddleware(['admin']), adminController.toggleOnlineStatus);

router.get('/admin/hotels', authMiddleware(['admin']), adminController.getAllHotels);

// 客户接口 (公开访问，无需认证)
router.get('/client/hotels', clientController.getHotels);
router.get('/admin/users', authMiddleware(['admin']), adminController.getAllUsers); // 管理员查用户
router.get('/merchant/orders', authMiddleware(['merchant']), merchantController.getMyOrders); // 商户查订单
// 客户接口 (公开访问，无需认证)
router.get('/client/hotels', clientController.getHotels);
// 👇 新增这一行：获取单个详情
router.get('/client/hotels/:id', clientController.getHotelById);
// 👇 在 商户路由 区域追加：
router.post('/merchant/rooms', authMiddleware(['merchant']), merchantController.addRoom);
router.get('/merchant/hotels/:hotelId/rooms', authMiddleware(['merchant']), merchantController.getRoomsByHotel);

// 👇 在 客户接口 区域追加：
router.get('/client/hotels/:hotelId/rooms', clientController.getHotelRooms); // 获取房型
router.post('/client/orders', clientController.createOrder); // 提交订单
router.get('/client/orders', clientController.getMyOrders);
router.delete('/client/orders/:id', clientController.deleteUserOrder);

router.put('/merchant/orders/:id/audit', authMiddleware(['merchant']), merchantController.auditOrder);
router.post('/client/register', clientAuthController.register);
router.post('/client/login', clientAuthController.login);
router.delete('/merchant/orders/:id', authMiddleware(['merchant']), merchantController.deleteOrder);
router.put('/merchant/hotels/:id', authMiddleware(['merchant']), merchantController.updateHotel);

// 在商户路由区域追加：
router.put('/merchant/hotels/:id/delete_request', authMiddleware(['merchant']), merchantController.requestDeleteHotel);

// 在管理员路由区域追加：
router.delete('/admin/users/:id', authMiddleware(['admin']), adminController.deleteUser);
router.post('/admin/users', authMiddleware(['admin']), adminController.createUser);
module.exports = router;// 👇 新增这一行：管理员强制删除酒店
router.delete('/admin/hotels/:id', authMiddleware(['admin']), adminController.forceDeleteHotel);