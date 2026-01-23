import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import profileApi, { type Profile, type ProfileUpdate } from "../../api/profileApi";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [p, setP] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const me = await profileApi.getMe();
        setP(me);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Không tải được hồ sơ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateField = (k: keyof Profile, v: any) => {
    setP((prev) => (prev ? { ...prev, [k]: v } : prev));
  };

  const onSave = async () => {
    if (!p) return;
    setSaving(true);
    setOk(null);
    setError(null);
    try {
      const payload: ProfileUpdate = {
        email: p.email ?? null,
        phone: p.phone ?? null,
        firstName: p.firstName ?? null,
        lastName: p.lastName ?? null,
        fullName: p.fullName ?? null,
        address: p.address ?? null,
        dateOfBirth: p.dateOfBirth ?? null,
        gender: p.gender ?? null,
        emergencyContact: p.emergencyContact ?? null,
        // medicalInfo: p.medicalInfo ?? null,
      };
      const saved = await profileApi.updateMe(payload);
      setP(saved);
      setOk("Đã lưu hồ sơ");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Hồ sơ cá nhân
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && ok && <Alert severity="success">{ok}</Alert>}

      {!loading && p && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Tài khoản: <b>{p.username}</b> • Role: <b>{p.role}</b> • Trạng thái:{" "}
            <b>{p.enabled ? "Active" : "Disabled"}</b>
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={p.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số điện thoại"
                value={p.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Họ"
                value={p.lastName || ""}
                onChange={(e) => updateField("lastName", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tên"
                value={p.firstName || ""}
                onChange={(e) => updateField("firstName", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Họ và tên"
                value={p.fullName || ""}
                onChange={(e) => updateField("fullName", e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày sinh"
                type="date"
                value={p.dateOfBirth || ""}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giới tính"
                value={p.gender || ""}
                onChange={(e) => updateField("gender", e.target.value)}
                fullWidth
                placeholder="Male / Female / Other"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Địa chỉ"
                value={p.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Liên hệ khẩn cấp"
                value={p.emergencyContact || ""}
                onChange={(e) => updateField("emergencyContact", e.target.value)}
                fullWidth
                placeholder="Tên + SĐT"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button variant="contained" onClick={onSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
