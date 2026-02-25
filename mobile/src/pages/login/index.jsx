import { View, Input, Button, Text } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await Taro.request({
        url: 'http://localhost:3000/api/client/login',
        method: 'POST',
        data: { username, password }
      });
      if (res.data.code === 0) {
        Taro.setStorageSync('token', res.data.data.token);
        // 👇 新增这一行：保存用户信息
        Taro.setStorageSync('userInfo', res.data.data.userInfo);
        
        Taro.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500);
      } else {
        Taro.showToast({ title: res.data.msg, icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '网络错误', icon: 'none' });
    }
  };

  return (
    <View style={{ padding: '30px' }}>
      <View style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>账号登录</View>
      <Input placeholder="用户名" onInput={e => setUsername(e.detail.value)} style={{ borderBottom: '1px solid #eee', padding: '10px', marginBottom: '20px' }} />
      <Input placeholder="密码" password onInput={e => setPassword(e.detail.value)} style={{ borderBottom: '1px solid #eee', padding: '10px', marginBottom: '30px' }} />
      <Button type="primary" onClick={handleLogin} style={{ background: '#0066FF', marginBottom: '15px' }}>登录</Button>
      <View onClick={() => Taro.navigateTo({ url: '/pages/register/index' })} style={{ textAlign: 'center', color: '#666' }}>没有账号？去注册</View>
    </View>
  );
}