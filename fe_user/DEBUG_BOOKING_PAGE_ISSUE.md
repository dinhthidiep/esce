# Debug: Không thể chuyển đến BookingPage

## Các nguyên nhân có thể

### 1. Button "Đặt dịch vụ ngay" bị disabled

**Kiểm tra:**
- Service có `Status = 'open'` không?
- Service có `AvailableSlots > 0` không?

**Code trong ServiceDetail.tsx:**
```tsx
disabled={status.toLowerCase() !== 'open' || availableSlots === 0}
```

**Giải pháp:**
- Kiểm tra service data trong console
- Đảm bảo service có status = 'open' và availableSlots > 0

---

### 2. Chưa đăng nhập → Redirect đến Login

**Kiểm tra:**
- Có token trong localStorage/sessionStorage không?
- Có userInfo trong localStorage/sessionStorage không?

**Code trong ServiceDetail.tsx:**
```tsx
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');

if (!token || !userInfoStr) {
  navigate('/login', { state: { returnUrl: `/booking/${id}` } });
  return;
}
```

**Giải pháp:**
- Đăng nhập trước
- Hoặc kiểm tra token có hợp lệ không

---

### 3. BookingPage load nhưng hiển thị error

**Nguyên nhân có thể:**
- Service không tồn tại (404)
- Service status không phải 'open'
- Lỗi khi fetch service từ API

**Code trong BookingPage.tsx:**
```tsx
if (status.toLowerCase() !== 'open') {
  setError('Dịch vụ này hiện không khả dụng để đặt');
  return;
}
```

**Giải pháp:**
- Kiểm tra console để xem lỗi cụ thể
- Kiểm tra service có tồn tại trong database không
- Kiểm tra service có status = 'open' không

---

### 4. Lỗi routing

**Kiểm tra:**
- Route `/booking/:id` có được định nghĩa trong App.tsx không?
- ID có hợp lệ không?

**Code trong App.tsx:**
```tsx
<Route path="/booking/:id" element={<BookingPage />} />
```

**Giải pháp:**
- Route đã được định nghĩa đúng
- Kiểm tra ID có phải là số không

---

## Cách debug

### Bước 1: Kiểm tra Console
Mở DevTools Console và kiểm tra:
- Có lỗi JavaScript không?
- Có log từ ServiceDetail không?
- Có log từ BookingPage không?

### Bước 2: Kiểm tra Network Tab
- Request đến `/api/ServiceCombo/{id}` có thành công không?
- Status code là gì? (200 = OK, 404 = Not Found, 500 = Server Error)

### Bước 3: Kiểm tra Storage
Mở DevTools → Application → Storage:
- localStorage có `token` và `userInfo` không?
- sessionStorage có `token` và `userInfo` không?

### Bước 4: Kiểm tra Service Data
Trong ServiceDetail, kiểm tra:
- `service.Status` = 'open'?
- `service.AvailableSlots` > 0?

---

## Code để debug

Thêm vào ServiceDetail.tsx để debug:

```tsx
onClick={() => {
  console.log('🔍 [ServiceDetail] Click "Đặt dịch vụ ngay"')
  console.log('  - Service ID:', id)
  console.log('  - Service Status:', status)
  console.log('  - Available Slots:', availableSlots)
  
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
  
  console.log('  - Has Token:', !!token)
  console.log('  - Has UserInfo:', !!userInfoStr)
  
  if (status.toLowerCase() !== 'open' || availableSlots === 0) {
    console.warn('  - Button disabled: status =', status, ', slots =', availableSlots)
    alert('Dịch vụ hiện không khả dụng để đặt')
    return
  }
  
  if (!token || !userInfoStr) {
    console.log('  - Not logged in, redirecting to login')
    navigate('/login', { state: { returnUrl: `/booking/${id}` } })
    return
  }
  
  console.log('  - Navigating to booking page:', `/booking/${id}`)
  navigate(`/booking/${id}`)
}}
```

---

## Giải pháp nhanh

1. **Kiểm tra đăng nhập:**
   - Đảm bảo đã đăng nhập
   - Token và userInfo có trong storage

2. **Kiểm tra service:**
   - Service có status = 'open'
   - Service có availableSlots > 0

3. **Kiểm tra console:**
   - Xem có lỗi gì không
   - Xem log từ ServiceDetail và BookingPage

4. **Thử navigate trực tiếp:**
   - Mở console và chạy: `window.location.href = '/booking/18'` (thay 18 bằng ID service thực tế)




