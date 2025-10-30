export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export const features: Feature[] = [
  {
    id: '1',
    title: 'Đặt Tour Nhóm Thông Minh',
    description: 'Tạo nhóm dễ dàng, mời bạn bè và nhận ưu đãi hấp dẫn khi đi đông người',
    icon: 'Users'
  },
  {
    id: '2',
    title: 'Du Lịch Sinh Thái Bền Vững',
    description: 'Khám phá thiên nhiên Đà Nẵng với các tour thân thiện môi trường',
    icon: 'Leaf'
  },
  {
    id: '3',
    title: 'An Toàn & Tin Cậy',
    description: 'Đội ngũ hướng dẫn viên chuyên nghiệp, bảo hiểm toàn diện',
    icon: 'Shield'
  },
  {
    id: '4',
    title: 'Ưu Đãi Độc Quyền',
    description: 'Giảm giá lên đến 8% khi đặt tour nhóm từ 12 người trở lên',
    icon: 'Gift'
  }
]











