import React from 'react'
import { Button } from './ui/button'
import { ArrowRight, Users } from 'lucide-react'
import { stats } from '../data/stats'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HeroSection: React.FC = () => {
  return (
    <section className="bg-white py-12 lg:py-20" aria-labelledby="hero-heading">
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
              <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Khám phá Đà Nẵng
                <span className="block text-emerald-600">cùng nhóm bạn</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Đặt tour theo nhóm thông minh, tiết kiệm chi phí và tạo những kỷ niệm đáng nhớ với các tour du lịch sinh thái tại Đà Nẵng.
              </p>
            </div>

            {/* CTA Button */}
            <Button size="lg" className="group" aria-label="Explore tours now" asChild>
              <Link to="/tours">
                Khám phá ngay
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
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
          role="region"
          aria-label="Statistics"
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
  )
}

export default HeroSection
