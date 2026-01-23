import React from 'react';
import { TextField, Button, Box, Grid } from '@mui/material';
import AuthLayout from '../../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';

export default function ClinicRegister() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Đăng Ký Phòng Khám">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField label="Tên phòng khám / Bệnh viện" fullWidth required />
        <TextField label="Địa chỉ" fullWidth required />
        <Grid container spacing={2}>
           <Grid item xs={6}>
             <TextField label="Email đại diện" type="email" fullWidth required />
           </Grid>
           <Grid item xs={6}>
             <TextField label="Số điện thoại" fullWidth required />
           </Grid>
        </Grid>
        <TextField label="Số giấy phép kinh doanh" fullWidth required />
        
        <Button 
          variant="contained" 
          size="large" 
          sx={{ mt: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
          onClick={() => { alert("Đã gửi hồ sơ!"); navigate('/login'); }}
        >
          Gửi hồ sơ xét duyệt
        </Button>
        <Button color="inherit" onClick={() => navigate('/login')}>
            Quay lại đăng nhập
        </Button>
      </Box>
    </AuthLayout>
  );
}