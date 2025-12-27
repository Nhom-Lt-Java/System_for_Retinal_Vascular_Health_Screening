import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import Upload from './pages/user/Upload';
import Result from './pages/user/Result';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import Chat from './pages/user/Chat';

// Doctor Pages
import Dashboard from './pages/doctor/Dashboard';
import PatientList from './pages/doctor/PatientList';

export default function App() {
  const { token, user, loading } = useAuth();

  if (loading) return null; // Chờ kiểm tra trạng thái đăng nhập

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes - Yêu cầu Token */}
        <Route path="/" element={
          token ? (user?.role === 'doctor' ? <Navigate to="/doctor" /> : <Navigate to="/upload" />) : <Navigate to="/login" />
        } />

        {/* Routes dành cho Bệnh nhân (User) */}
        <Route path="/upload" element={token ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/result" element={token ? <Result /> : <Navigate to="/login" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/login" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

        {/* Routes dành cho Bác sĩ (Doctor) */}
        <Route path="/doctor" element={token && user?.role === 'doctor' ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/doctor/patients" element={token && user?.role === 'doctor' ? <PatientList /> : <Navigate to="/login" />} />

        {/* Redirect lỗi 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}