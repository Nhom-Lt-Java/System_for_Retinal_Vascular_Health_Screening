import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import UploadBox from '../../components/UploadBox';
import { useNavigate } from 'react-router-dom';

import { createBulkMyAnalyses } from '../../api/analysisApi';

type BulkItem = {
  id: string;
  status: string;
  originalFilename?: string;
};

export default function Upload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<BulkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const selectedInfo = useMemo(() => {
    const total = selectedFiles.length;
    const totalSize = selectedFiles.reduce((s, f) => s + (f.size || 0), 0);
    return { total, totalSize };
  }, [selectedFiles]);

  const handleStartAnalysis = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ảnh trước!");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setCreated([]);

      // Upload many images in one request (FR-2). Backend will infer userId from JWT.
      const res = await createBulkMyAnalyses(selectedFiles);
      const items = Array.isArray(res) ? (res as BulkItem[]) : [];
      setCreated(items);

      // If user uploads exactly 1 image, go straight to result.
      if (items.length === 1 && items[0]?.id) {
        navigate(`/user/result/${items[0].id}`);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Không thể gửi ảnh phân tích.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Tải ảnh võng mạc
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Hệ thống AI sẽ phân tích hình ảnh và trả kết quả trong giây lát.
        </Typography>

        <UploadBox onSelect={(files) => setSelectedFiles(files)} />

        <Box mt={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
            <Chip label={`Đã chọn: ${selectedInfo.total} ảnh`} />
            {selectedInfo.totalSize > 0 && (
              <Typography variant="body2" color="text.secondary">
                Tổng dung lượng: {(selectedInfo.totalSize / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            )}
          </Stack>
        </Box>

        {submitting && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Đang tải ảnh lên và tạo yêu cầu phân tích...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {created.length > 1 && (
          <Box mt={3}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Đã gửi {created.length} ảnh. Bạn có thể mở từng kết quả hoặc xem trong Lịch sử.
            </Alert>

            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {created.map((it, idx) => (
                <ListItem
                  key={it.id || idx}
                  secondaryAction={
                    <Button size="small" onClick={() => navigate(`/user/result/${it.id}`)}>
                      Mở
                    </Button>
                  }
                >
                  <ListItemText
                    primary={it.originalFilename || selectedFiles[idx]?.name || `Ảnh ${idx + 1}`}
                    secondary={`Trạng thái: ${it.status}`}
                  />
                </ListItem>
              ))}
            </List>

            <Box mt={2} textAlign="center">
              <Button variant="outlined" onClick={() => navigate('/user/history')}
                sx={{ borderRadius: 2 }}>
                Xem lịch sử
              </Button>
            </Box>
          </Box>
        )}

        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStartAnalysis}
            disabled={submitting}
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            {selectedFiles.length > 1 ? 'Gửi nhiều ảnh để phân tích' : 'Bắt đầu phân tích AI'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
