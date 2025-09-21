import React from 'react'
import { Button } from './ui/button'
import { Users, Flame } from 'lucide-react'
import { discountTiers } from '../data/discountTiers'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const GroupDiscountSection: React.FC = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium shadow-sm">
            <Flame className="h-4 w-4 mr-2" />
            Ưu đãi đặc biệt
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
            Ưu đãi đặc biệt cho nhóm
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Tạo nhóm tour cùng bạn bè và nhận ngay ưu đãi hấp dẫn. Tiết kiệm lên đến 8% khi đi nhóm đông người!
          </p>
        </motion.div>

        {/* Discount Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {discountTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center cursor-pointer"
            >
              {/* Percentage Circle */}
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {tier.percentage}%
                  </span>
                </div>
              </div>

              {/* Group Size */}
              <h3 className="text-sm font-medium text-slate-600 mb-3">
                {tier.description}
              </h3>

              {/* Discount Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${tier.color}`}>
                Giảm {tier.percentage}%
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Bắt đầu tạo nhóm tour ngay hôm nay!
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group" asChild>
              <Link to="/tours">
                <Users className="mr-2 h-5 w-5" />
                Tạo nhóm tour
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/tours">
                Tham gia nhóm có sẵn
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default GroupDiscountSection
