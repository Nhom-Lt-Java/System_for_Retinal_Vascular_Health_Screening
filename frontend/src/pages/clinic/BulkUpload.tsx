import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  TextField,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { createBulkAnalyses } from "../../api/analysisApi";

export default function BulkUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const canSubmit = useMemo(() => files.length > 0 && !!userId.trim(), [files, userId]);

  const onChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files || []);
    setFiles(fs);
    setResult(null);
    setError("");
  };

  const onSubmit = async () => {
    try {
      if (!canSubmit) return;
      if (files.length < 2) {
        // bulk vẫn chạy với 1 ảnh, nhưng UI nhắc
        setError("Bulk upload nên có từ 2 ảnh trở lên (yêu cầu dự án: >=100 ảnh/batch). Bạn vẫn có thể chạy demo.");
      }
      setBusy(true);
      const res = await createBulkAnalyses(files, userId.trim());
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Bulk upload thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Bulk Upload (Clinic)
      </Typography>
      <Typography color="textSecondary" sx={{ mb: 2 }}>
        Upload nhiều ảnh Fundus/OCT (≥ 100 ảnh/batch) để hệ thống xử lý bất đồng bộ theo hàng đợi.
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TextField
          label="User ID (bệnh nhân)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          fullWidth
          helperText="Clinic upload hộ bệnh nhân nào? Nhập userId của bệnh nhân trong phòng khám."
        />

        <Box sx={{ mt: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
          >
            Chọn ảnh (multi)
            <input hidden type="file" multiple accept="image/*" onChange={onChoose} />
          </Button>
          <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
            Đã chọn: <b>{files.length}</b> ảnh
          </Typography>
        </Box>

        {busy && <LinearProgress sx={{ mt: 2 }} />}

        {files.length > 0 && (
          <List dense sx={{ mt: 2, maxHeight: 220, overflow: "auto" }}>
            {files.slice(0, 20).map((f) => (
              <ListItem key={f.name}>
                <ListItemText primary={f.name} secondary={`${Math.round(f.size / 1024)} KB`} />
              </ListItem>
            ))}
            {files.length > 20 && (
              <ListItem>
                <ListItemText primary={`... và ${files.length - 20} ảnh khác`} />
              </ListItem>
            )}
          </List>
        )}

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          disabled={!canSubmit || busy}
          onClick={onSubmit}
        >
          {busy ? "Đang gửi..." : "Gửi batch"}
        </Button>

        {result && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
            Đã tạo <b>{result.count}</b> bản ghi analysis. Bạn có thể theo dõi trạng thái tại dashboard.
          </Alert>
        )}
      </Paper>
    </Container>
  );
}
