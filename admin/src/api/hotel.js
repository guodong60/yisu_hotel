import request from './request';

export const login = (data) => request.post('/auth/login', data);
export const register = (data) => request.post('/auth/register', data);
export const createHotel = (data) => request.post('/merchant/hotels', data);
export const getMyHotels = () => request.get('/merchant/hotels');
export const getAllHotels = () => request.get('/admin/hotels'); 
export const auditHotel = (id, data) => request.put(`/admin/hotels/${id}/audit`, data);
export const toggleStatus = (id, data) => request.put(`/admin/hotels/${id}/status`, data);

export const uploadImage = (formData) => request.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const getAllUsers = () => request.get('/admin/users');
export const getMyOrders = () => request.get('/merchant/orders');

// ... 之前的代码不变
export const addRoom = (data) => request.post('/merchant/rooms', data);
export const getRoomsByHotel = (hotelId) => request.get(`/merchant/hotels/${hotelId}/rooms`);

// 假设我们在后端 merchantController 里加一个 auditOrder 方法
export const auditOrder = (id, data) => request.put(`/merchant/orders/${id}/audit`, data);
export const deleteOrder = (id) => request.delete(`/merchant/orders/${id}`);
export const updateHotel = (id, data) => request.put(`/merchant/hotels/${id}`, data);
// 商户申请删除酒店
export const requestDeleteHotel = (id) => request.put(`/merchant/hotels/${id}/delete_request`);
// 管理员删除用户
export const deleteUser = (id, type) => request.delete(`/admin/users/${id}?type=${type}`);
export const createUser = (data) => request.post('/admin/users', data);

// 👇 新增这一行：调用强制删除接口
export const forceDeleteHotel = (id) => request.delete(`/admin/hotels/${id}`);