import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: `${base}/api`,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
