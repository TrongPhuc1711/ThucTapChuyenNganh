import axios from "axios";

// Ưu tiên sử dụng biến môi trường VITE_API_URL trong .env, nếu không có mới fallback localhost:4000
const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const baseURL = rawBaseURL.endsWith("/api") ? rawBaseURL : `${rawBaseURL}/api`;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
      // 1. Lấy token từ localStorage
      const token = localStorage.getItem('token');
      // 2. Nếu có token, tự động đính vào Header
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
  },
  (error) => {
      return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
      return response;
  },
  (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('token');
          // Không tự động redirect nếu đang ở trang chủ public
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
      }
      return Promise.reject(error);
  }
);

export default api;