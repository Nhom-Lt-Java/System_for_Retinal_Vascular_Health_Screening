import { useState } from 'react';
import { TextField, Button, Box, Grid, Alert, Typography, CircularProgress } from '@mui/material';
import AuthLayout from '../../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient'; // Đảm bảo import đúng axiosClient

export default function ClinicRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    clinicName: '',
    address: '',
    email: '',
    phone: '',
    businessLicense: '' // Số giấy phép kinh doanh
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError(null);
    
    // Validate cơ bản
    if (!formData.clinicName || !formData.email || !formData.businessLicense) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký (Cần đảm bảo Backend có endpoint này)
      // Payload gửi đi sẽ khớp với DTO bên Java
      await axiosClient.post('/auth/register-clinic', {
        name: formData.clinicName,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        license_number: formData.businessLicense,
        role: "CLINIC_ADMIN" // Gán cứng role nếu cần
      });

      alert("Gửi hồ sơ thành công! Vui lòng chờ Admin duyệt.");
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng Ký Phòng Khám">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField 
            label="Tên phòng khám / Bệnh viện" 
            name="clinicName"
            value={formData.clinicName}
            onChange={handleChange}
            fullWidth required 
        />
        <TextField 
            label="Địa chỉ" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth required 
        />
        
        <Grid container spacing={2}>
           {/* SỬA LỖI GRID: Dùng size thay vì item xs */}
           <Grid size={{ xs: 6 }}>
             <TextField 
                label="Email đại diện" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth required 
            />
           </Grid>
           <Grid size={{ xs: 6 }}>
             <TextField 
                label="Số điện thoại" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth required 
            />
           </Grid>
        </Grid>

        <TextField 
            label="Số giấy phép kinh doanh" 
            name="businessLicense"
            value={formData.businessLicense}
            onChange={handleChange}
            fullWidth required 
        />
        
        <Button 
          variant="contained" 
          size="large" 
          disabled={loading}
          sx={{ mt: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
          onClick={handleRegister}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Gửi hồ sơ xét duyệt"}
        </Button>
        
        <Button color="inherit" onClick={() => navigate('/login')}>
            Quay lại đăng nhập
        </Button>
      </Box>
    </AuthLayout>
  );
}