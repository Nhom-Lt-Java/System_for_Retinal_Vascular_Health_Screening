// src/pages/doctor/PatientList.tsx
import { useState } from 'react';
import { Search, UserCircle, Calendar, ChevronRight } from 'lucide-react';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu mẫu mở rộng phục vụ FR-17 và FR-18
  const patients = [
    { id: 1, name: "Nguyễn Văn A", lastVisit: "2026-01-15", status: "Cần kiểm tra", gender: "Nam", age: 45 },
    { id: 2, name: "Trần Thị B", lastVisit: "2026-01-10", status: "Bình thường", gender: "Nữ", age: 32 },
    { id: 3, name: "Lê Minh C", lastVisit: "2025-12-28", status: "Nguy cơ cao", gender: "Nam", age: 58 },
  ];

  // Logic lọc bệnh nhân theo tên (FR-18)
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bệnh nhân</h1>
          <p className="text-gray-500 text-sm">Tìm kiếm và xem lịch sử phân tích của bệnh nhân (FR-17, FR-18)</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Tìm theo tên bệnh nhân..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredPatients.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredPatients.map(p => (
              <div 
                key={p.id} 
                className="p-5 flex items-center justify-between hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <UserCircle size={48} className="text-gray-300 group-hover:text-blue-200 transition-colors" />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${p.status === 'Nguy cơ cao' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{p.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{p.gender} • {p.age} tuổi</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {p.lastVisit}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'Nguy cơ cao' ? 'bg-red-100 text-red-700' : 
                    p.status === 'Cần kiểm tra' ? 'bg-orange-100 text-orange-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {p.status}
                  </span>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-500">Không tìm thấy bệnh nhân nào khớp với từ khóa "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;