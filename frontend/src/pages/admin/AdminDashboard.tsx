import React from 'react';
import { Container, Grid, Paper, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function ClinicApprovalTable() {
  const pending = [
    { id: 101, name: 'Mắt Sài Gòn', address: 'Q1, TP.HCM', date: '05/01/2026' },
    { id: 102, name: 'Nha khoa & Mắt Việt', address: 'Hà Nội', date: '04/01/2026' },
  ];

  return (
    <Table>
      <TableHead sx={{ bgcolor: '#eee' }}>
        <TableRow>
           <TableCell>Tên Phòng Khám</TableCell>
           <TableCell>Địa chỉ</TableCell>
           <TableCell>Ngày đăng ký</TableCell>
           <TableCell>Hành động</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pending.map((c) => (
          <TableRow key={c.id}>
            <TableCell sx={{ fontWeight: 'bold' }}>{c.name}</TableCell>
            <TableCell>{c.address}</TableCell>
            <TableCell>{c.date}</TableCell>
            <TableCell>
              <Button startIcon={<CheckCircleIcon />} color="success" size="small" variant="contained" sx={{ mr: 1 }}>Duyệt</Button>
              <Button startIcon={<CancelIcon />} color="error" size="small" variant="outlined">Từ chối</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = React.useState(0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>Global Admin Dashboard</Typography>
      
      {/* Thẻ thống kê hệ thống */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
           <Paper sx={{ p: 3, bgcolor: '#1976d2', color: 'white' }}>
             <Typography variant="subtitle1">Tổng Users</Typography>
             <Typography variant="h3" fontWeight="bold">5,400</Typography>
           </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
           <Paper sx={{ p: 3, bgcolor: '#388e3c', color: 'white' }}>
             <Typography variant="subtitle1">Phòng khám Active</Typography>
             <Typography variant="h3" fontWeight="bold">45</Typography>
           </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
           <Paper sx={{ p: 3, bgcolor: '#fbc02d', color: 'white' }}>
             <Typography variant="subtitle1">Chờ duyệt</Typography>
             <Typography variant="h3" fontWeight="bold">2</Typography>
           </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', minHeight: 400 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
            <Tab label="Duyệt Phòng Khám (FR-38)" />
            <Tab label="Quản lý Tài Khoản (FR-31)" />
            <Tab label="System Logs" />
          </Tabs>
        </Box>
        <Box sx={{ p: 3 }}>
          {tab === 0 && <ClinicApprovalTable />}
          {tab === 1 && <Typography align="center" sx={{ mt: 4, color: '#888' }}>Danh sách tài khoản toàn hệ thống...</Typography>}
        </Box>
      </Paper>
    </Container>
  );
}