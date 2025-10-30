export interface Tour {
  id: string
  slug: string
  name: string
  area: string
  location: string
  image: string
  rating: number
  reviewsCount: number
  priceFrom: number
  originalPrice?: number
  discountPercent?: number
  days: number
  duration: string
  description: string
  highlights: string[]
  category: string[]
  createdAt: string
}

export const popularTours: Tour[] = [
  {
    id: 'farm-1',
    slug: 'yen-retreat-farm',
    name: 'Yên Retreat Farm',
    area: 'Đà Nẵng',
    location: 'Yên Retreat, Đà Nẵng',
    image: '/images/Yên Retreat_1.jpg',
    rating: 4.9,
    reviewsCount: 156,
    priceFrom: 1200000,
    originalPrice: 1350000,
    discountPercent: 11,
    days: 2,
    duration: '2 ngày 1 đêm',
    description: 'Trải nghiệm nghỉ dưỡng tại Yên Retreat Farm với không gian xanh mát, thư giãn hoàn toàn trong thiên nhiên.',
    highlights: ['Nghỉ dưỡng cao cấp', 'Thiên nhiên xanh mát', 'Dịch vụ spa', 'Ẩm thực organic'],
    category: ['Nghỉ dưỡng', 'Sinh thái'],
    createdAt: '2024-03-01'
  },
  {
    id: 'farm-2',
    slug: 'roc-rach-glamping',
    name: 'Róc Rách Glamping',
    area: 'Đà Nẵng',
    location: 'Róc Rách, Đà Nẵng',
    image: '/images/róc_rách_1.jpg',
    rating: 4.7,
    reviewsCount: 89,
    priceFrom: 950000,
    originalPrice: 1100000,
    discountPercent: 14,
    days: 1,
    duration: '1 ngày 1 đêm',
    description: 'Trải nghiệm glamping độc đáo tại Róc Rách với tiếng suối róc rách, không gian lều trại sang trọng.',
    highlights: ['Glamping sang trọng', 'Tiếng suối róc rách', 'Lều trại cao cấp', 'Hoạt động ngoài trời'],
    category: ['Glamping', 'Sinh thái'],
    createdAt: '2024-03-05'
  },
  {
    id: 'farm-3',
    slug: 'hoa-bac-ecolodge',
    name: 'Hoà Bắc Ecolodge',
    area: 'Đà Nẵng',
    location: 'Hoà Bắc, Đà Nẵng',
    image: '/images/eco_hòa bắc_1.jpg',
    rating: 4.8,
    reviewsCount: 134,
    priceFrom: 800000,
    originalPrice: 900000,
    discountPercent: 11,
    days: 1,
    duration: '1 ngày',
    description: 'Khám phá Hoà Bắc Ecolodge với hệ sinh thái đa dạng, trải nghiệm du lịch bền vững và thân thiện môi trường.',
    highlights: ['Du lịch bền vững', 'Hệ sinh thái đa dạng', 'Hoạt động giáo dục', 'Ẩm thực địa phương'],
    category: ['Sinh thái', 'Giáo dục'],
    createdAt: '2024-03-10'
  },
  {
    id: 'farm-4',
    slug: 'vuon-nha-camping',
    name: 'Vườn Nhà Camping',
    area: 'Đà Nẵng',
    location: 'Vườn Nhà, Đà Nẵng',
    image: '/images/Vườn nhà_1.jpg',
    rating: 4.6,
    reviewsCount: 67,
    priceFrom: 650000,
    originalPrice: 750000,
    discountPercent: 13,
    days: 1,
    duration: '1 ngày',
    description: 'Trải nghiệm camping tại Vườn Nhà với không gian vườn tược xanh tươi, hoạt động nông nghiệp thú vị.',
    highlights: ['Camping vườn tược', 'Hoạt động nông nghiệp', 'Không gian xanh', 'Trải nghiệm gia đình'],
    category: ['Camping', 'Nông nghiệp'],
    createdAt: '2024-03-15'
  },
  {
    id: '1',
    slug: 'ba-na-hills-cau-vang',
    name: 'Bà Nà Hills - Cầu Vàng',
    area: 'Đà Nẵng',
    location: 'Bà Nà Hills, Đà Nẵng',
    image: '/images/ba-na-hill.jpg',
    rating: 4.8,
    reviewsCount: 1247,
    priceFrom: 850000,
    originalPrice: 920000,
    discountPercent: 8,
    days: 1,
    duration: '1 ngày',
    description: 'Khám phá Cầu Vàng nổi tiếng và khu du lịch Bà Nà Hills với cảnh quan thiên nhiên tuyệt đẹp.',
    highlights: ['Cầu Vàng', 'Làng Pháp', 'Cáp treo', 'Vườn hoa'],
    category: ['Văn hóa', 'Phiêu lưu'],
    createdAt: '2024-01-15'
  },
  {
    id: '5',
    slug: 'hoi-an-pho-co',
    name: 'Hội An - Phố Cổ',
    area: 'Quảng Nam',
    location: 'Hội An, Quảng Nam',
    image: '/images/hoi-an.jpg',
    rating: 4.6,
    reviewsCount: 892,
    priceFrom: 1200000,
    originalPrice: 1300000,
    discountPercent: 8,
    days: 1,
    duration: '1 ngày',
    description: 'Trải nghiệm văn hóa truyền thống tại phố cổ Hội An với kiến trúc cổ kính và ẩm thực đặc sắc.',
    highlights: ['Phố cổ Hội An', 'Chùa Cầu', 'Làng gốm Thanh Hà', 'Đèn lồng'],
    category: ['Văn hóa', 'Nghỉ dưỡng'],
    createdAt: '2024-01-20'
  },
  {
    id: '6',
    slug: 'son-tra-chua-linh-ung',
    name: 'Sơn Trà - Chùa Linh Ứng',
    area: 'Đà Nẵng',
    location: 'Bán đảo Sơn Trà, Đà Nẵng',
    image: '/images/son-tra.jpg',
    rating: 4.7,
    reviewsCount: 634,
    priceFrom: 650000,
    originalPrice: 680000,
    discountPercent: 5,
    days: 1,
    duration: 'Nửa ngày',
    description: 'Tham quan chùa Linh Ứng và ngắm toàn cảnh Đà Nẵng từ bán đảo Sơn Trà.',
    highlights: ['Chùa Linh Ứng', 'Tượng Phật Quan Âm', 'Rừng nguyên sinh', 'Khỉ vàng'],
    category: ['Sinh thái', 'Văn hóa'],
    createdAt: '2024-02-01'
  },
  {
    id: '7',
    slug: 'ngu-hanh-son-dong-huyen-khong',
    name: 'Ngũ Hành Sơn - Động Huyền Không',
    area: 'Đà Nẵng',
    location: 'Ngũ Hành Sơn, Đà Nẵng',
    image: '/images/chua-linh-ung.jpg',
    rating: 4.5,
    reviewsCount: 456,
    priceFrom: 450000,
    originalPrice: 500000,
    discountPercent: 10,
    days: 1,
    duration: 'Nửa ngày',
    description: 'Khám phá hệ thống hang động và chùa chiền tại Ngũ Hành Sơn.',
    highlights: ['Động Huyền Không', 'Chùa Tam Thai', 'Động Âm Phủ', 'Làng đá mỹ nghệ'],
    category: ['Văn hóa', 'Phiêu lưu'],
    createdAt: '2024-02-10'
  },
  {
    id: '8',
    slug: 'bai-bien-my-khe-lan-bien',
    name: 'Bãi biển Mỹ Khê - Lặn biển',
    area: 'Đà Nẵng',
    location: 'Bãi biển Mỹ Khê, Đà Nẵng',
    image: '/images/ba-na-hill.jpg',
    rating: 4.9,
    reviewsCount: 723,
    priceFrom: 750000,
    originalPrice: 800000,
    discountPercent: 6,
    days: 1,
    duration: '1 ngày',
    description: 'Trải nghiệm lặn biển và khám phá hệ sinh thái biển tại bãi biển Mỹ Khê.',
    highlights: ['Lặn biển', 'San hô', 'Cá nhiệt đới', 'Bãi biển đẹp'],
    category: ['Sinh thái', 'Phiêu lưu'],
    createdAt: '2024-02-15'
  },
  {
    id: '9',
    slug: 'lang-cu-lao-cham-du-lich-sinh-thai',
    name: 'Làng Cù Lao Chàm - Du lịch sinh thái',
    area: 'Quảng Nam',
    location: 'Cù Lao Chàm, Hội An',
    image: '/images/hoi-an.jpg',
    rating: 4.8,
    reviewsCount: 567,
    priceFrom: 950000,
    originalPrice: 1000000,
    discountPercent: 5,
    days: 1,
    duration: '1 ngày',
    description: 'Khám phá đảo Cù Lao Chàm với hệ sinh thái biển phong phú và văn hóa địa phương.',
    highlights: ['Đảo hoang sơ', 'Lặn biển', 'Làng chài', 'Bảo tồn biển'],
    category: ['Sinh thái', 'Văn hóa'],
    createdAt: '2024-02-20'
  }
]
