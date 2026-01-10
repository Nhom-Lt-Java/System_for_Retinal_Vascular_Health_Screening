import React from 'react';
import { Container, Grid, Paper, Typography, Box, Alert, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';

export default function ClinicDashboard() {
  // Mock data cho biểu đồ (FR-36)
  const data = [
    { name: 'T1', cases: 40, highRisk: 24 },
    { name: 'T2', cases: 30, highRisk: 13 },
    { name: 'T3', cases: 20, highRisk: 98 },
    { name: 'T4', cases: 27, highRisk: 39 },
    { name: 'T5', cases: 18, highRisk: 48 },
    { name: 'T6', cases: 23, highRisk: 38 },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Tổng Quan Phòng Khám
      </Typography>

      {/* FR-29: Cảnh báo High-Risk */}
      <Box sx={{ mb: 3 }}>
        <Alert severity="error" icon={<WarningIcon fontSize="inherit" />} 
          action={<Button color="inherit" size="small">Xử lý ngay</Button>}
        >
          <strong>CẢNH BÁO:</strong> Có 5 ca bệnh nhân có nguy cơ cao (High Risk) chưa được xử lý!
        </Alert>
      </Box>

      {/* FR-27: Thẻ thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e3f2fd' }}>
            <Box>
              <Typography color="textSecondary">Tổng số ca chụp</Typography>
              <Typography variant="h3" color="primary" fontWeight="bold">1,245</Typography>
            </Box>
            <TrendingUpIcon sx={{ fontSize: 60, opacity: 0.3 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
           <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ffebee' }}>
            <Box>
              <Typography color="textSecondary">Ca nguy cơ cao</Typography>
              <Typography variant="h3" color="error" fontWeight="bold">128</Typography>
            </Box>
            <WarningIcon sx={{ fontSize: 60, opacity: 0.3 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
           <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e8f5e9' }}>
            <Box>
              <Typography color="textSecondary">Bác sĩ hoạt động</Typography>
              <Typography variant="h3" color="success.main" fontWeight="bold">12</Typography>
            </Box>
            <PeopleIcon sx={{ fontSize: 60, opacity: 0.3 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* FR-36: Biểu đồ thống kê */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom>Thống kê lượt khám theo tháng</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" name="Tổng ca" fill="#1976d2" />
                <Bar dataKey="highRisk" name="Nguy cơ cao" fill="#d32f2f" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* FR-28: Trạng thái gói dịch vụ */}
        <Grid item xs={12} md={4}>
           <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom>Gói Dịch Vụ (Enterprise)</Typography>
            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" gutterBottom>Trạng thái: <span style={{ color: 'green', fontWeight: 'bold' }}>Đang hoạt động</span></Typography>
              <Typography variant="body1" gutterBottom>Hết hạn: <strong>20/12/2026</strong></Typography>
              
              <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Dung lượng AI</Typography>
                <Typography variant="caption">4,500 / 5,000</Typography>
              </Box>
              <Box sx={{ width: '100%', height: 10, bgcolor: '#eee', borderRadius: 5 }}>
                <Box sx={{ width: '90%', height: '100%', bgcolor: '#1976d2', borderRadius: 5 }} />
              </Box>

              <Button variant="outlined" fullWidth sx={{ mt: 4 }} href="/clinic/billing">
                Gia hạn / Nâng cấp gói
              </Button>
            </Box>
           </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}