import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import  authApi  from '../../api/authApi';

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', fullName: '', 
    role: 'admin', adminKey: '' // Trường quan trọng để xác thực admin
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.register(formData);
      alert('Đăng ký Admin thành công!');
      navigate('/auth/login/admin');
    } catch (err: any) {
      alert('Thất bại: ' + (err.response?.data || 'Sai mã bí mật hoặc lỗi hệ thống'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-indigo-400 mb-6">Đăng Ký Admin Mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Họ tên hiển thị" className="w-full p-3 bg-gray-700 text-white border-none rounded focus:ring-2 focus:ring-indigo-500" 
             onChange={e => setFormData({...formData, fullName: e.target.value})} required />
          <input type="text" placeholder="Username Admin" className="w-full p-3 bg-gray-700 text-white border-none rounded focus:ring-2 focus:ring-indigo-500" 
             onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email liên hệ" className="w-full p-3 bg-gray-700 text-white border-none rounded focus:ring-2 focus:ring-indigo-500" 
             onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Mật khẩu" className="w-full p-3 bg-gray-700 text-white border-none rounded focus:ring-2 focus:ring-indigo-500" 
             onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          <div className="pt-2">
            <label className="text-red-400 text-xs uppercase font-bold tracking-wider mb-1 block">Mã bí mật hệ thống (Bắt buộc)</label>
            <input type="text" placeholder="Nhập: ADMIN123" className="w-full p-3 bg-red-900/20 border border-red-500/50 text-red-200 rounded focus:border-red-500 outline-none" 
               onChange={e => setFormData({...formData, adminKey: e.target.value})} required />
          </div>
          
          <button type="submit" className="w-full py-3 mt-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition">
            Xác Nhận Đăng Ký
          </button>
        </form>
        <div className="mt-4 text-center">
           <Link to="/auth/login/admin" className="text-gray-400 text-sm hover:text-white">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;