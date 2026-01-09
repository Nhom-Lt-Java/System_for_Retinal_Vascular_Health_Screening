import React, { useState } from "react";
import { Container, Typography, Paper, Button, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import analysisApi from "../../api/analysisApi";
import UploadBox from "../../components/UploadBox";

type LocalHistoryItem = {
  id: string;
  createdAt: string;
  predLabel: string | null;
  predConf: number | null;
};

function pushLocalHistory(item: LocalHistoryItem) {
  const key = "aura_analysis_history";
  const raw = localStorage.getItem(key);
  const arr: LocalHistoryItem[] = raw ? JSON.parse(raw) : [];
  arr.unshift(item);
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
}

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartAnalysis = async () => {
    setError("");

    if (selectedFiles.length === 0) {
      setError("Vui lòng chọn ảnh trước!");
      return;
    }

    try {
      setLoading(true);
      const file = selectedFiles[0];
      const res = await analysisApi.create(file);

      // lưu local history (fallback nếu backend chưa có list)
      pushLocalHistory({
        id: res.id,
        createdAt: new Date().toISOString(),
        predLabel: res.predLabel,
        predConf: res.predConf,
      });

      navigate(`/result?id=${res.id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || "Lỗi upload/phân tích";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Tải ảnh võng mạc
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          Hệ thống AI sẽ phân tích hình ảnh và trả kết quả trong giây lát.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <UploadBox onSelect={setSelectedFiles} />
        <Button
          variant="contained"
          size="large"
          onClick={handleStartAnalysis}
          disabled={loading}
          sx={{ mt: 3, borderRadius: 3, px: 4, py: 1.2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={22} sx={{ mr: 1 }} /> Đang phân tích...
            </>
          ) : (
            "Bắt đầu phân tích"
          )}
        </Button>
      </Paper>
    </Container>
  );
};

export default Upload;
