import React from 'react'
import { Button } from '../ui/button'
import { Grid3X3, List, ArrowUpDown, Filter } from 'lucide-react'

interface ResultsToolbarProps {
  totalResults: number
  sortBy: string
  viewMode: 'grid' | 'list'
  onSortChange: (sortBy: string) => void
  onViewModeChange: (mode: 'grid' | 'list') => void
  onToggleFilters?: () => void
  showMobileFilters?: boolean
}

const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  totalResults,
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onToggleFilters,
  showMobileFilters = false
}) => {
  const sortOptions = [
    { value: 'popular', label: 'Phổ biến' },
    { value: 'price_asc', label: 'Giá thấp → cao' },
    { value: 'price_desc', label: 'Giá cao → thấp' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'newest', label: 'Mới nhất' }
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Results Count */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {totalResults} kết quả
        </h2>
        
        {/* Mobile Filter Toggle */}
        {showMobileFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Sort */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-slate-300 rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-none border-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-none border-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResultsToolbar
