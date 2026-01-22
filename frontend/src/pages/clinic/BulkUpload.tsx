// src/pages/clinic/BulkUpload.tsx
import { useState } from 'react'; // SỬA: Xóa import React dư thừa
import { Container, Paper, Typography, Box, Button, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function BulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
        Tải lên dữ liệu hàng loạt
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 8, 
          textAlign: 'center', 
          border: '2px dashed #1976d2', 
          bgcolor: '#f0f7ff',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#e3f2fd' }
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
        <Typography variant="h5" color="textPrimary" gutterBottom>
          Kéo thả file ZIP hoặc Folder ảnh vào đây
        </Typography>
        <Typography color="textSecondary" sx={{ mb: 4 }}>
          Hỗ trợ định dạng: .zip, .rar, .jpg, .png (Tối đa 500MB)
        </Typography>
        
        <Button variant="contained" size="large" onClick={handleUpload} disabled={uploading} sx={{ minWidth: 200 }}>
          {uploading ? 'Đang xử lý...' : 'Chọn tập tin'}
        </Button>

        {uploading && (
          <Box sx={{ width: '100%', mt: 4 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            <Typography variant="body2" sx={{ mt: 1, color: 'textSecondary' }}>
              Đang tải lên và phân tích AI: {progress}%
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}