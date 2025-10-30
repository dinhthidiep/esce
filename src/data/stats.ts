export interface Stat {
  id: string
  value: string
  label: string
  color: string
  icon?: string
}

export const stats: Stat[] = [
  {
    id: '1',
    value: '1,284+',
    label: 'Khách hàng',
    color: 'text-emerald-600',
    icon: 'Users'
  },
  {
    id: '2',
    value: '127',
    label: 'Nhóm tour',
    color: 'text-blue-600',
    icon: 'UserGroup'
  },
  {
    id: '3',
    value: '4.8★',
    label: 'Đánh giá',
    color: 'text-orange-600',
    icon: 'Star'
  }
]











