import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  InputAdornment,
  Link as MuiLink,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

import authApi from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [roleTab, setRoleTab] = useState(0); // 0 user, 1 doctor
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) login -> lấy JWT token
      const token = await authApi.login(username, password);
      localStorage.setItem("aura_token", token);

      const me = await authApi.me(); // {id, username, role}
      const realRole = String(me?.role || "").toUpperCase();
      const wantRole = roleTab === 0 ? "USER" : "DOCTOR";

      if (realRole !== wantRole) {
        localStorage.removeItem("aura_token");
        setError(`Tài khoản này có role=${realRole}, không phù hợp với lựa chọn ${wantRole}.`);
        return;
      }

      login(me, token);
      navigate(realRole === "DOCTOR" ? "/doctor" : "/upload");

    } catch (err: any) {
      localStorage.removeItem("aura_token");
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Đăng nhập thất bại";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: "center", width: "100%" }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          AURA
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Đăng nhập hệ thống sàng lọc võng mạc
        </Typography>

        <Tabs
          value={roleTab}
          onChange={(_, v) => setRoleTab(v)}
          variant="fullWidth"
          sx={{ mt: 2, mb: 2 }}
        >
          <Tab label="Bệnh nhân" />
          <Tab label="Bác sĩ" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: "left", borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
          >
            {loading ? "Đang đăng nhập..." : `Đăng nhập ${roleTab === 0 ? "Bệnh nhân" : "Bác sĩ"}`}
          </Button>
        </form>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Chưa có tài khoản?{" "}
            <MuiLink component={Link} to="/register" sx={{ fontWeight: "bold", textDecoration: "none" }}>
              Đăng ký ngay
            </MuiLink>
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Quên mật khẩu?{" "}
            <MuiLink component={Link} to="/forgot-password" sx={{ fontWeight: "bold", textDecoration: "none" }}>
              Khôi phục
            </MuiLink>
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={26} />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;
