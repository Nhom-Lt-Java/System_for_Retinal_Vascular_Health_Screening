import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://your-api-url.com/api', // Thay bằng URL thật của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào Header nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi tập trung (Ví dụ: Token hết hạn thì logout)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aura_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;