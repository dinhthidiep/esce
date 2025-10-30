import React from 'react'
import TourCard from './TourCard'
import { Tour } from '../../data/tours'

interface TourGridProps {
  tours: Tour[]
  viewMode: 'grid' | 'list'
  loading?: boolean
  onViewDetails?: (slug: string) => void
  onToggleFavorite?: (id: string) => void
}

const TourGrid: React.FC<TourGridProps> = ({
  tours,
  viewMode,
  loading = false,
  onViewDetails,
  onToggleFavorite
}) => {
  if (loading) {
    return <SkeletonGrid viewMode={viewMode} />
  }

  if (tours.length === 0) {
    return <EmptyState />
  }

  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-6'

  return (
    <div className={gridClasses}>
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          id={tour.id}
          slug={tour.slug}
          name={tour.name}
          area={tour.area}
          category={tour.category}
          days={tour.days}
          rating={tour.rating}
          reviewsCount={tour.reviewsCount}
          priceFrom={tour.priceFrom}
          discountPercent={tour.discountPercent}
          image={tour.image}
          createdAt={tour.createdAt}
          viewMode={viewMode}
          onViewDetails={onViewDetails}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

// Skeleton Loading Component
const SkeletonGrid: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-6'

  return (
    <div className={gridClasses}>
      {[...Array(6)].map((_, index) => (
        <div key={index} className="animate-pulse">
          {viewMode === 'grid' ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-48 bg-slate-200"></div>
              <div className="p-4">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-3"></div>
                <div className="flex space-x-2 mb-3">
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                  <div className="h-6 bg-slate-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded w-20"></div>
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex">
                <div className="w-64 h-48 bg-slate-200"></div>
                <div className="flex-1 p-6">
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Empty State Component
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Không tìm thấy tour nào
        </h3>
        <p className="text-slate-600 mb-6">
          Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
        </p>
        <div className="space-y-2 text-sm text-slate-500">
          <p>• Kiểm tra lại từ khóa tìm kiếm</p>
          <p>• Bỏ bớt một số bộ lọc</p>
          <p>• Thử tìm kiếm với khu vực khác</p>
        </div>
      </div>
    </div>
  )
}

export default TourGrid











