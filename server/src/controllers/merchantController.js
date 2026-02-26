const Hotel = require('../models/Hotel');
const { sendResponse } = require('../utils/response');

exports.createHotel = async (req, res) => {
  try {
    const hotelData = { ...req.body, merchantId: req.user.id };
    const hotel = await Hotel.create(hotelData);
    sendResponse(res, 201, '酒店信息录入成功', hotel);
  } catch (error) {
    sendResponse(res, 400, '酒店录入失败', error.message);
  }
};

exports.getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ merchantId: req.user.id });
    sendResponse(res, 200, '获取成功', hotels);
  } catch (error) {
    sendResponse(res, 400, '获取列表失败');
  }
};

const Order = require('../models/Order');
// 新增：获取我的订单
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ merchantId: req.user.id });
    require('../utils/response').sendResponse(res, 200, '获取成功', orders);
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '获取失败');
  }
};

const Room = require('../models/Room');

// 新增：商户给指定酒店添加房型
exports.addRoom = async (req, res) => {
  try {
    const { hotelId, name, price, bedType, area, hasWindow } = req.body;
    const room = new Room({ hotelId, name, price, bedType, area, hasWindow });
    await room.save();
    require('../utils/response').sendResponse(res, 200, '房型添加成功', room);
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '房型添加失败');
  }
};

// 新增：获取指定酒店的所有房型
exports.getRoomsByHotel = async (req, res) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    require('../utils/response').sendResponse(res, 200, '获取成功', rooms);
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '获取房型失败');
  }
};

// 审核订单
exports.auditOrder = async (req, res) => {
  try {
    const { status } = req.body; // '已确认' 或 '已拒绝'
    await Order.findByIdAndUpdate(req.params.id, { status });
    require('../utils/response').sendResponse(res, 200, '操作成功');
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '操作失败');
  }
};

// 新增：删除订单
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    require('../utils/response').sendResponse(res, 200, '订单删除成功');
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '删除失败');
  }
};


// 新增：更新酒店信息
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 1. 安全检查：确保只能改自己名下的酒店
    const hotel = await Hotel.findOne({ _id: id, merchantId: req.user.id });
    if (!hotel) {
      return require('../utils/response').sendResponse(res, 404, '未找到该酒店或无权修改');
    }

    // 2. 更新字段
    // 注意：这里我们允许更新基础信息和图片
    hotel.nameCn = updates.nameCn;
    hotel.nameEn = updates.nameEn;
    hotel.address = updates.address;
    hotel.starRating = updates.starRating;
    hotel.openingYear = updates.openingYear;
    hotel.bannerImages = updates.bannerImages; // 更新图片数组

    // 3. 核心逻辑：一旦修改，必须重置为“审核中”，并清空之前的驳回原因
    hotel.status = '审核中';
    hotel.rejectReason = '';

    await hotel.save();
    require('../utils/response').sendResponse(res, 200, '修改成功，已重新提交审核', hotel);
  } catch (error) {
    console.error(error);
    require('../utils/response').sendResponse(res, 500, '更新失败');
  }
};

// 新增：商户申请删除酒店
exports.requestDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, merchantId: req.user.id });
    if (!hotel) return require('../utils/response').sendResponse(res, 404, '酒店不存在');

    // 👇 核心修复：在变成“待删除”之前，先把它现在的状态（比如“不通过”）记在小本本上
    hotel.previousStatus = hotel.status; 
    
    hotel.status = '待删除'; // 然后再变状态
    await hotel.save();

    require('../utils/response').sendResponse(res, 200, '删除申请已提交');
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '申请失败');
  }
};
