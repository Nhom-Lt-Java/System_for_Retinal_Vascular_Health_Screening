import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginOptions from './pages/auth/LoginOptions';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard'; // <--- QUAN TRỌNG: Import file Dashboard mới

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang chọn vai trò (Trang chủ) */}
        <Route path="/" element={<LoginOptions />} />
        
        {/* Các trang đăng nhập/đăng ký */}
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Trang Dashboard chính */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Nếu đường dẫn sai thì tự về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;