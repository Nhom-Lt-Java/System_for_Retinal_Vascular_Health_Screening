import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ClientRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    fullName: '',
    role: 'USER', 
    clinicName: '', 
    address: '' 
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Gọi đúng API Backend đã sửa
      await axios.post("http://localhost:8080/api/auth/register", formData);
      
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Đăng ký hệ thống</h2>
        
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
            </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input name="fullName" placeholder="Nguyễn Văn A" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, fullName: e.target.value})} required />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
             <input name="email" type="email" placeholder="example@email.com" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select 
                name="role" 
                aria-label="Chọn vai trò người dùng" 
                title="Chọn vai trò người dùng"
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={e => setFormData({...formData, role: e.target.value})}
                value={formData.role}
            >
                <option value="USER">Người dùng (Bệnh nhân)</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="CLINIC_ADMIN">Quản lý Phòng khám</option>
                {/* <option value="SUPER_ADMIN">Admin Tổng</option> */}
            </select>
          </div>

          {/* Form mở rộng cho Clinic */}
          {(formData.role === 'CLINIC_ADMIN') && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3 animate-fade-in">
              <input placeholder="Tên phòng khám" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, clinicName: e.target.value})} required />
              <input placeholder="Địa chỉ phòng khám" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, address: e.target.value})} required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input name="username" placeholder="username" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, username: e.target.value})} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input name="password" type="password" placeholder="••••••••" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full text-white mt-8 p-3 rounded-xl font-bold transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}>
          {loading ? "Đang xử lý..." : "Đăng ký ngay"}
        </button>

        <div className="mt-4 text-center text-sm">
             Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};

export default ClientRegister;