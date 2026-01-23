import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getAnalysis } from "../../api/analysisApi";
import axiosClient from "../../api/axiosClient";

type AnalysisResult = {
  id: string;
  status: string;
  predLabel?: string | null;
  predConf?: number | null;
  riskLevel?: string | null;
  advice?: string[] | null;
  originalUrl?: string | null;
  overlayUrl?: string | null;
  maskUrl?: string | null;
  heatmapUrl?: string | null;
  heatmapOverlayUrl?: string | null;
  errorMessage?: string | null;
};

function riskChip(risk?: string | null) {
  const r = (risk || "").toUpperCase();
  if (!r) return null;
  const label =
    r === "HIGH" ? "Nguy cơ cao" : r === "MED" ? "Nguy cơ" : r === "LOW" ? "Thấp" : "Chất lượng thấp";
  return <Chip label={label} />;
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: any = null;

    const fetchOnce = async (isFirst = false) => {
      if (!id) return;
      try {
        if (isFirst) setLoading(true);
        const res = await getAnalysis(id);
        if (stopped) return;
        setData(res as any);
        setErr(null);

        const st = String((res as any)?.status || "").toUpperCase();
        const shouldPoll = st === "QUEUED" || st === "RUNNING";
        setPolling(shouldPoll);
        if (shouldPoll) {
          timer = setTimeout(() => fetchOnce(false), 2000);
        }
      } catch (e: any) {
        if (stopped) return;
        setErr(e?.response?.data?.message || e?.message || "Load failed");
        setPolling(false);
      } finally {
        if (!stopped) setLoading(false);
      }
    };

    fetchOnce(true);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (err) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{err}</Alert>
      </Container>
    );
  }

  if (!data) return null;

  const canDownload = data.status === "COMPLETED" || data.status === "REVIEWED";

  const downloadPdf = async () => {
    try {
      const res = await axiosClient.get(`/reports/pdf/${data.id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura_report_${data.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Không tải được PDF");
    }
  };

  const downloadCsv = async () => {
    try {
      const res = await axiosClient.get(`/reports/csv/${data.id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura_report_${data.id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Không tải được CSV");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Kết quả phân tích</Typography>
        <Button component={RouterLink} to="/user/history" variant="outlined">
          Lịch sử
        </Button>
      </Box>

      {polling && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Hệ thống đang phân tích (trạng thái: {data.status}). Trang sẽ tự cập nhật...
        </Alert>
      )}

      {data.status === "FAILED" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Phân tích thất bại: {data.errorMessage || "Unknown error"}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Nhãn dự đoán
              </Typography>
              <Typography variant="h6">{data.predLabel || "—"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Độ tin cậy: {data.predConf != null ? (data.predConf * 100).toFixed(1) + "%" : "—"}
              </Typography>
              <Box mt={1}>{riskChip(data.riskLevel)}</Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Khuyến nghị
              </Typography>
              {data.advice && data.advice.length > 0 ? (
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {data.advice.map((a, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{a}</Typography>
                    </li>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có khuyến nghị.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Hình ảnh & chú thích
            </Typography>
            <Grid container spacing={2}>
              {data.originalUrl && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption">Ảnh gốc</Typography>
                  <Box component="img" src={data.originalUrl} sx={{ width: "100%", borderRadius: 1 }} />
                </Grid>
              )}
              {data.overlayUrl && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption">Overlay mạch máu</Typography>
                  <Box component="img" src={data.overlayUrl} sx={{ width: "100%", borderRadius: 1 }} />
                </Grid>
              )}
              {data.maskUrl && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption">Mask</Typography>
                  <Box component="img" src={data.maskUrl} sx={{ width: "100%", borderRadius: 1 }} />
                </Grid>
              )}
              {data.heatmapOverlayUrl && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption">Heatmap (giải thích)</Typography>
                  <Box component="img" src={data.heatmapOverlayUrl} sx={{ width: "100%", borderRadius: 1 }} />
                </Grid>
              )}
            </Grid>

            <Box mt={2}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" disabled={!canDownload} onClick={downloadPdf}>
                  Tải PDF
                </Button>
                <Button variant="outlined" disabled={!canDownload} onClick={downloadCsv}>
                  Tải CSV
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
