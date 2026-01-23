import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getClinicDashboard,
  getClinicVerificationDocument,
  uploadClinicVerificationDocument,
} from "../../api/clinicApi";

export default function ClinicDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  const [verif, setVerif] = useState<{ fileId: string | null; url: string | null } | null>(null);
  const [verifUploading, setVerifUploading] = useState(false);
  const [verifMsg, setVerifMsg] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setVerifMsg("");
      const d = await getClinicDashboard();
      setData(d);
      const v = await getClinicVerificationDocument();
      setVerif(v);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được dashboard phòng khám.");
    } finally {
      setLoading(false);
    }
  };

  const onUploadVerif = async () => {
    const f = fileRef.current?.files?.[0];
    if (!f) {
      setVerifMsg("Vui lòng chọn file.");
      return;
    }
    try {
      setVerifUploading(true);
      setVerifMsg("");
      const res = await uploadClinicVerificationDocument(f);
      setVerif({ fileId: res.fileId, url: res.url });
      setVerifMsg("Đã upload giấy phép. Admin có thể xem và duyệt.");
    } catch (e: any) {
      setVerifMsg(e?.response?.data?.message || "Upload thất bại.");
    } finally {
      setVerifUploading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalAnalyses = data?.totalAnalyses ?? 0;
  const highRisk = data?.highRisk ?? 0;
  const doctors = data?.doctors ?? 0;
  const recent = Array.isArray(data?.recentAnalyses) ? data.recentAnalyses : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Clinic Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => navigate("/clinic/bulk")}>Bulk upload</Button>
          <Button variant="contained" onClick={() => navigate("/clinic/patients")}>Quản lý bệnh nhân</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Tổng số ca phân tích</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }}>{totalAnalyses}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Nguy cơ cao</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }} color="error">
                {highRisk}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Số bác sĩ</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }}>{doctors}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                Hồ sơ xác minh phòng khám (FR-22)
              </Typography>
              {verifMsg && (
                <Alert severity={verifMsg.includes("thất bại") ? "error" : "success"} sx={{ mb: 2, borderRadius: 2 }}>
                  {verifMsg}
                </Alert>
              )}
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <input ref={fileRef} type="file" accept="image/*,application/pdf" />
                <Button variant="contained" disabled={verifUploading} onClick={onUploadVerif}>
                  {verifUploading ? "Đang upload..." : "Upload"}
                </Button>
                {verif?.url ? (
                  <Button variant="outlined" href={verif.url} target="_blank" rel="noreferrer">
                    Xem file đã upload
                  </Button>
                ) : (
                  <Typography color="textSecondary">Chưa có file.</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 3, overflow: "hidden" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Lượt phân tích gần đây
                </Typography>
                <Button size="small" onClick={load}>Refresh</Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell align="right">Chi tiết</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map((r: any) => {
                    const time = r.createdAt ? new Date(r.createdAt).toLocaleString() : "—";
                    const conf = typeof r.confidence === "number" ? `${Math.round(r.confidence * 100)}%` : "—";
                    return (
                      <TableRow key={r.analysisId} hover>
                        <TableCell>{time}</TableCell>
                        <TableCell>{r.username || r.userId || "—"}</TableCell>
                        <TableCell>{r.status}</TableCell>
                        <TableCell>{r.label || "—"}</TableCell>
                        <TableCell>{conf}</TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => navigate(`/clinic/result/${r.analysisId}`)}>Xem</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recent.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>Chưa có dữ liệu.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
