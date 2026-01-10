import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';

export default function Navbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  if (!token) return null;

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ px: 0 }}>
          <Typography 
            variant="h5" 
            sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1976d2', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            AURA
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            
            {/* MENU CHO USER */}
            {(user?.role === 'user' || user?.role === 'patient' || !user?.role || user?.role === 'USER') && (
              <>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/upload')}>Phân tích</Button>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/history')}>Lịch sử</Button>
                <IconButton color="primary" onClick={() => navigate('/chat')}><ChatIcon /></IconButton>
              </>
            )}

            {/* MENU CHO BÁC SĨ */}
            {(user?.role === 'doctor' || user?.role === 'DOCTOR') && (
              <>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/doctor')}>Thống kê</Button>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/doctor/patients')}>Bệnh nhân</Button>
              </>
            )}

            {/* MENU CHO CLINIC ADMIN (MỚI) */}
            {user?.role === 'CLINIC_ADMIN' && (
              <>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/clinic')}>Tổng quan</Button>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/clinic/doctors')}>QL Bác sĩ</Button>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/clinic/bulk-upload')}>Upload Lô</Button>
              </>
            )}

            {/* MENU CHO GLOBAL ADMIN (MỚI) */}
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/admin')}>Hệ thống</Button>
                <Button color="inherit" sx={{ color: '#555' }} onClick={() => navigate('/admin/ai-settings')}>AI Config</Button>
              </>
            )}
            
            {/* AVATAR & LOGOUT */}
            <IconButton onClick={() => navigate('/profile')} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>

            <IconButton color="error" onClick={() => { logout(); navigate('/login'); }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}