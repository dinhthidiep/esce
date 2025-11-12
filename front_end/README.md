# Travel Login App - Ứng dụng đăng nhập du lịch

## Mô tả
Ứng dụng web du lịch với giao diện đăng nhập đẹp mắt được xây dựng bằng React. Giao diện được thiết kế hiện đại với hiệu ứng gradient, animation mượt mà và responsive hoàn toàn.

## Tính năng
- ✨ Giao diện đăng nhập hiện đại với hiệu ứng gradient
- 📱 Responsive design cho mọi thiết bị
- 🔐 Validation form đầy đủ
- 🎨 Animation và hiệu ứng mượt mà
- 🌐 Hỗ trợ đăng nhập qua Google và Facebook
- ⚡ Loading state và error handling
- 🎯 UX/UI được tối ưu cho trải nghiệm người dùng

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Chạy ứng dụng:**
   ```bash
   npm start
   ```

3. **Mở trình duyệt:**
   Truy cập [http://localhost:3000](http://localhost:3000)

### Build cho production
```bash
npm run build
```

## Cấu trúc project

```
src/
├── components/
│   ├── LoginForm.js          # Component form đăng nhập chính
│   └── LoginForm.css         # Styling cho form đăng nhập
├── App.js                    # Component App chính
├── App.css                   # Styling cho App
├── index.js                  # Entry point
└── index.css                 # Global styles
```

## Tính năng chi tiết

### Form đăng nhập
- Validation email và mật khẩu
- Hiệu ứng focus và hover
- Loading state khi đăng nhập
- Error handling và hiển thị lỗi

### Giao diện
- Background gradient động
- Card đăng nhập với glassmorphism effect
- Animation mượt mà
- Responsive hoàn toàn

### Tương lai
- Tích hợp API thực tế
- Dashboard sau đăng nhập
- Quản lý booking du lịch
- Tích hợp bản đồ

## Công nghệ sử dụng
- React 18
- React Router DOM
- CSS3 với Flexbox và Grid
- Font Google (Poppins)
- Axios (cho API calls)

## Liên hệ
Nếu có thắc mắc hoặc góp ý, vui lòng liên hệ qua email hoặc tạo issue trên repository.
