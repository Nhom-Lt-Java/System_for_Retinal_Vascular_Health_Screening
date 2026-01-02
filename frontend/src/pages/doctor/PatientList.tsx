import React, { useState } from 'react';
import { Container, Typography, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const mockPatients = [
  { id: 'BN01', name: 'Nguyễn Văn A', age: 45, status: 'High Risk' },
  { id: 'BN02', name: 'Trần Thị B', age: 38, status: 'Normal' },
];

export default function PatientList() {
  const [search, setSearch] = useState('');

  // FR-18: Logic tìm kiếm
  const filtered = mockPatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight="bold" gutterBottom>Quản lý Bệnh nhân</Typography>
      
      <TextField 
        fullWidth 
        placeholder="Tìm tên bệnh nhân..." 
        sx={{ mb: 3, bgcolor: 'white' }}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Mã BN</TableCell>
              <TableCell>Họ Tên</TableCell>
              <TableCell>Tuổi</TableCell>
              <TableCell>Tình trạng</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell><strong>{p.name}</strong></TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell><Button variant="outlined" size="small">Chi tiết</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}