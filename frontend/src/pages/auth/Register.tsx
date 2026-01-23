import React, { useMemo, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PhoneIcon from "@mui/icons-material/Phone";

import authApi from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

function normalizeRole(r: string) {
  const up = (r || "").toUpperCase();
  if (up === "SUPER_ADMIN") return "ADMIN";
  if (up === "CLINIC_ADMIN") return "CLINIC";
  return up || "USER";
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 0: Patient, 1: Clinic
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [patient, setPatient] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [clinic, setClinic] = useState({
    adminEmail: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
    licenseNo: "",
  });

  const passwordError = useMemo(() => {
    const src = tab === 0 ? patient : clinic;
    if (!src.password) return "";
    if (src.password.length < 6) return "Mật khẩu nên có ít nhất 6 ký tự.";
    if (src.confirmPassword && src.password !== src.confirmPassword) return "Mật khẩu nhập lại không khớp.";
    return "";
  }, [tab, patient, clinic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setSubmitting(true);
      if (tab === 0) {
        if (!patient.email.trim() || !patient.password.trim()) {
          setError("Vui lòng nhập Email và mật khẩu.");
          return;
        }
        const res = await authApi.register({
          username: patient.email.trim(),
          password: patient.password,
          role: "USER",
          fullName: patient.fullName.trim() || undefined,
        });
        const token = res.data?.token;
        const user = res.data?.user;
        if (!token || !user) {
          setError("Đăng ký thất bại: thiếu dữ liệu phản hồi.");
          return;
        }
        const role = normalizeRole(user.role);
        login(user, token, role);
        navigate("/user/upload");
        return;
      }

      // CLINIC
      if (!clinic.adminEmail.trim() || !clinic.password.trim() || !clinic.clinicName.trim()) {
        setError("Vui lòng nhập Email đại diện, mật khẩu và tên phòng khám.");
        return;
      }

      const res = await authApi.register({
        username: clinic.adminEmail.trim(),
        password: clinic.password,
        role: "CLINIC",
        clinicName: clinic.clinicName.trim(),
        clinicAddress: clinic.clinicAddress.trim() || undefined,
        clinicPhone: clinic.clinicPhone.trim() || undefined,
        licenseNo: clinic.licenseNo.trim() || undefined,
      });
      const token = res.data?.token;
      const user = res.data?.user;
      if (!token || !user) {
        setError("Đăng ký thất bại: thiếu dữ liệu phản hồi.");
        return;
      }
      const role = normalizeRole(user.role);
      login(user, token, role);
      navigate("/clinic/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 4 }}>
      <Paper elevation={10} sx={{ p: 4, borderRadius: 4, width: "100%" }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom align="center">
          AURA
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} align="center">
          Đăng ký tài khoản
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Bệnh nhân" />
          <Tab label="Phòng khám" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {tab === 0 ? (
            <>
              <TextField
                fullWidth
                label="Họ và tên"
                margin="normal"
                value={patient.fullName}
                onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={patient.email}
                onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                margin="normal"
                value={patient.password}
                onChange={(e) => setPatient({ ...patient, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Nhập lại mật khẩu"
                type="password"
                margin="normal"
                value={patient.confirmPassword}
                onChange={(e) => setPatient({ ...patient, confirmPassword: e.target.value })}
                helperText={passwordError || ""}
                error={!!passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Email đại diện"
                margin="normal"
                value={clinic.adminEmail}
                onChange={(e) => setClinic({ ...clinic, adminEmail: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                margin="normal"
                value={clinic.password}
                onChange={(e) => setClinic({ ...clinic, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Nhập lại mật khẩu"
                type="password"
                margin="normal"
                value={clinic.confirmPassword}
                onChange={(e) => setClinic({ ...clinic, confirmPassword: e.target.value })}
                helperText={passwordError || ""}
                error={!!passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Tên phòng khám / Bệnh viện"
                margin="normal"
                value={clinic.clinicName}
                onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeWorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Địa chỉ"
                margin="normal"
                value={clinic.clinicAddress}
                onChange={(e) => setClinic({ ...clinic, clinicAddress: e.target.value })}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                margin="normal"
                value={clinic.clinicPhone}
                onChange={(e) => setClinic({ ...clinic, clinicPhone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Số giấy phép"
                margin="normal"
                value={clinic.licenseNo}
                onChange={(e) => setClinic({ ...clinic, licenseNo: e.target.value })}
              />
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Tài khoản phòng khám sẽ ở trạng thái <b>PENDING</b> cho đến khi Admin duyệt.
                (Demo: vẫn có thể đăng nhập để trải nghiệm tính năng.)
              </Alert>
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={submitting}
            sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: "bold", textTransform: "none" }}
          >
            {submitting ? "Đang xử lý..." : "Tạo tài khoản"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Đã có tài khoản?{" "}
              <Button component={Link} to="/login" sx={{ textTransform: "none" }}>
                Đăng nhập
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
