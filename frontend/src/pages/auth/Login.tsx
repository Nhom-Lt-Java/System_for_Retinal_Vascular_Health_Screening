import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function normalizeRole(r: string) {
  const up = (r || "").toUpperCase();
  if (up === "ADMIN" || up === "SUPER_ADMIN") return "ADMIN";
  if (up === "CLINIC" || up === "CLINIC_ADMIN") return "CLINIC";
  if (up === "DOCTOR") return "DOCTOR";
  return "USER";
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.login({ username, password });
      
      const token = res.data?.token;
      const user = res.data?.user || {};
      const role = normalizeRole(res.data?.role || user.role);

      if (!token) {
        throw new Error("Không nhận được xác thực từ hệ thống.");
      }

      login(user, token, role);

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "CLINIC") navigate("/clinic/dashboard");
      else if (role === "DOCTOR") navigate("/doctor/dashboard");
      else navigate("/user/upload");

    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data || "Tên đăng nhập hoặc mật khẩu không đúng.";
      setError(typeof msg === 'string' ? msg : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Sử dụng Tailwind class thay cho inline style để fix warning
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')]">
      <div className="absolute inset-0 bg-blue-900 bg-opacity-40"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">AURA</h1>
          <p className="text-gray-600 font-medium">Hệ thống sàng lọc võng mạc</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nhập tên đăng nhập hoặc Email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-blue-700 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}