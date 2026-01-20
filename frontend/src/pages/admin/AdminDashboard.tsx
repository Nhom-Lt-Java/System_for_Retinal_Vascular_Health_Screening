// src/pages/admin/AdminDashboard.tsx
import { BarChart3, Users, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: "Tổng người dùng", value: "1,250", icon: <Users size={20} />, color: "bg-blue-500" },
    { label: "Ảnh đã phân tích", value: "8,420", icon: <ImageIcon size={20} />, color: "bg-green-500" },
    { label: "Nguy cơ cao", value: "124", icon: <AlertCircle size={20} />, color: "bg-red-500" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Global Admin Dashboard</h1>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          <BarChart3 size={16} />
          <span>Thống kê thời gian thực (FR-36)</span>
        </div>
      </div>
      
      {/* Khối Thống kê nhanh FR-36 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`${s.color} p-3 rounded-lg text-white shadow-lg`}>
              {s.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FR-38: Danh sách duyệt phòng khám */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <CheckCircle size={20} className="text-green-500" />
            Phòng khám chờ duyệt
          </h2>
          <div className="text-gray-400 text-center py-16 border-2 border-dashed border-gray-100 rounded-xl">
            <p>Hiện tại không có yêu cầu nào cần duyệt.</p>
          </div>
        </div>

        {/* FR-33: Placeholder cho Quản lý ngưỡng AI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <AlertCircle size={20} className="text-orange-500" />
            Cảnh báo rủi ro hệ thống (FR-29)
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Tất cả hệ thống đang hoạt động ổn định.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;