import { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, Modal, Form, Input, InputNumber, Switch, message, Select, Upload, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getMyHotels, getRoomsByHotel, addRoom, updateHotel, uploadImage, requestDeleteHotel } from '../../api/hotel';
export default function MyHotels() {
  const [hotels, setHotels] = useState([]);
  
  // --- 房型管理相关状态 ---
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
  const [currentHotelForRoom, setCurrentHotelForRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomForm] = Form.useForm();

  // --- 酒店编辑相关状态 (新增) ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState([]); // 管理图片列表

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = () => {
    getMyHotels().then(res => { if (res.code === 0) setHotels(res.data); });
  };

  // ================= 房型管理逻辑 (保持不变) =================
  const openRoomManage = async (hotel) => {
    setCurrentHotelForRoom(hotel);
    setIsRoomModalVisible(true);
    const res = await getRoomsByHotel(hotel._id);
    if (res.code === 0) setRooms(res.data);
  };

  const handleAddRoom = async (values) => {
    const res = await addRoom({ ...values, hotelId: currentHotelForRoom._id });
    if (res.code === 0) {
      message.success('房型添加成功');
      roomForm.resetFields();
      const refreshRes = await getRoomsByHotel(currentHotelForRoom._id);
      if (refreshRes.code === 0) setRooms(refreshRes.data);
    }
  };

  // ================= 酒店编辑逻辑 (新增核心) =================
  
  // 1. 打开编辑弹窗，回显数据
  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    // 回显基础信息
    editForm.setFieldsValue({
      nameCn: hotel.nameCn,
      nameEn: hotel.nameEn,
      address: hotel.address,
      openingYear: hotel.openingYear,
      starRating: hotel.starRating,
    });

    // 回显图片：将 URL 数组转换成 Upload 组件需要的 fileList 格式
    if (hotel.bannerImages && hotel.bannerImages.length > 0) {
      const formattedFileList = hotel.bannerImages.map((url, index) => ({
        uid: `-${index}`, // 必须是唯一的
        name: `image-${index}`,
        status: 'done',
        url: url,
        response: { url } // 为了统一处理，模拟一个 response
      }));
      setFileList(formattedFileList);
    } else {
      setFileList([]);
    }

    setIsEditModalVisible(true);
  };

  // 2. 处理图片上传
  const customUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadImage(formData);
      if (res.code === 0) {
        onSuccess({ url: res.data.url }); // 这里的对象会被放入 file.response
      } else {
        onError(new Error('上传失败'));
      }
    } catch (err) {
      onError(err);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // 3. 提交更新
  const handleUpdateSubmit = async (values) => {
    // 提取最终的图片 URL 数组
    // file.response.url 是新上传的，file.url 是回显的老图片
    const bannerImages = fileList.map(file => {
      if (file.response) return file.response.url;
      return file.url;
    }).filter(Boolean); // 过滤掉无效值

    const updateData = { ...values, bannerImages };

    const res = await updateHotel(editingHotel._id, updateData);
    if (res.code === 0) {
      message.success('修改成功，酒店已转为“审核中”状态');
      setIsEditModalVisible(false);
      fetchHotels(); // 刷新列表，状态会变成审核中
    }
  };

  const handleRequestDelete = async (id) => {
    const res = await requestDeleteHotel(id);
    if (res.code === 0) {
      message.success('申请已提交，等待管理员处理');
      fetchHotels();
    }
  };

  const columns = [
    { title: '酒店名称', dataIndex: 'nameCn' },
    { title: '地址', dataIndex: 'address' },
    { title: '星级', dataIndex: 'starRating', render: s => `${s} 星` },
    { 
      title: '审核状态', 
      dataIndex: 'status', 
      render: s => <Tag color={s === '通过' ? 'green' : (s === '审核中' ? 'blue' : 'red')}>{s}</Tag> 
    },
    { 
      title: '操作', 
      width: 250,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" ghost onClick={() => openEditModal(record)} disabled={record.status === '待删除' || record.status === '已删除'}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => openRoomManage(record)} disabled={record.status !== '通过'}>
            管理房型
          </Button>
          <Popconfirm title="确定要申请下架并删除该酒店吗？" onConfirm={() => handleRequestDelete(record._id)}>
            <Button type="link" danger size="small" disabled={record.status === '待删除' || record.status === '已删除'}>
              申请删除
            </Button>
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <Card title="我录入的酒店">
      <Table columns={columns} dataSource={hotels} rowKey="_id" />

      {/* --- 房型管理弹窗 --- */}
      <Modal 
        title={`管理房型 - ${currentHotelForRoom?.nameCn}`} 
        open={isRoomModalVisible} 
        onCancel={() => setIsRoomModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 20 }}>
          <h4>已有房型：</h4>
          {rooms.length === 0 ? <p style={{color: '#999'}}>暂无房型</p> : (
            rooms.map(r => (
              <Tag color="blue" key={r._id} style={{ margin: '5px' }}>
                {r.name} | ¥{r.price}
              </Tag>
            ))
          )}
        </div>
        <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
          <h4>添加新房型：</h4>
          <Form form={roomForm} layout="inline" onFinish={handleAddRoom}>
            <Form.Item name="name" rules={[{required: true}]}><Input placeholder="名称" style={{width: 120}}/></Form.Item>
            <Form.Item name="price" rules={[{required: true}]}><InputNumber placeholder="¥" min={0} style={{width: 80}}/></Form.Item>
            <Form.Item name="bedType" rules={[{required: true}]}><Input placeholder="床型" style={{width: 100}}/></Form.Item>
            <Form.Item name="area" rules={[{required: true}]}><Input placeholder="面积" style={{width: 80}}/></Form.Item>
            <Form.Item name="hasWindow" valuePropName="checked" initialValue={true}><Switch checkedChildren="有窗" unCheckedChildren="无窗"/></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit">添加</Button></Form.Item>
          </Form>
        </div>
      </Modal>

      {/* --- 酒店编辑弹窗 (新增) --- */}
      <Modal
        title="编辑酒店信息 (修改后需重新审核)"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item label="酒店中文名" name="nameCn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="酒店英文名" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="详细地址" name="address" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="开业年份" name="openingYear" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="星级" name="starRating" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>1 星级</Select.Option>
              <Select.Option value={2}>2 星级</Select.Option>
              <Select.Option value={3}>3 星级</Select.Option>
              <Select.Option value={4}>4 星级</Select.Option>
              <Select.Option value={5}>5 星级</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="酒店图片 (支持多张上传/删除)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={customUpload}
              onChange={handleUploadChange}
            >
              {fileList.length >= 5 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>上传</div></div>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsEditModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存并提交审核</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}