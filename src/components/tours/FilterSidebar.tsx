import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterSidebarProps {
  onFiltersChange: (filters: TourFilters) => void
  className?: string
}

export interface TourFilters {
  search: string
  categories: string[]
  areas: string[]
  priceRange: [number, number]
  duration: string[]
  sortBy: string
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFiltersChange, className = '' }) => {
  const [filters, setFilters] = useState<TourFilters>({
    search: '',
    categories: [],
    areas: [],
    priceRange: [0, 5000000],
    duration: [],
    sortBy: 'popular'
  })

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    categories: true,
    areas: true,
    price: true,
    duration: true
  })

  const categories = [
    { id: 'Sinh thái', label: 'Du lịch sinh thái', count: 4 },
    { id: 'Văn hóa', label: 'Văn hóa', count: 5 },
    { id: 'Phiêu lưu', label: 'Phiêu lưu', count: 3 },
    { id: 'Nghỉ dưỡng', label: 'Nghỉ dưỡng', count: 2 }
  ]

  const areas = [
    { id: 'danang', label: 'Đà Nẵng', count: 4 },
    { id: 'quangnam', label: 'Quảng Nam', count: 2 }
  ]

  const durations = [
    { id: 'half-day', label: 'Nửa ngày' },
    { id: '1-day', label: '1 ngày' },
    { id: '2-days', label: '2 ngày' },
    { id: '3-days', label: '3 ngày' }
  ]

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilters = (newFilters: Partial<TourFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    updateFilters({ categories: newCategories })
  }

  const toggleArea = (areaId: string) => {
    const newAreas = filters.areas.includes(areaId)
      ? filters.areas.filter(id => id !== areaId)
      : [...filters.areas, areaId]
    updateFilters({ areas: newAreas })
  }

  const toggleDuration = (durationId: string) => {
    const newDurations = filters.duration.includes(durationId)
      ? filters.duration.filter(id => id !== durationId)
      : [...filters.duration, durationId]
    updateFilters({ duration: newDurations })
  }

  const clearAllFilters = () => {
    const clearedFilters: TourFilters = {
      search: '',
      categories: [],
      areas: [],
      priceRange: [0, 5000000],
      duration: [],
      sortBy: 'popular'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.areas.length > 0 || 
                          filters.duration.length > 0 ||
                          filters.search.length > 0

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 sticky top-20 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-emerald-600 hover:text-emerald-700"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('search')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-slate-900">Tìm kiếm</h4>
          {expandedSections.search ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.search && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm tour..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-slate-900">Loại tour</h4>
          {expandedSections.categories ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{category.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">({category.count})</span>
                      {filters.categories.includes(category.id) && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Areas */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('areas')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-slate-900">Khu vực</h4>
          {expandedSections.areas ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.areas && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => toggleArea(area.id)}
                    className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{area.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">({area.count})</span>
                      {filters.areas.includes(area.id) && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('duration')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-slate-900">Thời gian</h4>
          {expandedSections.duration ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.duration && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {durations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => toggleDuration(duration.id)}
                    className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{duration.label}</span>
                    {filters.duration.includes(duration.id) && (
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-slate-900">Giá tour</h4>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>0 VNĐ</span>
                    <span>5.000.000 VNĐ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilters({ 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)] 
                    })}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-sm text-emerald-600 font-medium">
                    Dưới {filters.priceRange[1].toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Bộ lọc đang áp dụng</h4>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map((categoryId) => {
              const category = categories.find(c => c.id === categoryId)
              return (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {category?.label}
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
            {filters.areas.map((areaId) => {
              const area = areas.find(a => a.id === areaId)
              return (
                <Badge key={areaId} variant="secondary" className="text-xs">
                  {area?.label}
                  <button
                    onClick={() => toggleArea(areaId)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterSidebar
