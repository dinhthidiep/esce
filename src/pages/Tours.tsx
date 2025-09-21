import React, { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import FilterSidebar, { TourFilters } from '../components/tours/FilterSidebar'
import ResultsToolbar from '../components/tours/ResultsToolbar'
import TourGrid from '../components/tours/TourGrid'
import Pagination from '../components/tours/Pagination'
import { popularTours } from '../data/tours'
import { motion } from 'framer-motion'

const Tours: React.FC = () => {
  const [filters, setFilters] = useState<TourFilters>({
    search: '',
    categories: [],
    areas: [],
    priceRange: [0, 2000000],
    duration: [],
    sortBy: 'popular'
  })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const itemsPerPage = 9

  // Filter and sort tours
  const filteredTours = useMemo(() => {
    let filtered = [...popularTours]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(tour =>
        tour.name.toLowerCase().includes(searchLower) ||
        tour.area.toLowerCase().includes(searchLower) ||
        tour.description.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(tour =>
        filters.categories.some(cat => tour.category.includes(cat))
      )
    }

    // Area filter
    if (filters.areas.length > 0) {
      filtered = filtered.filter(tour =>
        filters.areas.includes(tour.area.toLowerCase().replace(' ', ''))
      )
    }

    // Price filter
    filtered = filtered.filter(tour =>
      tour.priceFrom >= filters.priceRange[0] && tour.priceFrom <= filters.priceRange[1]
    )

    // Duration filter
    if (filters.duration.length > 0) {
      filtered = filtered.filter(tour => {
        const tourDuration = tour.days === 1 ? '1-day' : 
                           tour.days <= 1 ? 'half-day' : 
                           tour.days <= 2 ? '2-days' : '3-days'
        return filters.duration.includes(tourDuration)
      })
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.priceFrom - b.priceFrom)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.priceFrom - a.priceFrom)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default: // popular
        filtered.sort((a, b) => b.reviewsCount - a.reviewsCount)
    }

    return filtered
  }, [filters])

  // Pagination
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTours = filteredTours.slice(startIndex, startIndex + itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleFiltersChange = (newFilters: TourFilters) => {
    setFilters(newFilters)
  }

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const handleViewDetails = (slug: string) => {
    // Navigate to tour detail page
    console.log('View tour details:', slug)
  }

  const handleToggleFavorite = (id: string) => {
    // Toggle favorite status
    console.log('Toggle favorite:', id)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Khám phá các tour du lịch
            </h1>
            <p className="text-slate-600">
              Tìm kiếm và đặt tour du lịch sinh thái phù hợp với bạn
            </p>
          </div>

          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Bộ lọc</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-slate-100 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <FilterSidebar onFiltersChange={handleFiltersChange} />
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block">
              <FilterSidebar onFiltersChange={handleFiltersChange} />
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Results Toolbar */}
              <ResultsToolbar
                totalResults={filteredTours.length}
                sortBy={filters.sortBy}
                viewMode={viewMode}
                onSortChange={handleSortChange}
                onViewModeChange={setViewMode}
                onToggleFilters={() => setShowMobileFilters(true)}
                showMobileFilters={true}
              />

              {/* Tour Grid */}
              <TourGrid
                tours={paginatedTours}
                viewMode={viewMode}
                loading={loading}
                onViewDetails={handleViewDetails}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Tours
