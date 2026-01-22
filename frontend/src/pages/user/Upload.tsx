import { useState } from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
import UploadBox from '../../components/UploadBox'; 
import { useNavigate } from 'react-router-dom';
// Loại bỏ import React bị thừa

export default function Upload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ảnh trước!");
      return;
    }
    console.log("Đang phân tích:", selectedFiles);
    navigate('/user/result');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Tải ảnh võng mạc (FR-2)
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Hệ thống AI sẽ phân tích hình ảnh và trả kết quả trong giây lát.
        </Typography>

        <UploadBox onSelect={(files) => setSelectedFiles(files)} />

        <Box mt={4} textAlign="center">
          <Button 
            variant="contained" 
            size="large" 
            fullWidth
            onClick={handleStartAnalysis}
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            Bắt đầu phân tích AI (FR-3)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}