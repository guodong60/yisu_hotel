
import { Navigate } from 'react-router-dom';
import { getToken, getRole } from '../utils/auth';

export default function AuthRoute({ children, allowedRole }) {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  
  return children;
}