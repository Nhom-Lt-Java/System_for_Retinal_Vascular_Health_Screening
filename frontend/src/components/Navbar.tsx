import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Activity, Bell, MessageSquareText, CreditCard, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, role, logout, user } = useAuth();

  const normalizedRole = (role || "").toUpperCase() === "SUPER_ADMIN" ? "ADMIN"
    : (role || "").toUpperCase() === "CLINIC_ADMIN" ? "CLINIC"
    : (role || "").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 px-6 py-4 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Tên App */}
        <div
          className="font-bold text-2xl cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <Activity size={28} /> Aura Retinal AI
        </div>

        {/* Menu Items */}
        <div className="flex gap-6 items-center text-sm font-medium">
          {token ? (
            <>
              {/* --- MENU USER --- */}
              {normalizedRole === "USER" && (
                <>
                  <Link to="/user/upload" className="hover:text-blue-200 transition">Phân tích ảnh</Link>
                  <Link to="/user/history" className="hover:text-blue-200 transition">Lịch sử</Link>
                  <Link to="/user/billing" className="hover:text-blue-200 transition flex items-center gap-2">
                    <CreditCard size={16} /> Gói dịch vụ
                  </Link>
                </>
              )}

              {/* --- MENU DOCTOR --- */}
              {normalizedRole === "DOCTOR" && (
                <>
                  <Link to="/doctor/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                  <Link to="/doctor/patients" className="hover:text-blue-200 transition">Bệnh nhân</Link>
                  {/* Thêm nút Chat cho Bác sĩ */}
                  <Link to="/chat" className="hover:text-blue-200 transition flex items-center gap-2">
                    <MessageSquareText size={16} /> Chat
                  </Link>
                  <Link to="/doctor/trends" className="hover:text-blue-200 transition">Trend</Link>
                </>
              )}

              {/* --- MENU CLINIC --- */}
              {normalizedRole === "CLINIC" && (
                <>
                  <Link to="/clinic/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                  <Link to="/clinic/doctors" className="hover:text-blue-200 transition">Bác sĩ</Link>
                  <Link to="/clinic/patients" className="hover:text-blue-200 transition">Bệnh nhân</Link>
                  <Link to="/clinic/bulk" className="hover:text-blue-200 transition">Bulk upload</Link>
                  {/* Thêm nút Chat cho Phòng khám */}
                  <Link to="/chat" className="hover:text-blue-200 transition flex items-center gap-2">
                    <MessageSquareText size={16} /> Chat
                  </Link>
                  <Link to="/clinic/billing" className="hover:text-blue-200 transition flex items-center gap-2">
                    <CreditCard size={16} /> Gói dịch vụ
                  </Link>
                </>
              )}

              {/* --- MENU ADMIN --- */}
              {normalizedRole === "ADMIN" && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-blue-200 transition">Quản trị</Link>
                  <Link to="/admin/users" className="hover:text-blue-200 transition">Users</Link>
                  <Link to="/admin/notification-templates" className="hover:text-blue-200 transition">Templates</Link>
                  <Link to="/admin/ai-settings" className="hover:text-blue-200 transition flex items-center gap-2">
                    <Settings size={16} /> AI settings
                  </Link>
                  {/* Thêm nút Chat cho Admin */}
                  <Link to="/chat" className="hover:text-blue-200 transition flex items-center gap-2">
                    <MessageSquareText size={16} /> Chat
                  </Link>
                  <Link to="/admin/pricing" className="hover:text-blue-200 transition flex items-center gap-2">
                    <CreditCard size={16} /> Gói & giá
                  </Link>
                </>
              )}

              {/* Notifications */}
              <Link to="/notifications" className="hover:text-blue-200 transition flex items-center gap-2">
                <Bell size={18} /> Thông báo
              </Link>

              {/* Quick chat shortcut for USER */}
              {normalizedRole === "USER" && user?.assignedDoctorId && (
                <Link to={`/chat/${user.assignedDoctorId}`} className="hover:text-blue-200 transition flex items-center gap-2">
                  <MessageSquareText size={18} /> Chat bác sĩ
                </Link>
              )}

              {/* Vách ngăn */}
              <div className="h-6 w-px bg-blue-400 mx-2"></div>

              {/* Hồ sơ cá nhân */}
              <Link to="/profile" className="hover:text-blue-200 transition flex items-center gap-2">
                <User size={18} /> Hồ sơ
              </Link>

              {/* Nút đăng xuất */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition">Đăng nhập</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-bold transition shadow-sm">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;