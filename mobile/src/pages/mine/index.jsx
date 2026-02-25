import { View, Text, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { getMyOrders, deleteUserOrder } from '../../api/request';

export default function Mine() {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLogin, setIsLogin] = useState(false);

  // 每次显示页面时触发
  useDidShow(() => {
    checkLogin();
  });

  const checkLogin = () => {
    const token = Taro.getStorageSync('token');
    const storedUser = Taro.getStorageSync('userInfo');
    if (token && storedUser) {
      setIsLogin(true);
      setUserInfo(storedUser);
      fetchOrders(); // 登录了就拉取订单
    } else {
      setIsLogin(false);
      setOrders([]);
    }
  };

  const fetchOrders = async () => {
    const res = await getMyOrders();
    if (res.code === 0) {
      setOrders(res.data);
    }
  };

  const handleLogout = () => {
    Taro.clearStorageSync();
    setIsLogin(false);
    setUserInfo(null);
    setOrders([]);
    Taro.showToast({ title: '已退出', icon: 'none' });
  };

  const handleDelete = (id) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条订单记录吗？',
      success: async (res) => {
        if (res.confirm) {
          const apiRes = await deleteUserOrder(id);
          if (apiRes.code === 0) {
            Taro.showToast({ title: '删除成功', icon: 'success' });
            fetchOrders(); // 刷新列表
          }
        }
      }
    });
  };

  const getStatusColor = (status) => {
    if (status === '已确认') return '#52c41a';
    if (status === '已拒绝') return '#ff4d4f';
    return '#faad14'; 
  };

  return (
    <View style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '20px' }}>
      {/* 顶部个人信息卡片 */}
      <View style={{ background: '#0066FF', padding: '40px 20px', color: '#fff', marginBottom: '10px' }}>
        {isLogin ? (
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View style={{ width: '60px', height: '60px', borderRadius: '30px', background: '#fff', marginRight: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0066FF', fontWeight: 'bold', fontSize: '24px' }}>
              {userInfo.username[0].toUpperCase()}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ fontSize: '20px', fontWeight: 'bold' }}>{userInfo.username}</View>
              <View style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>手机号: {userInfo.phone}</View>
            </View>
            <View onClick={handleLogout} style={{ fontSize: '12px', border: '1px solid #fff', padding: '4px 10px', borderRadius: '15px' }}>退出</View>
          </View>
        ) : (
          <View style={{ textAlign: 'center' }}>
            <View style={{ marginBottom: '15px', fontSize: '18px' }}>欢迎来到易宿酒店</View>
            <Button onClick={() => Taro.navigateTo({ url: '/pages/login/index' })} style={{ background: '#fff', color: '#0066FF', width: '120px', borderRadius: '20px', fontWeight: 'bold' }}>去登录</Button>
          </View>
        )}
      </View>

      {/* 订单列表区域 */}
      <View style={{ padding: '0 15px' }}>
        <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '5px', borderLeft: '4px solid #0066FF' }}>我的订单</View>
        
        {!isLogin ? (
          <View style={{ textAlign: 'center', color: '#999', padding: '30px' }}>登录后查看订单</View>
        ) : orders.length === 0 ? (
          <View style={{ textAlign: 'center', color: '#999', padding: '30px' }}>暂无订单，快去预订吧~</View>
        ) : (
          orders.map(item => (
            <View key={item._id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: '16px', display: 'block' }}>{item.hotelName}</Text>
                  {/* 👇 在这里新增地址展示 */}
                  <Text style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>📍 {item.hotelAddress || '暂无地址信息'}</Text>
                </View>
                <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>{item.status}</Text>
              </View>
              <View style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                <View>房型：{item.roomName}</View>
                {/* 这里的日期现在是真实读取的了！ */}
                <View>时间：{item.checkInDate} 至 {item.checkOutDate}</View>
                <View>总价：<Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{item.totalPrice}</Text></View>
              </View>
              <View style={{ textAlign: 'right', marginTop: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                <Button 
                  size="mini" 
                  onClick={() => handleDelete(item._id)}
                  style={{ display: 'inline-block', background: '#fff', border: '1px solid #ddd', color: '#666', padding: '0 15px', fontSize: '12px', lineHeight: '28px' }}
                >
                  删除订单
                </Button>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}