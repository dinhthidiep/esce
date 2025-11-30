# Scripts để tạo đơn nâng cấp vai trò test

## Mô tả
Các script này sẽ tạo 3 đơn nâng cấp vai trò ảo để test:
- 2 đơn nâng cấp lên **Travel Agency** (Agency Certificate)
- 1 đơn nâng cấp lên **Host** (Host Certificate)

Tất cả các đơn sẽ có status = **'Pending'** để Admin có thể phê duyệt/từ chối.

## Yêu cầu
- Database phải có ít nhất **3 Customer accounts** (RoleId = 4)
- Nếu chưa có đủ Customer accounts, bạn cần tạo trước

## Cách sử dụng

### Option 1: Script đơn giản (Khuyến nghị)
Chạy file `CreateTestUpgradeRequestsSimple.sql`:
- Script này sẽ tự động kiểm tra và tạo đơn cho 3 Customer accounts đầu tiên
- Có kiểm tra để tránh tạo trùng đơn
- Có thông báo kết quả

### Option 2: Script chi tiết
Chạy file `CreateTestUpgradeRequests.sql`:
- Script này có logic phức tạp hơn để chọn Customer accounts
- Có phần verify để xem kết quả

## Cách chạy script

### Trong SQL Server Management Studio (SSMS):
1. Mở SSMS và kết nối đến database
2. Mở file `.sql` 
3. Chọn database đúng
4. Nhấn F5 hoặc Execute để chạy

### Trong Visual Studio:
1. Mở Server Explorer
2. Kết nối đến database
3. Right-click vào database → New Query
4. Copy nội dung script vào và Execute

### Hoặc dùng command line:
```bash
sqlcmd -S <server_name> -d <database_name> -i CreateTestUpgradeRequestsSimple.sql
```

## Kiểm tra kết quả

Sau khi chạy script, bạn có thể:
1. Vào Admin Panel → Nâng cấp vai trò
2. Sẽ thấy 3 đơn với status "Pending"
3. Có thể test các chức năng:
   - Phê duyệt đơn
   - Từ chối đơn
   - Xem chi tiết đơn

## Dữ liệu test được tạo

### Agency Certificate #1:
- Company Name: "Công ty Du lịch ABC"
- Phone: "0901234567"
- Email: "agency1@test.com"
- Website: "https://agency1-test.com"

### Agency Certificate #2:
- Company Name: "Công ty Lữ hành XYZ"
- Phone: "0912345678"
- Email: "agency2@test.com"
- Website: "https://agency2-test.com"

### Host Certificate #1:
- Business Name: "Khách sạn Resort Paradise"
- Phone: "0923456789"
- Email: "host1@test.com"

## Lưu ý
- Script sẽ không tạo trùng đơn nếu đã có đơn Pending cho Customer account đó
- Nếu không đủ 3 Customer accounts, script sẽ báo lỗi
- Tất cả đơn sẽ có License File là một base64 image nhỏ (1x1 pixel) để test

