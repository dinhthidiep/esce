// API Configuration
// Backend chạy trên port 5002 (http) hoặc 7267 (https)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

export const API_ENDPOINTS = {
  SERVICE_COMBO: '/ServiceCombo',
  SERVICE: '/Service',
  BOOKING: '/Booking',
  PAYMENT: '/Payment',
  SERVICE_COMBO_DETAIL: '/ServiceComboDetail',
  USER: '/user',
  REVIEW: '/Review',
  COUPON: '/Coupon',
  NEWS: '/News',
  AUTH: '/Auth',
};

