// API Configuration
// Backend chạy trên port 7267 (https) hoặc 5002 (http)
const envApiUrl = import.meta.env.VITE_API_URL
// Default: dùng HTTPS port 7267 (backend đang chạy ở đây)
// Nếu có lỗi SSL, có thể dùng http://localhost:5002/api
export const API_BASE_URL = envApiUrl || 'https://localhost:7267/api'

// Log để debug (chỉ log một lần khi khởi động)
if (import.meta.env.DEV) {
  // Chỉ log một lần để tránh spam
  if (!(window as any).__API_CONFIG_LOGGED) {
    console.log('🔧 [api.ts] Environment check:')
    console.log('  - VITE_API_URL:', envApiUrl || '(not set)')
    console.log('  - API_BASE_URL:', API_BASE_URL)
    console.log('  - Backend URL:', API_BASE_URL.replace('/api', ''))
    console.log('  - Nếu gặp lỗi SSL, thử đặt VITE_API_URL=http://localhost:5002/api')
    ;(window as any).__API_CONFIG_LOGGED = true
  }
}

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
  POST: '/Post',
  POST_REACTION: '/PostReaction',
  POST_SAVE: '/PostSave',
  COMMENT: '/Comment',
} as const


