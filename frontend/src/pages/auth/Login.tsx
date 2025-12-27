import React, { useState } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, 
  Box, Tabs, Tab, Alert, InputAdornment, Link as MuiLink 
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

export default function Login() {
  const [role, setRole] = useState(0); // 0: Patient (user), 1: Doctor
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Hàm kiểm tra tính hợp lệ trước khi đăng nhập
  const validateLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!emailRegex.test(email)) {
      return "Định dạng Email không hợp lệ!";
    }
    if (!passwordRegex.test(password)) {
      return "Mật khẩu không đúng quy chuẩn (tối thiểu 8 ký tự, gồm cả chữ và số)!";
    }
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Sửa lỗi: Chặn đăng nhập nếu dữ liệu sai cấu trúc
    const errorMsg = validateLogin();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    
    // Giả lập gọi API (Sẽ dùng authApi.ts trong tương lai)
    const userRole = role === 0 ? 'user' : 'doctor';
    const mockUser = { 
      name: role === 0 ? "Bệnh nhân" : "Bác sĩ", 
      role: userRole,
      email: email 
    };
    
    login(mockUser, "fake-jwt-token");
    navigate(userRole === 'doctor' ? '/doctor' : '/upload');
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center', width: '100%' }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>AURA</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Hệ thống phân tích võng mạc thông minh
        </Typography>

        <Tabs value={role} onChange={(_, v) => setRole(v)} variant="fullWidth" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Bệnh nhân" sx={{ fontWeight: 'bold' }} />
          <Tab label="Bác sĩ" sx={{ fontWeight: 'bold' }} />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left', borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin} noValidate>
          <TextField 
            fullWidth 
            label="Email" 
            margin="normal" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
            }}
          />
          <TextField 
            fullWidth 
            label="Mật khẩu" 
            type="password" 
            margin="normal" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
            }}
          />
          
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ textDecoration: 'none' }}>
              Quên mật khẩu?
            </MuiLink>
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            size="large" 
            type="submit" 
            sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
          >
            Đăng nhập {role === 0 ? "Bệnh nhân" : "Bác sĩ"}
          </Button>
        </form>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Chưa có tài khoản?{' '}
            <MuiLink component={Link} to="/register" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
              Đăng ký ngay
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}