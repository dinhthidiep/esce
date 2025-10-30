import React from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const quickLinks = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Tours', href: '/tours', icon: Search },
    { name: 'Về chúng tôi', href: '/about', icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            {/* 404 Illustration */}
            <div className="relative">
              <div className="text-9xl font-bold text-emerald-100 mb-4">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Search className="h-16 w-16 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Trang không tìm thấy
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
                Hãy kiểm tra lại URL hoặc quay về trang chủ.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Quay lại
              </Button>
              <Button size="lg" asChild>
                <Link to="/">
                  <Home className="h-5 w-5 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
            </div>

            {/* Quick Links */}
            <Card className="mt-12">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Có thể bạn đang tìm kiếm:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        className="block p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <link.icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-slate-900 group-hover:text-emerald-700">
                            {link.name}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Cần hỗ trợ?
              </h3>
              <p className="text-slate-600 mb-4">
                Nếu bạn vẫn gặp khó khăn, hãy liên hệ với chúng tôi để được hỗ trợ.
              </p>
              <Button variant="outline" asChild>
                <Link to="/contact">
                  Liên hệ hỗ trợ
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default NotFound













