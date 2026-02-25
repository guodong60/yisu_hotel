const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  hotelName: String,
  hotelAddress: String, // 👈 新增：用来存储酒店地址
  roomName: String,
  customerName: String, 
  customerPhone: String,
  checkInDate: String,  // 入住日期
  checkOutDate: String, // 离店日期
  totalPrice: Number,
  status: { 
    type: String, 
    enum: ['待审核', '已确认', '已拒绝'], 
    default: '待审核' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);