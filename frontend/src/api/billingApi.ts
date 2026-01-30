import axiosClient from "./axiosClient";

export type ServicePackage = {
  id: number;
  name: string;
  description?: string;
  price: number;
  credits: number;
  durationDays?: number | null;
  active: boolean; 
};

export type UserCredit = {
  id?: number;
  remainingCredits: number;
  totalUsed?: number;
};

export type OrderSummary = {
  id: number;
  packageId?: number | null;
  packageName?: string | null;
  amount: number | string;
  status?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | null;
};

export async function listPackages() {
  const res = await axiosClient.get(`/billing/packages`);
  return res.data as ServicePackage[];
}

export async function purchasePackage(userId: number, packageId: number) {
  // Gửi params khớp với @RequestParam bên Controller
  const res = await axiosClient.post(`/billing/purchase`, null, { 
    params: { userId, packageId } 
  });
  return res.data;
}

export async function getBalance(userId: number) {
  const res = await axiosClient.get(`/billing/balance/${userId}`);
  return res.data as UserCredit;
}

export async function listMyOrders() {
  const res = await axiosClient.get(`/billing/orders/my`);
  return res.data as OrderSummary[];
}