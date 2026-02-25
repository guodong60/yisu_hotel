const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true } // 真实场景需要手机号
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);