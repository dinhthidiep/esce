import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export const useTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API_BASE_URL}${API_ENDPOINTS.SERVICE_COMBO}`;
      console.log('Đang gọi API:', url);
      
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          console.log(`Tìm thấy ${response.data.length} tour`);
          setTours(response.data);
        } else {
          console.warn('API trả về mảng rỗng');
          setTours([]);
        }
      } else {
        console.warn('API response không phải là mảng:', response.data);
        setTours([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách tour:', err);
      if (err.response) {
        // Server trả về response với status code lỗi
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        setError(`Lỗi ${err.response.status}: ${err.response.data?.message || err.message}`);
      } else if (err.request) {
        // Request đã được gửi nhưng không nhận được response
        console.error('Không nhận được response từ server');
        setError('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      } else {
        // Lỗi khi setup request
        console.error('Lỗi setup request:', err.message);
        setError(err.message);
      }
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  return { tours, loading, error, refetch: fetchTours };
};

