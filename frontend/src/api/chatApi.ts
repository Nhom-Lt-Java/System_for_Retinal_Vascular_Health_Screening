import axiosClient from "./axiosClient";

export type ChatMessage = {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
};

export async function getConversation(user1: number, user2: number) {
  const res = await axiosClient.get(`/messages/history`, {
    params: { user1, user2 },
  });
  return res.data as ChatMessage[];
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  const res = await axiosClient.post(`/messages/send`, {
    senderId,
    receiverId,
    content,
  });
  return res.data as ChatMessage;
}