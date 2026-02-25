import { View, Text, Image } from '@tarojs/components';

export default function HotelItem({ data, onClick }) {
  const coverImage = data.bannerImages && data.bannerImages.length > 0 
    ? data.bannerImages[0] 
    : 'https://dummyimage.com/100x100/eeeeee/999999.png&text=No+Image';

  return (
    <View onClick={onClick} style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #eee', background: '#fff' }}>
      <Image 
        src={coverImage} 
        style={{ width: '100px', height: '100px', borderRadius: '8px', marginRight: '10px', objectFit: 'cover' }} 
      />
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <View style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.nameCn}</View>
        <View style={{ fontSize: '12px', color: '#0066FF' }}>{data.starRating} 星级</View>
        <View style={{ fontSize: '12px', color: '#666', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {data.address}
        </View>
        <View style={{ textAlign: 'right', color: '#FF4D4F', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
          {/* 👇 就是这里！把 199 换成动态读取的 data.minPrice，如果没传则默认显示 0 */}
          <Text style={{ fontSize: '12px' }}>¥</Text> {data.minPrice || 0} <Text style={{ fontSize: '12px', color: '#999', fontWeight: 'normal' }}>起</Text>
        </View>
      </View>
    </View>
  );
}