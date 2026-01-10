import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// --- Auth Pages ---
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// --- User Pages ---
import Upload from './pages/user/Upload';
import Result from './pages/user/Result';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import Chat from './pages/user/Chat';

// --- Doctor Pages ---
// Lưu ý: Dashboard bác sĩ của bạn đang ở path này
import DoctorDashboard from './pages/doctor/Dashboard'; 
import PatientList from './pages/doctor/PatientList';

// --- Clinic Pages (MỚI) ---
// Đảm bảo bạn đã tạo các file này trong thư mục src/pages/clinic/
import ClinicRegister from './pages/clinic/ClinicRegister';
import ClinicDashboard from './pages/clinic/ClinicDashboard';
import DoctorManager from './pages/clinic/DoctorManager';
import BulkUpload from './pages/clinic/BulkUpload';

// --- Admin Pages (MỚI) ---
// Đảm bảo bạn đã tạo các file này trong thư mục src/pages/admin/
import AdminDashboard from './pages/admin/AdminDashboard';
import AISettings from './pages/admin/AISettings';

export default function App() {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  // Hàm điều hướng thông minh theo Role
  const getHomeRoute = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN': return '/admin';
      case 'CLINIC_ADMIN': return '/clinic';
      case 'DOCTOR': 
      case 'doctor': return '/doctor';
      default: return '/upload';
    }
  };

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to={getHomeRoute()} />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to={getHomeRoute()} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Đăng ký phòng khám (Ai cũng xem được) */}
        <Route path="/clinic/register" element={<ClinicRegister />} />

        {/* Trang chủ điều hướng */}
        <Route path="/" element={token ? <Navigate to={getHomeRoute()} /> : <Navigate to="/login" />} />

        {/* --- USER ROUTES --- */}
        <Route path="/upload" element={token ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/result" element={token ? <Result /> : <Navigate to="/login" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/login" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

        {/* --- DOCTOR ROUTES --- */}
        <Route path="/doctor" element={token && (user?.role === 'doctor' || user?.role === 'DOCTOR') ? <DoctorDashboard /> : <Navigate to="/login" />} />
        <Route path="/doctor/patients" element={token && (user?.role === 'doctor' || user?.role === 'DOCTOR') ? <PatientList /> : <Navigate to="/login" />} />

        {/* --- CLINIC ROUTES (MỚI) --- */}
        <Route path="/clinic" element={token && user?.role === 'CLINIC_ADMIN' ? <ClinicDashboard /> : <Navigate to="/login" />} />
        <Route path="/clinic/doctors" element={token && user?.role === 'CLINIC_ADMIN' ? <DoctorManager /> : <Navigate to="/login" />} />
        <Route path="/clinic/bulk-upload" element={token && user?.role === 'CLINIC_ADMIN' ? <BulkUpload /> : <Navigate to="/login" />} />

        {/* --- ADMIN ROUTES (MỚI) --- */}
        <Route path="/admin" element={token && user?.role === 'SUPER_ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/ai-settings" element={token && user?.role === 'SUPER_ADMIN' ? <AISettings /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}