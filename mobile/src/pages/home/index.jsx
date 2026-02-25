import { View, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import CalendarCard from '../../components/CalendarCard';
import HotelItem from '../../components/HotelItem';
import { getHotels } from '../../api/request';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [recommendHotels, setRecommendHotels] = useState([]);

  // 页面加载时，拉取一些酒店作为“猜你喜欢”随机推荐
  useEffect(() => {
    const fetchRecommend = async () => {
      const res = await getHotels();
      if (res.code === 0 && res.data) {
        // 简单的前端打乱顺序，取前 3 个展示
        const shuffled = res.data.sort(() => 0.5 - Math.random()).slice(0, 3);
        setRecommendHotels(shuffled);
      }
    };
    fetchRecommend();
  }, []);

  // 点击查找，带着关键字跳转到列表页
  const handleSearch = () => {
    Taro.navigateTo({ url: `/pages/list/index?keyword=${keyword}` });
  };

  return (
    <View style={{ padding: '15px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部 Banner */}
      <View style={{ height: '150px', background: '#0066FF', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(0,102,255,0.3)' }}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>易宿酒店 · 享你所想</Text>
      </View>
      
      {/* 搜索区域模块 */}
      <View style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
        <Input 
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          placeholder="请输入关键字/酒店名/地标" 
          style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '15px' }} 
        />
        <CalendarCard />
        <Button onClick={handleSearch} style={{ background: '#0066FF', color: '#fff', borderRadius: '25px', marginTop: '15px' }}>
          查找酒店
        </Button>
      </View>

      {/* 动态推荐区域 */}
      <View style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>猜你喜欢</View>
      <View style={{ borderRadius: '12px', overflow: 'hidden' }}>
        {recommendHotels.length > 0 ? (
          recommendHotels.map(hotel => (
            <HotelItem 
              key={hotel._id} 
              data={hotel} 
              onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${hotel._id}` })}
            />
          ))
        ) : (
          <View style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无推荐酒店</View>
        )}
      </View>
    </View>
  );
}