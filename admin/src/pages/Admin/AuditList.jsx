import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message, Modal, Form, Input, Popconfirm } from 'antd';
// 找到第一行 import API 的地方，加上 forceDeleteHotel
import { getAllHotels, auditHotel, toggleStatus, forceDeleteHotel } from '../../api/hotel';

export default function AuditList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 驳回弹窗相关状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentHotelId, setCurrentHotelId] = useState(null);
  const [form] = Form.useForm();

  // 获取酒店列表数据
  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await getAllHotels();
      if (res.code === 0) {
        setHotels(res.data);
      }
    } catch (error) {
      // 错误已由 axios 拦截器处理
    } finally {
      setLoading(false);
    }
  };

  // 👇 新增：处理彻底删除
  const handleForceDelete = async (id) => {
    const res = await forceDeleteHotel(id);
    if (res.code === 0) {
      message.success('酒店已彻底从系统中抹除！');
      fetchHotels(); // 刷新列表
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // 处理审核通过
  const handleApprove = async (id) => {
    const res = await auditHotel(id, { status: '通过' });
    if (res.code === 0) {
      message.success('已审核通过');
      fetchHotels();
    }
  };

  // 👇 新增：处理通用审核操作（用于同意删除/驳回删除请求）
  const handleDirectAudit = async (id, targetStatus) => {
    const res = await auditHotel(id, { status: targetStatus });
    if (res.code === 0) {
      message.success(`操作成功`);
      fetchHotels();
    }
  };

  // 点击驳回按钮，打开弹窗
  const showRejectModal = (id) => {
    setCurrentHotelId(id);
    setIsModalVisible(true);
  };

  // 提交驳回原因
  const handleRejectSubmit = async (values) => {
    const res = await auditHotel(currentHotelId, { 
      status: '不通过', 
      rejectReason: values.reason 
    });
    if (res.code === 0) {
      message.success('已驳回');
      setIsModalVisible(false);
      form.resetFields();
      fetchHotels();
    }
  };

  // 处理上下线切换
  const handleToggleStatus = async (id, currentIsDeleted) => {
    const res = await toggleStatus(id, { isDeleted: !currentIsDeleted });
    if (res.code === 0) {
      message.success(currentIsDeleted ? '酒店已恢复上线' : '酒店已下线');
      fetchHotels();
    }
  };

  // 定义表格列
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameCn',
      key: 'nameCn',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.nameEn}</div>
        </div>
      )
    },
    {
      title: '商户账号',
      dataIndex: 'merchantId',
      key: 'merchantId',
      render: (merchant) => merchant?.username || '未知商户'
    },
    {
      title: '星级',
      dataIndex: 'starRating',
      key: 'starRating',
      render: (star) => `${star} 星`
    },
    {
      title: '审核状态',
      key: 'status',
      render: (_, record) => {
        // 👇 修改：增加了对待删除和已删除状态颜色的支持
        let color = 'blue';
        if (record.status === '通过') color = 'green';
        else if (record.status === '不通过') color = 'red';
        else if (record.status === '待删除') color = 'orange';
        else if (record.status === '已删除') color = 'default';

        return (
          <>
            <Tag color={color}>{record.status}</Tag>
            {record.status === '不通过' && (
              <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
                原因: {record.rejectReason}
              </div>
            )}
          </>
        );
      }
    },
    {
      title: '在线状态',
      key: 'isDeleted',
      render: (_, record) => {
        if (record.status !== '通过') return <Tag color="default">未发布</Tag>;
        return record.isDeleted ? <Tag color="warning">已下线</Tag> : <Tag color="success">线上营业中</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        return (
          <Space size="middle">
            {/* 👇 1. 处理商户申请删除的审批流 */}
            {record.status === '待删除' && (
              <>
                <Popconfirm 
                  title="确定同意删除该酒店吗？(同意后数据将从系统彻底抹除！)" 
                  onConfirm={() => handleForceDelete(record._id)} // 🌟 核心修改：同意后直接调用彻底删除
                >
                  <Button type="link" danger style={{ padding: 0 }}>同意删除</Button>
                </Popconfirm>
                <Button type="link" style={{ padding: 0 }} onClick={() => handleDirectAudit(record._id, '通过')}>驳回请求</Button>
              </>
            )}

            {/* 2. 处理审核中状态 */}
            {record.status === '审核中' && (
              <>
                <Popconfirm title="确定要审核通过吗？" onConfirm={() => handleApprove(record._id)}>
                  <Button type="link" style={{ padding: 0 }}>通过</Button>
                </Popconfirm>
                <Button type="link" danger style={{ padding: 0 }} onClick={() => showRejectModal(record._id)}>驳回</Button>
              </>
            )}

            {/* 3. 只有“通过”的酒店才能操作上下线 */}
            {record.status === '通过' && (
              <Popconfirm 
                title={record.isDeleted ? "确定要恢复上线吗？" : "确定要下线该酒店吗？下线后用户端将不可见。"} 
                onConfirm={() => handleToggleStatus(record._id, record.isDeleted)}
              >
                <Button type="link" danger={!record.isDeleted} style={{ padding: 0 }}>
                  {record.isDeleted ? '恢复上线' : '强制下线'}
                </Button>
              </Popconfirm>
            )}

            {/* 👇 4. 终极清理按钮：无论酒店当前是什么状态（哪怕是之前遗留的“已删除”状态），管理员随时可以执行物理删除 */}
            <Popconfirm 
              title="极度危险：确定要彻底删除该酒店及相关房型吗？此操作不可逆！" 
              onConfirm={() => handleForceDelete(record._id)}
            >
              <Button type="link" danger style={{ padding: 0, fontWeight: 'bold' }}>
                彻底删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    }
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2 style={{ marginBottom: 20 }}>酒店审核与发布列表</h2>
      <Table 
        columns={columns} 
        dataSource={hotels} 
        rowKey="_id" 
        loading={loading}
        pagination={{ defaultPageSize: 10 }}
      />

      {/* 填写驳回原因的弹窗 */}
      <Modal 
        title="填写驳回原因" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleRejectSubmit} layout="vertical">
          <Form.Item 
            name="reason" 
            rules={[{ required: true, message: '请填写驳回原因' }]}
          >
            <Input.TextArea rows={4} placeholder="例如：酒店图片不够清晰，请重新上传" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" danger htmlType="submit">确认驳回</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}