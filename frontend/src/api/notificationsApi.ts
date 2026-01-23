import axiosClient from "./axiosClient";

export type Notification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export async function getNotifications(userId: number) {
  const res = await axiosClient.get(`/notifications/${userId}`);
  return res.data as Notification[];
}

export async function markNotificationRead(id: number) {
  const res = await axiosClient.put(`/notifications/${id}/read`);
  return res.data;
}
