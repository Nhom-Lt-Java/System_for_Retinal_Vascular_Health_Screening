import { Navigate, Outlet } from 'react-router-dom';

function normalizeRole(role: string | null | undefined): string {
  const up = (role || "").toUpperCase();
  if (up === "SUPER_ADMIN") return "ADMIN";
  if (up === "CLINIC_ADMIN") return "CLINIC";
  return up;
}

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const role = normalizeRole(localStorage.getItem("role"));

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