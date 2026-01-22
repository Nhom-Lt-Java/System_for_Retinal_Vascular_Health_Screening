import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Link as MuiLink, 
  Tabs, 
  Tab, 
  Alert, 
  InputAdornment 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import authApi from '../../api/authApi'; // 👇 Import API

export default function Register() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState(0); // 0: Bệnh nhân, 1: Bác sĩ
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Thêm loading
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Tối thiểu 8 ký tự, có chữ và số

    if (!formData.fullName.trim()) return "Vui lòng nhập họ và tên.";
    if (!emailRegex.test(formData.email)) return "Định dạng Email không hợp lệ.";
    if (!passwordRegex.test(formData.password)) return "Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số.";
    if (formData.password !== formData.confirmPassword) return "Mật khẩu nhập lại không khớp.";
    
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      // 👇 LOGIC GỬI API THẬT
      const payload = {
        username: formData.email,       // Backend cần username (lấy email làm username)
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        role: role === 0 ? 'USER' : 'DOCTOR' // Backend cần string viết hoa
      };

      console.log("Đang gửi đăng ký:", payload);
      await authApi.register(payload); // Gọi API

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');

    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      // Hiển thị lỗi từ Backend (Ví dụ: Email đã tồn tại)
      const message = err.response?.data || "Đăng ký thất bại. Vui lòng thử lại.";
      // Backend có thể trả về object {message: "..."} hoặc string
      setError(typeof message === 'object' ? (message.message || JSON.stringify(message)) : message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 4, bgcolor: '#ffffff' }}>
        <Typography component="h1" variant="h3" align="center" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
          AURA
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Hệ thống tầm soát sức khỏe võng mạc AI
        </Typography>

        <Tabs 
          value={role} 
          onChange={(_, v) => setRole(v)} 
          variant="fullWidth" 
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Bệnh nhân" sx={{ fontWeight: 'bold' }} />
          <Tab label="Bác sĩ" sx={{ fontWeight: 'bold' }} />
        </Tabs>
        
        <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 500 }}>
          Đăng ký {role === 0 ? 'Bệnh nhân' : 'Bác sĩ'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth label="Họ và tên" name="fullName" autoFocus
            onChange={handleChange}
            // Fix lỗi gạch ngang InputProps bằng slotProps
            slotProps={{
              input: {
                startAdornment: (<InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>),
              }
            }}
          />
          <TextField
            margin="normal" required fullWidth label="Email" name="email" type="email" placeholder="example@mail.com"
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (<InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>),
              }
            }}
          />
          <TextField
            margin="normal" required fullWidth label="Mật khẩu" name="password" type="password" helperText="Tối thiểu 8 ký tự, gồm chữ và số"
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>),
              }
            }}
          />
          <TextField
            margin="normal" required fullWidth label="Xác nhận mật khẩu" name="confirmPassword" type="password"
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>),
              }
            }}
          />
          
          <Button 
            type="submit" fullWidth variant="contained" disabled={loading}
            sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem', textTransform: 'none' }}
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </Button>

          <Box textAlign="center" sx={{ mt: 1 }}>
            <MuiLink 
              component="button" variant="body2" onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}
            >
              Đã có tài khoản? Đăng nhập ngay
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}