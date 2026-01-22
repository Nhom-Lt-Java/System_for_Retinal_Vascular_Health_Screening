import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import  authApi  from '../../api/authApi';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ username, password });
      // Kiểm tra đúng quyền Admin mới cho vào
      if (res.data.role === 'ROLE_ADMIN' || res.data.role === 'ROLE_CLINIC') {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('role', res.data.role);
        navigate('/admin/dashboard');
      } else {
        setError('Tài khoản này không có quyền truy cập Admin!');
      }
    } catch (err) {
      setError('Truy cập bị từ chối.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Admin Portal</h2>
        <p className="text-center text-gray-400 mb-6 text-sm">Hệ thống quản trị Aura AI</p>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Username</label>
            <input type="text" className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <input type="password" className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg">
            Đăng nhập hệ thống
          </button>
        </form>

        <div className="mt-6 text-center">
           <Link to="/auth/register/admin" className="text-gray-500 text-sm hover:text-white transition">Đăng ký Admin mới (Cần Key)</Link>
        </div>
        <div className="mt-2 text-center">
           <Link to="/auth/login-options" className="text-gray-600 text-xs hover:text-gray-400">← Quay lại</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;