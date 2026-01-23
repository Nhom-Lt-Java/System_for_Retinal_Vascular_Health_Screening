import axiosClient from "./axiosClient";

export async function listPatients(params?: { q?: string; risk?: string }) {
  const res = await axiosClient.get("/doctor/patients", { params });
  return res.data;
}

export async function getTrends(days = 30) {
  const res = await axiosClient.get("/doctor/trends", { params: { days } });
  return res.data;
}

export async function reviewAnalysis(id: string, payload: { conclusion: string; note: string }) {
  const res = await axiosClient.post(`/doctor/analyses/${id}/review`, payload);
  return res.data;
}

export async function getDoctorDashboard() {
  const res = await axiosClient.get(`/doctor/dashboard`);
  return res.data;
}
