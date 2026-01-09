import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import doctorApi, { type PatientSummary } from "../../api/doctorApi";

function statusText(p: PatientSummary) {
  if (!p.latestAnalysisId) return "Chưa có kết quả";
  const l = (p.predLabel || "").toLowerCase();
  if (l.includes("glau")) return "Nguy cơ cao";
  if (l.includes("dr") || l.includes("diab")) return "Nguy cơ";
  if (l.includes("normal") || l.includes("healthy")) return "Bình thường";
  return p.predLabel || "—";
}

export default function PatientList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await doctorApi.listPatients();
        if (!mounted) return;
        setPatients(data);
      } catch (e: any) {
        if (!mounted) return;
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === "string" ? e.response.data : null) ||
          e?.message ||
          "Không tải được danh sách bệnh nhân.";
        setErr(String(msg));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => (p.username || "").toLowerCase().includes(q));
  }, [patients, search]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Danh sách bệnh nhân
      </Typography>

      {err && (
        <Box mb={2}>
          <Alert severity="error">{err}</Alert>
        </Box>
      )}

      <TextField
        fullWidth
        placeholder="Tìm theo username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Lần gần nhất</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    <strong>{p.username}</strong>
                  </TableCell>
                  <TableCell>
                    {p.lastAnalyzedAt ? new Date(p.lastAnalyzedAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>{statusText(p)}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={!p.latestAnalysisId}
                      onClick={() => navigate(`/result?id=${p.latestAnalysisId}`)}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Không có bệnh nhân phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          * MVP: DB chưa có cột tên/tuổi bệnh nhân nên đang hiển thị theo username.
        </Typography>
      </Box>
    </Container>
  );
}
