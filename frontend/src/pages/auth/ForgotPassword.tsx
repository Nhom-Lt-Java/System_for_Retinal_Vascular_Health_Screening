import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    // Gọi API khôi phục mật khẩu ở đây
    setIsSent(true);
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, textAlign: 'center', width: '100%' }}>
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>Quên mật khẩu?</Typography>
        
        {!isSent ? (
          <form onSubmit={handleReset}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Nhập email của bạn để nhận hướng dẫn khôi phục tài khoản.
            </Typography>
            <TextField 
              fullWidth label="Email đăng ký" 
              required type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button fullWidth variant="contained" size="large" type="submit" sx={{ mt: 3, borderRadius: 3 }}>
              Gửi yêu cầu
            </Button>
          </form>
        ) : (
          <Alert severity="success" sx={{ mb: 2 }}>
            Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư của bạn.
          </Alert>
        )}
        
        <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/login')}>
          Quay lại Đăng nhập
        </Button>
      </Paper>
    </Container>
  );
}