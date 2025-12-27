import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Paper, Box, TextField, IconButton, Typography, 
  Avatar, Divider, InputAdornment, Tooltip, Chip 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from '../../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Giả lập danh sách tin nhắn
  const [messages, setMessages] = useState([
    { 
      text: "Chào bạn, tôi đã xem qua kết quả phân tích ảnh võng mạc của bạn. Bạn có thắc mắc gì về giai đoạn Mild DR này không?", 
      isDoc: true, 
      time: "10:00",
      sender: "Bác sĩ chuyên khoa"
    }
  ]);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { 
      text: input, 
      isDoc: user?.role === 'doctor', // Xác định tin nhắn từ phía nào dựa trên role
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: user?.name || "Người dùng"
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Giả lập phản hồi tự động nếu là bệnh nhân nhắn
    if (user?.role !== 'doctor') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          text: "Bác sĩ đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.",
          isDoc: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: "Hệ thống"
        }]);
      }, 2000);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
      <Paper elevation={4} sx={{ height: '85vh', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
        
        {/* Header: Hiển thị đối tượng đang chat cùng */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}>
              {user?.role === 'doctor' ? 'BN' : 'BS'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.role === 'doctor' ? 'Bệnh nhân: Nguyễn Văn A' : 'Bác sĩ: Trần Thị Hùng'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircleIcon sx={{ fontSize: 10, color: '#4caf50' }} />
                <Typography variant="caption">Đang trực tuyến</Typography>
              </Box>
            </Box>
          </Box>
          <Chip label="Ca bệnh: #12345" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>

        {/* Thân Chat */}
        <Box 
          ref={scrollRef} 
          sx={{ 
            flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#f0f2f5', 
            display: 'flex', flexDirection: 'column', gap: 2 
          }}
        >
          {messages.map((m, i) => {
            const isMyMessage = (user?.role === 'doctor' && m.isDoc) || (user?.role !== 'doctor' && !m.isDoc);
            
            return (
              <Box key={i} sx={{ alignSelf: isMyMessage ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <Box sx={{ display: 'flex', flexDirection: isMyMessage ? 'row-reverse' : 'row', gap: 1 }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.8rem' }}>{m.sender[0]}</Avatar>
                  <Box>
                    <Paper sx={{ 
                      p: 1.5, 
                      borderRadius: 3, 
                      bgcolor: isMyMessage ? 'primary.main' : 'white', 
                      color: isMyMessage ? 'white' : 'black',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="body2">{m.text}</Typography>
                    </Paper>
                    <Typography variant="caption" sx={{ color: 'gray', mt: 0.5, display: 'block', textAlign: isMyMessage ? 'right' : 'left' }}>
                      {m.time}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {isTyping && (
            <Typography variant="caption" sx={{ color: 'gray', fontStyle: 'italic' }}>
              Bác sĩ đang nhập tin nhắn...
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Input: Thêm nút đính kèm ảnh võng mạc */}
        <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Gửi ảnh võng mạc">
            <IconButton color="primary">
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          
          <TextField 
            fullWidth 
            placeholder="Viết tin nhắn tư vấn..." 
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5, bgcolor: '#f0f2f5' } }}
          />

          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
}