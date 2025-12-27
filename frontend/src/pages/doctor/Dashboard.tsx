import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  Chip, 
  Grid 
} from '@mui/material'; // Sửa lỗi: Import Grid tiêu chuẩn
import { useNavigate } from 'react-router-dom';
import { Dashboard as DashboardIcon, Logout } from '@mui/icons-material';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  // Dữ liệu giả lập danh sách bệnh nhân
  const recentPatients = [
    { id: 1, name: "Nguyễn Văn A", age: 45, status: "High Risk", date: "21/12/2024" },
    { id: 2, name: "Trần Thị B", age: 32, status: "Normal", date: "20/12/2024" },
    { id: 3, name: "Lê Văn C", age: 58, status: "Pending", date: "19/12/2024" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon color="primary" fontSize="large" />
          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
            Bác sĩ: Dr. Strange
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<Logout />}
          onClick={() => navigate('/login')} // Dùng navigate thay vì href để tránh load lại trang
        >
          Đăng xuất
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Thẻ thống kê */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography color="textSecondary" fontWeight="bold">Tổng số ca chụp</Typography>
            <Typography component="p" variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
              128
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#ffebee', borderRadius: 2 }}>
            <Typography color="textSecondary" fontWeight="bold">Ca nguy cơ cao</Typography>
            <Typography component="p" variant="h3" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
              12
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Typography color="textSecondary" fontWeight="bold">Đã xử lý</Typography>
            <Typography component="p" variant="h3" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
              116
            </Typography>
          </Paper>
        </Grid>

        {/* Danh sách bệnh nhân gần đây */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
              Bệnh nhân cần chẩn đoán mới nhất (FR-14)
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {recentPatients.map((patient) => (
                <Grid item xs={12} key={patient.id}>
                  <Card variant="outlined" sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    alignItems: 'center',
                    transition: '0.3s',
                    '&:hover': { boxShadow: 2, borderColor: 'primary.main' }
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{patient.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tuổi: {patient.age} — Ngày khám: {patient.date}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={patient.status} 
                        size="small"
                        color={patient.status === "High Risk" ? "error" : patient.status === "Normal" ? "success" : "warning"} 
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => navigate('/doctor/patients')}
                        sx={{ borderRadius: 2 }}
                      >
                        Chi tiết
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box mt={3} textAlign="center">
               <Button onClick={() => navigate('/doctor/patients')}>Xem tất cả bệnh nhân</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}