import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useAuth } from "../../context/AuthContext";
import {
  getBalance,
  listPackages,
  listMyOrders,
  purchasePackage,
  type OrderSummary,
  type ServicePackage,
  type UserCredit,
} from "../../api/billingApi";

function fmtMoney(v: number | string | undefined | null) {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  return Intl.NumberFormat("vi-VN").format(Number.isFinite(n) ? n : 0) + "đ";
}

export default function Billing() {
  const { user, role } = useAuth();
  const userId = user?.id as number | undefined;

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [balance, setBalance] = useState<UserCredit | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const credits = useMemo(() => {
    if (!balance) return null;
    return balance.remainingCredits ?? null;
  }, [balance]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setOk("");
      const ps = await listPackages();
      setPackages((ps || []).filter((p) => p.active));
      if (userId) {
        const b = await getBalance(userId);
        setBalance(b);
        const os = await listMyOrders();
        setOrders(Array.isArray(os) ? os : []);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được gói dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onPurchase = async (pkgId: number) => {
    if (!userId) {
      setError("Thiếu userId.");
      return;
    }
    try {
      setBusyId(pkgId);
      setError("");
      setOk("");
      await purchasePackage(userId, pkgId);
      setOk("Mua gói thành công (demo payment). Credits đã được ghi DB.");
      const b = await getBalance(userId);
      setBalance(b);
      const os = await listMyOrders();
      setOrders(Array.isArray(os) ? os : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Mua gói thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Gói dịch vụ ({(role || "").toUpperCase()})
        </Typography>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </Box>

      {credits !== null && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Số credits còn lại: <b>{credits}</b>
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {ok && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {ok}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {packages.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 4 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h5" fontWeight="bold">
                      {plan.name}
                    </Typography>
                    <Chip label={`${plan.credits} credits`} />
                  </Box>
                  <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                    {fmtMoney(plan.price)}
                  </Typography>
                  {plan.description && <Typography color="textSecondary">{plan.description}</Typography>}
                  {plan.durationDays ? (
                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                      Thời hạn: {plan.durationDays} ngày
                    </Typography>
                  ) : null}

                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckIcon color="success" fontSize="small" /> Thanh toán demo
                    </Typography>
                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckIcon color="success" fontSize="small" /> Ghi DB: order + credits
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={busyId === plan.id}
                    onClick={() => onPurchase(plan.id)}
                  >
                    {busyId === plan.id ? "Đang xử lý..." : "Mua ngay"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {packages.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Chưa có gói dịch vụ nào đang hoạt động.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Lịch sử thanh toán
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          {orders.length === 0 ? (
            <Typography color="textSecondary">Chưa có giao dịch.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {orders
                .slice()
                .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
                .map((o) => (
                  <Box
                    key={o.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700}>{o.packageName || "(Gói đã xoá)"}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""} · {o.paymentMethod || "MOCK"}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography fontWeight={800}>{fmtMoney(o.amount)}</Typography>
                      <Chip size="small" label={o.status || "COMPLETED"} />
                    </Box>
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
