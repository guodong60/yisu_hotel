import axios from 'axios';
import { message } from 'antd';
import { getToken, clearAuth } from '../utils/auth';

const request = axios.create({
  baseURL: 'https://2234729b.r6.cpolar.cn/api',
  timeout: 5000
});

request.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 👇 主要修改这里：
request.interceptors.response.use(
  response => response.data,
  error => {
    // 增加判断：如果报 401，且请求的不是登录接口，才强制跳转到登录页
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      clearAuth();
      window.location.href = '/login';
    }
    // 正常弹出后端传过来的错误信息（比如“账号或密码错误”）
    message.error(error.response?.data?.msg || '网络请求失败');
    return Promise.reject(error);
  }
);

export default request;