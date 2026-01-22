import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Chỉ import những icon cơ bản để tránh lỗi thư viện
import { UploadCloud, Clock, Activity } from 'lucide-react';
import Button from '../../components/Button'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập loading để test giao diện
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển User</h1>
          </div>
          <p className="text-gray-500">Chào mừng bạn quay trở lại hệ thống.</p>
        </header>

        <section className="mb-12">
          <div className="bg-blue-600 rounded-3xl p-8 text-white flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-2xl font-bold mb-3">Tải ảnh chụp võng mạc</h2>
              <p className="text-blue-100 mb-6">Phân tích AI nhanh chóng và chính xác.</p>
              <Button onClick={() => navigate('/user/upload')} className="bg-white text-blue-800 border-none">
                <UploadCloud size={20} className="mr-2"/> Bắt đầu ngay
              </Button>
            </div>
          </div>
        </section>

        {loading && <p className="text-center text-gray-500">Đang tải dữ liệu...</p>}
      </main>
    </div>
  );
}