import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

export default function ConclusionEditor() {
  const [note, setNote] = useState('');

  const handleSave = () => {
    alert("Đã lưu ghi chú của bác sĩ: " + note);
  };

  return (
    <Paper sx={{ p: 3, mt: 3, bgcolor: '#fff9c4' }}>
      <Typography variant="h6" gutterBottom color="warning.dark">Ghi chú & Kết luận của Bác sĩ</Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="Nhập chẩn đoán lâm sàng và lời khuyên tại đây..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        sx={{ bgcolor: 'white' }}
      />
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Button variant="contained" color="warning" onClick={handleSave}>
          Lưu kết luận
        </Button>
      </Box>
    </Paper>
  );
}