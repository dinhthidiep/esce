import React from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  ArrowRight, 
  Users, 
  Leaf, 
  Shield, 
  Gift,
  Star,
  CheckCircle,
  MapPin,
  Clock,
  Heart
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { stats } from '../data/stats'
import { features } from '../data/features'
import { reviews } from '../data/reviews'
import { popularTours } from '../data/tours'
import { formatPrice } from '../lib/utils'

const LandingPage: React.FC = () => {
  const displayTours = popularTours.slice(0, 6)
  const displayReviews = reviews.slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                  <Users className="h-4 w-4 mr-2" />
                  Du lịch sinh thái bền vững
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Khám phá Đà Nẵng
                    <span className="block text-emerald-600">cùng nhóm bạn</span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Đặt tour theo nhóm thông minh, tiết kiệm chi phí và tạo những kỷ niệm đáng nhớ 
                    với các tour du lịch sinh thái tại Đà Nẵng.
                  </p>
                </div>

                {/* CTA Button */}
                <Button size="lg" className="group" asChild>
                  <Link to="/tours">
                    Khám phá ngay
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>

              {/* Right Column - Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/ba-na-hill.jpg"
                    alt="Du lịch sinh thái Đà Nẵng"
                    className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                  />
                </div>
              </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Tại sao chọn ESCE Du lịch?
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Chúng tôi mang đến trải nghiệm du lịch sinh thái độc đáo với công nghệ đặt tour nhóm tiên tiến
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => {
                const iconMap = {
                  Users,
                  Leaf,
                  Shield,
                  Gift
                }
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
                
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="h-full text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-8">
                        <div className="flex justify-center mb-6">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <IconComponent className="h-8 w-8 text-emerald-600" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Popular Tours Section */}
        <section className="py-16 lg:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-16"
            >
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Tour được yêu thích nhất
                </h2>
                <p className="text-lg text-slate-600">
                  Khám phá những điểm đến tuyệt vời nhất Đà Nẵng
                </p>
              </div>
              
              <Button variant="outline" className="group self-start sm:self-center" asChild>
                <Link to="/tours">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="relative overflow-hidden">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
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
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {tour.name}
                      </h3>

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

                      <div className="flex items-center justify-between mb-4">
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

                      <Button variant="outline" className="w-full group" asChild>
                        <Link to={`/tours/${tour.slug}`}>
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

        {/* Testimonials Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Trải nghiệm từ khách hàng
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Hơn 1,000+ khách hàng đã tin tưởng và có những trải nghiệm tuyệt vời cùng ESCE Du lịch
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
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

                      <div className="text-6xl text-gray-200 mb-4">"</div>

                      <p className="text-slate-700 mb-6 leading-relaxed">
                        {review.comment}
                      </p>

                      <div className="border-t border-gray-200 mb-4"></div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 font-bold text-sm">
                            {review.initials}
                          </span>
                        </div>
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-8"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Sẵn sàng khám phá cùng chúng tôi?
              </h2>
              <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
                Hãy để chúng tôi mang đến cho bạn những trải nghiệm du lịch sinh thái 
                tuyệt vời và ý nghĩa nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50" asChild>
                  <Link to="/tours">
                    Khám phá tour ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600" asChild>
                  <Link to="/about">
                    Tìm hiểu thêm
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage