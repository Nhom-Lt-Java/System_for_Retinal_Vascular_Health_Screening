import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  approveClinic,
  getAuditLogs,
  getOverview,
  listClinics,
  suspendClinic,
  type AuditLog,
  type Clinic,
} from "../../api/adminApi";

function fmtMoney(v: any) {
  const n = typeof v === "string" ? Number(v) : v;
  return Intl.NumberFormat("vi-VN").format(Number.isFinite(n) ? n : 0) + "đ";
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setOk("");
      const [o, c, l] = await Promise.all([
        getOverview(),
        listClinics(),
        getAuditLogs(50),
      ]);
      setOverview(o);
      setClinics(c || []);
      setLogs(l || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(() => (clinics || []).filter((x) => x.status === "PENDING"), [clinics]);

  const cards = useMemo(() => {
    const users = overview?.users || {};
    const jobs = overview?.jobs || {};
    const statusDist = overview?.statusDistribution || {};

    return {
      revenue: overview?.revenue,
      totalAnalyses: overview?.totalAnalyses ?? 0,
      jobs,
      users,
      statusDist,
    };
  }, [overview]);

  const onApprove = async (id: number) => {
    try {
      setError("");
      setOk("");
      await approveClinic(id);
      setOk("Đã duyệt clinic.");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Duyệt thất bại.");
    }
  };

  const onSuspend = async (id: number) => {
    try {
      setError("");
      setOk("");
      await suspendClinic(id);
      setOk("Đã tạm dừng clinic.");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Tạm dừng thất bại.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Button variant="outlined" onClick={load}>Refresh</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{ok}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="textSecondary">Doanh thu (COMPLETED)</Typography>
                <Typography variant="h5" fontWeight={900}>{fmtMoney(cards.revenue)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="textSecondary">Tổng analyses</Typography>
                <Typography variant="h5" fontWeight={900}>{cards.totalAnalyses}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="textSecondary">Jobs</Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip label={`QUEUED: ${cards.jobs.queued ?? 0}`} />
                  <Chip label={`RUNNING: ${cards.jobs.running ?? 0}`} />
                  <Chip label={`FAILED: ${cards.jobs.failed ?? 0}`} color={cards.jobs.failed ? "error" : "default" as any} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="textSecondary">Users</Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip label={`TOTAL: ${cards.users.total ?? 0}`} />
                  <Chip label={`PATIENTS: ${cards.users.patients ?? 0}`} />
                  <Chip label={`DOCTORS: ${cards.users.doctors ?? 0}`} />
                  <Chip label={`CLINICS: ${cards.users.clinics ?? 0}`} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Clinics chờ duyệt
                </Typography>
                {pending.length === 0 ? (
                  <Typography color="textSecondary">Không có clinic nào đang PENDING.</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {pending.map((c) => (
                      <Box key={c.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, border: "1px solid rgba(0,0,0,0.06)", borderRadius: 2 }}>
                        <Box>
                          <Typography fontWeight={800}>{c.name}</Typography>
                          <Chip size="small" label={c.status} />
                        </Box>
                        <Box display="flex" gap={1}>
                          <Button size="small" variant="contained" onClick={() => onApprove(c.id)}>
                            Approve
                          </Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => onSuspend(c.id)}>
                            Suspend
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Phân bố status
                </Typography>
                {Object.keys(cards.statusDist || {}).length === 0 ? (
                  <Typography color="textSecondary">Chưa có dữ liệu.</Typography>
                ) : (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {Object.entries(cards.statusDist).map(([k, v]) => (
                      <Chip key={k} label={`${k || "(empty)"}: ${v as any}`} />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Audit logs
            </Typography>
            {logs.length === 0 ? (
              <Typography color="textSecondary">Chưa có log.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {logs.map((l) => (
                  <Box key={l.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.25, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <Box>
                      <Typography fontWeight={800}>{l.action}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {l.username || "anonymous"} · {l.timestamp ? new Date(l.timestamp).toLocaleString() : ""}
                        {l.ipAddress ? ` · ${l.ipAddress}` : ""}
                      </Typography>
                      {l.details ? (
                        <Typography variant="body2" color="textSecondary">{l.details}</Typography>
                      ) : null}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
}
