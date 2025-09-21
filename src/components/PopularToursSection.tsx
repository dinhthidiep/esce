import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Star, ChevronRight, Eye } from 'lucide-react'
import { popularTours } from '../data/tours'
import { formatPrice } from '../lib/utils'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PopularToursSection: React.FC = () => {
  const displayTours = popularTours.slice(0, 3)

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-16"
        >
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
              Tour được yêu thích nhất
            </h2>
            <p className="text-lg text-slate-600">
              Khám phá những điểm đến tuyệt vời nhất Đà Nẵng
            </p>
          </div>
          
          <Button variant="outline" className="group self-start sm:self-center" asChild>
            <Link to="/tours">
              Xem tất cả
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Tour Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {displayTours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Discount Badge */}
                  {tour.discountPercent && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-4 right-4"
                    >
                      Giảm {tour.discountPercent}%
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Tour Name */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {tour.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(tour.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">
                      ({tour.rating})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatPrice(tour.priceFrom)}
                      </span>
                      {tour.originalPrice && (
                        <span className="text-sm text-slate-500 line-through ml-2">
                          {formatPrice(tour.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button variant="outline" className="w-full group" asChild>
                    <Link to="/tours">
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PopularToursSection
