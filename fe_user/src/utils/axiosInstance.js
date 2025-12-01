import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Tạo axios instance với base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function để lấy token từ localStorage hoặc sessionStorage
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Request interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios: Đã thêm token vào request:', config.url);
    } else {
      console.warn('Axios: Không có token trong storage cho request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi 401/403
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token hết hạn hoặc không hợp lệ
      // Xóa token và userInfo từ cả localStorage và sessionStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
      
      // Không tự động redirect - để component tự quyết định
      // Component sẽ xử lý redirect trong catch block
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

