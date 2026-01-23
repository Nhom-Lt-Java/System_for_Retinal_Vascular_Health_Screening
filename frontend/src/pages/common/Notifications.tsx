import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markNotificationRead, type Notification } from "../../api/notificationsApi";

export default function NotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id as number | undefined;

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const load = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getNotifications(userId);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // refresh nhẹ mỗi 10s để demo realtime
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không thể đánh dấu đã đọc.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Thông báo
        </Typography>
        <Chip label={`${unreadCount} chưa đọc`} color={unreadCount ? "warning" : "default"} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {items.map((n) => {
              const time = n.createdAt ? new Date(n.createdAt).toLocaleString() : "";
              return (
                <ListItem key={n.id} divider sx={{ bgcolor: n.isRead ? "#fff" : "#f5fbff" }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={n.isRead ? 500 : 800}>{n.title}</Typography>
                        <Chip size="small" label={n.type || "SYSTEM"} />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{n.message}</Typography>
                        <Typography variant="caption" color="textSecondary">{time}</Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!n.isRead && (
                      <Button size="small" variant="outlined" onClick={() => onMarkRead(n.id)}>
                        Đã đọc
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
            {items.length === 0 && (
              <Box textAlign="center" py={6}>
                <Typography color="textSecondary">Chưa có thông báo.</Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Container>
  );
}
