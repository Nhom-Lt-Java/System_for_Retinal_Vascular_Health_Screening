import { User, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';

export default function LoginOptions() {
  const navigate = useNavigate();

  const OptionBtn = ({ title, icon: Icon, path, color }: any) => (
    <button 
      onClick={() => navigate(path)}
      className={`w-full p-4 mb-4 rounded-xl border-2 border-transparent hover:border-${color}-500 bg-${color}-50 flex items-center gap-4 transition-all hover:shadow-md group`}
    >
      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-${color}-600 shadow-sm`}>
        <Icon size={24} />
      </div>
      <div className="text-left">
        <h3 className="font-bold text-gray-800 group-hover:text-blue-700">{title}</h3>
        <p className="text-xs text-gray-500">Nhấn để đăng nhập</p>
      </div>
    </button>
  );

  return (
    <AuthLayout title="Chào mừng">
      <p className="text-gray-500 text-center mb-8 -mt-4">
        Vui lòng chọn vai trò để truy cập hệ thống
      </p>

      <OptionBtn 
        title="Người dùng / Bệnh nhân" 
        icon={User} 
        path="/login/user"
        color="blue"
      />

      <OptionBtn 
        title="Bác sĩ / Chuyên gia" 
        icon={Stethoscope} 
        path="/login/doctor"
        color="teal"
      />

      <div className="mt-8 text-center border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500 mb-2">Chưa có tài khoản?</p>
        <button 
          onClick={() => navigate('/register')}
          className="text-blue-600 font-bold text-sm hover:underline"
        >
          Đăng ký tài khoản mới
        </button>
      </div>
    </AuthLayout>
  );
}