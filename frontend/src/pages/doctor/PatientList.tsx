import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { listPatients } from "../../api/doctorApi";

type PatientSummary = {
  id?: string | number;
  userId?: string | number;
  username?: string;
  fullName?: string;
  name?: string;
  age?: number;
  latestAnalysisId?: string;
  predLabel?: string;
  riskLevel?: string;
};

function riskText(p: PatientSummary) {
  if (!p.latestAnalysisId) return { label: "Chưa có kết quả", tone: "default" as const };

  const rl = (p.riskLevel || "").toUpperCase();
  if (rl === "HIGH") return { label: "Nguy cơ cao", tone: "error" as const };
  if (rl === "MED") return { label: "Nguy cơ", tone: "warning" as const };
  if (rl === "LOW") return { label: "Bình thường", tone: "success" as const };
  if (rl === "QUALITY_LOW") return { label: "Chất lượng ảnh kém", tone: "default" as const };

  // fallback for older records
  const l = (p.predLabel || "").toLowerCase();
  if (l.includes("glau")) return { label: "Nguy cơ cao", tone: "error" as const };
  if (l.includes("dr") || l.includes("diab")) return { label: "Nguy cơ", tone: "warning" as const };
  if (l.includes("normal") || l.includes("healthy")) return { label: "Bình thường", tone: "success" as const };
  return { label: p.predLabel || "—", tone: "default" as const };
}

export default function PatientList() {
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<string>("ALL");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await listPatients();
        const items = Array.isArray(data) ? data : data?.items || data?.content || [];
        setPatients(items);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không tải được danh sách bệnh nhân.");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const hay = `${p.name || ""} ${p.fullName || ""} ${p.username || ""} ${p.id || ""} ${p.userId || ""}`.toLowerCase();
      const okQ = !q || hay.includes(q);

      const rl = (p.riskLevel || "QUALITY_LOW").toUpperCase();
      const okR = risk === "ALL" ? true : rl === risk;

      return okQ && okR;
    });
  }, [patients, search, risk]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý bệnh nhân
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/doctor/dashboard")}>Dashboard</Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Tìm theo tên, username, mã BN..."
        sx={{ mb: 3, bgcolor: "white" }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <FormControl sx={{ mb: 3, width: 260, bgcolor: "white" }} size="small">
        <InputLabel id="risk-filter">Lọc theo nguy cơ</InputLabel>
        <Select
          labelId="risk-filter"
          label="Lọc theo nguy cơ"
          value={risk}
          onChange={(e) => setRisk(String(e.target.value))}
        >
          <MenuItem value="ALL">Tất cả</MenuItem>
          <MenuItem value="HIGH">HIGH (Nguy cơ cao)</MenuItem>
          <MenuItem value="MED">MED (Nguy cơ)</MenuItem>
          <MenuItem value="LOW">LOW (Bình thường)</MenuItem>
          <MenuItem value="QUALITY_LOW">QUALITY_LOW (Ảnh kém)</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Mã BN</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Tuổi</TableCell>
              <TableCell>Tình trạng</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => {
              const id = String(p.id ?? p.userId ?? "—");
              const displayName = p.name || p.fullName || p.username || "—";
              const risk = riskText(p);

              return (
                <TableRow key={`${id}-${p.latestAnalysisId || "none"}`} hover>
                  <TableCell>{id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>{displayName}</Typography>
                  </TableCell>
                  <TableCell>{p.age ?? "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={risk.label} color={risk.tone} variant={risk.tone === "default" ? "outlined" : "filled"} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!p.latestAnalysisId}
                      onClick={() => navigate(`/doctor/result/${p.latestAnalysisId}`)}
                    >
                      Xem kết quả
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Chưa có dữ liệu.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
