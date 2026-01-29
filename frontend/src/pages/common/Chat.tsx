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
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
  Chip, // <-- ĐÃ THÊM IMPORT NÀY
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getConversation, sendMessage, type ChatMessage } from "../../api/chatApi";
import axiosClient from "../../api/axiosClient";

// Định nghĩa kiểu dữ liệu cho Contact (Người trong danh sách chat)
interface Contact {
  id: number;
  username: string;
  fullName: string;
  role: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
}

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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Check màn hình nhỏ

  // Parse ID an toàn (tránh NaN)
  const otherUserId = useMemo(() => (otherId ? Number(otherId) : null), [otherId]);
  
  const { user } = useAuth();
  const myId = user?.id as number | undefined;

  // States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load danh sách liên hệ (Conversations)
  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      // Gọi API lấy danh sách người đã chat
      const res = await axiosClient.get("/chat/conversations");
      if (Array.isArray(res.data)) {
        setContacts(res.data);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách chat:", e);
    } finally {
      setLoadingContacts(false);
    }
  };

  // 2. Load nội dung chat với 1 người cụ thể
  const loadMessages = async () => {
    if (!myId || !otherUserId) {
        setMessages([]); // Clear messages nếu không chọn ai
        return;
    }
    try {
      setError("");
      // Chỉ hiện loading lần đầu, polling sẽ chạy ngầm
      if (messages.length === 0) setLoadingMsg(true); 
      
      const data = await getConversation(myId, otherUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được hội thoại.");
    } finally {
      setLoadingMsg(false);
    }
  };

  // Effect: Load contacts lần đầu
  useEffect(() => {
    loadContacts();
  }, []);

  // Effect: Load messages & Polling
  useEffect(() => {
    loadMessages();
    const t = setInterval(loadMessages, 3000); // Poll mỗi 3s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, otherUserId]);

  // Effect: Auto scroll xuống cuối
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, otherUserId]);

  // Gửi tin nhắn
  const onSend = async () => {
    if (!input.trim() || !myId || !otherUserId) return;
    const content = input.trim();
    setInput("");
    try {
      setError("");
      const msg = await sendMessage(myId, otherUserId, content);
      setMessages((prev) => [...prev, msg]);
      // Reload contact list để update "lastMessage" nếu cần
      loadContacts(); 
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không gửi được tin nhắn.");
      setInput(content); // Rollback nếu lỗi
    }
  };

  // Tìm thông tin người đang chat để hiển thị trên Header
  const activeContact = contacts.find(c => c.id === otherUserId);
  const activeName = activeContact?.fullName || activeContact?.username || (otherUserId ? `User #${otherUserId}` : "");

  // Logic hiển thị trên Mobile (ẩn danh sách khi đang chat)
  const showList = !isMobile || !otherUserId;
  const showChat = !isMobile || !!otherUserId;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2, height: "85vh", p: { xs: 1, md: 2 } }}>
      <Paper elevation={3} sx={{ height: "100%", display: "flex", borderRadius: 3, overflow: "hidden" }}>
        
        {/* === CỘT TRÁI: DANH SÁCH LIÊN HỆ === */}
        <Box 
            sx={{ 
                width: { xs: "100%", md: 320 }, 
                borderRight: "1px solid #e0e0e0", 
                display: showList ? "flex" : "none", 
                flexDirection: "column",
                bgcolor: "#fff"
            }}
        >
            <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0", bgcolor: "#f8f9fa" }}>
                <Typography variant="h6" fontWeight="bold" color="primary">Tin nhắn</Typography>
            </Box>
            
            <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
                {loadingContacts && contacts.length === 0 && (
                    <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24}/></Box>
                )}
                {contacts.length === 0 && !loadingContacts && (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 3 }}>
                        Chưa có liên hệ nào.
                    </Typography>
                )}
                {contacts.map((c) => (
                    <ListItemButton 
                        key={c.id} 
                        selected={c.id === otherUserId}
                        onClick={() => navigate(`/chat/${c.id}`)}
                        sx={{ 
                            borderBottom: "1px solid #f5f5f5",
                            bgcolor: c.id === otherUserId ? "#e3f2fd !important" : "transparent"
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "primary.light" }}>{c.fullName?.charAt(0) || "U"}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {c.fullName || c.username}
                                </Typography>
                            }
                            secondary={c.role ? <Chip label={c.role} size="small" sx={{ height: 20, fontSize: "0.65rem" }} /> : null}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>

        {/* === CỘT PHẢI: KHUNG CHAT === */}
        <Box 
            sx={{ 
                flexGrow: 1, 
                display: showChat ? "flex" : "none", 
                flexDirection: "column",
                bgcolor: "#fff"
            }}
        >
            {/* Header Chat */}
            {otherUserId ? (
                <Box sx={{ 
                    p: 2, 
                    bgcolor: "primary.main", 
                    color: "white", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2,
                    boxShadow: 1
                }}>
                    {isMobile && (
                        <IconButton onClick={() => navigate("/chat")} sx={{ color: "white", p: 0.5 }}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Avatar sx={{ bgcolor: "white", color: "primary.main", fontWeight: "bold" }}>
                        {activeName.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{activeName}</Typography>
                        {activeContact?.role && <Typography variant="caption" sx={{ opacity: 0.8 }}>{activeContact.role}</Typography>}
                    </Box>
                </Box>
            ) : (
                <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", height: 64 }} />
            )}

            {/* Error Banner */}
            {error && <Alert severity="error" sx={{ borderRadius: 0 }}>{error}</Alert>}

            {/* Nội dung tin nhắn */}
            <Box
                ref={scrollRef}
                sx={{ 
                    flexGrow: 1, 
                    p: 2.5, 
                    overflowY: "auto", 
                    bgcolor: "#f5f7fb", // Màu nền nhẹ cho khung chat
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 1.5 
                }}
            >
                {!otherUserId ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                        <SendIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
                        <Typography>Chọn một người để bắt đầu trò chuyện</Typography>
                    </Box>
                ) : (
                    <>
                        {loadingMsg && messages.length === 0 ? (
                            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                        ) : (
                            messages.map((m, index) => {
                                const mine = myId && m.senderId === myId;
                                return (
                                    <Box 
                                        key={m.id || index} 
                                        sx={{ 
                                            alignSelf: mine ? "flex-end" : "flex-start", 
                                            maxWidth: "75%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: mine ? "flex-end" : "flex-start"
                                        }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                px: 2,
                                                borderRadius: 3,
                                                borderTopRightRadius: mine ? 0 : 3,
                                                borderTopLeftRadius: mine ? 3 : 0,
                                                bgcolor: mine ? "primary.main" : "white",
                                                color: mine ? "white" : "text.primary",
                                                border: mine ? "none" : "1px solid #e0e0e0",
                                                boxShadow: mine ? 2 : 0,
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ wordBreak: "break-word" }}>{m.content}</Typography>
                                        </Paper>
                                        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, px: 0.5, fontSize: "0.7rem" }}>
                                            {fmtTime(m.timestamp)}
                                        </Typography>
                                    </Box>
                                );
                            })
                        )}
                        {messages.length === 0 && !loadingMsg && (
                            <Box textAlign="center" py={4}>
                                <Typography variant="caption" color="textSecondary">Chưa có tin nhắn nào. Hãy nói "Xin chào"!</Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* Input Area */}
            {otherUserId && (
                <Box sx={{ p: 2, bgcolor: "white", borderTop: "1px solid #e0e0e0", display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="Nhập tin nhắn..."
                        variant="outlined"
                        size="small"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSend()}
                        sx={{ 
                            "& .MuiOutlinedInput-root": { 
                                borderRadius: 4, 
                                bgcolor: "#f8f9fa",
                                "& fieldset": { borderColor: "#e0e0e0" }
                            } 
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={onSend}
                        disabled={!input.trim()}
                        sx={{ 
                            bgcolor: input.trim() ? "primary.main" : "#e0e0e0", 
                            color: "white", 
                            "&:hover": { bgcolor: "primary.dark" },
                            width: 40, height: 40
                        }}
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </Box>
      </Paper>
    </Container>
  );
}