import { View, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', phone: '' });

  const handleRegister = async () => {
    // 1. 判空校验
    if (!form.username || !form.password || !form.phone) {
      Taro.showToast({ title: '请填写完整的注册信息', icon: 'none' });
      return; // 终止后续执行
    }

    // 2. 核心修改：使用正则表达式校验标准的 11 位手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      Taro.showToast({ title: '请输入正确的11位手机号', icon: 'none' });
      return; // 如果格式不对，直接终止，不发请求
    }

    // 3. 发送注册请求
    try {
      Taro.showLoading({ title: '注册中...' });
      const res = await Taro.request({
        url: 'http://localhost:3000/api/client/register',
        method: 'POST',
        data: form
      });
      
      Taro.hideLoading();
      if (res.data.code === 0) {
        Taro.showToast({ title: '注册成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500); // 注册完回到登录页
      } else {
        Taro.showToast({ title: res.data.msg || '注册失败', icon: 'none' });
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  };

  return (
    <View style={{ padding: '30px' }}>
      <View style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>新用户注册</View>
      
      <Input 
        placeholder="用户名" 
        onInput={e => setForm({...form, username: e.detail.value})} 
        style={{ borderBottom: '1px solid #eee', padding: '10px', marginBottom: '20px' }} 
      />
      
      <Input 
        placeholder="密码" 
        password 
        onInput={e => setForm({...form, password: e.detail.value})} 
        style={{ borderBottom: '1px solid #eee', padding: '10px', marginBottom: '20px' }} 
      />
      
      {/* 核心修改：增加了 type="number" 调起数字键盘，增加了 maxlength={11} 限制长度 */}
      <Input 
        type="number"
        maxlength={11}
        placeholder="11位手机号" 
        onInput={e => setForm({...form, phone: e.detail.value})} 
        style={{ borderBottom: '1px solid #eee', padding: '10px', marginBottom: '30px' }} 
      />
      
      <Button type="primary" onClick={handleRegister} style={{ background: '#0066FF' }}>注册</Button>
    </View>
  );
}