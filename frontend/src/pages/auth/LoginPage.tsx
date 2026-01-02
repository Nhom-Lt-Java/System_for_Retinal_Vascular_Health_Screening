import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import api from '../../services/api';

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDoctor = role === 'doctor';
  const roleTitle = isDoctor ? 'Bác sĩ' : 'Người dùng';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Đang gửi đăng nhập...", formData); // Log để kiểm tra

      // Gọi API đăng nhập
      const response = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
        // Backend Java thường tự hiểu role qua username hoặc không cần gửi role lúc login
      });

      console.log("Kết quả:", response.data);

      // Lưu token
      const token = response.data.token || response.data;
      if (token) {
        localStorage.setItem('token', typeof token === 'string' ? token : JSON.stringify(token));
        localStorage.setItem('user', JSON.stringify({ username: formData.username, role: role }));
        
        alert("Đăng nhập thành công!");
        navigate('/dashboard'); // Chuyển vào trang trong
      } else {
        setError('Đăng nhập thành công nhưng không có Token.');
      }

    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      // Hiển thị lỗi chi tiết
      if (err.code === "ERR_NETWORK") {
        setError("Không kết nối được Backend (8080). Hãy kiểm tra Docker!");
      } else if (err.response?.status === 401) {
        setError("Sai tên đăng nhập hoặc mật khẩu!");
      } else {
        setError(err.response?.data?.message || "Lỗi đăng nhập không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN (Giữ nguyên cho đẹp) ---
  const inputContainerStyle = "relative mb-4";
  const inputStyle = "w-full bg-gray-100 border border-transparent text-gray-900 text-sm rounded-lg pl-10 pr-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400 font-medium";
  const iconStyle = "absolute left-3 top-3.5 text-gray-400";

  return (
    <AuthLayout title={`Đăng nhập ${roleTitle}`}>
      <button onClick={() => navigate('/')} className="mb-6 text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium">
        <ArrowLeft size={16} /> Quay lại
      </button>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <div className={inputContainerStyle}>
          <User size={18} className={iconStyle} />
          <input type="text" className={inputStyle} placeholder={isDoctor ? "Tên đăng nhập Bác sĩ" : "Email / Mã SV"}
            value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
        </div>

        <div className={inputContainerStyle}>
          <Lock size={18} className={iconStyle} />
          <input type={showPassword ? "text" : "password"} className={`${inputStyle} pr-10`} placeholder="Mật khẩu"
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" fullWidth disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg">
          {loading ? 'Đang kết nối...' : 'Đăng nhập'}
        </Button>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">Chưa có tài khoản? <span onClick={() => navigate('/register')} className="text-blue-700 font-bold cursor-pointer hover:underline">Đăng ký mới</span></p>
        </div>
      </form>
    </AuthLayout>
  );
}