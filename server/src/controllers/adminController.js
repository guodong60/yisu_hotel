const Hotel = require('../models/Hotel');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member'); // 👈 记得在顶部引入 Member 模型
const { sendResponse } = require('../utils/response');

// 1. 改造审核接口（兼容审核删除）
exports.auditHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const hotel = await Hotel.findById(id);
    if (!hotel) return require('../utils/response').sendResponse(res, 404, '酒店不存在');

    // --- 核心状态机：分场景处理 ---
    if (hotel.status === '待删除') {
      if (status === '不通过') {
        // 🚨 完美修复：管理员驳回删除申请，精准恢复到“申请删除前的小本本状态”
        // 如果当时是“不通过”来申请的，就恢复成“不通过”
        hotel.status = hotel.previousStatus || '不通过'; 
        hotel.previousStatus = null; // 恢复后，清空记忆
      } else if (status === '通过') {
        // 兜底防御机制（虽然前端现在点同意是走彻底物理删除了）
        hotel.status = '已删除';
      }
    } else {
      // 正常的新酒店审核（审核中 -> 通过 / 不通过）
      hotel.status = status;
    }

    if (reason) {
      hotel.rejectReason = reason;
    }

    await hotel.save();
    require('../utils/response').sendResponse(res, 200, '操作成功');
  } catch (error) {
    console.error(error);
    require('../utils/response').sendResponse(res, 500, '审核失败');
  }
};

exports.toggleOnlineStatus = async (req, res) => {
  try {
    const { isDeleted } = req.body; 
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, { isDeleted }, { new: true });
    sendResponse(res, 200, isDeleted ? '酒店已下线' : '酒店已恢复', hotel);
  } catch (error) {
    sendResponse(res, 400, '上下线操作失败');
  }
};

exports.getAllHotels = async (req, res) => {
    try {
      const hotels = await require('../models/Hotel').find().populate('merchantId', 'username');
      require('../utils/response').sendResponse(res, 200, '获取成功', hotels);
    } catch (error) {
      require('../utils/response').sendResponse(res, 500, '获取失败');
    }
  };

// 新增：获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    const members = await Member.find().lean(); // 拉取移动端用户

    const formattedUsers = users.map(u => ({
      _id: u._id, username: u.username, role: u.role === 'admin' ? '管理员' : '商户', phone: '--', type: 'system', createdAt: u.createdAt
    }));
    const formattedMembers = members.map(m => ({
      _id: m._id, username: m.username, role: '移动端用户', phone: m.phone, type: 'member', createdAt: m.createdAt
    }));

    // 合并后按时间倒序
    const allUsers = [...formattedUsers, ...formattedMembers].sort((a, b) => b.createdAt - a.createdAt);
    require('../utils/response').sendResponse(res, 200, '获取成功', allUsers);
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '获取失败');
  }
};

// 3. 新增：管理员删除用户
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 通过传参判断删哪个表
    if (type === 'member') {
      await Member.findByIdAndDelete(id);
    } else {
      await User.findByIdAndDelete(id);
    }
    require('../utils/response').sendResponse(res, 200, '删除成功');
  } catch (error) {
    require('../utils/response').sendResponse(res, 500, '删除失败');
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return require('../utils/response').sendResponse(res, 400, '该账号已被占用，请换一个');
    }

    // 👈 2. 核心修复：这里也要加密！
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword, // 存入加密后的密码
      role: role || 'admin'
    });

    await newUser.save();
    require('../utils/response').sendResponse(res, 200, '新管理员账号创建成功');
  } catch (error) {
    console.error(error); // 打印报错方便调试
    require('../utils/response').sendResponse(res, 500, '创建失败');
  }
};

// 新增：管理员强制物理删除酒店（清理孤儿数据或违规酒店）
exports.forceDeleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. 从数据库中彻底删除该酒店
    await Hotel.findByIdAndDelete(id);
    
    // 2. 顺手牵羊：把这个酒店名下的所有房型也一起清理掉，防止产生更多垃圾数据
    // ⚠️ 注意：如果你在文件顶部没有引入 Room 模型，请在顶部加上 const Room = require('../models/Room');
    const Room = require('../models/Room'); 
    await Room.deleteMany({ hotelId: id });

    require('../utils/response').sendResponse(res, 200, '该酒店及其房型已彻底物理删除');
  } catch (error) {
    console.error('彻底删除酒店失败:', error);
    require('../utils/response').sendResponse(res, 500, '彻底删除失败');
  }
};
