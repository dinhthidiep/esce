export interface DiscountTier {
  id: string
  percentage: number
  minPeople: number
  maxPeople: number
  description: string
  color: string
}

export const discountTiers: DiscountTier[] = [
  {
    id: '1',
    percentage: 2,
    minPeople: 4,
    maxPeople: 6,
    description: '4-6 khách',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    percentage: 4,
    minPeople: 7,
    maxPeople: 10,
    description: '7-10 khách',
    color: 'bg-green-500'
  },
  {
    id: '3',
    percentage: 6,
    minPeople: 11,
    maxPeople: 15,
    description: '11-15 khách',
    color: 'bg-orange-500'
  },
  {
    id: '4',
    percentage: 8,
    minPeople: 16,
    maxPeople: 20,
    description: '16-20 khách',
    color: 'bg-red-500'
  }
]
