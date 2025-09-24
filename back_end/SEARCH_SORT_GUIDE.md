# Hướng dẫn Search và Sort Tour

## 🔍 **Tìm kiếm Tour**

### **1. Tìm kiếm theo từ khóa chung (SearchKey)**
```http
GET /api/tour/SearchTours?searchKey=Hà Nội
```
- Tìm kiếm trong cả **tên tour** và **địa chỉ**
- Không phân biệt hoa thường

### **2. Tìm kiếm theo địa chỉ cụ thể**
```http
GET /api/tour/SearchTours?address=Hà Nội
```
- Tìm kiếm chính xác trong trường **địa chỉ**

### **3. Tìm kiếm theo giá**
```http
GET /api/tour/SearchTours?minPrice=1000000&maxPrice=3000000
```
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa

### **4. Tìm kiếm theo ngày**
```http
GET /api/tour/SearchTours?startDateFrom=2024-04-01&startDateTo=2024-04-30
```
- `startDateFrom`: Ngày bắt đầu từ
- `startDateTo`: Ngày bắt đầu đến
- `endDateFrom`: Ngày kết thúc từ
- `endDateTo`: Ngày kết thúc đến

### **5. Tìm kiếm kết hợp**
```http
GET /api/tour/SearchTours?searchKey=Hạ Long&minPrice=2000000&maxPrice=3000000&startDateFrom=2024-04-01
```

## 📊 **Sắp xếp Tour**

### **1. Sắp xếp theo đánh giá (Mặc định)**
```http
GET /api/tour/SearchTours?sortBy=rating&sortOrder=desc
```
- **Tour có đánh giá cao nhất** lên đầu
- **Tour chưa có đánh giá** sắp xếp theo thời gian tạo
- `sortOrder=desc`: Từ cao xuống thấp
- `sortOrder=asc`: Từ thấp lên cao

### **2. Sắp xếp theo tên**
```http
GET /api/tour/SearchTours?sortBy=name&sortOrder=asc
```

### **3. Sắp xếp theo giá**
```http
GET /api/tour/SearchTours?sortBy=price&sortOrder=asc
```

### **4. Sắp xếp theo ngày bắt đầu**
```http
GET /api/tour/SearchTours?sortBy=startdate&sortOrder=asc
```

### **5. Sắp xếp theo ngày kết thúc**
```http
GET /api/tour/SearchTours?sortBy=enddate&sortOrder=asc
```

### **6. Sắp xếp theo địa chỉ**
```http
GET /api/tour/SearchTours?sortBy=address&sortOrder=asc
```

## 📄 **Phân trang**

```http
GET /api/tour/SearchTours?page=1&pageSize=10
```
- `page`: Trang (bắt đầu từ 1)
- `pageSize`: Số lượng mỗi trang (mặc định: 10)

## 🎯 **Ví dụ thực tế**

### **Tìm tour Hà Nội có giá từ 1-3 triệu, sắp xếp theo đánh giá:**
```http
GET /api/tour/SearchTours?searchKey=Hà Nội&minPrice=1000000&maxPrice=3000000&sortBy=rating&sortOrder=desc&page=1&pageSize=5
```

### **Tìm tour miền Tây trong tháng 6, sắp xếp theo giá:**
```http
GET /api/tour/SearchTours?address=Miền Tây&startDateFrom=2024-06-01&startDateTo=2024-06-30&sortBy=price&sortOrder=asc
```

## 📋 **Response Format**

```json
{
  "tours": [
    {
      "id": 1,
      "name": "Tour Hà Nội - Hạ Long",
      "address": "Hà Nội, Việt Nam",
      "price": 2500000,
      "averageRating": 4.5,
      "totalReviews": 12,
      "startDate": "2024-04-01T00:00:00",
      "endDate": "2024-04-03T00:00:00",
      "capacity": 30,
      "availableSlots": 25,
      "status": "open",
      "hostName": "Nguyễn Văn A"
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

## ⭐ **Logic sắp xếp theo đánh giá:**

1. **Tour có đánh giá**: Sắp xếp theo điểm đánh giá trung bình (0-5 sao)
2. **Tour chưa có đánh giá**: Sắp xếp theo thời gian tạo (mới nhất lên đầu)
3. **Trong cùng nhóm**: Sắp xếp theo thời gian tạo

## 🚀 **Các endpoint khác cũng được sắp xếp theo đánh giá:**

- `GET /api/tour/TourList` - Tất cả tour
- `GET /api/tour/GetAvailableTours` - Tour có sẵn
- `GET /api/tour/GetToursByHost/{hostId}` - Tour theo host
