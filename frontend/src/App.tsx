import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // SỬA: Dùng Hook thay vì localStorage trực tiếp
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// AUTH
import ClientLogin from "./pages/auth/ClientLogin";
import ClientRegister from "./pages/auth/ClientRegister";

// PAGES
import UserDashboard from "./pages/user/Dashboard"; 
import UserUpload from "./pages/user/Upload";       
import UserProfile from "./pages/user/Profile"; // BỔ SUNG: Import trang hồ sơ
import PatientList from "./pages/doctor/PatientList";
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import DoctorManager from "./pages/clinic/DoctorManager";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const { token, role, loading } = useAuth(); // Lấy dữ liệu từ Context để đảm bảo đồng bộ

  // Hiển thị màn hình chờ khi đang tải dữ liệu user (tránh màn hình trắng)
  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải hệ thống...</div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 min-h-[calc(100vh-80px)]">
        <Routes>
          {/* --- ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
          <Route path="/" element={
              !token ? <Navigate to="/login" /> : 
              role === 'SUPER_ADMIN' ? <Navigate to="/admin/dashboard" /> :
              role === 'CLINIC_ADMIN' ? <Navigate to="/clinic/dashboard" /> :
              role === 'DOCTOR' ? <Navigate to="/doctor/patients" /> :
              <Navigate to="/user/dashboard" />
          } />

          <Route path="/login" element={<ClientLogin />} />
          <Route path="/register" element={<ClientRegister />} />

          {/* --- CÁC TRANG BẢO VỆ --- */}
          
          {/* 1. USER */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/upload" element={<UserUpload />} />
            {/* Nếu có trang lịch sử, thêm vào đây: <Route path="/user/history" element={<UserHistory />} /> */}
          </Route>

          {/* 2. DOCTOR */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route path="/doctor/patients" element={<PatientList />} />
            {/* Redirect dashboard về danh sách bệnh nhân */}
            <Route path="/doctor/dashboard" element={<Navigate to="/doctor/patients" />} />
          </Route>

          {/* 3. CLINIC ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['CLINIC_ADMIN']} />}>
            <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
            <Route path="/clinic/doctors" element={<DoctorManager />} />
          </Route>

          {/* 4. SUPER ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 5. TRANG CHUNG (HỒ SƠ CÁ NHÂN) - Cho phép tất cả Role đã đăng nhập */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;