import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { createClinicDoctor, listClinicDoctors, type ClinicDoctor } from "../../api/clinicApi";

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", fullName: "", phone: "", password: "" });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listClinicDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được danh sách bác sĩ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("Vui lòng nhập username và mật khẩu cho bác sĩ.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const created = await createClinicDoctor({
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim() || form.username.trim(),
        phone: form.phone.trim() || undefined,
      });
      setDoctors((prev) => [created, ...prev]);
      setOpen(false);
      setForm({ username: "", fullName: "", phone: "", password: "" });
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tạo được bác sĩ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Quản lý Bác sĩ
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Thêm Bác sĩ
        </Button>
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
                <TableCell><strong>SĐT</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>{doc.id}</TableCell>
                  <TableCell>{doc.username}</TableCell>
                  <TableCell>{doc.fullName || "—"}</TableCell>
                  <TableCell>{doc.phone || "—"}</TableCell>
                </TableRow>
              ))}
              {doctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="textSecondary">Chưa có bác sĩ.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm bác sĩ</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Username (email)"
            margin="normal"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextField
            fullWidth
            label="Họ tên"
            margin="normal"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
            Bác sĩ sẽ được gán tự động vào clinic hiện tại.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Hủy</Button>
          <Button variant="contained" onClick={onCreate} disabled={saving}>
            {saving ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
