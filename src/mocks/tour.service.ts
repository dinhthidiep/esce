import { 
  Tour, 
  ScheduleDay, 
  Promotion, 
  Addon, 
  BookingDraft, 
  GroupBooking, 
  GroupMember,
  Review,
  Comment,
  Reaction,
  TourSchedule,
  BookingResult
} from '../types/tour';

// Mock data
const mockTours: Tour[] = [
  {
    id: 'hoi-an-pho-co',
    title: 'Khám phá Hội An - Phố cổ di sản thế giới',
    description: 'Hành trình khám phá phố cổ Hội An với kiến trúc cổ kính, ẩm thực đặc sắc và văn hóa truyền thống. Trải nghiệm cuộc sống chậm rãi tại thành phố di sản UNESCO.',
    shortDescription: 'Khám phá phố cổ Hội An với kiến trúc cổ kính và ẩm thực đặc sắc',
    region: 'Quảng Nam',
    duration: 2,
    rating: 4.8,
    reviewCount: 1247,
    price: 1200000,
    originalPrice: 1500000,
    images: [
      '/images/hoi-an.jpg',
      '/images/chua-linh-ung.jpg',
      '/images/ba-na-hill.jpg',
      '/images/son-tra.jpg'
    ],
    highlights: [
      'Tham quan phố cổ Hội An - Di sản UNESCO',
      'Trải nghiệm ẩm thực địa phương',
      'Tham quan chùa Cầu Nhật Bản',
      'Mua sắm tại chợ đêm Hội An',
      'Tham quan làng gốm Thanh Hà'
    ],
    included: [
      'Xe đưa đón từ khách sạn',
      'Hướng dẫn viên chuyên nghiệp',
      'Vé tham quan các điểm du lịch',
      'Bữa trưa tại nhà hàng địa phương',
      'Bảo hiểm du lịch'
    ],
    excluded: [
      'Chi phí cá nhân',
      'Đồ uống có cồn',
      'Quà lưu niệm',
      'Chi phí phát sinh ngoài chương trình'
    ],
    requirements: [
      'Mang theo giấy tờ tùy thân',
      'Mặc trang phục thoải mái',
      'Mang theo kem chống nắng',
      'Mang theo máy ảnh'
    ],
    cancellationPolicy: 'Hủy miễn phí trước 24h. Hủy trong vòng 24h tính phí 50%.',
    remainingSlots: 8,
    maxGroupSize: 20,
    minGroupSize: 2,
    category: 'Văn hóa',
    difficulty: 'EASY',
    tags: ['văn hóa', 'di sản', 'ẩm thực', 'phố cổ'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'ba-na-hills-cau-vang',
    title: 'Bà Nà Hills - Cầu Vàng và Fantasy Park',
    description: 'Khám phá Bà Nà Hills với cầu Vàng nổi tiếng, công viên giải trí Fantasy Park và khí hậu mát mẻ quanh năm.',
    shortDescription: 'Khám phá Bà Nà Hills với cầu Vàng và Fantasy Park',
    region: 'Đà Nẵng',
    duration: 1,
    rating: 4.6,
    reviewCount: 892,
    price: 1800000,
    originalPrice: 2200000,
    images: [
      '/images/ba-na-hill.jpg',
      '/images/chua-linh-ung.jpg'
    ],
    highlights: [
      'Tham quan cầu Vàng nổi tiếng',
      'Trải nghiệm cáp treo dài nhất thế giới',
      'Vui chơi tại Fantasy Park',
      'Tham quan chùa Linh Ứng',
      'Ngắm cảnh từ đỉnh núi'
    ],
    included: [
      'Vé cáp treo khứ hồi',
      'Vé vào Fantasy Park',
      'Hướng dẫn viên',
      'Bữa trưa buffet',
      'Bảo hiểm du lịch'
    ],
    excluded: [
      'Chi phí cá nhân',
      'Đồ uống có cồn',
      'Trò chơi có phí',
      'Quà lưu niệm'
    ],
    requirements: [
      'Mang theo giấy tờ tùy thân',
      'Mặc trang phục thoải mái',
      'Mang theo áo ấm (nhiệt độ thấp)',
      'Mang theo máy ảnh'
    ],
    cancellationPolicy: 'Hủy miễn phí trước 48h. Hủy trong vòng 48h tính phí 30%.',
    remainingSlots: 15,
    maxGroupSize: 25,
    minGroupSize: 1,
    category: 'Giải trí',
    difficulty: 'EASY',
    tags: ['giải trí', 'cầu vàng', 'cáp treo', 'fantasy park'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  }
];

const mockSchedules: { [tourId: string]: ScheduleDay[] } = {
  'hoi-an-pho-co': [
    {
      day: 1,
      title: 'Khám phá phố cổ Hội An',
      description: 'Bắt đầu hành trình khám phá phố cổ Hội An với những ngôi nhà cổ và kiến trúc độc đáo.',
      activities: [
        'Đón khách tại khách sạn (8:00)',
        'Tham quan chùa Cầu Nhật Bản',
        'Dạo bộ phố cổ, chụp ảnh',
        'Tham quan nhà cổ Tấn Ký',
        'Ăn trưa tại nhà hàng địa phương'
      ],
      meals: ['Trưa'],
      accommodation: 'Khách sạn 3 sao tại Hội An',
      transport: 'Xe du lịch 16 chỗ'
    },
    {
      day: 2,
      title: 'Làng gốm Thanh Hà và chợ đêm',
      description: 'Trải nghiệm làm gốm tại làng gốm truyền thống và thưởng thức ẩm thực chợ đêm.',
      activities: [
        'Tham quan làng gốm Thanh Hà',
        'Trải nghiệm làm gốm',
        'Tham quan chợ đêm Hội An',
        'Thưởng thức ẩm thực địa phương',
        'Trả khách tại khách sạn (20:00)'
      ],
      meals: ['Sáng', 'Trưa'],
      transport: 'Xe du lịch 16 chỗ'
    }
  ],
  'ba-na-hills-cau-vang': [
    {
      day: 1,
      title: 'Bà Nà Hills - Cầu Vàng và Fantasy Park',
      description: 'Khám phá Bà Nà Hills với cầu Vàng nổi tiếng và vui chơi tại Fantasy Park.',
      activities: [
        'Đón khách tại khách sạn (7:30)',
        'Đi cáp treo lên Bà Nà Hills',
        'Tham quan cầu Vàng',
        'Vui chơi tại Fantasy Park',
        'Ăn trưa buffet',
        'Tham quan chùa Linh Ứng',
        'Trả khách tại khách sạn (17:00)'
      ],
      meals: ['Trưa'],
      transport: 'Xe du lịch 29 chỗ'
    }
  ]
};

const mockPromotions: Promotion[] = [
  {
    id: '1',
    code: 'HOIAN20',
    name: 'Giảm 20% tour Hội An',
    type: 'PERCENT',
    value: 20,
    minOrderAmount: 2000000,
    maxDiscountAmount: 500000,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 234,
    isActive: true
  },
  {
    id: '2',
    code: 'BANA50K',
    name: 'Giảm 50k tour Bà Nà',
    type: 'AMOUNT',
    value: 50000,
    minOrderAmount: 1500000,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    usageLimit: 500,
    usedCount: 89,
    isActive: true
  },
  {
    id: '3',
    code: 'WELCOME10',
    name: 'Giảm 10% cho khách mới',
    type: 'PERCENT',
    value: 10,
    minOrderAmount: 1000000,
    maxDiscountAmount: 200000,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    usageLimit: 2000,
    usedCount: 456,
    isActive: true
  }
];

const mockAddons: Addon[] = [
  {
    id: '1',
    name: 'Bảo hiểm du lịch nâng cao',
    description: 'Bảo hiểm với mức bồi thường cao hơn',
    price: 100000,
    type: 'PER_PERSON',
    isRequired: false,
    category: 'Bảo hiểm'
  },
  {
    id: '2',
    name: 'Dịch vụ chụp ảnh chuyên nghiệp',
    description: 'Photographer chuyên nghiệp đi cùng',
    price: 500000,
    type: 'PER_GROUP',
    isRequired: false,
    category: 'Dịch vụ'
  },
  {
    id: '3',
    name: 'Bữa tối đặc biệt',
    description: 'Bữa tối tại nhà hàng cao cấp',
    price: 300000,
    type: 'PER_PERSON',
    isRequired: false,
    category: 'Ẩm thực'
  }
];

const mockReviews: Review[] = [
  {
    id: '1',
    tourId: 'hoi-an-pho-co',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userAvatar: 'https://via.placeholder.com/40',
    rating: 5,
    title: 'Tour tuyệt vời!',
    content: 'Tour rất hay, hướng dẫn viên nhiệt tình, chương trình phong phú. Tôi rất hài lòng với dịch vụ.',
    images: ['/images/hoi-an.jpg'],
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    hostReply: {
      content: 'Cảm ơn bạn đã đánh giá tích cực! Chúng tôi rất vui khi bạn có trải nghiệm tốt.',
      repliedAt: '2024-01-15T14:20:00Z'
    },
    reactions: [
      { id: '1', userId: 'user2', type: 'LIKE', createdAt: '2024-01-15T11:00:00Z' },
      { id: '2', userId: 'user3', type: 'HELPFUL', createdAt: '2024-01-15T12:00:00Z' }
    ]
  },
  {
    id: '2',
    tourId: 'hoi-an-pho-co',
    userId: 'user2',
    userName: 'Trần Thị B',
    userAvatar: 'https://via.placeholder.com/40',
    rating: 4,
    title: 'Khá tốt',
    content: 'Tour ổn, giá cả hợp lý. Chỉ có một chút vội vàng ở một số điểm tham quan.',
    isVerified: true,
    createdAt: '2024-01-10T15:45:00Z',
    updatedAt: '2024-01-10T15:45:00Z',
    reactions: [
      { id: '3', userId: 'user1', type: 'LIKE', createdAt: '2024-01-10T16:00:00Z' }
    ]
  }
];

const mockComments: Comment[] = [
  {
    id: '1',
    tourId: 'hoi-an-pho-co',
    userId: 'user3',
    userName: 'Lê Văn C',
    userAvatar: 'https://via.placeholder.com/40',
    content: 'Tour này có phù hợp với trẻ em 5 tuổi không?',
    isVerified: false,
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    replies: [
      {
        id: '2',
        tourId: 'hoi-an-pho-co',
        userId: 'host1',
        userName: 'Hướng dẫn viên',
        userAvatar: 'https://via.placeholder.com/40',
        content: 'Chào bạn! Tour này rất phù hợp với trẻ em. Chúng tôi có nhiều hoạt động thú vị cho các bé.',
        isVerified: true,
        createdAt: '2024-01-12T10:30:00Z',
        updatedAt: '2024-01-12T10:30:00Z',
        replies: [],
        reactions: []
      }
    ],
    reactions: [
      { id: '4', userId: 'user4', type: 'LIKE', createdAt: '2024-01-12T10:00:00Z' }
    ]
  }
];

// Mock service functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const tourService = {
  async getTourById(id: string): Promise<Tour | null> {
    await delay(200);
    // Try to find by ID first, then by slug
    return mockTours.find(tour => tour.id === id || tour.id === id) || null;
  },

  async getTourScheduleDays(tourId: string): Promise<ScheduleDay[]> {
    await delay(150);
    return mockSchedules[tourId] || [];
  },

  async getTourPromotions(tourId: string): Promise<Promotion[]> {
    await delay(180);
    return mockPromotions.filter(promo => promo.isActive);
  },

  async getTourAddons(tourId: string): Promise<Addon[]> {
    await delay(120);
    return mockAddons;
  },

  async getTourSchedule(tourId: string): Promise<TourSchedule> {
    await delay(200);
    const tour = mockTours.find(t => t.id === tourId);
    if (!tour) throw new Error('Tour not found');

    // Fixed dates for testing - October 2025
    const availableDates = [
      // September 2025
      {
        date: '2025-09-28',
        remainingSlots: 12,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-09-29',
        remainingSlots: 8,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-09-30',
        remainingSlots: 15,
        price: 1200000,
        isAvailable: true
      },
      // October 2025
      {
        date: '2025-10-01',
        remainingSlots: 20,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-02',
        remainingSlots: 10,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-03',
        remainingSlots: 4,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-04',
        remainingSlots: 18,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-05',
        remainingSlots: 6,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-06',
        remainingSlots: 14,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-07',
        remainingSlots: 9,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-08',
        remainingSlots: 16,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-09',
        remainingSlots: 3,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-10',
        remainingSlots: 11,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-11',
        remainingSlots: 7,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-12',
        remainingSlots: 13,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-13',
        remainingSlots: 5,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-14',
        remainingSlots: 19,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-15',
        remainingSlots: 2,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-16',
        remainingSlots: 12,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-17',
        remainingSlots: 8,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-18',
        remainingSlots: 15,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-19',
        remainingSlots: 6,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-20',
        remainingSlots: 0,
        price: 1200000,
        isAvailable: false
      },
      {
        date: '2025-10-21',
        remainingSlots: 10,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-22',
        remainingSlots: 3,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-23',
        remainingSlots: 18,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-24',
        remainingSlots: 1,
        price: 1500000,
        isAvailable: true
      },
      {
        date: '2025-10-25',
        remainingSlots: 14,
        price: 1500000,
        isAvailable: true
      },
      {
        date: '2025-10-26',
        remainingSlots: 7,
        price: 1500000,
        isAvailable: true
      },
      {
        date: '2025-10-27',
        remainingSlots: 9,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-28',
        remainingSlots: 5,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-29',
        remainingSlots: 11,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-30',
        remainingSlots: 4,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-10-31',
        remainingSlots: 13,
        price: 1200000,
        isAvailable: true
      },
      // November 2025
      {
        date: '2025-11-01',
        remainingSlots: 8,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-11-02',
        remainingSlots: 16,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-11-03',
        remainingSlots: 2,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-11-04',
        remainingSlots: 12,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-11-05',
        remainingSlots: 6,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-11-06',
        remainingSlots: 0,
        price: 1200000,
        isAvailable: false
      },
      {
        date: '2025-11-07',
        remainingSlots: 9,
        price: 1200000,
        isAvailable: true
      },
      {
        date: '2025-11-08',
        remainingSlots: 3,
        price: 1200000,
        isAvailable: true
      }
    ];

    return {
      tourId,
      availableDates
    };
  },

  async createBooking(booking: BookingDraft): Promise<BookingResult> {
    await delay(300);
    const bookingId = `BK${Date.now()}`;
    return {
      bookingId,
      status: 'SUCCESS',
      message: 'Đặt tour thành công!',
      total: booking.total
    };
  },

  async createGroupBooking(booking: BookingDraft, leaderInfo: { name: string; email: string; phone: string }): Promise<GroupBooking> {
    await delay(250);
    const groupId = `GB${Date.now()}`;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const groupBooking: GroupBooking = {
      id: groupId,
      code,
      tourId: booking.tourId,
      date: booking.date,
      leaderId: 'leader1',
      members: [{
        id: 'member1',
        name: leaderInfo.name,
        email: leaderInfo.email,
        phone: leaderInfo.phone,
        adults: booking.adults,
        children: booking.children,
        addons: booking.addons,
        subtotal: booking.subtotal,
        paymentStatus: 'PENDING',
        joinedAt: new Date().toISOString()
      }],
      adults: booking.adults,
      children: booking.children,
      addons: booking.addons,
      promotionCode: booking.promotionCode,
      subtotal: booking.subtotal,
      discount: booking.discount,
      total: booking.total,
      paymentMode: 'LEADER',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    return groupBooking;
  },

  async joinGroupBooking(code: string, memberInfo: { name: string; email: string; phone: string }, adults: number, children: number, addons: { addonId: string; quantity: number }[]): Promise<GroupBooking> {
    await delay(200);
    // Mock: assume group exists and add member
    const groupBooking: GroupBooking = {
      id: 'GB123456',
      code,
      tourId: 'hoi-an-pho-co',
      date: '2024-02-15',
      leaderId: 'leader1',
      members: [
        {
          id: 'member1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0123456789',
          adults: 2,
          children: 1,
          addons: [],
          subtotal: 2400000,
          paymentStatus: 'PAID',
          joinedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'member2',
          name: memberInfo.name,
          email: memberInfo.email,
          phone: memberInfo.phone,
          adults,
          children,
          addons,
          subtotal: adults * 1200000 + children * 600000,
          paymentStatus: 'PENDING',
          joinedAt: new Date().toISOString()
        }
      ],
      adults: 2 + adults,
      children: 1 + children,
      addons: addons,
      promotionCode: 'HOIAN20',
      subtotal: 2400000 + (adults * 1200000 + children * 600000),
      discount: 480000,
      total: 2400000 + (adults * 1200000 + children * 600000) - 480000,
      paymentMode: 'LEADER',
      status: 'DRAFT',
      createdAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-22T10:00:00Z'
    };

    return groupBooking;
  },

  async getGroupBooking(code: string): Promise<GroupBooking | null> {
    await delay(150);
    // Mock: return sample group booking
    return {
      id: 'GB123456',
      code,
      tourId: 'hoi-an-pho-co',
      date: '2024-02-15',
      leaderId: 'leader1',
      members: [
        {
          id: 'member1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0123456789',
          adults: 2,
          children: 1,
          addons: [],
          subtotal: 2400000,
          paymentStatus: 'PAID',
          joinedAt: '2024-01-15T10:00:00Z'
        }
      ],
      adults: 2,
      children: 1,
      addons: [],
      promotionCode: 'HOIAN20',
      subtotal: 2400000,
      discount: 480000,
      total: 1920000,
      paymentMode: 'LEADER',
      status: 'DRAFT',
      createdAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-22T10:00:00Z'
    };
  },

  async setGroupPaymentMode(code: string, mode: 'LEADER' | 'SPLIT'): Promise<GroupBooking> {
    await delay(150);
    const group = await this.getGroupBooking(code);
    if (!group) throw new Error('Group not found');
    
    group.paymentMode = mode;
    return group;
  },

  async confirmGroupBooking(code: string): Promise<BookingResult> {
    await delay(300);
    const bookingId = `GB${Date.now()}`;
    return {
      bookingId,
      status: 'SUCCESS',
      message: 'Xác nhận đặt nhóm thành công!',
      total: 1920000
    };
  },

  async getReviews(tourId: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    await delay(200);
    return mockReviews.filter(review => review.tourId === tourId);
  },

  async addReview(tourId: string, review: { rating: number; title: string; content: string; images?: string[] }): Promise<Review> {
    await delay(250);
    const newReview: Review = {
      id: `review_${Date.now()}`,
      tourId,
      userId: 'current_user',
      userName: 'Người dùng hiện tại',
      userAvatar: 'https://via.placeholder.com/40',
      rating: review.rating,
      title: review.title,
      content: review.content,
      images: review.images,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: []
    };
    
    mockReviews.push(newReview);
    return newReview;
  },

  async replyReview(reviewId: string, content: string): Promise<void> {
    await delay(200);
    const review = mockReviews.find(r => r.id === reviewId);
    if (review) {
      review.hostReply = {
        content,
        repliedAt: new Date().toISOString()
      };
    }
  },

  async getComments(tourId: string, page: number = 1, limit: number = 10): Promise<Comment[]> {
    await delay(150);
    return mockComments.filter(comment => comment.tourId === tourId);
  },

  async addComment(tourId: string, content: string, parentId?: string): Promise<Comment> {
    await delay(200);
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      tourId,
      userId: 'current_user',
      userName: 'Người dùng hiện tại',
      userAvatar: 'https://via.placeholder.com/40',
      content,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      reactions: []
    };

    if (parentId) {
      const parent = mockComments.find(c => c.id === parentId);
      if (parent) {
        parent.replies.push(newComment);
      }
    } else {
      mockComments.push(newComment);
    }

    return newComment;
  },

  async toggleReaction(targetId: string, targetType: 'review' | 'comment', type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY'): Promise<void> {
    await delay(100);
    // Mock: just simulate success
    console.log(`Toggled ${type} reaction on ${targetType} ${targetId}`);
  }
};
