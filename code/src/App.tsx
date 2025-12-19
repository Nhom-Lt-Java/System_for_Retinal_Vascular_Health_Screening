import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import MainLayout from './components/layout/MainLayout';
import UploadScan from './pages/Patient/UploadScan';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
// QUAN TRỌNG: Dòng này sửa lỗi đỏ "Cannot find name PatientDetail"
import PatientDetail from './pages/Doctor/PatientDetail'; 
import ChatPage from './pages/Doctor/ChatPage'; 
import ProfilePage from './pages/Common/ProfilePage';
import AdminDashboard from './pages/Admin/AdminDashboard';

const SimplePage = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-full text-gray-400">
        <h2 className="text-xl font-medium border-b-2 border-sky-500 pb-2">{title}</h2>
    </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        <Route element={<MainLayout />}>
          {/* User Routes */}
          <Route path="/patient/dashboard" element={<UploadScan />} />
          <Route path="/patient/history" element={<SimplePage title="Lịch sử khám bệnh" />} />
          <Route path="/patient/profile" element={<ProfilePage />} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/patient/:id" element={<PatientDetail />} />
          <Route path="/doctor/patients" element={<SimplePage title="Quản lý bệnh nhân" />} />
          <Route path="/doctor/chat" element={<ChatPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<SimplePage title="Quản lý tài khoản" />} />
          <Route path="/admin/reports" element={<SimplePage title="Báo cáo" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;