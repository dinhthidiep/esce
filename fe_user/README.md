# Travel Login App - Ứng dụng đăng nhập du lịch

## 🎉 Đã được migrate sang Vite + TypeScript + Material-UI

Ứng dụng web du lịch với giao diện đăng nhập đẹp mắt được xây dựng bằng React, đã được nâng cấp với:
- ⚡ **Vite** - Build tool hiện đại, nhanh hơn 20x
- 🔷 **TypeScript** - Type safety và better developer experience
- 🎨 **Material-UI** - UI framework mạnh mẽ
- 🎯 **Tailwind CSS** - Utility-first CSS framework
- 🌓 **Theme System** - Dark/Light mode support

## Tính năng
- ✨ Giao diện đăng nhập hiện đại với hiệu ứng gradient
- 📱 Responsive design cho mọi thiết bị
- 🔐 Validation form đầy đủ
- 🎨 Animation và hiệu ứng mượt mà
- 🌐 Hỗ trợ đăng nhập qua Google
- ⚡ Loading state và error handling
- 🎯 UX/UI được tối ưu cho trải nghiệm người dùng
- 🌓 Dark/Light theme mode

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Tạo file .env:**
   ```bash
   cp .env.example .env
   # Chỉnh sửa các giá trị trong .env nếu cần
   ```

3. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt:**
   Truy cập [http://localhost:3000](http://localhost:3000) (hoặc port được cấu hình trong .env)

### Build cho production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint và fix code
```bash
npm run lint
npm run lint:fix
```

## Cấu trúc project

```
fe_user/
├── src/
│   ├── components/        # React components
│   ├── API/              # API calls
│   ├── config/           # Configuration (theme, API)
│   ├── contexts/         # React Context (Theme)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utilities
│   ├── services/         # Services
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint configuration
└── package.json
```

## Công nghệ sử dụng

### Core
- **React 19.1** - UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7** - Build tool với SWC compiler

### UI & Styling
- **Material-UI (MUI) 7** - Component library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Emotion** - CSS-in-JS (từ MUI)

### Routing
- **React Router DOM 7.9** - Client-side routing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting

### Other
- **Axios** - HTTP client
- **JWT Decode** - JWT token handling
- **React Secure Storage** - Secure storage

## Path Aliases

Sử dụng `~` để import từ `src/`:
```typescript
import { something } from '~/config'
import { useTheme } from '~/contexts/theme'
```

## Environment Variables

Sử dụng `import.meta.env.VITE_*` thay vì `process.env.REACT_APP_*`:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Theme System

Ứng dụng hỗ trợ dark/light mode:
```typescript
import { useTheme } from '~/contexts/theme'

const { mode, setMode, currentMode, theme } = useTheme()
```

## Migration từ CRA

Xem file `MIGRATION_GUIDE.md` để biết chi tiết về quá trình migration.

## Liên hệ
Nếu có thắc mắc hoặc góp ý, vui lòng liên hệ qua email hoặc tạo issue trên repository.
