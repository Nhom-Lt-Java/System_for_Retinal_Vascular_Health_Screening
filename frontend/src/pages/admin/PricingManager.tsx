// src/pages/admin/PricingManager.tsx
import React from 'react';
import { Container, Typography, Paper, TextField, Button, Box } from '@mui/material';

export default function PricingManager() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Quản lý Giá & Gói Cước</Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField label="Giá gói Basic (VNĐ)" defaultValue="500,000" />
            <TextField label="Giá gói Premium (VNĐ)" defaultValue="2,000,000" />
            <TextField label="Hạn mức gói Basic (lượt/tháng)" defaultValue="50" />
            <TextField label="Hạn mức gói Premium (lượt/tháng)" defaultValue="300" />
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined">Hủy bỏ</Button>
                <Button variant="contained">Lưu thay đổi</Button>
            </Box>
        </Box>
      </Paper>
    </Container>
  );
}