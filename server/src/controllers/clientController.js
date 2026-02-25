const Hotel = require('../models/Hotel');
const Room = require('../models/Room'); // 👈 新增：引入房型表
const Order = require('../models/Order');
const Member = require('../models/Member'); // 引入 Member 表获取真实手机号
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/response');

// 1. 获取酒店列表（支持关键字模糊搜索，并动态计算最低价）
exports.getHotels = async (req, res) => {
  try {
    const { keyword } = req.query; 
    let query = { status: '通过', isDeleted: false };
    
    if (keyword) {
      query.$or = [
        { nameCn: { $regex: keyword, $options: 'i' } }, 
        { address: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 使用 .lean() 把 Mongoose 数据对象转换成纯 JS 对象，方便我们追加字段
    const hotels = await Hotel.find(query).sort({ createdAt: -1 }).lean(); 

    // 👈 核心逻辑：遍历每一个酒店，去查它的专属房型并计算最低价
    const hotelsWithPrice = await Promise.all(hotels.map(async (hotel) => {
      const rooms = await Room.find({ hotelId: hotel._id });
      let minPrice = 0;
      if (rooms.length > 0) {
        // 提取所有房型的价格并找出最小值
        minPrice = Math.min(...rooms.map(r => r.price));
      }
      return { ...hotel, minPrice }; // 把计算出的 minPrice 拼接到酒店信息里发给前端
    }));

    sendResponse(res, 200, '获取成功', hotelsWithPrice);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, '获取酒店列表失败');
  }
};

// 2. 新增：获取单个酒店详情
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, status: '通过', isDeleted: false });
    if (!hotel) return sendResponse(res, 404, '酒店不存在或已下线');
    sendResponse(res, 200, '获取成功', hotel);
  } catch (error) {
    sendResponse(res, 500, '获取酒店详情失败');
  }
};


// 新增：移动端获取某酒店的所有房型
exports.getHotelRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    require('../utils/response').sendResponse(res, 200, '获取成功', rooms);
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '获取房型失败');
  }
};

// 新增：移动端用户提交订单

const getMemberFromToken = (req) => {
  const raw = req.headers.authorization;
  if (!raw) return null;
  const token = raw.replace('Bearer ', '');
  try {
    return jwt.verify(token, 'yisu_mobile_secret_key');
  } catch (e) {
    return null;
  }
};

exports.createOrder = async (req, res) => {
  try {
    const user = getMemberFromToken(req);
    if (!user) return require('../utils/response').sendResponse(res, 401, '请先登录');

    // 👈 核心修改：从前端传来的请求体中解构出真实日期和地址
    const { merchantId, hotelName, hotelAddress, roomName, price, checkInDate, checkOutDate } = req.body;

    const existingOrder = await Order.findOne({
      memberId: user.id, hotelName, roomName, status: '待审核'
    });
    if (existingOrder) {
      return require('../utils/response').sendResponse(res, 400, '您已预订该房型且正在等待审核，请勿重复提交！');
    }

    const memberData = await Member.findById(user.id);

    const order = new Order({
      merchantId,
      memberId: user.id,
      hotelName,
      hotelAddress, // 👈 存入地址
      roomName,
      customerName: memberData.username,
      customerPhone: memberData.phone,
      checkInDate: checkInDate || '未选日期',   // 👈 存入真实的入住时间
      checkOutDate: checkOutDate || '未选日期', // 👈 存入真实的离店时间
      totalPrice: price,
      status: '待审核'
    });
    await order.save();
    require('../utils/response').sendResponse(res, 200, '预订提交成功，等待商户审核', order);
  } catch (error) {
    console.error(error);
    require('../utils/response').sendResponse(res, 500, '预订失败');
  }
};

// 新增：获取当前登录用户的所有订单
exports.getMyOrders = async (req, res) => {
  try {
    const user = getMemberFromToken(req); // 复用之前的 token 解析函数
    if (!user) return require('../utils/response').sendResponse(res, 401, '请先登录');

    // 按时间倒序排列
    const orders = await Order.find({ memberId: user.id }).sort({ createdAt: -1 });
    require('../utils/response').sendResponse(res, 200, '获取成功', orders);
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '获取订单失败');
  }
};

// 新增：用户删除自己的订单
exports.deleteUserOrder = async (req, res) => {
  try {
    const user = getMemberFromToken(req);
    if (!user) return require('../utils/response').sendResponse(res, 401, '请先登录');

    // 确保只能删自己的订单
    const order = await Order.findOne({ _id: req.params.id, memberId: user.id });
    if (!order) return require('../utils/response').sendResponse(res, 404, '订单不存在');

    await Order.findByIdAndDelete(req.params.id);
    require('../utils/response').sendResponse(res, 200, '订单删除成功');
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '删除失败');
  }
};

