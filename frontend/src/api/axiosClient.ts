import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("aura_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trả luôn data để FE dùng gọn
axiosClient.interceptors.response.use(
  (r) => r.data,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
