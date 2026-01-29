import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid, // Lưu ý: Nếu dùng MUI v6, Grid này thường là Grid2
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useAuth } from "../../context/AuthContext";
import { getBalance, listPackages, purchasePackage, type ServicePackage } from "../../api/billingApi";

export default function BillingPage() {
  const { user } = useAuth();
  const userId = user?.id as number | undefined;

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setOk("");
      const ps = await listPackages();
      // Lọc các gói active
      setPackages((ps || []).filter((p) => p.active));
      
      if (userId) {
        const b = await getBalance(userId);
        setBalance(b);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được gói dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onPurchase = async (pkgId: number) => {
    if (!userId) {
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setBusyId(pkgId);
      setError("");
      setOk("");
      await purchasePackage(userId, pkgId);
      setOk("Mua gói thành công! Credits đã được cộng vào tài khoản.");
      const b = await getBalance(userId);
      setBalance(b);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Giao dịch thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  const credits = balance?.remainingCredits ?? balance?.credits ?? balance?.balance ?? 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Gói Dịch Vụ
        </Typography>
        <Button variant="outlined" onClick={load}>Làm mới</Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontSize: '1.1rem' }}>
        Số dư hiện tại của bạn: <b>{credits}</b> lượt phân tích
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{ok}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {packages.map((plan) => (
            // FIX: Thay 'item xs={12} md={4}' thành 'size={{ xs: 12, md: 4 }}'
            <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 4, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>{plan.name}</Typography>
                  <Chip label={`${plan.credits} Credits`} color="primary" sx={{ mb: 2 }} />
                  
                  <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                    {new Intl.NumberFormat("vi-VN", { style: 'currency', currency: 'VND' }).format(Number(plan.price))}
                  </Typography>
                  
                  {plan.description && <Typography color="textSecondary" sx={{ mb: 2 }}>{plan.description}</Typography>}
                  
                  <Box sx={{ mt: 2, textAlign: 'left', pl: 2 }}>
                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <CheckIcon color="success" fontSize="small" /> Kích hoạt ngay lập tức
                    </Typography>
                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckIcon color="success" fontSize="small" /> Hỗ trợ kỹ thuật 24/7
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={busyId === plan.id}
                    onClick={() => onPurchase(plan.id)}
                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                  >
                    {busyId === plan.id ? "Đang xử lý..." : "MUA NGAY"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {!loading && packages.length === 0 && (
             // FIX: Thay 'item xs={12}' thành 'size={{ xs: 12 }}'
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>Hiện chưa có gói dịch vụ nào được mở bán.</Alert>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}