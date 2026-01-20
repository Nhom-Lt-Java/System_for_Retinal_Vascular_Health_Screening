import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Activity } from 'lucide-react'; // Thêm icon nếu muốn đẹp hơn

const Navbar = () => {
  const navigate = useNavigate();
  const { token, role, logout } = useAuth(); 

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
              {role === "USER" && (
                <>
                  <Link to="/user/dashboard" className="hover:text-blue-200 transition">Trang chủ</Link>
                  <Link to="/user/upload" className="hover:text-blue-200 transition">Phân tích ảnh</Link>
                </>
              )}

              {/* --- MENU DOCTOR --- */}
              {role === "DOCTOR" && (
                <>
                  <Link to="/doctor/patients" className="hover:text-blue-200 transition">Danh sách Bệnh nhân</Link>
                </>
              )}

              {/* --- MENU CLINIC --- */}
              {role === "CLINIC_ADMIN" && (
                <>
                  <Link to="/clinic/dashboard" className="hover:text-blue-200 transition">Phòng khám</Link>
                  <Link to="/clinic/doctors" className="hover:text-blue-200 transition">Quản lý Bác sĩ</Link>
                </>
              )}

              {/* --- MENU ADMIN --- */}
              {role === "SUPER_ADMIN" && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-blue-200 transition">Quản trị</Link>
                </>
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