import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/Button';

export default function UserProfile() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    avatar: 'https://i.pravatar.cc/300',
    role: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setProfile({
        fullName: parsedUser.username || 'Người dùng Aura',
        email: parsedUser.email || 'user@example.com',
        avatar: parsedUser.avatar || 'https://i.pravatar.cc/300',
        role: parsedUser.role || 'USER'
      });
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (showPasswordSection) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setErrorMsg('Mật khẩu mới không khớp!');
        setLoading(false);
        return;
      }
      if (passwords.newPassword.length < 6) {
        setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
        setLoading(false);
        return;
      }
    }

    setTimeout(() => {
      const updatedUser = {
        username: profile.fullName,
        email: profile.email,
        role: profile.role,
        avatar: previewImage || profile.avatar
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (previewImage) {
        setProfile(prev => ({ ...prev, avatar: previewImage }));
        setPreviewImage(null);
      }

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

        <form onSubmit={handleSaveChanges} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: AVATAR */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="relative inline-block mb-4 group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                  <img 
                    src={previewImage || profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Sửa lỗi 1: Liên kết Label và Input rõ ràng */}
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md"
                  title="Tải ảnh đại diện mới"
                >
                  <Camera size={20} />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                  aria-label="Tải ảnh đại diện" 
                />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
              <p className="text-gray-500 text-sm mb-4">{profile.role}</p>
            </div>
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <User className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Thông tin cơ bản</h3>
              </div>

              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 border border-green-100">
                  <CheckCircle size={20} /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-100">
                  <AlertCircle size={20} /> {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                  <input 
                    id="fullname"
                    type="text" 
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                      id="email"
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    <Lock size={16} /> {showPasswordSection ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu'}
                  </button>

                  {showPasswordSection && (
                    <div className="mt-6 space-y-4 bg-gray-50 p-6 rounded-xl">
                      {/* Sửa lỗi 2: Thêm id và htmlFor cho phần mật khẩu */}
                      <div>
                        <label htmlFor="current-pass" className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu hiện tại</label>
                        <input 
                          id="current-pass"
                          type="password" 
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="new-pass" className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu mới</label>
                          <input 
                            id="new-pass"
                            type="password" 
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirm-pass" className="block text-xs font-bold text-gray-500 uppercase mb-1">Xác nhận mật khẩu</label>
                          <input 
                            id="confirm-pass"
                            type="password" 
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg border-none">
                    {loading ? (
                      <><Loader2 className="animate-spin mr-2" /> Đang lưu...</>
                    ) : (
                      <><Save className="mr-2" size={20} /> Lưu thay đổi</>
                    )}
                  </Button>
                </div>

              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}