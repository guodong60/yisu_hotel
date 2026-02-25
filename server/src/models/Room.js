const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name: { type: String, required: true }, // 如：经典大床房
  price: { type: Number, required: true }, // 价格
  bedType: { type: String, required: true }, // 如：1张1.8米大床
  area: { type: String, required: true }, // 如：30㎡
  hasWindow: { type: Boolean, default: true } // 是否有窗
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);