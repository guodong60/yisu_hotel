import { View, Text, Picker } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { formatDate } from '../utils/format'; // 如果你的 format 文件名不一样，请保持原样

export default function CalendarCard() {
  // 默认今天和明天
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(Taro.getStorageSync('checkInDate') || today);
  const [checkOut, setCheckOut] = useState(Taro.getStorageSync('checkOutDate') || tomorrow);

  // 初始化时，如果缓存没有，就写死默认时间到缓存里
  useEffect(() => {
    if (!Taro.getStorageSync('checkInDate')) Taro.setStorageSync('checkInDate', today);
    if (!Taro.getStorageSync('checkOutDate')) Taro.setStorageSync('checkOutDate', tomorrow);
  }, []);

  // 👇 新增核心逻辑：计算相差的晚数
  const calculateNights = () => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    // 毫秒相减，再除以一天的毫秒数 (1000ms * 60s * 60m * 24h)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1; // 兜底保护，确保最少 1 晚
  };

  const handleCheckIn = (e) => {
    const newCheckIn = e.detail.value;
    setCheckIn(newCheckIn);
    Taro.setStorageSync('checkInDate', newCheckIn);

    // 🌟 体验优化：如果用户把入住日期选到了离店日期之后，自动把离店日期往后推 1 天
    if (new Date(newCheckIn) >= new Date(checkOut)) {
      const nextDay = new Date(new Date(newCheckIn).getTime() + 86400000).toISOString().split('T')[0];
      setCheckOut(nextDay);
      Taro.setStorageSync('checkOutDate', nextDay);
    }
  };

  const handleCheckOut = (e) => {
    const newCheckOut = e.detail.value;
    
    // 🌟 逻辑拦截：防止用户选的离店日期早于入住日期
    if (new Date(newCheckOut) <= new Date(checkIn)) {
      Taro.showToast({ title: '离店日期必须晚于入住日期', icon: 'none' });
      return; 
    }
    
    setCheckOut(newCheckOut);
    Taro.setStorageSync('checkOutDate', newCheckOut);
  };

  return (
    <View style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8f8f8', borderRadius: '8px', margin: '10px 0' }}>
      <Picker mode="date" onChange={handleCheckIn} value={checkIn}>
        <View>
          <Text style={{ fontSize: '12px', color: '#666' }}>入住日期</Text>
          <View style={{ fontWeight: 'bold', fontSize: '16px' }}>{formatDate(checkIn)}</View>
        </View>
      </Picker>
      
      {/* 👇 动态渲染计算出来的晚数 */}
      <View style={{ alignSelf: 'center', fontSize: '12px', color: '#0066FF', background: '#e6f0ff', padding: '2px 8px', borderRadius: '10px' }}>
        共 {calculateNights()} 晚
      </View>
      
      <Picker mode="date" onChange={handleCheckOut} value={checkOut}>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>离店日期</Text>
          <View style={{ fontWeight: 'bold', fontSize: '16px' }}>{formatDate(checkOut)}</View>
        </View>
      </Picker>
    </View>
  );
}