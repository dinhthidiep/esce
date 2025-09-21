# Hướng dẫn cài đặt Google OAuth

## Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API hoặc Google Identity API

## Bước 2: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Thêm **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://yourdomain.com` (nếu deploy)

## Bước 3: Cấu hình Environment Variables
Tạo file `.env` trong thư mục root với nội dung:
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Bước 4: Test Google Authentication
1. Chạy `npm start`
2. Thử đăng nhập/đăng ký bằng Google
3. Kiểm tra console để xem thông tin user

## Lưu ý:
- Client ID phải được cấu hình đúng
- Domain phải được thêm vào Authorized origins
- API phải được bật trong Google Cloud Console
