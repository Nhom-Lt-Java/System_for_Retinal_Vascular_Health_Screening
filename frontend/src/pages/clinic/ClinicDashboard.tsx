import { 
  Container, Grid, Paper, Typography, Box, Alert, Button, 
  Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function ClinicDashboard() {
  const navigate = useNavigate();

  const data = [
    { name: 'T8', cases: 120, highRisk: 15 },
    { name: 'T9', cases: 210, highRisk: 22 },
    { name: 'T10', cases: 180, highRisk: 30 },
    { name: 'T11', cases: 270, highRisk: 45 },
    { name: 'T12', cases: 350, highRisk: 60 },
    { name: 'T1', cases: 410, highRisk: 48 },
  ];

  const activeDoctors = [
    { id: 1, name: 'Dr. Strange', specialty: 'Võng mạc', count: 120 },
    { id: 2, name: 'Dr. Watson', specialty: 'Tổng quát', count: 85 },
  ];

  const handleExportData = () => {
    alert("Hệ thống đang trích xuất báo cáo thống kê (FR-30)...");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Bảng Điều Khiển Phòng Khám
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportData}>
          Xuất Báo Cáo (FR-30)
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Alert severity="error" variant="filled" action={
          <Button color="inherit" size="small" onClick={() => navigate('/clinic/high-risk')}>Xem ngay</Button>
        }>
          <strong>CẢNH BÁO:</strong> Có 5 ca nguy cơ cao mới cần xử lý (FR-29).
        </Alert>
      </Box>

      {/* Sửa lỗi Grid ở đây: Thay item bằng size */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', bgcolor: '#e3f2fd', borderRadius: 3 }}>
            <Box>
              <Typography color="primary" variant="subtitle2" fontWeight="bold">TỔNG CA</Typography>
              <Typography variant="h3" fontWeight="bold">15,245</Typography>
            </Box>
            <TrendingUpIcon sx={{ fontSize: 50, color: '#1976d2', opacity: 0.5 }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
           <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', bgcolor: '#fff4e5', borderRadius: 3 }}>
            <Box>
              <Typography color="warning.main" variant="subtitle2" fontWeight="bold">NGUY CƠ CAO</Typography>
              <Typography variant="h3" fontWeight="bold">48</Typography>
            </Box>
            <AssessmentIcon sx={{ fontSize: 50, color: '#ed6c02', opacity: 0.5 }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
           <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', bgcolor: '#e8f5e9', borderRadius: 3 }}>
            <Box>
              <Typography color="success.main" variant="subtitle2" fontWeight="bold">BÁC SĨ</Typography>
              <Typography variant="h3" fontWeight="bold">12</Typography>
            </Box>
            <PeopleIcon sx={{ fontSize: 50, color: '#2e7d32', opacity: 0.5 }} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 500, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Hiệu Suất AI (FR-36)</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" name="Tổng ca" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highRisk" name="Nguy cơ cao" fill="#d32f2f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold">Gói Dịch Vụ (FR-28)</Typography>
                <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, mt: 2 }}>
                  <Typography variant="h6" color="primary">ENTERPRISE</Typography>
                  <Typography variant="caption">Hết hạn: 20/12/2026</Typography>
                </Box>
                <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/clinic/billing')}>
                  Nâng cấp
                </Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold">Bác sĩ tiêu biểu (FR-23)</Typography>
                <List>
                  {activeDoctors.map((doc) => (
                    <ListItem key={doc.id} sx={{ px: 0 }}>
                      <ListItemAvatar><Avatar>{doc.name[4]}</Avatar></ListItemAvatar>
                      <ListItemText primary={doc.name} secondary={`${doc.specialty}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}