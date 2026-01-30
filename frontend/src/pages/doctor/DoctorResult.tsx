import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaCheckCircle, FaEdit, FaPaperPlane, FaRobot, FaExclamationTriangle } from 'react-icons/fa';

export default function DoctorResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [reviewMode, setReviewMode] = useState<'VIEW' | 'APPROVE' | 'CORRECT'>('VIEW');
  const [notes, setNotes] = useState(''); // Kết luận (Conclusion)
  const [advice, setAdvice] = useState(''); // Lời khuyên (Advice)
  
  // States cho chế độ Chỉnh sửa (Feedback Loop)
  const [correctedLabel, setCorrectedLabel] = useState(''); // Nhãn đúng (VD: DR_MODERATE)
  const [correctionDetails, setCorrectionDetails] = useState(''); // Mô tả vùng sai

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Lưu ý: Endpoint lấy chi tiết analysis
      const res = await axiosClient.get(`/doctor/patients/${id}/analyses`); // Hoặc API lấy 1 analysis cụ thể nếu có
      // Vì API list trả về mảng, nếu bạn có API get detail thì dùng. 
      // Tạm thời giả định endpoint này trả về detail hoặc dùng endpoint /analysis/{id} nếu Backend hỗ trợ.
      // FIX: Dùng endpoint chung lấy chi tiết
      const detailRes = await axiosClient.get(`/analysis/${id}`); 
      setData(detailRes.data);

      // Fill dữ liệu cũ nếu đã từng review
      if (detailRes.data.doctorConclusion) setNotes(detailRes.data.doctorConclusion);
      if (detailRes.data.doctorAdvice) setAdvice(detailRes.data.doctorAdvice);
      if (detailRes.data.reviewResult === 'CORRECTED') {
          setReviewMode('CORRECT');
          // Nếu có lưu correctedLabel thì set lại (cần backend trả về)
      } else if (detailRes.data.reviewResult === 'APPROVED') {
          setReviewMode('APPROVE');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return alert("Vui lòng nhập kết luận lâm sàng (Final Report).");
    if (reviewMode === 'CORRECT' && !correctedLabel.trim()) {
        return alert("Vui lòng nhập chẩn đoán đúng (Corrected Label) để huấn luyện AI.");
    }
    
    try {
      // Cấu trúc payload khớp với DoctorReviewPayload trong Java
      const payload = {
        reviewResult: reviewMode === 'CORRECT' ? 'CORRECTED' : 'APPROVED',
        conclusion: notes,      // Map vào doctorConclusion
        advice: advice,         // Map vào doctorAdvice
        note: "",               // Ghi chú nội bộ (Optional)
        correctedLabel: reviewMode === 'CORRECT' ? correctedLabel : null,
        correctionData: reviewMode === 'CORRECT' ? { description: correctionDetails } : null // Gửi dạng Object JSON
      };

      // FIX: URL phải là 'analyses' (số nhiều) khớp với Controller
      await axiosClient.post(`/doctor/analyses/${id}/review`, payload);
      
      alert("Đã gửi báo cáo & kết quả review thành công!");
      navigate('/doctor/dashboard');
    } catch (error: any) {
      console.error(error);
      alert("Lỗi khi gửi báo cáo: " + (error?.response?.data?.message || "Lỗi không xác định"));
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu phân tích.</div>;

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-80px)]">
      
      {/* CỘT TRÁI: HÌNH ẢNH & AI */}
      <div className="bg-black rounded-xl overflow-hidden flex flex-col relative shadow-lg">
        <div className="flex-1 relative flex items-center justify-center bg-gray-900">
           {/* Hiển thị ảnh kết quả (nếu có) hoặc ảnh gốc */}
           <img 
             src={data.resultImage?.fileUrl || data.inputImage?.fileUrl} 
             alt="Eye Analysis" 
             className="max-h-full max-w-full object-contain"
           />
           
           {/* Overlay hiển thị AI Diagnosis */}
           <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm border border-gray-700">
             <div className="flex items-center gap-2 mb-1 text-blue-400 font-bold">
               <FaRobot /> Chẩn đoán AI
             </div>
             <p className="text-xl font-bold text-white">{data.predLabel || "Chưa xác định"}</p>
             <p className="text-sm text-gray-300">Độ tin cậy: {data.predConf ? (data.predConf * 100).toFixed(1) : 0}%</p>
           </div>
        </div>
        
        {/* Tool sửa lỗi (Feedback Loop) - Chỉ hiện khi chọn CHỈNH SỬA */}
        {reviewMode === 'CORRECT' && (
          <div className="bg-yellow-50 p-4 border-t border-yellow-200 animate-fade-in">
            <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                <FaExclamationTriangle />
                <h4>FEEDBACK LOOP (Huấn luyện lại AI)</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Chẩn đoán đúng là gì?</label>
                    <input 
                        className="w-full p-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="VD: Normal, DR_Mild, DR_Severe..."
                        value={correctedLabel}
                        onChange={(e) => setCorrectedLabel(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Mô tả chi tiết lỗi sai:</label>
                    <textarea
                      className="w-full p-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="VD: Vùng xuất huyết ở góc 2h là nhiễu ảnh..."
                      rows={2}
                      value={correctionDetails}
                      onChange={(e) => setCorrectionDetails(e.target.value)}
                    />
                </div>
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: BÁO CÁO BÁC SĨ */}
      <div className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-100">
        <div className="p-4 bg-blue-600 text-white font-bold text-lg flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2"><FaEdit/> Kết luận chuyên môn</span>
          <span className="text-xs font-normal bg-blue-800/50 px-3 py-1 rounded-full border border-blue-400">
              ID: #{data.id?.toString().slice(-4)}
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
          
          {/* Bước 1: Đánh giá AI */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">1. Đánh giá kết quả AI</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setReviewMode('APPROVE')}
                className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-bold transition-all ${reviewMode === 'APPROVE' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-400 hover:bg-gray-100'}`}
              >
                <FaCheckCircle /> CHẤP THUẬN
              </button>
              <button 
                onClick={() => setReviewMode('CORRECT')}
                className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-bold transition-all ${reviewMode === 'CORRECT' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-200 text-gray-400 hover:bg-gray-100'}`}
              >
                <FaEdit /> CHỈNH SỬA
              </button>
            </div>
            {reviewMode === 'APPROVE' && <p className="text-xs text-green-600 mt-2 font-medium ml-1 flex items-center gap-1"><FaCheckCircle/> Xác nhận AI chẩn đoán đúng.</p>}
            {reviewMode === 'CORRECT' && <p className="text-xs text-yellow-600 mt-2 font-medium ml-1 flex items-center gap-1"><FaExclamationTriangle/> Xác nhận AI có sai sót, cần điều chỉnh dữ liệu.</p>}
          </div>

          {/* Bước 2: Ghi chú lâm sàng */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">2. Kết luận cuối cùng (Final Report)</label>
            <textarea
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nhập kết luận bệnh học chính thức để trả về cho bệnh nhân..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Bước 3: Lời khuyên */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">3. Lời khuyên & Chỉ định</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ví dụ: Tái khám sau 3 tháng, hạn chế đường, kiêng rượu bia..."
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
            ></textarea>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-white flex justify-end gap-3 shadow-inner">
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
          >
            <FaPaperPlane /> HOÀN TẤT & GỬI
          </button>
        </div>
      </div>
    </div>
  );
}