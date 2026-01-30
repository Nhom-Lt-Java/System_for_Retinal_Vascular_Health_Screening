import axiosClient from "./axiosClient";

export type ChatMessage = {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt?: string; // Khớp với Backend
};

export async function getConversation(user1: number, user2: number) {
  // Fix đường dẫn: /chat/history thay vì /messages/history
  const res = await axiosClient.get(`/chat/history`, {
    params: { user1, user2 },
  });
  return res.data as ChatMessage[];
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  // Fix đường dẫn: /chat/send thay vì /messages/send
  const res = await axiosClient.post(`/chat/send`, {
    senderId,
    receiverId,
    content,
  });
  return res.data as ChatMessage;
}