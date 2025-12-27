import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import api from '../../services/api'; // Sử dụng API thật

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.role) {
      setError('Vui lòng chọn vai trò!');
      return;
    }
    
    setLoading(true);

    try {
      // GỌI API THẬT VÀO BACKEND
      // Backend sẽ tự động lưu vào Database PostgreSQL
      await api.post('/auth/register', {
        // Map dữ liệu cho khớp với Java Backend
        username: formData.email, // Backend thường dùng username là email
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      alert('Đăng ký thành công! Dữ liệu đã được lưu vào Database.');
      navigate('/login/' + formData.role.toLowerCase());
    } catch (err: any) {
      console.error(err);
      // Hiển thị lỗi từ Backend trả về (nếu có)
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-gray-100 border-none text-gray-800 text-sm rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all placeholder:text-gray-400 mb-4";

  return (
    <AuthLayout title="Đăng ký tài khoản">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-1">
            <input type="text" placeholder="Họ" className={inputStyle}
              value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
            <input type="text" placeholder="Tên" className={inputStyle}
              value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
        </div>

        <input type="email" placeholder="Email" className={inputStyle}
          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />

        <input type="password" placeholder="Mật khẩu" className={inputStyle}
          value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />

        <div className="relative mb-6">
          <select className={inputStyle + " appearance-none cursor-pointer text-gray-600"}
            value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required >
            <option value="" disabled>-- Chọn vai trò --</option>
            <option value="USER">Người dùng</option>
            <option value="DOCTOR">Bác sĩ</option>
          </select>
        </div>

        <Button type="submit" fullWidth disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg">
          {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
        </Button>

        <div className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản? 
          <span onClick={() => navigate('/')} className="text-blue-600 font-bold cursor-pointer hover:underline ml-1">Đăng nhập</span>
        </div>
      </form>
    </AuthLayout>
  );
}