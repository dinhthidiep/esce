# Hướng dẫn tích hợp PayOS API

## Tổng quan
Dự án đã được tích hợp PayOS API để xử lý thanh toán. PayOS là một giải pháp thanh toán phổ biến tại Việt Nam.

## Cấu hình

### 1. Cài đặt Package
Package `Net.payOS` đã được thêm vào dự án trong file `ESCESYSTEM.csproj`.

### 2. Cấu hình Keys
Cập nhật các key PayOS trong file `appsettings.json` và `appsettings.Development.json`:

```json
{
  "PayOS": {
    "ClientId": "YOUR_CLIENT_ID",
    "ApiKey": "YOUR_API_KEY", 
    "ChecksumKey": "YOUR_CHECKSUM_KEY"
  }
}
```

**Lưu ý:** Thay thế các giá trị `YOUR_CLIENT_ID`, `YOUR_API_KEY`, `YOUR_CHECKSUM_KEY` bằng thông tin thực từ tài khoản PayOS của bạn.

## API Endpoints

### 1. Tạo Payment Link
**POST** `/api/payment/create-payment-link`

**Request Body:**
```json
{
  "amount": 2000000,
  "description": "Thanh toán tour du lịch sinh thái",
  "items": [
    {
      "name": "Tour du lịch sinh thái",
      "quantity": 1,
      "price": 2000000
    }
  ],
  "returnUrl": "http://localhost:5000/success.html",
  "cancelUrl": "http://localhost:5000/cancel.html"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://pay.payOS.vn/web/...",
  "orderCode": 123456
}
```

### 2. Xác nhận Payment
**POST** `/api/payment/confirm-payment`

**Request Body:**
```json
{
  "code": 123456,
  "amount": 2000000,
  "description": "Thanh toán tour du lịch sinh thái"
}
```

### 3. Kiểm tra trạng thái Payment
**GET** `/api/payment/payment-status/{orderCode}`

**Response:**
```json
{
  "orderCode": 123456,
  "status": "COMPLETED",
  "amount": 2000000,
  "createdAt": "2024-01-01T10:00:00",
  "completedAt": "2024-01-01T10:05:00"
}
```

## Cách sử dụng

### 1. Chạy ứng dụng
```bash
cd back_end
dotnet run
```

### 2. Truy cập trang thanh toán
Mở trình duyệt và truy cập: `http://localhost:5000`

### 3. Tạo payment link
- Điền thông tin sản phẩm
- Nhấn "Tạo Link thanh toán"
- Hệ thống sẽ chuyển hướng đến trang thanh toán PayOS

### 4. Xử lý kết quả
- **Thành công:** Chuyển về `/success.html`
- **Thất bại:** Chuyển về `/cancel.html`

## Database

PaymentController sẽ tự động lưu thông tin payment vào database thông qua model `Payment`. Đảm bảo rằng:

1. Model `Payment` đã được định nghĩa trong `ESCEContext`
2. Database đã được migrate để tạo bảng `Payments`

## Bảo mật

1. **Không commit keys:** Đảm bảo không commit các key PayOS vào git
2. **Sử dụng Environment Variables:** Trong production, sử dụng environment variables thay vì hardcode keys
3. **HTTPS:** Luôn sử dụng HTTPS trong production

## Troubleshooting

### Lỗi thường gặp:

1. **"PayOS configuration is missing"**
   - Kiểm tra lại cấu hình trong `appsettings.json`

2. **"Payment not found"**
   - Kiểm tra `orderCode` có tồn tại trong database không

3. **Network errors**
   - Kiểm tra kết nối internet
   - Kiểm tra URL PayOS có đúng không

## Liên hệ hỗ trợ

Nếu có vấn đề với PayOS, liên hệ:
- Email: support@payos.vn
- Documentation: https://payos.vn/docs


