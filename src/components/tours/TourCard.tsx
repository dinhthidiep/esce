import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Star, MapPin, Clock, Heart, Eye } from 'lucide-react'
import { formatPrice } from '../../lib/utils'
import { motion } from 'framer-motion'

interface TourCardProps {
  id: string
  slug: string
  name: string
  area: string
  category: string[]
  days: number
  rating: number
  reviewsCount: number
  priceFrom: number
  discountPercent?: number
  image: string
  createdAt: string
  viewMode?: 'grid' | 'list'
  onViewDetails?: (slug: string) => void
  onToggleFavorite?: (id: string) => void
}

const TourCard: React.FC<TourCardProps> = ({
  id,
  slug,
  name,
  area,
  category,
  days,
  rating,
  reviewsCount,
  priceFrom,
  discountPercent,
  image,
  createdAt: _createdAt,
  viewMode = 'grid',
  onViewDetails,
  onToggleFavorite
}) => {
  const isListMode = viewMode === 'list'

  if (isListMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            {/* Image */}
            <div className="relative w-64 h-48 flex-shrink-0">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
              {discountPercent && (
                <Badge variant="destructive" className="absolute top-3 right-3">
                  -{discountPercent}%
                </Badge>
              )}
              <button
                onClick={() => onToggleFavorite?.(id)}
                className="absolute top-3 left-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                aria-label="Thêm vào yêu thích"
              >
                <Heart className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{area}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{days} ngày</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(priceFrom)}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category.slice(0, 2).map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">
                    {rating} ({reviewsCount} đánh giá)
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onViewDetails?.(slug)}
                  className="group"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {discountPercent && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              -{discountPercent}%
            </Badge>
          )}
          
          <button
            onClick={() => onToggleFavorite?.(id)}
            className="absolute top-3 left-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            aria-label="Thêm vào yêu thích"
          >
            <Heart className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
              {name}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{area}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{days} ngày</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-3">
            {category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-600">
              {rating} ({reviewsCount})
            </span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-emerald-600">
                {formatPrice(priceFrom)}
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => onViewDetails?.(slug)}
              className="group"
            >
              <Eye className="mr-2 h-4 w-4" />
              Chi tiết
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TourCard
