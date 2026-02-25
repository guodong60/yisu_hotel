import { View, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import HotelItem from '../../components/HotelItem';
import { getHotels } from '../../api/request';

export default function List() {
  const router = useRouter();
  const keyword = router.params.keyword ? decodeURIComponent(router.params.keyword) : '';

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilteredHotels = async () => {
      setLoading(true);
      Taro.showLoading({ title: '搜索中' });
      try {
        // 将关键字传给后端进行模糊查询
        const res = await getHotels({ keyword }); 
        if (res.code === 0) {
          setHotels(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        Taro.hideLoading();
        setLoading(false);
      }
    };

    fetchFilteredHotels();
  }, [keyword]); // 关键字改变时重新请求

  return (
    <View style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <View style={{ padding: '10px 15px', background: '#fff', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
        {keyword ? `包含 "${keyword}" 的搜索结果` : '全部酒店列表'}
      </View>

      <ScrollView scrollY style={{ flex: 1 }}>
        {hotels.map(hotel => (
          <HotelItem 
            key={hotel._id} 
            data={hotel} 
            onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${hotel._id}` })}
          />
        ))}
        {hotels.length === 0 && !loading && (
          <View style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            没有找到相关的酒店，换个词试试吧~
          </View>
        )}
      </ScrollView>
    </View>
  );
}