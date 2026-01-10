import React from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Chip, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function DoctorManager() {
  const doctors = [
    { id: 1, name: 'Dr. Strange', email: 'doc1@clinic.com', phone: '0901234567', status: 'Active' },
    { id: 2, name: 'Dr. House', email: 'doc2@clinic.com', phone: '0909876543', status: 'Inactive' },
    { id: 3, name: 'Dr. Watson', email: 'doc3@clinic.com', phone: '0912345678', status: 'Active' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary" fontWeight="bold">Quản lý Bác sĩ</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Thêm Bác sĩ</Button>
      </Box>
      <Paper elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Họ tên</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>SĐT</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell align="right"><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell>{doc.id}</TableCell>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.email}</TableCell>
                <TableCell>{doc.phone}</TableCell>
                <TableCell>
                  <Chip label={doc.status} color={doc.status === 'Active' ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small"><EditIcon /></IconButton>
                  <IconButton color="error" size="small"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}