import { Layout, Menu, Button, Space, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, getRole, getUsername } from '../utils/auth';
import { UserOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();
  const username = getUsername();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // 根据角色动态生成侧边栏菜单
  const menuItems = role === 'merchant' 
    ? [
        { key: '/merchant', label: '录入新酒店' },
        { key: '/merchant/list', label: '我的酒店列表' },
        { key: '/merchant/orders', label: '订房订单管理' }
      ]
    : [
        { key: '/admin', label: '审核酒店列表' },
        { key: '/admin/users', label: '用户账号管理' }
      ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', color: 'white' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>易宿酒店管理系统</div>
        
        {/* 👈 这里是新增的个人信息展示区 */}
        <Space size="large">
          <Space>
            <UserOutlined />
            <span>你好, {username}</span>
            <Tag color={role === 'admin' ? 'red' : 'blue'}>
              {role === 'admin' ? '超级管理员' : '入驻商户'}
            </Tag>
          </Space>
          <Button type="primary" danger onClick={handleLogout} size="small">退出登录</Button>
        </Space>
      </Header>
      
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]} // 根据当前路由高亮菜单
            items={menuItems}
            onClick={(e) => navigate(e.key)} // 点击菜单跳转路由
          />
        </Sider>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
}