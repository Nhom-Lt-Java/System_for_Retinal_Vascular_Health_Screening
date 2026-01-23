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
  listNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  type NotificationTemplate,
} from "../../api/adminApi";

const emptyTpl: NotificationTemplate = {
  templateKey: "",
  titleTemplate: "",
  messageTemplate: "",
  type: "INFO",
  active: true,
};

export default function NotificationTemplates() {
  const [items, setItems] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate>(emptyTpl);

  const isEdit = useMemo(() => !!editing?.id, [editing]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await listNotificationTemplates();
      setItems(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được danh sách template.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    try {
      setBusy(true);
      setError("");
      setOk("");
      if (!editing.templateKey?.trim()) throw new Error("Thiếu templateKey");
      if (!editing.titleTemplate?.trim()) throw new Error("Thiếu titleTemplate");
      if (!editing.messageTemplate?.trim()) throw new Error("Thiếu messageTemplate");

      if (isEdit && editing.id) {
        await updateNotificationTemplate(Number(editing.id), editing);
        setOk("Đã cập nhật template.");
      } else {
        await createNotificationTemplate(editing);
        setOk("Đã tạo template.");
      }

      setOpen(false);
      setEditing(emptyTpl);
      await load();
    } catch (e: any) {
      setError(e?.message || e?.response?.data?.message || "Không lưu được template.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Notification templates</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(emptyTpl);
            setOpen(true);
          }}
        >
          Thêm template
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{ok}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id ?? t.templateKey} hover>
                  <TableCell><b>{t.templateKey}</b></TableCell>
                  <TableCell>{t.type || "INFO"}</TableCell>
                  <TableCell>{t.titleTemplate}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t.active ? "ACTIVE" : "INACTIVE"}
                      color={t.active ? "success" : "default"}
                      variant={t.active ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setEditing({
                          id: t.id,
                          templateKey: t.templateKey,
                          titleTemplate: t.titleTemplate,
                          messageTemplate: t.messageTemplate,
                          type: t.type || "INFO",
                          active: !!t.active,
                        });
                        setOpen(true);
                      }}
                    >
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow><TableCell colSpan={5}>Chưa có template nào.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => !busy && setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? "Cập nhật template" : "Tạo template"}</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
            <TextField
              label="Template key"
              fullWidth
              value={editing.templateKey}
              disabled={isEdit}
              onChange={(e) => setEditing({ ...editing, templateKey: e.target.value })}
              helperText={isEdit ? "Không thể đổi key" : "VD: ANALYSIS_DONE"}
            />
            <TextField
              label="Type"
              value={editing.type || "INFO"}
              onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              sx={{ width: 220 }}
            />
            <FormControlLabel
              control={<Switch checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />}
              label="Active"
            />
            <TextField
              label="Title template"
              fullWidth
              value={editing.titleTemplate}
              onChange={(e) => setEditing({ ...editing, titleTemplate: e.target.value })}
              helperText="Hỗ trợ {{analysisId}}, {{riskLevel}}, {{label}}"
            />
            <TextField
              label="Message template"
              fullWidth
              multiline
              minRows={4}
              value={editing.messageTemplate}
              onChange={(e) => setEditing({ ...editing, messageTemplate: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={busy}>Huỷ</Button>
          <Button variant="contained" onClick={onSave} disabled={busy}>
            {busy ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
