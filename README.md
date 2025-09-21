# ESCE Du Lịch - Du lịch sinh thái Đà Nẵng

Website du lịch sinh thái bền vững với tính năng đặt tour nhóm thông minh tại Đà Nẵng.

## 🚀 Tính năng chính

- **Đặt tour nhóm thông minh**: Tạo nhóm, mời bạn bè và nhận ưu đãi hấp dẫn
- **Du lịch sinh thái bền vững**: Các tour thân thiện với môi trường
- **Ưu đãi nhóm**: Giảm giá lên đến 8% khi đi nhóm đông người
- **Giao diện responsive**: Tối ưu cho mọi thiết bị
- **Accessibility**: Tuân thủ chuẩn a11y

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS với tông màu xanh eco
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM

## 📦 Cài đặt và chạy

```bash
# Cài đặt dependencies
pnpm install

# Chạy development server
pnpm dev

# Build production
pnpm build

# Preview production build
pnpm preview
```

## 🎨 Theme & Design

- **Primary Color**: Emerald-600 (xanh eco)
- **Accent Color**: Blue-600
- **Surface**: White / Emerald-50
- **Text**: Slate-800/900
- **Shadows**: Mềm mại với rounded-2xl
- **Animations**: Tinh tế với Framer Motion

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Container**: max-w-7xl với padding responsive

## ♿ Accessibility

- Semantic HTML
- ARIA labels cho icon buttons
- Keyboard navigation
- Focus management
- Color contrast đạt chuẩn WCAG

## 📁 Cấu trúc dự án

```
src/
├── components/          # UI Components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── HeroSection.tsx # Hero + Stats section
│   ├── ResponsibleSection.tsx # Eco tourism section
│   ├── GroupDiscountSection.tsx # Group discounts
│   ├── TestimonialsSection.tsx # Customer reviews
│   ├── WhyChooseUsSection.tsx # Features
│   ├── PopularToursSection.tsx # Popular tours
│   └── NewsletterFooterSection.tsx # Newsletter + Footer
├── data/               # Mock data
│   ├── tours.ts        # Tour data
│   ├── reviews.ts      # Customer reviews
│   ├── features.ts     # Feature list
│   ├── discountTiers.ts # Discount tiers
│   └── stats.ts        # Statistics
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
├── pages/              # Pages
│   └── Home.tsx        # Homepage
└── main.tsx            # App entry point
```

## 🎯 Sections theo thiết kế

1. **Hero + Stats**: Header, hero content, statistics
2. **Responsible/Eco**: Du lịch có trách nhiệm
3. **Group Discounts**: Ưu đãi nhóm tour
4. **Testimonials**: Đánh giá khách hàng
5. **Why Choose Us**: Lý do chọn ESCE
6. **Popular Tours**: Tour được yêu thích
7. **Newsletter/Footer**: Đăng ký email + thông tin liên hệ

## 🔧 Development

```bash
# Lint code
pnpm lint

# Type check
pnpm build
```

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
