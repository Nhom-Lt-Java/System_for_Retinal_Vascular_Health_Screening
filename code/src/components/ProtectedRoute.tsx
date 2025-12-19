import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../types';

interface Props {
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  // Lấy user từ localStorage hoặc Context (Giả lập)
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; // Cho phép đi tiếp
};

export default ProtectedRoute;