import { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, message, Popconfirm } from 'antd';
import { getMyOrders, auditOrder } from '../../api/hotel'; // 引入新接口
import { deleteOrder } from '../../api/hotel'; // 顶部别忘了引入这个新方法！

export default function OrderList() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    getMyOrders().then(res => { if (res.code === 0) setOrders(res.data); });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 处理审核逻辑
  const handleAudit = async (id, status) => {
    const res = await auditOrder(id, { status });
    if (res.code === 0) {
      message.success(`订单${status}`);
      fetchOrders(); // 刷新列表
    }
  };

  const columns = [
    { title: '预订房型', dataIndex: 'roomName' },
    { title: '客户姓名', dataIndex: 'customerName' },
    { title: '联系电话', dataIndex: 'customerPhone' },
    { title: '总价', dataIndex: 'totalPrice', render: val => `¥${val}` },
    { 
      title: '状态', 
      dataIndex: 'status', 
      render: val => {
        let color = val === '已确认' ? 'green' : (val === '已拒绝' ? 'red' : 'orange');
        return <Tag color={color}>{val}</Tag>;
      } 
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          {/* 如果是新生成的待审核订单，显示 接单/拒绝 */}
          {record.status === '待审核' && (
            <>
              <Popconfirm title="确认接受此订单?" onConfirm={() => handleAudit(record._id, '已确认')}>
                <Button type="link" size="small">接单</Button>
              </Popconfirm>
              <Popconfirm title="确认拒绝此订单?" onConfirm={() => handleAudit(record._id, '已拒绝')}>
                <Button type="link" danger size="small">拒绝</Button>
              </Popconfirm>
            </>
          )}

          {/* 🌟 不管什么状态，只要不是待审核（包括那些历史遗留的假数据），都可以直接删除清理 */}
          {record.status !== '待审核' && (
            <Popconfirm title="确认删除此订单记录?" onConfirm={async () => {
              const res = await deleteOrder(record._id);
              if (res.code === 0) {
                message.success('清理成功');
                fetchOrders(); // 重新拉取列表
              }
            }}>
              <Button type="link" danger size="small" style={{ color: '#ccc' }}>删除</Button>
            </Popconfirm>
          )}
        </>
      )
    }
  ];

  return (
    <Card title="移动端预订订单">
      <Table columns={columns} dataSource={orders} rowKey="_id" />
    </Card>
  );
}