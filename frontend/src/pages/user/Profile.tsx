import React from 'react';
import { Container, Paper, Typography, Avatar, Box, Divider, Button, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth(); //

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Avatar sx={{ width: 100, height: 100, margin: 'auto', bgcolor: 'primary.main', fontSize: '2rem' }}>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>{user?.name || 'Chưa cập nhật'}</Typography>
        <Typography color="textSecondary">{user?.role === 'doctor' ? 'Bác sĩ chuyên khoa' : 'Bệnh nhân'}</Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={2} textAlign="left">
          <Grid item xs={6}><Typography color="textSecondary">Email:</Typography></Grid>
          <Grid item xs={6}><Typography fontWeight="medium">{user?.email}</Typography></Grid>
          <Grid item xs={6}><Typography color="textSecondary">Mã định danh:</Typography></Grid>
          <Grid item xs={6}><Typography fontWeight="medium">AURA-{Math.floor(Math.random() * 10000)}</Typography></Grid>
        </Grid>

        <Button variant="contained" sx={{ mt: 4, px: 4 }}>Chỉnh sửa hồ sơ</Button>
      </Paper>
    </Container>
  );
}