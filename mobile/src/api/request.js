import Taro from '@tarojs/taro';
const BASE_URL = 'http://localhost:3000/api/client';

const request = async (url, method = 'GET', data = {}) => {
  // 获取本地存的 token
  const token = Taro.getStorageSync('token');
  
  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: { 
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' // 👈 有 token 就带上
      }
    });
    return res.data;
  } catch (error) {
    Taro.showToast({ title: '网络请求失败', icon: 'none' });
    throw error;
  }
};

export const getHotels = (params) => request('/hotels', 'GET', params);
export const getHotelDetail = (id) => request(`/hotels/${id}`, 'GET');

export const getHotelRooms = (hotelId) => request(`/hotels/${hotelId}/rooms`, 'GET');
export const submitOrder = (data) => request('/orders', 'POST', data);
export const getMyOrders = () => request('/orders', 'GET');
export const deleteUserOrder = (id) => request(`/orders/${id}`, 'DELETE');
