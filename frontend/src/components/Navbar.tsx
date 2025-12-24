// src/components/Navbar.tsx
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  const navigate = useNavigate();
  // Lấy thông tin user từ bộ nhớ (lúc đăng nhập đã lưu)
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { lastName: 'Người dùng' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Logo className="w-6 h-6" textSize="text-xl" />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            <UserIcon size={18} />
          </div>
          <span className="font-medium">{user.lastName}</span>
        </div>

        <button 
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </nav>
  );
}