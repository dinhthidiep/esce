import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Award } from 'lucide-react'
import { motion } from 'framer-motion'

const NewsletterFooterSection: React.FC = () => {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock subscription logic
    alert('Cảm ơn bạn đã đăng ký nhận thông tin!')
    setEmail('')
  }

  return (
    <section className="bg-emerald-600 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Đăng ký nhận thông tin tour mới
              </h2>
              <p className="text-emerald-100 text-lg">
                Nhận ngay những ưu đãi độc quyền và thông tin về các tour du lịch sinh thái mới nhất
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border-emerald-300 focus:border-emerald-400"
                required
              />
              <Button 
                type="submit" 
                className="bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-300"
              >
                Đăng ký
              </Button>
            </form>
          </motion.div>

          {/* Right Column - Contact & Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-emerald-200" />
                  <span className="text-white">+84 236 3123 456</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-emerald-200" />
                  <span className="text-white">info@esce-danang.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-emerald-200" />
                  <span className="text-white">123 Nguyễn Văn Linh, Đà Nẵng</span>
                </div>
              </div>
            </div>

            {/* Certification */}
            <div className="border-t border-emerald-500 pt-6">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="h-5 w-5 text-emerald-200" />
                <h4 className="text-lg font-bold text-white">
                  Chứng nhận du lịch bền vững
                </h4>
              </div>
              <p className="text-emerald-100 text-sm">
                Bộ Văn hóa, Thể thao và Du lịch Việt Nam
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Theo dõi chúng tôi</h4>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-white" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}

export default NewsletterFooterSection
