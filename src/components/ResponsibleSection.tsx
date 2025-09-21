import React from 'react'
import { Button } from './ui/button'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const ResponsibleSection: React.FC = () => {
  const checklistItems = [
    'Sử dụng phương tiện thân thiện môi trường',
    'Hỗ trợ cộng đồng địa phương',
    'Giáo dục ý thức bảo vệ thiên nhiên',
    'Cam kết không để lại rác thải'
  ]

  return (
    <section className="bg-emerald-50 py-16 lg:py-24">
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
              <Check className="h-4 w-4 mr-2" />
              Hành trình xanh
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Du lịch có trách nhiệm
                <span className="block text-emerald-600">vì một tương lai xanh</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                ESCE cam kết mang đến các tour du lịch sinh thái bền vững, bảo vệ môi trường và hỗ trợ cộng đồng địa phương. Mỗi chuyến đi là một bước nhỏ vì hành tinh xanh.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Button size="lg" className="group" asChild>
              <Link to="/tours">
                Tìm hiểu thêm
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
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/images/son-tra.jpg"
                  alt="Du lịch sinh thái bền vững"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ResponsibleSection
