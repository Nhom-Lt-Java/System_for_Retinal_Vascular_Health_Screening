import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getConversation, sendMessage, type ChatMessage } from "../../api/chatApi";

function fmtTime(ts?: string) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatPage() {
  const { otherId } = useParams();
  const otherUserId = Number(otherId);
  const { user } = useAuth();
  const myId = user?.id as number | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => {
    if (!otherUserId) return "Chat";
    return `Chat với User #${otherUserId}`;
  }, [otherUserId]);

  const load = async () => {
    if (!myId || !otherUserId) return;
    try {
      setError("");
      setLoading(true);
      const data = await getConversation(myId, otherUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được hội thoại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 2000); // poll nhẹ để demo realtime
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, otherUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const onSend = async () => {
    if (!input.trim()) return;
    if (!myId || !otherUserId) return;
    const content = input.trim();
    setInput("");
    try {
      setError("");
      const msg = await sendMessage(myId, otherUserId, content);
      setMessages((prev) => [...prev, msg]);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không gửi được tin nhắn.");
      // rollback input
      setInput(content);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Paper elevation={4} sx={{ height: "82vh", display: "flex", flexDirection: "column", borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ p: 2, bgcolor: "primary.main", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "white", color: "primary.main", fontWeight: "bold" }}>
              {otherUserId ? String(otherUserId).slice(-2) : "?"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
              <Typography variant="caption">Poll mỗi 2s (demo)</Typography>
            </Box>
          </Box>
          <Chip label={`Bạn: #${myId || "?"}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: 0 }}>{error}</Alert>}

        <Box
          ref={scrollRef}
          sx={{ flexGrow: 1, p: 2.5, overflowY: "auto", bgcolor: "#f0f2f5", display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          {loading && messages.length === 0 ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            messages.map((m) => {
              const mine = myId && m.senderId === myId;
              return (
                <Box key={m.id || `${m.senderId}-${m.timestamp}`} sx={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  <Box sx={{ display: "flex", flexDirection: mine ? "row-reverse" : "row", gap: 1 }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem" }}>{mine ? "Me" : "U"}</Avatar>
                    <Box>
                      <Paper
                        sx={{
                          p: 1.25,
                          borderRadius: 3,
                          bgcolor: mine ? "primary.main" : "white",
                          color: mine ? "white" : "black",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Typography variant="body2">{m.content}</Typography>
                      </Paper>
                      <Typography variant="caption" sx={{ color: "gray", mt: 0.5, display: "block", textAlign: mine ? "right" : "left" }}>
                        {fmtTime(m.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
          {messages.length === 0 && !loading && (
            <Box textAlign="center" py={6}>
              <Typography color="textSecondary">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</Typography>
            </Box>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 2, bgcolor: "white", display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder="Viết tin nhắn..."
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 5, bgcolor: "#f0f2f5" } }}
          />
          <IconButton
            color="primary"
            onClick={onSend}
            disabled={!input.trim()}
            sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
}
