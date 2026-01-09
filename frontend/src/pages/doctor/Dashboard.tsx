import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import doctorApi, { type PatientSummary } from "../../api/doctorApi";
import { useAuth } from "../../context/AuthContext";

function labelToStatus(label?: string | null) {
  if (!label) return "Chưa có kết quả";
  const l = label.toLowerCase();
  if (l.includes("glau")) return "Nguy cơ cao";
  if (l.includes("dr") || l.includes("diab")) return "Nguy cơ";
  if (l.includes("normal") || l.includes("healthy")) return "Bình thường";
  return label;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const p = await doctorApi.listPatients();
        if (!mounted) return;
        setPatients(p);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Không tải được dữ liệu dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const pending = patients.filter((p) => !p.latestAnalysisId).length;
    const risk = patients.filter((p) => {
      const l = (p.predLabel || "").toLowerCase();
      return l.includes("glau") || l.includes("dr") || l.includes("diab");
    }).length;
    return { totalPatients, risk, pending };
  }, [patients]);

  const recentCards = useMemo(() => {
    return [...patients]
      .filter((p) => !!p.lastAnalyzedAt)
      .sort(
        (a, b) =>
          new Date(b.lastAnalyzedAt || 0).getTime() -
          new Date(a.lastAnalyzedAt || 0).getTime()
      )
      .slice(0, 6);
  }, [patients]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dashboard bác sĩ
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Xin chào, {user?.username || "Bác sĩ"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Đăng xuất
        </Button>
      </Box>

      {err && (
        <Box mb={2}>
          <Alert severity="error">{err}</Alert>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 140, bgcolor: "#e3f2fd", borderRadius: 2 }}>
              <Typography color="textSecondary" fontWeight="bold">
                Tổng bệnh nhân
              </Typography>
              <Typography component="p" variant="h3" color="primary" sx={{ mt: 1, fontWeight: "bold" }}>
                {stats.totalPatients}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 140, bgcolor: "#fff3e0", borderRadius: 2 }}>
              <Typography color="textSecondary" fontWeight="bold">
                Nguy cơ (ước tính)
              </Typography>
              <Typography component="p" variant="h3" color="warning.main" sx={{ mt: 1, fontWeight: "bold" }}>
                {stats.risk}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 140, bgcolor: "#f3e5f5", borderRadius: 2 }}>
              <Typography color="textSecondary" fontWeight="bold">
                Chưa có kết quả
              </Typography>
              <Typography component="p" variant="h3" color="secondary" sx={{ mt: 1, fontWeight: "bold" }}>
                {stats.pending}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Bệnh nhân gần đây
                </Typography>
                <Button onClick={() => navigate("/doctor/patients")}>Xem tất cả</Button>
              </Box>

              {recentCards.length === 0 ? (
                <Typography color="text.secondary">Chưa có dữ liệu phân tích.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {recentCards.map((p) => (
                    <Grid item xs={12} md={4} key={p.id}>
                      <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                              {(p.username || "U").charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {p.username}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {p.id} •{" "}
                                {p.lastAnalyzedAt ? new Date(p.lastAnalyzedAt).toLocaleString() : "—"}
                              </Typography>
                            </Box>
                          </Box>

                          <Typography variant="body2">
                            Trạng thái: <b>{labelToStatus(p.predLabel)}</b>
                          </Typography>

                          <Box mt={2}>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => navigate("/doctor/patients")}
                            >
                              Chi tiết
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  * MVP: DB chưa có tên/tuổi bệnh nhân nên đang hiển thị theo username.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
