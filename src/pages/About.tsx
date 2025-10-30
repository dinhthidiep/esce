import React from 'react';
import Header from '../components/Header';
import NewsletterFooterSection from '../components/NewsletterFooterSection';
import { motion } from 'framer-motion';
import { 
  Users, 
  Globe
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-600 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-4 py-2 text-sm font-medium">
                Du lịch sinh thái Đà Nẵng
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            >
              Về chúng tôi
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl max-w-7xl text-center mx-auto opacity-90 leading-relaxed"
            >
              Du lịch sinh thái Đà Nẵng là nền tảng kỹ thuật số được phát triển nhằm thúc đẩy và quản lý các hoạt động du lịch sinh thái tại Đà Nẵng. Chúng tôi tạo ra cầu nối giữa thiên nhiên – con người – công nghệ.
            </motion.p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-1 h-8 bg-emerald-600 rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Giới thiệu chung
                  </h2>
                </div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Du lịch sinh thái Đà Nẵng là một nền tảng kỹ thuật số được phát triển nhằm thúc đẩy và quản lý các hoạt động du lịch sinh thái tại Đà Nẵng.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Hệ thống giúp kết nối du khách với chủ cơ sở du lịch sinh thái địa phương như khu cắm trại, glamping, farmstay, đồng thời đảm bảo vận hành minh bạch và hiệu quả dưới sự giám sát của quản trị viên.
                </p>
                <div className="bg-emerald-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                  <p className="text-emerald-800 font-medium italic">
                    "Với Du lịch sinh thái Đà Nẵng, chúng tôi hướng đến việc số hoá mô hình du lịch bền vững, tạo ra cầu nối giữa thiên nhiên – con người – công nghệ."
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative flex items-center justify-center h-full"
              >
                <img
                  src="/images/about_1.jpg"
                  alt="Biển Mỹ Khê Đà Nẵng"
                  className="rounded-3xl shadow-lg w-full max-w-3xl object-cover aspect-[4/3] border-4 border-emerald-100"
                  style={{maxHeight: '500px'}}
                  loading="lazy"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Sứ mệnh
              </h2>
              <p className="text-lg text-slate-700 max-w-4xl mx-auto leading-relaxed">
                Chúng tôi tin rằng du lịch sinh thái không chỉ là trải nghiệm nghỉ dưỡng, mà còn là cơ hội để bảo tồn môi trường và hỗ trợ cộng đồng địa phương.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full p-8 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Kết nối & Minh bạch</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Tăng cường tính kết nối và minh bạch giữa du khách và nhà cung cấp dịch vụ.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="h-full p-8 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Hỗ trợ cộng đồng</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Hỗ trợ doanh nghiệp nhỏ và hộ gia đình địa phương phát triển du lịch bền vững.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="h-full p-8 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Trải nghiệm chân thật</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Mang đến cho du khách trải nghiệm chân thật, thân thiện với thiên nhiên.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center py-8">
                <img
                  src="/images/about_2.png"
                  alt="Toàn cảnh thành phố Đà Nẵng"
                  className="rounded-2xl shadow-lg w-full max-w-4xl object-cover aspect-[16/7] border-4 border-blue-100"
                  style={{maxHeight: '460px'}}
                  loading="lazy"
                />
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500 max-w-3xl mx-auto">
                <p className="text-blue-800 font-medium italic">
                  "Chúng tôi mong muốn mỗi chuyến đi qua Du lịch sinh thái Đà Nẵng không chỉ mang lại niềm vui mà còn lan tỏa ý thức bảo vệ thiên nhiên."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Message Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-slate-900 to-emerald-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Thông điệp từ nhóm phát triển
              </h2>
              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed italic mb-8">
                "Chúng tôi mong muốn mỗi du khách khi đến với Đà Nẵng qua Du lịch sinh thái Đà Nẵng không chỉ khám phá thiên nhiên tuyệt đẹp, mà còn góp phần gìn giữ và phát triển nó."
              </blockquote>
              <div className="text-emerald-300">
                <span>Đà Nẵng, Việt Nam • 2024</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Giá trị cốt lõi
              </h2>
              <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                Những nguyên tắc và giá trị định hướng mọi hoạt động của chúng tôi
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="h-full p-6 text-center hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Bền vững</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Cam kết các hoạt động du lịch thân thiện với môi trường và có lợi cho cộng đồng.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="h-full p-6 text-center hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Cộng đồng</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Tạo ra giá trị cho người dân địa phương, tôn trọng văn hóa và truyền thống.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="h-full p-6 text-center hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Chất lượng</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Mang đến những trải nghiệm du lịch chất lượng cao, an toàn và đáng nhớ.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="h-full p-6 text-center hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Đổi mới</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Liên tục tìm kiếm và áp dụng các giải pháp sáng tạo để nâng cao trải nghiệm du lịch.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* System Features Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Tính năng hệ thống
              </h2>
              <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                Du lịch sinh thái Đà Nẵng cung cấp các tính năng quản lý và kết nối toàn diện cho du lịch sinh thái
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Kết nối đa bên</h3>
                  <p className="text-slate-600 text-sm">
                    Kết nối du khách với chủ cơ sở du lịch sinh thái địa phương một cách minh bạch và hiệu quả.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Quản lý minh bạch</h3>
                  <p className="text-slate-600 text-sm">
                    Đảm bảo vận hành minh bạch và hiệu quả dưới sự giám sát của quản trị viên.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Đa dạng loại hình</h3>
                  <p className="text-slate-600 text-sm">
                    Hỗ trợ khu cắm trại, glamping, farmstay và các loại hình du lịch sinh thái khác.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Số hóa thông minh</h3>
                  <p className="text-slate-600 text-sm">
                    Số hóa mô hình du lịch bền vững với công nghệ hiện đại và thân thiện.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Bền vững</h3>
                  <p className="text-slate-600 text-sm">
                    Thúc đẩy du lịch có trách nhiệm với môi trường và cộng đồng địa phương.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Trải nghiệm chân thật</h3>
                  <p className="text-slate-600 text-sm">
                    Mang đến trải nghiệm du lịch chân thật, gần gũi với thiên nhiên và văn hóa địa phương.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-emerald-600 to-blue-600 py-16 lg:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Sẵn sàng khám phá cùng Du lịch sinh thái Đà Nẵng?
              </h2>
              <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                Hãy tham gia cùng chúng tôi để tạo nên những chuyến đi ý nghĩa, bền vững và góp phần bảo vệ thiên nhiên.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 px-8 py-3" asChild>
                  <Link to="/tours">
                    <Globe className="h-5 w-5 mr-2" />
                    Khám phá các tour
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3" asChild>
                  <Link to="/contact">
                    <Users className="h-5 w-5 mr-2" />
                    Liên hệ với chúng tôi
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <NewsletterFooterSection />
    </div>
  );
};

export default About;