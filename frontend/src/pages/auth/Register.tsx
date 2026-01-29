import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import { FaUser, FaEnvelope, FaLock, FaHospital, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    fullName: '',
    role: 'USER', 
    clinicName: '', 
    address: '',
    phone: '',
    clinicId: ''
  });

  useEffect(() => {
    // Lấy danh sách phòng khám public
    authApi.getClinics()
      .then((res: any) => {
          // Xử lý dữ liệu trả về (có thể là res.data hoặc res trực tiếp)
          const data = Array.isArray(res) ? res : (res.data || []);
          setClinics(data);
      })
      .catch(err => console.error("Không tải được DS phòng khám", err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role
      };

      if (formData.role === 'USER' && formData.clinicId) {
          payload.clinicId = Number(formData.clinicId);
      }
      
      if (formData.role === 'CLINIC_ADMIN') {
          payload.clinicName = formData.clinicName;
          payload.address = formData.address;
      }

      await authApi.register(payload);
      
      alert("Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.");
      navigate("/login");
      
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Đăng ký thất bại.";
      setError(typeof msg === 'string' ? msg : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-center text-white uppercase tracking-wider">Đăng ký tài khoản</h2>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Họ tên */}
          <div className="relative">
            <FaUser className="absolute top-3.5 left-3 text-gray-400" />
            <input name="fullName" placeholder="Họ và tên hiển thị" 
                   className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   onChange={handleChange} required />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3 text-gray-400" />
            <input name="email" type="email" placeholder="Địa chỉ Email" 
                   className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   onChange={handleChange} required />
          </div>

           {/* Phone */}
           <div className="relative">
            <FaPhone className="absolute top-3.5 left-3 text-gray-400" />
            <input name="phone" placeholder="Số điện thoại" 
                   className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   onChange={handleChange} required />
          </div>
          
          {/* Vai trò */}
          <div className="relative">
            <select 
                name="role"
                aria-label="Chọn vai trò" 
                title="Chọn vai trò người dùng"
                className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none" 
                onChange={handleChange}
                value={formData.role}
            >
                <option value="USER">Bệnh nhân (Người dùng)</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="CLINIC_ADMIN">Quản lý Phòng khám</option>
            </select>
          </div>

          {/* --- USER CHỌN PHÒNG KHÁM --- */}
          {formData.role === 'USER' && (
             <div className="relative">
                 <FaHospital className="absolute top-3.5 left-3 text-gray-400" />
                 <select 
                    name="clinicId"
                    aria-label="Chọn phòng khám"
                    title="Chọn phòng khám"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    onChange={handleChange}
                    value={formData.clinicId}
                 >
                    <option value="">-- Chọn Phòng Khám (Tuỳ chọn) --</option>
                    {clinics.map((c: any) => (
                        <option key={c.id} value={c.id}>
                            {c.name} - {c.address}
                        </option>
                    ))}
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
             </div>
          )}

          {/* Clinic Admin nhập thông tin PK */}
          {(formData.role === 'CLINIC_ADMIN') && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg animate-fade-in">
              <div className="relative">
                <FaHospital className="absolute top-3.5 left-3 text-blue-400" />
                <input name="clinicName" placeholder="Tên phòng khám" 
                       className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded focus:outline-none" 
                       onChange={handleChange} required />
              </div>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-3.5 left-3 text-blue-400" />
                <input name="address" placeholder="Địa chỉ" 
                       className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded focus:outline-none" 
                       onChange={handleChange} required />
              </div>
            </div>
          )}

          {/* Username */}
          <div className="relative">
            <FaUser className="absolute top-3.5 left-3 text-gray-400" />
            <input name="username" placeholder="Tên đăng nhập" 
                   className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   onChange={handleChange} required />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-gray-400" />
            <input name="password" type="password" placeholder="Mật khẩu" 
                   className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   onChange={handleChange} required />
          </div>

          <button type="submit" disabled={loading} 
                  className={`w-full mt-6 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'}`}>
            {loading ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
          </button>

          <div className="mt-4 text-center">
             <span className="text-gray-600">Đã có tài khoản? </span>
             <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;