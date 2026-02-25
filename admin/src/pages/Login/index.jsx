import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../api/hotel';
import { setToken, setRole, setUsername } from '../../utils/auth';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      if (activeTab === 'login') {
        const res = await login(values);
        if (res.code === 0) {
          setToken(res.data.token);
          setRole(res.data.role);
          setUsername(values.username);
          message.success('登录成功');
          navigate(res.data.role === 'admin' ? '/admin' : '/merchant');
        }
      } else {
        // 🌟 注册时，前端也默认固定为 merchant
        const res = await register({ ...values, role: 'merchant' });
        if (res.code === 0) {
          message.success('注册成功，请登录');
          setActiveTab('login');
        }
      }
    } catch (error) {
      console.error("提交遇到错误:", error); 
    }
  };

  const tabItems = [
    { key: 'login', label: '登录' },
    { key: 'register', label: '注册商户' } // 明确告诉用户这里是注册商户
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered />
        <Form onFinish={onFinish} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入登录账号" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          
          {/* 🌟 这里的 Role Radio 单选框已经被彻底删除了！ */}
          
          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
            {activeTab === 'login' ? '登录' : '立即注册'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}