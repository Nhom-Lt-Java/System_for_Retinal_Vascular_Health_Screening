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
  aiVersion?: string | null;
  
  // Các trường của Bác sĩ
  doctorConclusion?: string | null;
  doctorAdvice?: string | null;
  doctorNote?: string | null;
  reviewResult?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | number | null;
};

function riskChip(risk?: string | null) {
  const r = (risk || "").toUpperCase();
  if (!r) return null;
  const color = r === "HIGH" ? "error" : r === "MED" ? "warning" : r === "LOW" ? "success" : "default";
  const label =
    r === "HIGH" ? "Nguy cơ cao" : r === "MED" ? "Cần theo dõi" : r === "LOW" ? "Bình thường" : "Chất lượng thấp";
  return <Chip label={label} color={color as any} sx={{ fontWeight: 'bold' }} />;
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // State để chọn ảnh hiển thị ở phần AI
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        // Mặc định chọn ảnh heatmap overlay hoặc ảnh gốc
        if (isFirst) {
            setSelectedImage((res as any).heatmapOverlayUrl || (res as any).originalUrl);
        }
        
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
      alert("Chưa hỗ trợ tải PDF hoặc có lỗi xảy ra");
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
      alert("Chưa hỗ trợ tải CSV hoặc có lỗi xảy ra");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">Kết quả phân tích</Typography>
        <Button component={RouterLink} to="/user/history" variant="outlined">
          Quay lại lịch sử
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

      {/* --- PHẦN 1: KẾT LUẬN CỦA BÁC SĨ (Ưu tiên hiển thị) --- */}
      {data.doctorConclusion ? (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderLeft: "6px solid #2e7d32", bgcolor: "#f1f8e9" }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h5" color="#1b5e20" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              👨‍⚕️ Kết luận của Bác sĩ
            </Typography>
            <Chip label="Đã được duyệt" color="success" size="small" />
          </Box>
          
          <Grid container spacing={3}>
            {/* Đã xóa prop 'item' để fix lỗi TS */}
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                CHẨN ĐOÁN CHUYÊN MÔN
              </Typography>
              <Box sx={{ mt: 1, p: 2, bgcolor: "white", borderRadius: 1, border: "1px solid #c8e6c9" }}>
                <Typography variant="body1" fontWeight="500">
                  {data.doctorConclusion}
                </Typography>
              </Box>
            </Grid>
            {/* Đã xóa prop 'item' để fix lỗi TS */}
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                LỜI KHUYÊN & CHỈ ĐỊNH
              </Typography>
              <Box sx={{ mt: 1, p: 2, bgcolor: "white", borderRadius: 1, border: "1px solid #c8e6c9" }}>
                <Typography variant="body1" fontStyle="italic">
                  "{data.doctorAdvice || "Tuân thủ theo hướng dẫn điều trị của bác sĩ."}"
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #c8e6c9", display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
             <Typography variant="caption">
                Bác sĩ phụ trách: <strong>BS. {data.reviewedBy || "Chuyên khoa"}</strong>
             </Typography>
             <Typography variant="caption">
                Thời gian duyệt: {data.reviewedAt ? new Date(data.reviewedAt).toLocaleString() : ""}
             </Typography>
          </Box>
        </Paper>
      ) : (
        !polling && data.status !== "FAILED" && (
            <Alert severity="warning" sx={{ mb: 4, alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    ⏳ Hồ sơ đang chờ bác sĩ chuyên khoa xem xét
                </Typography>
                <Typography variant="body2">
                    Kết quả dưới đây chỉ là tham khảo từ AI. Kết luận chính thức sẽ được cập nhật sớm.
                </Typography>
            </Alert>
        )
      )}

      {/* --- PHẦN 2: KẾT QUẢ AI --- */}
      <Grid container spacing={3}>
        
        {/* CỘT TRÁI: THÔNG TIN AI */}
        {/* Đã xóa prop 'item' để fix lỗi TS */}
        <Grid xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Tham khảo từ AI (v{data.aiVersion || "1.0"})
              </Typography>
              
              <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={data.predConf ? data.predConf * 100 : 0} size={60} color={data.riskLevel === 'HIGH' ? 'error' : data.riskLevel === 'MED' ? 'warning' : 'success'} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {data.predConf ? `${Math.round(data.predConf * 100)}%` : "0%"}
                        </Typography>
                    </Box>
                 </Box>
                 <Box>
                    <Typography variant="subtitle2" color="text.secondary">Độ tin cậy</Typography>
                    <Typography variant="h6">{data.predLabel || "—"}</Typography>
                 </Box>
              </Box>

              <Box mb={3}>{riskChip(data.riskLevel)}</Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Gợi ý sơ bộ từ hệ thống:
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
                <Typography variant="body2" color="text.secondary">Chưa có dữ liệu.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CỘT PHẢI: HÌNH ẢNH */}
        {/* Đã xóa prop 'item' để fix lỗi TS */}
        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Hình ảnh phân tích
            </Typography>
            
            {/* Ảnh lớn - Đã fix lỗi inline-style bằng sx */}
            <Box sx={{ 
                bgcolor: '#000', 
                borderRadius: 2, 
                overflow: 'hidden', 
                height: 400, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
            }}>
                <Box 
                    component="img"
                    src={selectedImage || data.originalUrl || ""} 
                    alt="Analysis Result" 
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
            </Box>

            {/* Các nút chọn ảnh */}
            <Grid container spacing={1}>
              {[
                { label: "Gốc", url: data.originalUrl },
                { label: "Tổn thương", url: data.overlayUrl },
                { label: "Mạch máu", url: data.maskUrl },
                { label: "Bản đồ nhiệt", url: data.heatmapUrl },
                { label: "Kết hợp", url: data.heatmapOverlayUrl }
              ].map((img, idx) => (
                img.url && (
                  // Đã xóa prop 'item' để fix lỗi TS
                  <Grid key={idx}>
                    <Button 
                        variant={selectedImage === img.url ? "contained" : "outlined"} 
                        size="small"
                        onClick={() => setSelectedImage(img.url!)}
                        sx={{ textTransform: 'none' }}
                    >
                        {img.label}
                    </Button>
                  </Grid>
                )
              ))}
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button variant="contained" disabled={!canDownload} onClick={downloadPdf}>
                Tải báo cáo PDF
              </Button>
              {/* <Button variant="outlined" disabled={!canDownload} onClick={downloadCsv}>
                Tải CSV
              </Button> */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}