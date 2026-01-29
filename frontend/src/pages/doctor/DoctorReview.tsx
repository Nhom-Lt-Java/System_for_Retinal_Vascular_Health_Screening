import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress,
  Chip,
  Alert
} from "@mui/material";
import { getAnalysis, submitReview } from "../../api/analysisApi";
import Navbar from "../../components/Navbar";

export default function DoctorReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý ảnh đang xem
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageType, setImageType] = useState<string>("Original");

  // Form state
  const [conclusion, setConclusion] = useState("");
  const [advice, setAdvice] = useState("");
  const [note, setNote] = useState("");
  const [reviewResult, setReviewResult] = useState<"APPROVED" | "CORRECTED">("APPROVED");

  useEffect(() => {
    if (!id) return;
    getAnalysis(id).then((data) => {
      setAnalysis(data);
      setSelectedImage(data.originalUrl); // Mặc định hiển thị ảnh gốc
      
      // Điền dữ liệu cũ nếu đã đánh giá
      if (data.doctorConclusion) setConclusion(data.doctorConclusion);
      if (data.doctorAdvice) setAdvice(data.doctorAdvice);
      if (data.doctorNote) setNote(data.doctorNote);
      if (data.reviewResult) setReviewResult(data.reviewResult);
      
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    if (!conclusion.trim()) return alert("Vui lòng nhập kết luận!");
    try {
      await submitReview(id!, {
        reviewResult,
        conclusion,
        advice,
        note,
        correctedLabel: reviewResult === "CORRECTED" ? "Bệnh lý khác" : undefined
      });
      alert("Đã lưu và gửi kết quả cho bệnh nhân!");
      navigate("/doctor/patients");
    } catch (err) {
      alert("Lỗi khi lưu đánh giá");
    }
  };

  // Hàm chuyển đổi ảnh hiển thị
  const handleImageChange = (url: string, type: string) => {
    if (url) {
      setSelectedImage(url);
      setImageType(type);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Layout chia 2 cột bằng CSS Grid (thay vì component Grid bị lỗi) */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
          gap: 4 
        }}>
          
          {/* CỘT TRÁI: HÌNH ẢNH CHI TIẾT & KẾT QUẢ AI */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Khung ảnh lớn */}
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">Hình ảnh: <b>{imageType}</b></Typography>
                <Chip 
                  label={`Nguy cơ: ${analysis.riskLevel}`} 
                  color={
                    analysis.riskLevel === 'HIGH' ? 'error' : 
                    analysis.riskLevel === 'MED' ? 'warning' : 'success'
                  }
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Box sx={{ 
                bgcolor: '#000', 
                borderRadius: 2, 
                height: 400, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src={selectedImage} 
                  alt={imageType} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
              </Box>

              {/* Danh sách các ảnh nhỏ (Thumbnails) */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mt: 2 }}>
                {[
                  { label: "Gốc", url: analysis.originalUrl },
                  { label: "Mạch máu", url: analysis.maskUrl },
                  { label: "Tổn thương", url: analysis.overlayUrl },
                  { label: "Heatmap", url: analysis.heatmapUrl },
                  { label: "Kết hợp", url: analysis.heatmapOverlayUrl }
                ].map((img, idx) => (
                  img.url ? (
                    <Button
                      key={idx}
                      onClick={() => handleImageChange(img.url, img.label)}
                      variant={selectedImage === img.url ? "contained" : "outlined"}
                      sx={{ 
                        flexDirection: 'column', 
                        p: 0.5, 
                        height: 'auto',
                        textTransform: 'none',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Box 
                        component="img" 
                        src={img.url} 
                        sx={{ width: '100%', height: 40, objectFit: 'cover', borderRadius: 1, mb: 0.5 }} 
                      />
                      {img.label}
                    </Button>
                  ) : null
                ))}
              </Box>
            </Paper>

            {/* Thông số AI chi tiết */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                Chi tiết phân tích AI
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Dự đoán chính:</Typography>
                  <Typography variant="h6" fontWeight="bold">{analysis.predLabel}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Độ tin cậy:</Typography>
                  <Typography variant="h6" fontWeight="bold">{(analysis.predConf * 100).toFixed(1)}%</Typography>
                </Box>
              </Box>
              
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Xác suất các bệnh lý:</Typography>
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  {analysis.probs && Object.entries(analysis.probs).map(([key, val]: any) => (
                    <Box key={key} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Typography>
                      <Typography variant="body2" fontFamily="monospace">{(val * 100).toFixed(1)}%</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* CỘT PHẢI: FORM ĐÁNH GIÁ CỦA BÁC SĨ */}
          <Paper 
            elevation={4} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              borderTop: 6, 
              borderColor: 'success.main', 
              height: 'fit-content',
              position: { lg: 'sticky' },
              top: 24
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={4}>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                👨‍⚕️ Kết luận chuyên môn
              </Typography>
            </Box>
            
            <Box component="form" display="flex" flexDirection="column" gap={3}>
              <FormControl fullWidth>
                <InputLabel>Đánh giá độ chính xác AI</InputLabel>
                <Select
                  value={reviewResult}
                  label="Đánh giá độ chính xác AI"
                  onChange={(e) => setReviewResult(e.target.value as any)}
                >
                  <MenuItem value="APPROVED">✅ Đồng ý với kết quả AI (Approved)</MenuItem>
                  <MenuItem value="CORRECTED">⚠️ Cần chỉnh sửa kết quả (Corrected)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Chẩn đoán / Kết luận (*)"
                placeholder="VD: Bệnh nhân mắc bệnh võng mạc đái tháo đường giai đoạn tiền tăng sinh..."
                multiline
                rows={4}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Lời khuyên & Phác đồ"
                placeholder="VD: Cần kiểm soát đường huyết chặt chẽ. Hạn chế sử dụng thiết bị điện tử..."
                multiline
                rows={4}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                fullWidth
              />

              <TextField
                label="Ghi chú nội bộ (Optional)"
                placeholder="Chỉ hiển thị cho bác sĩ/phòng khám..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                variant="outlined"
              />

              <Button 
                variant="contained" 
                color="success" 
                size="large" 
                onClick={handleSubmit}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
              >
                💾 LƯU & GỬI KẾT QUẢ
              </Button>
            </Box>
          </Paper>

        </Box>
      </Container>
    </Box>
  );
}