import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Popconfirm, message, Modal, Form, Input, Space } from 'antd';
import { getAllUsers, deleteUser, createUser } from '../../api/hotel';

export default function UserList() {
  const [users, setUsers] = useState([]);
  
  // 新增管理员弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = () => {
    getAllUsers().then(res => { if (res.code === 0) setUsers(res.data); });
  };

  useEffect(() => { fetchUsers(); }, []);

  // 删除用户逻辑
  const handleDelete = async (id, type) => {
    const res = await deleteUser(id, type);
    if (res.code === 0) {
      message.success('用户删除成功');
      fetchUsers();
    }
  };

  // 提交新增管理员逻辑
  const handleAddAdmin = async (values) => {
    // 强制传 role: 'admin' 给后端
    const res = await createUser({ ...values, role: 'admin' });
    if (res.code === 0) {
      message.success('🎉 成功新增管理员！');
      setIsModalVisible(false);
      form.resetFields(); // 清空表单
      fetchUsers();       // 刷新列表
    }
  };

  const columns = [
    { title: '登录账号', dataIndex: 'username' },
    { title: '绑定手机号', dataIndex: 'phone', render: val => val || '--' },
    {
      title: '角色',
      dataIndex: 'role',
      render: role => {
        let color = role === '管理员' ? 'red' : (role === '商户' ? 'blue' : 'green');
        return <Tag color={color}>{role}</Tag>;
      }
    },
    { title: '注册/创建时间', dataIndex: 'createdAt', render: val => new Date(val).toLocaleString() },
    {
      title: '操作',
      render: (_, record) => (
         <Popconfirm title="极度危险：确定要删除该用户吗？相关数据可能丢失！" onConfirm={() => handleDelete(record._id, record.type)}>
            {/* 保护机制：只有初代超级管理员（admin）拥有免死金牌，其他新增的管理员都可以被删除 */}
            <Button type="link" danger disabled={record.username === 'admin'}>删除账号</Button>
         </Popconfirm>
      )
    }
  ];

  return (
    <Card 
      title="系统用户与移动端客户管理"
      // 👇 在卡片右上角增加一个“新增管理员”按钮
      extra={
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          + 新增管理员
        </Button>
      }
    >
      <Table columns={columns} dataSource={users} rowKey="_id" />

      {/* 👇 新增管理员专属弹窗 */}
      <Modal
        title="✨ 开通内部管理员账号"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAdmin} style={{ marginTop: 20 }}>
          <Form.Item 
            label="管理员账号" 
            name="username" 
            rules={[{ required: true, message: '请输入要分配的账号名' }]}
          >
            <Input placeholder="请设置登录账号 (如: admin_2)" />
          </Form.Item>
          
          <Form.Item 
            label="初始登录密码" 
            name="password" 
            rules={[
              { required: true, message: '请设置密码' },
              { min: 6, message: '安全起见，密码不能少于6位' }
            ]}
          >
            <Input.Password placeholder="请设置初始密码" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>取消</Button>
              <Button type="primary" htmlType="submit">确认开通</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}