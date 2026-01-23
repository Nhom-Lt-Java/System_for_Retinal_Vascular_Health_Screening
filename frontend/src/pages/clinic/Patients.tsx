import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Box,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { assignDoctorToPatient, listClinicDoctors, listClinicPatients, type ClinicDoctor, type ClinicPatient } from "../../api/clinicApi";
import { useNavigate } from "react-router-dom";

export default function ClinicPatients() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [patients, setPatients] = useState<ClinicPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [pick, setPick] = useState<Record<number, number | "">>({});

  const doctorMap = useMemo(() => {
    const m: Record<number, ClinicDoctor> = {};
    doctors.forEach((d) => (m[d.id] = d));
    return m;
  }, [doctors]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [ds, ps] = await Promise.all([listClinicDoctors(), listClinicPatients()]);
      setDoctors(Array.isArray(ds) ? ds : []);
      setPatients(Array.isArray(ps) ? ps : []);
      // init picks
      const init: Record<number, number | ""> = {};
      (Array.isArray(ps) ? ps : []).forEach((p) => (init[p.id] = p.assignedDoctorId || ""));
      setPick(init);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được danh sách bệnh nhân.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAssign = async (patientId: number) => {
    const doctorId = pick[patientId];
    if (!doctorId) return;
    try {
      setSaving((prev) => ({ ...prev, [patientId]: true }));
      const updated = await assignDoctorToPatient(patientId, Number(doctorId));
      setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không thể gán bác sĩ.");
    } finally {
      setSaving((prev) => ({ ...prev, [patientId]: false }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color="primary" fontWeight="bold">Quản lý Bệnh nhân</Typography>
        <Button variant="outlined" onClick={() => navigate("/clinic/bulk")}>Bulk upload</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Họ tên</strong></TableCell>
                <TableCell><strong>Bác sĩ phụ trách</strong></TableCell>
                <TableCell align="right"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.username}</TableCell>
                  <TableCell>{p.fullName || "—"}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={pick[p.id] ?? ""}
                      onChange={(e) => setPick((prev) => ({ ...prev, [p.id]: e.target.value as any }))}
                      displayEmpty
                      sx={{ minWidth: 220 }}
                    >
                      <MenuItem value=""><em>Chưa gán</em></MenuItem>
                      {doctors.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          #{d.id} — {d.fullName || d.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!pick[p.id] || !!saving[p.id]}
                      onClick={() => onAssign(p.id)}
                    >
                      {saving[p.id] ? "Đang lưu..." : "Gán"}
                    </Button>
                    {p.assignedDoctorId && (
                      <Button
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => navigate(`/chat/${p.assignedDoctorId}`)}
                      >
                        Chat
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="textSecondary">Chưa có bệnh nhân trong phòng khám.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
