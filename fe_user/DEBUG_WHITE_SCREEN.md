# 🔍 Debug Màn Hình Trắng

## Các bước kiểm tra

### 1. Mở Console (F12)
Kiểm tra xem có lỗi nào không:
- Lỗi import
- Lỗi syntax
- Lỗi runtime

### 2. Kiểm tra Network Tab
Xem các file có load được không:
- `/src/main.tsx`
- CSS files
- JS files

### 3. Kiểm tra Elements Tab
Xem có element `#root` không và có content bên trong không

### 4. Kiểm tra Dev Server
Đảm bảo dev server đang chạy:
```bash
cd fe_user
npm run dev
```

URL: `http://localhost:3000`

## Các lỗi thường gặp

### Lỗi: "Cannot find module"
- Chạy: `npm install`
- Kiểm tra `node_modules` có đầy đủ không

### Lỗi: "Failed to load resource"
- Kiểm tra đường dẫn file
- Kiểm tra `vite.config.ts`

### Lỗi: "Uncaught SyntaxError"
- Kiểm tra TypeScript compilation
- Chạy: `npm run build` để xem lỗi

### Màn hình trắng không có lỗi
- Kiểm tra `main.tsx` có render được không
- Kiểm tra `App.tsx` có lỗi không
- Thử comment các component phức tạp

## Test nhanh

Thêm vào `main.tsx` để test:
```tsx
console.log('✅ Main.tsx loaded')
console.log('✅ Root element:', document.getElementById('root'))
```

## Liên hệ

Nếu vẫn không giải quyết được, kiểm tra:
1. Console errors
2. Network tab
3. Elements tab
4. React DevTools (nếu có)



