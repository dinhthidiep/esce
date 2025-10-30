import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  CheckCircle,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Địa chỉ',
      content: '123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng',
      description: 'Văn phòng chính của chúng tôi'
    },
    {
      icon: Phone,
      title: 'Điện thoại',
      content: '+84 236 3123 456',
      description: 'Hotline 24/7 hỗ trợ khách hàng'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@esce-danang.com',
      description: 'Liên hệ qua email'
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      content: '8:00 - 18:00 (T2-T7)',
      description: 'Thời gian phục vụ khách hàng'
    }
  ]

  const faqs = [
    {
      question: 'Làm thế nào để đặt tour?',
      answer: 'Bạn có thể đặt tour trực tiếp trên website hoặc gọi hotline. Chúng tôi hỗ trợ đặt tour cá nhân và tour nhóm với ưu đãi hấp dẫn.'
    },
    {
      question: 'Tour có thể hủy không?',
      answer: 'Có, bạn có thể hủy tour miễn phí trước 24h. Hủy trong vòng 24h sẽ tính phí 50% giá tour.'
    },
    {
      question: 'Có bảo hiểm du lịch không?',
      answer: 'Tất cả tour đều bao gồm bảo hiểm du lịch cơ bản. Bạn có thể mua thêm bảo hiểm nâng cao nếu cần.'
    },
    {
      question: 'Thanh toán như thế nào?',
      answer: 'Chúng tôi hỗ trợ thanh toán qua chuyển khoản, thẻ tín dụng, ví điện tử và tiền mặt tại văn phòng.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-sm font-medium px-4 py-2">
                <MessageCircle className="h-4 w-4 mr-2" />
                Liên hệ & Hỗ trợ
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900">
                Liên hệ với chúng tôi
              </h1>
              
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
                Hãy liên hệ với chúng tôi để được tư vấn miễn phí về các tour du lịch sinh thái.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <info.icon className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {info.title}
                      </h3>
                      <p className="text-slate-900 font-medium mb-2">
                        {info.content}
                      </p>
                      <p className="text-sm text-slate-600">
                        {info.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-16 lg:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      Gửi tin nhắn cho chúng tôi
                    </CardTitle>
                    <p className="text-slate-600">
                      Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn trong vòng 24h
                    </p>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          Cảm ơn bạn!
                        </h3>
                        <p className="text-slate-600">
                          Chúng tôi đã nhận được tin nhắn của bạn và sẽ liên hệ lại sớm nhất.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Họ và tên *
                            </label>
                            <Input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              placeholder="Nhập họ và tên"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              placeholder="Nhập email"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Số điện thoại
                            </label>
                            <Input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Nhập số điện thoại"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Chủ đề
                            </label>
                            <Input
                              type="text"
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              placeholder="Chủ đề liên hệ"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tin nhắn *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Nhập tin nhắn của bạn..."
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Đang gửi...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Gửi tin nhắn
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Map & Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Map Placeholder */}
                <Card>
                  <CardContent className="p-0">
                    <div className="h-64 bg-slate-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Bản đồ vị trí văn phòng</p>
                        <p className="text-sm text-slate-500">123 Nguyễn Văn Linh, Đà Nẵng</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Theo dõi chúng tôi
                    </CardTitle>
                    <p className="text-slate-600">
                      Cập nhật tin tức và ưu đãi mới nhất
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <a 
                        href="#" 
                        className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-6 w-6 text-white" />
                      </a>
                      <a 
                        href="#" 
                        className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-6 w-6 text-white" />
                      </a>
                      <a 
                        href="#" 
                        className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-6 w-6 text-white" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Câu hỏi thường gặp
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Những câu hỏi phổ biến mà khách hàng thường hỏi chúng tôi
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Contact













