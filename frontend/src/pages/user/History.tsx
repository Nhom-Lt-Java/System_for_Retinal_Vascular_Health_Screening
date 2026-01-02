import React from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const historyData = [
    { id: 1, date: '2025-12-22', result: 'Normal', confidence: '98%' },
    { id: 2, date: '2025-12-20', result: 'Mild DR', confidence: '85%' },
  ];

  return (
    <Container maxWidth="md">
      <Typography variant="h5" fontWeight="bold" gutterBottom>Lịch sử khám bệnh</Typography>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Chẩn đoán AI</TableCell>
              <TableCell>Độ tin cậy</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historyData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.result}</TableCell>
                <TableCell>{row.confidence}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate('/result')}>Xem</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}