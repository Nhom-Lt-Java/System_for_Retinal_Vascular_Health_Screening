import React, { useState } from 'react';
import { Container, Paper, Typography, Slider, Box, Button, Divider, Grid } from '@mui/material';

export default function AISettings() {
  const [threshold, setThreshold] = useState<number>(0.75);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 5 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">Cấu hình tham số AI (FR-33)</Typography>
        <Typography color="textSecondary" paragraph>
          Điều chỉnh các ngưỡng quyết định (Threshold) cho mô hình Deep Learning.
        </Typography>

        <Box sx={{ mt: 5, px: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography gutterBottom>
                Ngưỡng xác suất bệnh (Disease Probability Threshold): <span style={{ color: 'blue', fontWeight: 'bold' }}>{threshold}</span>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Slider
                value={threshold}
                min={0.5}
                max={0.99}
                step={0.01}
                onChange={(e, val) => setThreshold(val as number)}
                valueLabelDisplay="auto"
                marks={[{ value: 0.5, label: '0.5 (Nhạy)' }, { value: 0.99, label: '0.99 (Chặt)' }]}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined">Đặt lại mặc định</Button>
          <Button variant="contained" color="primary">Lưu cấu hình</Button>
        </Box>
      </Paper>
    </Container>
  );
}