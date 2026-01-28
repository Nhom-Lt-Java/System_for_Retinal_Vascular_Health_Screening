import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Components (Đảm bảo đường dẫn import đúng file bạn vừa sửa)
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register"; // Sử dụng file đăng ký chung mới

// User Pages
import Upload from "./pages/user/Upload";
import Result from "./pages/user/Result";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import PatientList from "./pages/doctor/PatientList";
import DoctorTrends from "./pages/doctor/Trends";

// Clinic Pages
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import DoctorManager from "./pages/clinic/DoctorManager";
import ClinicPatients from "./pages/clinic/Patients";
import BulkUpload from "./pages/clinic/BulkUpload";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AISettings from "./pages/admin/AISettings";
import PricingManager from "./pages/admin/PricingManager";
import AdminUserManager from "./pages/admin/UserManager";
import NotificationTemplates from "./pages/admin/NotificationTemplates";

// Common Pages
import NotificationsPage from "./pages/common/Notifications";
import ChatPage from "./pages/common/Chat";
import Billing from "./pages/common/Billing";

function App() {
  const { token, role, loading } = useAuth();

  const normalizedRole = (role || "").toUpperCase() === "SUPER_ADMIN" ? "ADMIN"
    : (role || "").toUpperCase() === "CLINIC_ADMIN" ? "CLINIC"
    : (role || "").toUpperCase();

  if (loading) return <div className="h-screen flex items-center justify-center font-semibold text-blue-600">Đang tải hệ thống AURA...</div>;

  return (
    <>
      {/* Chỉ hiện Navbar khi đã đăng nhập (tuỳ chọn, ở đây giữ nguyên logic cũ) */}
      <Navbar /> 
      
      <div className="container mx-auto p-0 min-h-[calc(100vh-80px)]"> 
        <Routes>
          {/* Default Route: Điều hướng thông minh dựa trên Role */}
          <Route
            path="/"
            element={
              !token ? <Navigate to="/login" /> :
              normalizedRole === "ADMIN" ? <Navigate to="/admin/dashboard" /> :
              normalizedRole === "CLINIC" ? <Navigate to="/clinic/dashboard" /> :
              normalizedRole === "DOCTOR" ? <Navigate to="/doctor/dashboard" /> :
              <Navigate to="/user/upload" />
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Nếu bạn có trang ClientRegister riêng, hãy xóa route đó và dùng route chung /register */}

          {/* --- PROTECTED ROUTES --- */}

          {/* USER */}
          <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
            <Route path="/user/upload" element={<Upload />} />
            <Route path="/user/history" element={<History />} />
            <Route path="/user/result/:id" element={<Result />} />
            <Route path="/user/billing" element={<Billing />} />
          </Route>

          {/* DOCTOR */}
          <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<PatientList />} />
            <Route path="/doctor/trends" element={<DoctorTrends />} />
            <Route path="/doctor/result/:id" element={<Result />} />
          </Route>

          {/* CLINIC */}
          <Route element={<ProtectedRoute allowedRoles={["CLINIC"]} />}>
            <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
            <Route path="/clinic/doctors" element={<DoctorManager />} />
            <Route path="/clinic/patients" element={<ClinicPatients />} />
            <Route path="/clinic/bulk" element={<BulkUpload />} />
            <Route path="/clinic/billing" element={<Billing />} />
            <Route path="/clinic/result/:id" element={<Result />} />
          </Route>

          {/* ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/ai-settings" element={<AISettings />} />
            <Route path="/admin/pricing" element={<PricingManager />} />
            <Route path="/admin/users" element={<AdminUserManager />} />
            <Route path="/admin/notification-templates" element={<NotificationTemplates />} />
            <Route path="/admin/result/:id" element={<Result />} />
          </Route>

          {/* COMMON (Shared access) */}
          <Route element={<ProtectedRoute allowedRoles={["USER", "DOCTOR", "CLINIC", "ADMIN"]} />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/chat/:otherId" element={<ChatPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
export default App;