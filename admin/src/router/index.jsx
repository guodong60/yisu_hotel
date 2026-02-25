import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Layout from '../components/Layout';
import AuthRoute from '../components/AuthRoute';

// 引入所有页面
import HotelForm from '../pages/Merchant/HotelForm';
import MyHotels from '../pages/Merchant/MyHotels';
import OrderList from '../pages/Merchant/OrderList';
import AuditList from '../pages/Admin/AuditList';
import UserList from '../pages/Admin/UserList';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AuthRoute><Layout /></AuthRoute>,
    children: [
      // 商户路由
      { path: 'merchant', element: <AuthRoute allowedRole="merchant"><HotelForm /></AuthRoute> },
      { path: 'merchant/list', element: <AuthRoute allowedRole="merchant"><MyHotels /></AuthRoute> },
      { path: 'merchant/orders', element: <AuthRoute allowedRole="merchant"><OrderList /></AuthRoute> },
      
      // 管理员路由
      { path: 'admin', element: <AuthRoute allowedRole="admin"><AuditList /></AuthRoute> },
      { path: 'admin/users', element: <AuthRoute allowedRole="admin"><UserList /></AuthRoute> },
      
      // 默认重定向
      { path: '', element: <Navigate to="/login" replace /> }
    ]
  }
]);

export default router;