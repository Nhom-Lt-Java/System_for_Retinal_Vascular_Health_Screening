import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  adminCreatePackage,
  adminDeletePackage,
  adminListPackages,
  adminUpdatePackage,
  type ServicePackageAdmin,
} from "../../api/adminApi";

function fmtMoney(v: number | string | undefined | null) {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  return Intl.NumberFormat("vi-VN").format(Number.isFinite(n) ? n : 0) + "đ";
}

const emptyPkg: ServicePackageAdmin = {
  name: "",
  description: "",
  price: 0,
  credits: 0,
  durationDays: null,
  active: true,
};

export default function PricingManager() {
  const [items, setItems] = useState<ServicePackageAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePackageAdmin>(emptyPkg);

  const isEdit = useMemo(() => !!editing?.id, [editing]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setOk("");
      const data = await adminListPackages();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được gói dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onOpenCreate = () => {
    setEditing({ ...emptyPkg });
    setOpen(true);
  };

  const onOpenEdit = (p: ServicePackageAdmin) => {
    setEditing({ ...p });
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onSave = async () => {
    try {
      setBusy(true);
      setError("");
      setOk("");

      if (!editing.name?.trim()) {
        setError("Tên gói không được để trống.");
        return;
      }

      const payload: ServicePackageAdmin = {
        name: editing.name.trim(),
        description: editing.description || "",
        price: editing.price ?? 0,
        credits: Number(editing.credits ?? 0),
        durationDays: editing.durationDays === null || editing.durationDays === undefined || editing.durationDays === ("" as any)
          ? null
          : Number(editing.durationDays),
        active: !!editing.active,
      };

      if (isEdit && editing.id) {
        await adminUpdatePackage(editing.id, payload);
        setOk("Đã cập nhật gói.");
      } else {
        await adminCreatePackage(payload);
        setOk("Đã tạo gói.");
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Lưu thất bại.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    try {
      setBusy(true);
      setError("");
      setOk("");
      await adminDeletePackage(id);
      setOk("Đã xoá gói.");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Xoá thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý gói dịch vụ (Admin)
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={load}>
            Refresh
          </Button>
          <Button variant="contained" onClick={onOpenCreate}>
            Tạo gói
          </Button>
        </Box>
      </Box>

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

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Thời hạn (ngày)</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography fontWeight={800}>{p.name}</Typography>
                    {p.description ? (
                      <Typography variant="body2" color="textSecondary">
                        {p.description}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{fmtMoney(p.price)}</TableCell>
                  <TableCell>{p.credits}</TableCell>
                  <TableCell>{p.durationDays ?? "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.active ? "ACTIVE" : "INACTIVE"}
                      color={p.active ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => onOpenEdit(p)}>
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => p.id && onDelete(p.id)}
                      >
                        Xoá
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box textAlign="center" py={4}>
                      <Typography color="textSecondary">Chưa có gói nào.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Cập nhật gói" : "Tạo gói mới"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            label="Tên gói"
            value={editing.name}
            onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Mô tả"
            value={editing.description || ""}
            onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Giá (VND)"
            type="number"
            value={String(editing.price ?? 0)}
            onChange={(e) => setEditing((s) => ({ ...s, price: Number(e.target.value) }))}
            fullWidth
          />
          <TextField
            label="Credits"
            type="number"
            value={String(editing.credits ?? 0)}
            onChange={(e) => setEditing((s) => ({ ...s, credits: Number(e.target.value) }))}
            fullWidth
          />
          <TextField
            label="Thời hạn (ngày, có thể để trống)"
            type="number"
            value={editing.durationDays === null || editing.durationDays === undefined ? "" : String(editing.durationDays)}
            onChange={(e) => setEditing((s) => ({ ...s, durationDays: e.target.value === "" ? null : Number(e.target.value) }))}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!editing.active}
                onChange={(e) => setEditing((s) => ({ ...s, active: e.target.checked }))}
              />
            }
            label="Đang bán (active)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={busy}>Huỷ</Button>
          <Button variant="contained" onClick={onSave} disabled={busy}>
            {busy ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
