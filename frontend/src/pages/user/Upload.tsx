import React, { useState } from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
import UploadBox from '../../components/UploadBox'; //
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ảnh trước!");
      return;
    }
    // Giả lập gửi ảnh lên Server
    console.log("Đang phân tích:", selectedFiles);
    navigate('/result');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Tải ảnh võng mạc
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Hệ thống AI sẽ phân tích hình ảnh và trả kết quả trong giây lát.
        </Typography>

        {/* Sử dụng Component UploadBox đã sửa */}
        <UploadBox onSelect={(files) => setSelectedFiles(files)} />

        <Box mt={4} textAlign="center">
          <Button 
            variant="contained" 
            size="large" 
            fullWidth
            onClick={handleStartAnalysis}
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            Bắt đầu phân tích AI
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}