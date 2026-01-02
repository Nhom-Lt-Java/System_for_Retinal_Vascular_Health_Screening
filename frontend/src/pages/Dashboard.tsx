import { useState, useEffect } from 'react';
import { UploadCloud, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
// Sửa lỗi: Thêm từ khóa 'type' để đúng chuẩn TypeScript mới
import type { MedicalRecord } from '../types'; 

export default function Dashboard() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập dữ liệu
    const fakeData: MedicalRecord[] = [
      { id: 1, patientName: 'Nguyễn Văn A', imageUrl: '', diagnosis: 'Bệnh võng mạc tiểu đường', riskLevel: 'HIGH', createdAt: '2025-12-20', status: 'REVIEWED' },
      { id: 2, patientName: 'Nguyễn Văn A', imageUrl: '', diagnosis: 'Bình thường', riskLevel: 'LOW', createdAt: '2025-10-15', status: 'COMPLETED' },
    ];

    // Sửa lỗi 'setState synchronously': Dùng setTimeout để giả lập độ trễ mạng
    const timer = setTimeout(() => {
      setRecords(fakeData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleUpload = () => {
    alert("Chức năng Upload sẽ làm ở bước tiếp theo!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-8">
        {/* Phần 1: Chào mừng & Upload */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan sức khỏe</h1>
          <p className="text-gray-500 mb-8">Quản lý các lần sàng lọc và theo dõi tiến triển bệnh lý.</p>

          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bắt đầu sàng lọc mới</h2>
              <p className="text-primary-100 max-w-lg mb-6">
                Sử dụng công nghệ AI để phát hiện sớm các tổn thương mạch máu võng mạc chỉ trong vài giây.
              </p>
              <Button onClick={handleUpload} className="bg-white text-primary-700 hover:bg-gray-100 border-none">
                <UploadCloud size={20} /> Tải ảnh lên ngay
              </Button>
            </div>
            <div className="opacity-20 hidden md:block">
              <UploadCloud size={150} />
            </div>
          </div>
        </section>

        {/* Phần 2: Lịch sử khám */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Lịch sử phân tích gần đây</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4 font-medium">Mã hồ sơ</th>
                  <th className="p-4 font-medium">Ngày khám</th>
                  <th className="p-4 font-medium">Kết quả chẩn đoán</th>
                  <th className="p-4 font-medium">Mức độ</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">Đang tải dữ liệu...</td>
                  </tr>
                ) : records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">#IMG-{record.id}025</td>
                    <td className="p-4 text-gray-500">{record.createdAt}</td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900">{record.diagnosis}</span>
                    </td>
                    <td className="p-4">
                      {record.riskLevel === 'HIGH' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} /> Nguy hiểm
                        </span>
                      )}
                      {record.riskLevel === 'LOW' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> An toàn
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${record.status === 'REVIEWED' ? 'text-blue-600' : 'text-gray-500'}`}>
                        {record.status === 'REVIEWED' ? 'Đã có kết luận' : 'Đang chờ'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-primary-600 hover:text-primary-800 text-sm font-medium hover:underline">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}