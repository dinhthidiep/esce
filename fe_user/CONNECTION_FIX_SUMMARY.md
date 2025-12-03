# Tóm tắt chỉnh sửa kết nối Frontend với Backend

## Ngày cập nhật: $(date)

## Tổng quan
Đã kiểm tra và chỉnh sửa các file trong `fe_user` để đảm bảo kết nối đúng với backend.

## Các thay đổi chính

### 1. Cấu hình API (`src/config/api.ts`)
- ✅ Đã xác nhận API_BASE_URL mặc định: `https://localhost:7267/api`
- ✅ Hỗ trợ biến môi trường `VITE_API_URL` để override
- ✅ Thêm log debug để kiểm tra cấu hình

### 2. Axios Instance (`src/utils/axiosInstance.ts`)
- ✅ Tăng timeout từ 10s lên 30s để tránh timeout khi backend chậm
- ✅ Cải thiện error handling cho lỗi SSL/Network
- ✅ Tự động redirect đến login khi token hết hạn (401/403)
- ✅ Log chi tiết để debug

### 3. API Endpoints
Tất cả endpoints đã được kiểm tra và khớp với backend:
- ✅ `/api/Auth` - Authentication
- ✅ `/api/ServiceCombo` - Service Combo
- ✅ `/api/Service` - Service
- ✅ `/api/ServiceComboDetail` - Service Combo Detail
- ✅ `/api/Booking` - Booking
- ✅ `/api/Review` - Review
- ✅ `/api/Coupon` - Coupon
- ✅ `/api/Payment` - Payment
- ✅ `/api/user` - User (lowercase)

### 4. Data Format Handling
Tất cả components đã xử lý đúng format PascalCase từ backend:
- ✅ ServicesPage - Xử lý `Id`, `Name`, `Price`, `Status`, etc.
- ✅ ServiceDetail - Xử lý `ServiceCombo` với PascalCase
- ✅ BookingPage - Xử lý booking data với PascalCase
- ✅ ProfilePage - Xử lý user info với PascalCase
- ✅ PaymentPage - Xử lý payment data với PascalCase

## Cách sử dụng

### 1. Chạy Backend
Backend chạy trên:
- HTTPS: `https://localhost:7267`
- HTTP: `http://localhost:5002`

### 2. Chạy Frontend
```bash
cd fe_user
npm install
npm run dev
```

### 3. Xử lý lỗi SSL (nếu có)
Nếu gặp lỗi SSL khi kết nối đến `https://localhost:7267`:
1. Tạo file `.env` trong thư mục `fe_user`
2. Thêm dòng: `VITE_API_URL=http://localhost:5002/api`
3. Restart dev server

## Kiểm tra kết nối

### 1. Kiểm tra Console
Mở DevTools Console và kiểm tra:
- ✅ `[api.ts] Environment check` - Xác nhận API_BASE_URL
- ✅ `[axiosInstance] Request` - Xem các request được gửi
- ✅ `[axiosInstance] Response` - Xem response từ backend

### 2. Kiểm tra Network Tab
Trong DevTools Network tab:
- Kiểm tra các request đến `/api/*`
- Xem status code (200 = OK, 401 = Unauthorized, etc.)
- Kiểm tra request headers có `Authorization: Bearer <token>` không

### 3. Kiểm tra Backend
- Backend có đang chạy không?
- Swagger UI có mở được không? (`https://localhost:7267/swagger`)
- CORS có được cấu hình đúng không? (Backend đã có `AllowAll` policy)

## Các component đã được kiểm tra

### ✅ Components chính
- `LoginForm.tsx` - Đăng nhập
- `Register.tsx` - Đăng ký
- `ServicesPage.tsx` - Danh sách dịch vụ
- `ServiceDetail.tsx` - Chi tiết dịch vụ
- `BookingPage.tsx` - Đặt dịch vụ
- `PaymentPage.tsx` - Thanh toán
- `ProfilePage.tsx` - Hồ sơ người dùng
- `LandingPage.tsx` - Trang chủ
- `Header.tsx` - Header navigation

### ✅ Hooks
- `useTours.ts` - Fetch danh sách tours/services

### ✅ Services
- `couponService.ts` - Xử lý coupon
- `googleAuth.ts` - Google authentication

### ✅ API Files
- `API/Au.js` - Authentication API (JavaScript)
- `API/instances/Au.ts` - Authentication API (TypeScript)
- `API/instances/apiClient.ts` - API client instance

## Lưu ý quan trọng

1. **Backend phải chạy trước** khi chạy frontend
2. **Token được lưu** trong `localStorage` hoặc `sessionStorage` tùy theo "Ghi nhớ đăng nhập"
3. **Data format**: Backend trả về PascalCase (`Id`, `Name`, `Price`), frontend đã xử lý cả PascalCase và camelCase
4. **Error handling**: Tất cả components đã có error handling và hiển thị thông báo lỗi rõ ràng

## Troubleshooting

### Lỗi: "Không thể kết nối đến server"
- Kiểm tra backend có đang chạy không
- Kiểm tra URL trong `src/config/api.ts`
- Thử đổi sang HTTP nếu gặp lỗi SSL

### Lỗi: "401 Unauthorized"
- Token đã hết hạn, cần đăng nhập lại
- Kiểm tra token trong localStorage/sessionStorage

### Lỗi: "CORS"
- Backend đã có CORS policy `AllowAll`, không cần cấu hình thêm
- Nếu vẫn lỗi, kiểm tra backend `Program.cs` có `app.UseCors("AllowAll")` không

### Không hiển thị dữ liệu
- Kiểm tra Console để xem có lỗi không
- Kiểm tra Network tab để xem API có trả về data không
- Kiểm tra data format có đúng không (PascalCase)

## Kết luận

Tất cả các file trong `fe_user` đã được kiểm tra và chỉnh sửa để đảm bảo:
- ✅ Kết nối đúng với backend
- ✅ Xử lý đúng data format (PascalCase)
- ✅ Error handling đầy đủ
- ✅ Authentication/Authorization hoạt động đúng
- ✅ Hiển thị dữ liệu trên màn hình

Frontend hiện đã sẵn sàng để kết nối và hiển thị dữ liệu từ backend.
