import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import adminApi, { type AdminUser, type AdminUserUpdate } from "../../api/adminApi";

const roles = ["USER", "DOCTOR", "CLINIC", "ADMIN"];

function roleChip(role?: string) {
  const r = (role || "").toUpperCase();
  return <Chip size="small" label={r || "—"} />;
}

export default function UserManager() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("");
  const [enabled, setEnabled] = useState<string>("");
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [edit, setEdit] = useState<AdminUserUpdate>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const en = enabled === "" ? undefined : enabled === "true";
      const res = await adminApi.listUsers({ q: q || undefined, role: role || undefined, enabled: en });
      setUsers(res);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => users, [users]);

  function openEdit(u: AdminUser) {
    setSelected(u);
    setEdit({
      email: u.email || "",
      phone: u.phone || "",
      fullName: u.fullName || "",
      role: u.role || "USER",
      enabled: u.enabled,
      clinicId: u.clinicId ?? null,
      assignedDoctorId: u.assignedDoctorId ?? null,
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!selected) return;
    setSaving(true);
    setErr(null);
    try {
      const payload: AdminUserUpdate = {
        ...edit,
        email: edit.email === "" ? null : edit.email,
        phone: edit.phone === "" ? null : edit.phone,
        fullName: edit.fullName === "" ? null : edit.fullName,
        clinicId: edit.clinicId === null ? null : Number(edit.clinicId),
        assignedDoctorId: edit.assignedDoctorId === null ? null : Number(edit.assignedDoctorId),
      };
      await adminApi.updateUser(selected.id, payload);
      setEditOpen(false);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(u: AdminUser) {
    setErr(null);
    try {
      if (u.enabled) await adminApi.disableUser(u.id);
      else await adminApi.enableUser(u.id);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Update failed");
    }
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700}>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search, filter, enable/disable, and edit user profiles (Admin only).
      </Typography>

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search (username/email/name)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            size="small"
            sx={{ minWidth: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={role} onChange={(e) => setRole(String(e.target.value))}>
              <MenuItem value="">All</MenuItem>
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={enabled}
              onChange={(e) => setEnabled(String(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Enabled</MenuItem>
              <MenuItem value="false">Disabled</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={load} disabled={loading}>
            Apply
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Clinic</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {u.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.fullName || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>{u.email || "—"}</TableCell>
                  <TableCell>{roleChip(u.role)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.enabled ? "Enabled" : "Disabled"}
                      color={u.enabled ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>{u.clinicName || (u.clinicId ? `#${u.clinicId}` : "—")}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button size="small" variant="outlined" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color={u.enabled ? "warning" : "success"}
                        onClick={() => toggleEnabled(u)}
                      >
                        {u.enabled ? "Disable" : "Enable"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">
                      No users
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent>
          {selected && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              #{selected.id} — {selected.username}
            </Typography>
          )}
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Email"
              value={edit.email ?? ""}
              onChange={(e) => setEdit((s) => ({ ...s, email: e.target.value }))}
            />
            <TextField
              label="Phone"
              value={edit.phone ?? ""}
              onChange={(e) => setEdit((s) => ({ ...s, phone: e.target.value }))}
            />
            <TextField
              label="Full name"
              value={edit.fullName ?? ""}
              onChange={(e) => setEdit((s) => ({ ...s, fullName: e.target.value }))}
            />

            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={edit.role || "USER"}
                onChange={(e) => setEdit((s) => ({ ...s, role: String(e.target.value) }))}
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={String(edit.enabled ?? true)}
                onChange={(e) => setEdit((s) => ({ ...s, enabled: e.target.value === "true" }))}
              >
                <MenuItem value="true">Enabled</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Clinic ID (optional)"
              value={edit.clinicId ?? ""}
              onChange={(e) =>
                setEdit((s) => ({ ...s, clinicId: e.target.value === "" ? null : Number(e.target.value) }))
              }
            />

            <TextField
              label="Assigned doctor ID (optional)"
              value={edit.assignedDoctorId ?? ""}
              onChange={(e) =>
                setEdit((s) => ({
                  ...s,
                  assignedDoctorId: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              helperText="Must be a user with role DOCTOR"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEdit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
