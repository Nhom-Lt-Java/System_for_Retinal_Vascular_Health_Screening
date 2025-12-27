import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Chip, Divider, TextField, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Result() {
  const { user } = useAuth(); // Lấy role để phân quyền
  const isDoctor = user?.role === 'doctor';

  // Dữ liệu giả lập từ AI (Mock Data)
  const mockResult = {
    imageUrl: 'https://via.placeholder.com/400', // Thay bằng ảnh võng mạc thật
    heatmapUrl: 'https://via.placeholder.com/400/ff0000/ffffff?text=Heatmap', // Ảnh vùng bệnh
    aiDiagnosis: 'Mild DR (Bệnh võng mạc tiểu đường nhẹ)',
    confidence: 87.5, // Độ tin cậy
    recommendation: 'Bạn nên đi khám chuyên sâu trong vòng 1 tháng tới để kiểm tra kỹ hơn.'
  };

  // State dành cho bác sĩ chỉnh sửa (FR-15, FR-16)
  const [doctorNote, setDoctorNote] = useState('');
  const [finalConclusion, setFinalConclusion] = useState(mockResult.aiDiagnosis);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // Gọi API lưu kết luận bác sĩ
    console.log("Lưu kết quả:", { finalConclusion, doctorNote });
    setIsSaved(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Cột Trái: Hiển thị Ảnh & Heatmap (FR-4) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Ảnh Phân Tích</Typography>
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <img src={mockResult.imageUrl} alt="Original" style={{ width: '100%', display: 'block' }} />
              {/* Giả lập lớp phủ Heatmap khi hover hoặc toggle */}
              <Box sx={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                opacity: 0.4, backgroundImage: `url(${mockResult.heatmapUrl})`, backgroundSize: 'cover' 
              }} />
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              *Vùng đỏ hiển thị các tổn thương nghi ngờ
            </Typography>
          </Paper>
        </Grid>

        {/* Cột Phải: Kết quả & Thao tác (FR-3, FR-5, FR-14, FR-15, FR-16) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            
            {/* 1. Kết quả AI */}
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              Kết quả AI chẩn đoán
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={`${mockResult.confidence}% Tin cậy`} 
                color={mockResult.confidence > 80 ? "success" : "warning"} 
                sx={{ mb: 1 }} 
              />
              <Typography variant="h4" fontWeight="bold">
                {mockResult.aiDiagnosis}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 2. Phần hiển thị khác nhau dựa trên Role */}
            {isDoctor ? (
              // --- GIAO DIỆN BÁC SĨ (FR-15, FR-16) ---
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">👨‍⚕️ Kết luận chuyên môn</Typography>
                
                <TextField
                  fullWidth label="Chẩn đoán cuối cùng"
                  value={finalConclusion}
                  onChange={(e) => setFinalConclusion(e.target.value)}
                  margin="normal"
                  helperText="Bác sĩ có thể sửa lại kết quả của AI nếu thấy sai."
                />
                
                <TextField
                  fullWidth multiline rows={4}
                  label="Ghi chú điều trị / Lời dặn"
                  placeholder="Nhập phác đồ điều trị hoặc lời khuyên..."
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  margin="normal"
                />

                <Button 
                  variant="contained" size="large" 
                  startIcon={isSaved ? <CheckCircleIcon /> : <SaveIcon />}
                  color={isSaved ? "success" : "primary"}
                  onClick={handleSave}
                  sx={{ mt: 2 }}
                >
                  {isSaved ? "Đã lưu hồ sơ" : "Xác nhận kết quả"}
                </Button>
              </Box>
            ) : (
              // --- GIAO DIỆN BỆNH NHÂN (FR-5) ---
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">💡 Khuyến nghị sức khỏe</Typography>
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  {mockResult.recommendation}
                </Alert>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Kết quả này được tạo bởi AI và chỉ mang tính chất tham khảo. 
                  Vui lòng chờ xác nhận cuối cùng từ bác sĩ chuyên khoa.
                </Typography>
                
                <Button variant="outlined" fullWidth onClick={() => alert("Đã gửi yêu cầu chat!")}>
                  Hỏi bác sĩ ngay
                </Button>
              </Box>
            )}

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}