const mongoose = require('mongoose');
const HotelSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nameCn: { type: String, required: true },
  nameEn: { type: String, required: true },
  address: { type: String, required: true },
  starRating: { type: Number, required: true },
  openingYear: { type: String, required: true },
  
  // 👇 就是漏了这最关键的一行！告诉数据库接收图片数组
  bannerImages: [{ type: String }], 
  
  status: { 
    type: String, 
    enum: ['审核中', '通过', '不通过', '待删除', '已删除'], // 👈 新增了待删除和已删除
    default: '审核中' 
  },
  // 👇 新增这个字段：用来记忆“上一次的状态”
  previousStatus: {
    type: String,
    default: null
  },
  rejectReason: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);
