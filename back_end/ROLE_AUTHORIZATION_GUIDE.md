# Hướng dẫn thêm phân quyền cho Tour Controller

## 🎯 **Mục tiêu:**
- Chỉ cho phép role 1 (Admin) và role 3 (Host) thực hiện CRUD operations
- Role 4 (Customer) chỉ có thể xem tour

## 📋 **Các bước thực hiện:**

### **Bước 1: Thêm using statement**
```csharp
using ESCE_SYSTEM.Attributes;
```

### **Bước 2: Thêm attribute cho các endpoint cần phân quyền**

#### **Tạo tour (chỉ Admin và Host):**
```csharp
[HttpPost("CreateTour")]
[AuthorizeByRole(1, 3)] // Role 1 (Admin) và Role 3 (Host)
public async Task<ActionResult<TourResponseDto>> CreateTour([FromBody] CreateTourDto createTourDto)
```

#### **Cập nhật tour (chỉ Admin và Host):**
```csharp
[HttpPut("UpdateTour/{id}")]
[AuthorizeByRole(1, 3)] // Role 1 (Admin) và Role 3 (Host)
public async Task<ActionResult<TourResponseDto>> UpdateTour(int id, [FromBody] UpdateTourDto updateTourDto)
```

#### **Xóa tour (chỉ Admin):**
```csharp
[HttpDelete("DeleteTour/{id}")]
[AuthorizeByRole(1)] // Chỉ Role 1 (Admin)
public async Task<ActionResult> DeleteTour(int id)
```

#### **Xem tour (tất cả role):**
```csharp
[HttpGet("TourList")]
// Không cần attribute - tất cả role đều xem được
public async Task<ActionResult<IEnumerable<TourResponseDto>>> GetAllTours()
```

## 🔐 **Cách hoạt động:**

1. **JWT Token** chứa thông tin role của user
2. **AuthorizeByRoleAttribute** kiểm tra role từ token
3. **Nếu role không hợp lệ** → trả về 403 Forbidden
4. **Nếu chưa đăng nhập** → trả về 401 Unauthorized

## 🧪 **Test phân quyền:**

### **Test với Admin (Role 1):**
```http
POST /api/tour/CreateTour
Authorization: Bearer ADMIN_JWT_TOKEN
```

### **Test với Host (Role 3):**
```http
POST /api/tour/CreateTour
Authorization: Bearer HOST_JWT_TOKEN
```

### **Test với Customer (Role 4):**
```http
POST /api/tour/CreateTour
Authorization: Bearer CUSTOMER_JWT_TOKEN
```
→ Sẽ trả về 403 Forbidden

## 📝 **Lưu ý:**

- **Role 1**: Admin - có thể làm mọi thứ
- **Role 3**: Host - có thể tạo, cập nhật tour của mình
- **Role 4**: Customer - chỉ có thể xem tour
- **Chưa đăng nhập**: chỉ có thể xem tour

## 🚀 **Khi nào thêm phân quyền:**

Sau khi test CRUD hoạt động tốt, thêm các attribute trên vào TourController.cs
