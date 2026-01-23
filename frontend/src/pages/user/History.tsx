import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { listMyAnalyses } from '../../api/analysisApi';

export default function History() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await listMyAnalyses();
        setRows(Array.isArray(data) ? data : (data.items || []));
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không tải được lịch sử.");
      }
    })();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h5" fontWeight="bold" gutterBottom>Lịch sử khám bệnh</Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

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
            {rows.map((row) => {
              const date = row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—";
              const conf = typeof row.predConf === "number" ? `${Math.round(row.predConf * 100)}%` : "—";
              return (
                <TableRow key={row.id}>
                  <TableCell>{date}</TableCell>
                  <TableCell>{row.predLabel || "—"}</TableCell>
                  <TableCell>{conf}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/user/result/${row.id}`)}>Xem</Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Chưa có dữ liệu.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
