import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("role");
  
  // SỬA LỖI: Luôn chuyển về chữ hoa để so sánh (ví dụ: "user" -> "USER")
  const role = rawRole ? rawRole.toUpperCase() : "";

  // 1. Chưa đăng nhập -> Về trang Login
  if (!token) return <Navigate to="/login" replace />;

  // 2. Sai quyền -> Về trang Login (thay vì trang chủ để tránh vòng lặp vô tận)
  if (!allowedRoles.includes(role)) {
    console.warn("Chặn truy cập: Role hiện tại", role, "không nằm trong", allowedRoles);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;