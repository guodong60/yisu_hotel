import { View, Swiper, SwiperItem, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { getHotelDetail, getHotelRooms, submitOrder } from '../../api/request';

export default function Detail() {
  const router = useRouter();
  const hotelId = router.params.id; 
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]); // 存放真实的房型数据

  useEffect(() => {
    if (hotelId) {
      // 同时拉取酒店基础信息和它的专属房型
      getHotelDetail(hotelId).then(res => { if (res.code === 0) setHotel(res.data); });
      getHotelRooms(hotelId).then(res => { if (res.code === 0) setRooms(res.data); });
    }
  }, [hotelId]);

  // 处理预订点击事件
  const handleBook = async (room) => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，请先登录后再预订',
        success: (res) => {
          if (res.confirm) Taro.navigateTo({ url: '/pages/login/index' });
        }
      });
      return;
    }

    // 🌟 加上 mask: true，屏幕会出现透明遮罩，防止用户疯狂连点按钮！
    Taro.showLoading({ title: '正在提交订单...', mask: true }); 
    // 从本地缓存拿取刚才日历选好的时间
    const checkIn = Taro.getStorageSync('checkInDate') || '未选日期';
    const checkOut = Taro.getStorageSync('checkOutDate') || '未选日期';

    try {
      const res = await submitOrder({
        merchantId: hotel.merchantId,
        hotelName: hotel.nameCn,
        hotelAddress: hotel.address, // 👈 发送地址
        roomName: room.name,
        price: room.price,
        checkInDate: checkIn,   // 👈 发送入住日期
        checkOutDate: checkOut  // 👈 发送离店日期
      });
      
      if (res.code === 0) {
        Taro.showModal({
          title: '预订成功 🎉',
          content: '订单已提交，请前往「我的」页面查看审核状态。',
          cancelText: '留在此页',
          confirmText: '查看订单',
          success: (res) => {
            if (res.confirm) {
              // 👇 关键跳转：跳转到 TabBar 页面必须用 switchTab
              Taro.switchTab({ url: '/pages/mine/index' });
            }
          }
        });
      } else {
        // 如果触发了后端的防刷单限制，提示错误
        Taro.showModal({ title: '预订失败', content: res.msg, showCancel: false });
      }
    } catch (error) {
      Taro.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      Taro.hideLoading(); // 关闭 loading
    }
  };

  if (!hotel) return <View style={{ padding: '20px', textAlign: 'center' }}>加载中...</View>;

  const images = hotel.bannerImages?.length > 0 
    ? hotel.bannerImages 
    : ['https://dummyimage.com/600x300/eeeeee/999999.png&text=No+Image'];

  return (
    <View style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '30px' }}>
      <Swiper indicatorDots autoplay style={{ height: '220px' }}>
        {images.map((img, index) => (
          <SwiperItem key={index}>
            <Image src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </SwiperItem>
        ))}
      </Swiper>

      <View style={{ background: '#fff', padding: '15px', marginBottom: '10px' }}>
        <View style={{ fontSize: '20px', fontWeight: 'bold' }}>{hotel.nameCn}</View>
        <View style={{ color: '#0066FF', margin: '8px 0' }}>{hotel.starRating} 星级酒店</View>
        <View style={{ fontSize: '13px', color: '#666' }}>📍 {hotel.address}</View>
      </View>

      {/* 动态渲染真实的房型价格列表 */}
      <View style={{ background: '#fff', padding: '15px' }}>
        <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>房型预订</View>
        
        {rooms.length === 0 ? (
          <View style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>商户太懒了，还没添加房型~</View>
        ) : (
          rooms.map(room => (
            <View key={room._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f5f5f5' }}>
              <View>
                <View style={{ fontSize: '16px', fontWeight: 'bold' }}>{room.name}</View>
                <View style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {room.bedType} | {room.area} | {room.hasWindow ? '有窗' : '无窗'}
                </View>
              </View>
              <View style={{ textAlign: 'right' }}>
                <View style={{ color: '#FF4D4F', fontSize: '20px', fontWeight: 'bold' }}>¥{room.price}</View>
                <View 
                  onClick={() => handleBook(room)}
                  style={{ background: '#0066FF', color: '#fff', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', marginTop: '5px', display: 'inline-block' }}
                >
                  预订
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}