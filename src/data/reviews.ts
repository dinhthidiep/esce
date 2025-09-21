export interface Review {
  id: string
  name: string
  initials: string
  rating: number
  comment: string
  tour: string
  timeAgo: string
  avatar?: string
}

export const reviews: Review[] = [
  {
    id: '1',
    name: 'Nguyễn Thị Lan',
    initials: 'NTL',
    rating: 5,
    comment: 'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, địa điểm đẹp. Đặc biệt là tính năng đặt nhóm giúp tiết kiệm rất nhiều chi phí.',
    tour: 'Tour Bà Nà Hills',
    timeAgo: '2 tuần trước'
  },
  {
    id: '2',
    name: 'Trần Văn Nam',
    initials: 'TVN',
    rating: 5,
    comment: 'ESCE thực sự quan tâm đến môi trường. Cảm giác tham gia tour ở đây rất ý nghĩa, vừa vui vẻ vừa bảo vệ thiên nhiên.',
    tour: 'Tour Sơn Trà',
    timeAgo: '1 tháng trước'
  },
  {
    id: '3',
    name: 'Lê Thị Mai',
    initials: 'LTM',
    rating: 5,
    comment: 'Đặt tour nhóm 10 người được giảm 12%. App rất dễ sử dụng, chia sẻ link cho bạn bè rất tiện lợi!',
    tour: 'Tour Hội An',
    timeAgo: '3 tuần trước'
  },
  {
    id: '4',
    name: 'Phạm Đức Minh',
    initials: 'PDM',
    rating: 5,
    comment: 'Dịch vụ chuyên nghiệp, hướng dẫn viên am hiểu về lịch sử và văn hóa địa phương. Sẽ quay lại!',
    tour: 'Tour Ngũ Hành Sơn',
    timeAgo: '1 tuần trước'
  },
  {
    id: '5',
    name: 'Hoàng Thị Hoa',
    initials: 'HTH',
    rating: 5,
    comment: 'Tour sinh thái rất hay, con tôi học được nhiều điều về bảo vệ môi trường. Cảm ơn ESCE!',
    tour: 'Tour Cù Lao Chàm',
    timeAgo: '2 tuần trước'
  },
  {
    id: '6',
    name: 'Võ Minh Tuấn',
    initials: 'VMT',
    rating: 5,
    comment: 'Trải nghiệm lặn biển tuyệt vời! Nước biển trong xanh, san hô đẹp. Hướng dẫn viên an toàn và chuyên nghiệp.',
    tour: 'Tour Mỹ Khê',
    timeAgo: '5 ngày trước'
  }
]
