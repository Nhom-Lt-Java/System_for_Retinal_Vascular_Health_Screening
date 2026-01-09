import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import analysisApi, { type AnalysisResponse } from "../../api/analysisApi";
import { useAuth } from "../../context/AuthContext";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * ✅ Bạn nói chỉ train 4 loại => chỉ map 4 loại này
 * (không thêm diabetic_retinopathy)
 */
const VI_LABEL: Record<string, string> = {
  glaucoma: "Glôcôm (tăng nhãn áp)",
  cataract: "Đục thủy tinh thể",
  normal: "Bình thường",
  amd: "Thoái hóa hoàng điểm (AMD)",
};

const ALLOWED_LABELS = new Set(Object.keys(VI_LABEL)); // ✅ chỉ cho 4 class

function parseProbs(data: any): Record<string, number> | null {
  const raw = data?.probsJson ?? data?.probs;
  if (!raw) return null;

  if (typeof raw === "object") return raw as Record<string, number>;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, number>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * ✅ Lấy top class nhưng CHỈ trong 4 class bạn train.
 * Nếu backend trả probs có key lạ (ví dụ diabetic_retinopathy) => bị bỏ qua.
 */
function getTopAllowedClass(probs: Record<string, number> | null | undefined) {
  if (!probs) return null;

  const entries = Object.entries(probs)
    .filter(([k, v]) => ALLOWED_LABELS.has(String(k).toLowerCase()) && typeof v === "number")
    .map(([k, v]) => [String(k).toLowerCase(), v] as [string, number]);

  if (!entries.length) return null;

  entries.sort((a, b) => b[1] - a[1]);
  const [key, val] = entries[0];
  return { key, val };
}

/**
 * ✅ URL helper: chịu được nhiều tên field backend có thể trả
 * (để không bị tab Heatmap Overlay rơi về overlayUrl)
 */
function pickUrls(d: any) {
  const originalUrl = d?.originalUrl ?? d?.original_url;
  const overlayUrl = d?.overlayUrl ?? d?.overlay_url;
  const maskUrl = d?.maskUrl ?? d?.mask_url;

  const heatmapUrl =
    d?.heatmapUrl ?? d?.heatUrl ?? d?.heatmap_url;

  const heatmapOverlayUrl =
    d?.heatmapOverlayUrl ??
    d?.heatOvUrl ??
    d?.heatmap_overlay_url ??
    d?.heatmapOverlayURL ??
    d?.heatmap_overlay;

  return { originalUrl, overlayUrl, maskUrl, heatmapUrl, heatmapOverlayUrl };
}

export default function Result() {
  const [params] = useSearchParams();
  const id = params.get("id");

  const { user } = useAuth();
  const isDoctor = String(user?.role || "").toUpperCase() === "DOCTOR";

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Doctor editable
  const [doctorNote, setDoctorNote] = useState("");
  const [finalConclusion, setFinalConclusion] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Image view tabs
  const [tab, setTab] = useState(0); // 0 original, 1 overlay, 2 mask, 3 heatmap overlay

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await analysisApi.get(id);
        if (cancelled) return;

        setData(res);

        // ✅ debug nhanh: mở DevTools console để xem backend trả key gì
        // console.log("Analysis raw:", res);

        // set kết luận ban đầu theo predLabel (nếu predLabel ngoài 4 class => "Không xác định")
        const raw = String((res as any).predLabel || "").toLowerCase();
        const vi = VI_LABEL[raw] ?? "Không xác định";
        setFinalConclusion(vi);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || "Không tải được kết quả");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const probs = useMemo(() => parseProbs(data as any), [data]);
  const topAllowed = useMemo(() => getTopAllowedClass(probs), [probs]);

  const rawPredLabel = useMemo(() => String((data as any)?.predLabel || "").toLowerCase(), [data]);

  /**
   * ✅ Ưu tiên topAllowed (lọc theo 4 class),
   * nếu không có => dùng predLabel nếu nằm trong 4 class,
   * nếu vẫn không => "unknown"
   */
  const topKey = useMemo(() => {
    if (topAllowed?.key) return topAllowed.key;
    if (ALLOWED_LABELS.has(rawPredLabel)) return rawPredLabel;
    return "unknown";
  }, [topAllowed, rawPredLabel]);

  const topScore = useMemo(() => {
    if (typeof topAllowed?.val === "number") return topAllowed.val;
    const conf = (data as any)?.predConf;
    return typeof conf === "number" ? conf : null;
  }, [topAllowed, data]);

  const topLabelVI = useMemo(() => {
    if (topKey === "unknown") return "Không xác định";
    return VI_LABEL[topKey] ?? "Không xác định";
  }, [topKey]);

  const confPct = useMemo(() => {
    if (typeof topScore !== "number") return null;
    return Math.round(topScore * 1000) / 10; // 1 decimal (%)
  }, [topScore]);

  // ✅ ảnh theo tab (tab 3 ưu tiên heatmapOverlayUrl, nếu thiếu mới fallback heatmapUrl)
  const imageSrc = useMemo(() => {
    if (!data) return null;
    const d: any = data as any;

    const { originalUrl, overlayUrl, maskUrl, heatmapUrl, heatmapOverlayUrl } = pickUrls(d);

    const urls = [
      originalUrl,
      overlayUrl,
      maskUrl,
      heatmapOverlayUrl ?? heatmapUrl, // ✅ đúng logic cho tab 3
    ];

    // ✅ Nếu urls[tab] không có, fallback lần lượt
    return urls[tab] || overlayUrl || originalUrl || null;
  }, [data, tab]);

  const handleSave = () => {
    // TODO: gọi API doctor-review ở đây
    console.log("Doctor save:", { finalConclusion, doctorNote, analysisId: (data as any)?.id });
    setIsSaved(true);
  };

  if (!id) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Không có mã kết quả. Hãy upload ảnh ở trang “Phân tích”.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left: Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Ảnh & Heatmap
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
              <Tab label="Original" />
              <Tab label="Vessel Overlay" />
              <Tab label="Vessel Mask" />
              <Tab label="Heatmap Overlay" />
            </Tabs>

            <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "#f6f7f9", minHeight: 320 }}>
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320 }}>
                  <CircularProgress />
                </Box>
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt="result"
                  style={{ width: "100%", display: "block" }}
                  onError={() => setError("Không tải được ảnh (URL/MinIO presign/CORS).")}
                />
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography color="text.secondary">Chưa có ảnh để hiển thị.</Typography>
                </Box>
              )}
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
              *Heatmap là vùng AI chú ý mạnh; Vessel mask/overlay là tách mạch.
            </Typography>
          </Paper>
        </Grid>

        {/* Right: Results */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: "100%" }}>
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              Kết quả AI
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                <CircularProgress size={22} />
                <Typography>Đang tải kết quả...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  {confPct !== null && (
                    <Chip
                      label={`${confPct}% tin cậy`}
                      color={confPct >= 80 ? "success" : "warning"}
                      sx={{ mb: 1 }}
                    />
                  )}

                  <Typography variant="h4" fontWeight="bold">
                    {topLabelVI}
                  </Typography>

                  {typeof topScore === "number" && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Xác suất cao nhất: {(topScore * 100).toFixed(1)}%
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {isDoctor ? (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      👨‍⚕️ Kết luận chuyên môn
                    </Typography>

                    <TextField
                      fullWidth
                      label="Chẩn đoán cuối cùng"
                      value={finalConclusion}
                      onChange={(e) => setFinalConclusion(e.target.value)}
                      margin="normal"
                      helperText="Bác sĩ có thể sửa lại kết quả của AI nếu thấy sai."
                    />

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Ghi chú điều trị / Lời dặn"
                      placeholder="Nhập phác đồ điều trị hoặc lời khuyên..."
                      value={doctorNote}
                      onChange={(e) => setDoctorNote(e.target.value)}
                      margin="normal"
                    />

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={isSaved ? <CheckCircleIcon /> : <SaveIcon />}
                      color={isSaved ? "success" : "primary"}
                      onClick={handleSave}
                      sx={{ mt: 2 }}
                    >
                      {isSaved ? "Đã lưu" : "Xác nhận kết quả"}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      💡 Khuyến nghị
                    </Typography>

                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                      Kết quả do AI tạo, mang tính tham khảo. Vui lòng chờ xác nhận từ bác sĩ.
                    </Alert>

                    <Button variant="outlined" fullWidth onClick={() => alert("MVP: mở trang Chat")}>
                      Hỏi bác sĩ ngay
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
