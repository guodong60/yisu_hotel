import { Form, Input, Select, Button, Card, message, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createHotel, uploadImage } from '../../api/hotel';
import { useState } from 'react';

export default function HotelForm() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]); // 管理上传的图片

  // 自定义上传逻辑，对接到我们的 Node.js 后端
  const customUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadImage(formData);
      if (res.code === 0) {
        onSuccess(res.data.url); // 保存返回的图片 URL
      } else {
        onError(new Error('上传失败'));
      }
    } catch (err) {
      onError(err);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const onFinish = async (values) => {
    // 提取上传成功后的图片 URL 数组
    const bannerImages = fileList.filter(f => f.status === 'done').map(f => f.response);
    const postData = { ...values, bannerImages };

    const res = await createHotel(postData);
    if (res.code === 0) {
      message.success('酒店录入成功，等待管理员审核');
      form.resetFields();
      setFileList([]);
    }
  };

  return (
    <Card title="录入新酒店">
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
        <Form.Item label="酒店中文名" name="nameCn" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="酒店英文名" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="详细地址" name="address" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="开业年份" name="openingYear" rules={[{ required: true }]}><Input placeholder="例如: 2022" /></Form.Item>
        
        {/* 👈 改为选择下拉栏 */}
        <Form.Item label="酒店星级" name="starRating" rules={[{ required: true }]}>
          <Select placeholder="请选择星级">
            <Select.Option value={1}>1 星级 (经济型)</Select.Option>
            <Select.Option value={2}>2 星级</Select.Option>
            <Select.Option value={3}>3 星级 (舒适型)</Select.Option>
            <Select.Option value={4}>4 星级 (高档型)</Select.Option>
            <Select.Option value={5}>5 星级 (豪华型)</Select.Option>
          </Select>
        </Form.Item>

        {/* 👈 新增图片上传组件 */}
        <Form.Item label="酒店详情图 (移动端 Banner)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            customRequest={customUpload}
            onChange={handleUploadChange}
          >
            {fileList.length >= 3 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>上传图片</div></div>}
          </Upload>
        </Form.Item>

        <Button type="primary" htmlType="submit">提交审核</Button>
      </Form>
    </Card>
  );
}