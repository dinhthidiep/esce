import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Checkbox } from '../ui/checkbox'
import { Search, Filter, X } from 'lucide-react'

export interface TourFilters {
  search: string
  categories: string[]
  areas: string[]
  priceRange: [number, number]
  duration: string[]
  sortBy: string
}

interface FilterSidebarProps {
  onFiltersChange: (filters: TourFilters) => void
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = React.useState<TourFilters>({
    search: '',
    categories: [],
    areas: [],
    priceRange: [0, 2000000],
    duration: [],
    sortBy: 'popular'
  })

  const categories = [
    'Văn hóa',
    'Sinh thái',
    'Phiêu lưu',
    'Nghỉ dưỡng',
    'Glamping',
    'Camping',
    'Nông nghiệp',
    'Giáo dục'
  ]

  const areas = [
    'Đà Nẵng',
    'Quảng Nam',
    'Huế',
    'Quảng Bình'
  ]

  const durations = [
    { value: 'half-day', label: 'Nửa ngày' },
    { value: '1-day', label: '1 ngày' },
    { value: '2-days', label: '2 ngày' },
    { value: '3-days', label: '3 ngày' }
  ]

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAreaToggle = (area: string) => {
    const areaKey = area.toLowerCase().replace(' ', '')
    const newAreas = filters.areas.includes(areaKey)
      ? filters.areas.filter(a => a !== areaKey)
      : [...filters.areas, areaKey]
    
    const newFilters = { ...filters, areas: newAreas }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDurationToggle = (duration: string) => {
    const newDurations = filters.duration.includes(duration)
      ? filters.duration.filter(d => d !== duration)
      : [...filters.duration, duration]
    
    const newFilters = { ...filters, duration: newDurations }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const newFilters: TourFilters = {
      search: '',
      categories: [],
      areas: [],
      priceRange: [0, 2000000],
      duration: [],
      sortBy: 'popular'
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm tour..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Loại hình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={category}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Khu vực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {areas.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={area}
                  checked={filters.areas.includes(area.toLowerCase().replace(' ', ''))}
                  onCheckedChange={() => handleAreaToggle(area)}
                />
                <label
                  htmlFor={area}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {area}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Khoảng giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Từ: {formatPrice(filters.priceRange[0])}</span>
                <span>Đến: {formatPrice(filters.priceRange[1])}</span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                max={2000000}
                min={0}
                step={50000}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {durations.map((duration) => (
              <div key={duration.value} className="flex items-center space-x-2">
                <Checkbox
                  id={duration.value}
                  checked={filters.duration.includes(duration.value)}
                  onCheckedChange={() => handleDurationToggle(duration.value)}
                />
                <label
                  htmlFor={duration.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {duration.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
      >
        <X className="h-4 w-4 mr-2" />
        Xóa bộ lọc
      </Button>
    </div>
  )
}

export default FilterSidebar