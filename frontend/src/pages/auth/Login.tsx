import React, { useEffect, useRef, useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Tabs, Tab, Alert, InputAdornment, Link as MuiLink
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import authApi from '../../api/authApi';

declare global {
  interface Window {
    google?: any;
  }
}

function normalizeRole(r: string) {
  const up = (r || "").toUpperCase();
  if (up === "ADMIN" || up === "SUPER_ADMIN") return "ADMIN";
  if (up === "CLINIC" || up === "CLINIC_ADMIN") return "CLINIC";
  if (up === "DOCTOR") return "DOCTOR";
  return "USER";
}

export default function Login() {
  const [roleTab, setRoleTab] = useState(0); // 0: Patient, 1: Doctor (UI only)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleError, setGoogleError] = useState<string>("");
  const roleTabRef = useRef<number>(roleTab);

  useEffect(() => {
    roleTabRef.current = roleTab;
  }, [roleTab]);

  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const g = window.google;
    if (!g?.accounts?.id || !googleBtnRef.current) return;

    try {
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          try {
            setGoogleError("");
            const idToken = resp?.credential;
            if (!idToken) {
              setGoogleError("Không nhận được Google credential.");
              return;
            }

            const res = await authApi.googleLogin(idToken);
            const token = res.data?.token;
            const user = res.data?.user || {};
            const role = normalizeRole(res.data?.role || user.role);

            if (!token) {
              setGoogleError("Đăng nhập Google thất bại: thiếu token.");
              return;
            }

            if (roleTabRef.current === 1 && role !== "DOCTOR") {
              setGoogleError("Tài khoản Google này không phải Bác sĩ.");
              return;
            }

            login(user, token, role);

            if (role === "DOCTOR") navigate("/doctor/dashboard");
            else if (role === "CLINIC") navigate("/clinic/dashboard");
            else if (role === "ADMIN") navigate("/admin/dashboard");
            else navigate("/user/upload");

          } catch (err: any) {
            setGoogleError(err?.response?.data?.message || "Đăng nhập Google thất bại.");
          }
        },
      });

      // Clear previous button content before rendering (avoid duplicates)
      googleBtnRef.current.innerHTML = "";
      g.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    } catch (e) {
      setGoogleError("Không thể khởi tạo Google Login.");
    }
  }, [login, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập Email và mật khẩu.");
      return;
    }

    try {
      // backend thường dùng username; ở đây dùng email làm username
      const res = await authApi.login({ username: email, password });
      const token = res.data?.token;
      const user = res.data?.user || {};
      const role = normalizeRole(res.data?.role || user.role);

      if (!token) {
        setError("Đăng nhập thất bại: thiếu token.");
        return;
      }

      // Optional: nếu user đang ở tab Doctor nhưng account không phải DOCTOR → báo lỗi
      if (roleTab === 1 && role !== "DOCTOR") {
        setError("Tài khoản này không phải Bác sĩ.");
        return;
      }

      login(user, token, role);

      if (role === "DOCTOR") navigate("/doctor/dashboard");
      else if (role === "CLINIC") navigate("/clinic/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/user/upload");

    } catch (err: any) {
      setError(err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center', width: '100%' }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>AURA</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Hệ thống phân tích võng mạc thông minh
        </Typography>

        <Tabs value={roleTab} onChange={(_, v) => setRoleTab(v)} variant="fullWidth"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Bệnh nhân" sx={{ fontWeight: 'bold' }} />
          <Tab label="Bác sĩ" sx={{ fontWeight: 'bold' }} />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left', borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth label="Email" margin="normal"
            value={email} onChange={e => setEmail(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
          />
          <TextField
            fullWidth label="Mật khẩu" type="password" margin="normal"
            value={password} onChange={e => setPassword(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ textDecoration: 'none' }}>
              Quên mật khẩu?
            </MuiLink>
          </Box>

          <Button
            fullWidth variant="contained" size="large" type="submit"
            sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
          >
            Đăng nhập {roleTab === 0 ? "Bệnh nhân" : "Bác sĩ"}
          </Button>

          {/* Google login (optional) */}
          {googleError && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left', borderRadius: 2 }}>
              {googleError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <div ref={googleBtnRef} />
          </Box>
        </form>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Chưa có tài khoản?{' '}
            <MuiLink component={Link} to="/register" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
              Đăng ký ngay
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
