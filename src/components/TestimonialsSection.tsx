import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Star, ChevronRight } from 'lucide-react'
import { reviews } from '../data/reviews'
import { motion } from 'framer-motion'

const TestimonialsSection: React.FC = () => {
  const displayReviews = reviews.slice(0, 3)

  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium shadow-sm">
            Khách hàng nói gì
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
            Trải nghiệm từ khách hàng
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Hơn 1,000+ khách hàng đã tin tưởng và có những trải nghiệm tuyệt vời cùng ESCE Du lịch
          </p>
        </motion.div>

        {/* Review Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {displayReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Star Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote Icon */}
                  <div className="text-6xl text-gray-200 mb-4">"</div>

                  {/* Review Text */}
                  <p className="text-slate-700 mb-6 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Separator */}
                  <div className="border-t border-gray-200 mb-4"></div>

                  {/* Reviewer Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <p className="text-sm text-slate-600">
                        {review.tour} • {review.timeAgo}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-right"
        >
          <Button variant="outline" className="group">
            Xem thêm đánh giá
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection
