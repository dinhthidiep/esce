export interface Tour {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  region: string;
  duration: number; // days
  rating: number;
  reviewCount: number;
  price: number; // base price per person
  originalPrice?: number;
  images: string[];
  highlights: string[];
  included: string[];
  excluded: string[];
  requirements: string[];
  cancellationPolicy: string;
  remainingSlots: number;
  maxGroupSize: number;
  minGroupSize: number;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
  transport?: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: 'PERCENT' | 'AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'PER_PERSON' | 'PER_GROUP';
  isRequired: boolean;
  category: string;
}

export interface BookingDraft {
  type: 'PERSONAL' | 'GROUP' | 'TEAM';
  tourId: string;
  date: string;
  adults: number;
  children: number;
  addons: { addonId: string; quantity: number }[];
  promotionCode?: string;
  subtotal: number;
  discount: number;
  total: number;
}

export interface GroupBooking {
  id: string;
  code: string;
  tourId: string;
  date: string;
  leaderId: string;
  members: GroupMember[];
  adults: number;
  children: number;
  addons: { addonId: string; quantity: number }[];
  promotionCode?: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMode: 'LEADER' | 'SPLIT';
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  addons: { addonId: string; quantity: number }[];
  subtotal: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  joinedAt: string;
}

export interface Review {
  id: string;
  tourId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  hostReply?: {
    content: string;
    repliedAt: string;
  };
  reactions: Reaction[];
}

export interface Comment {
  id: string;
  tourId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
  reactions: Reaction[];
}

export interface Reaction {
  id: string;
  userId: string;
  type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY';
  createdAt: string;
}

export interface TourSchedule {
  tourId: string;
  availableDates: {
    date: string;
    remainingSlots: number;
    price: number;
    isAvailable: boolean;
  }[];
}

export interface BookingResult {
  bookingId: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  total: number;
}











