import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getDoctorDashboard } from "../../api/doctorApi";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const d = await getDoctorDashboard();
      setData(d);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được dashboard bác sĩ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patients = data?.patients ?? 0;
  const totalAnalyses = data?.totalAnalyses ?? 0;
  const highRisk = data?.highRisk ?? 0;
  const pendingReview = data?.pendingReview ?? 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Doctor Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={load}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate("/doctor/patients")}>Danh sách bệnh nhân</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Bệnh nhân</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }}>{patients}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Tổng phân tích</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }}>{totalAnalyses}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Nguy cơ cao</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }} color="error">{highRisk}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography color="textSecondary" fontWeight="bold">Chờ duyệt</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }} color="warning.main">{pendingReview}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
