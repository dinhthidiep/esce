import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '~/components/Header'
import Button from '~/components/ui/Button'
import { Card, CardContent } from '~/components/ui/Card'
import LazyImage from '~/components/LazyImage'
import {
  ArrowRightIcon,
  UsersIcon,
  LeafIcon,
  ShieldIcon,
  GiftIcon,
  StarIcon,
  MapPinIcon,
} from '~/components/icons'
import { stats } from '~/data/stats'
// Sử dụng đường dẫn public URL thay vì import
const baNaHillImage = '/img/banahills.jpg'
import './AboutPage.css'

interface CoreValue {
  id: number
  icon: string
  title: string
  description: string
}

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  const coreValues: CoreValue[] = [
    {
      id: 1,
      icon: 'Leaf',
      title: 'Bền vững',
      description:
        'Cam kết phát triển du lịch sinh thái bền vững, bảo vệ môi trường và gìn giữ văn hóa địa phương.',
    },
    {
      id: 2,
      icon: 'Shield',
      title: 'An toàn',
      description:
        'Đảm bảo an toàn tuyệt đối cho khách hàng với các dịch vụ được kiểm định chất lượng nghiêm ngặt.',
    },
    {
      id: 3,
      icon: 'Users',
      title: 'Cộng đồng',
      description:
        'Xây dựng cộng đồng du lịch có trách nhiệm, kết nối mọi người với thiên nhiên và văn hóa địa phương.',
    },
    {
      id: 4,
      icon: 'Gift',
      title: 'Trải nghiệm',
      description: 'Mang đến những trải nghiệm độc đáo, đáng nhớ và ý nghĩa cho mọi khách hàng.',
    },
  ]

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users: UsersIcon,
    Leaf: LeafIcon,
    Shield: ShieldIcon,
    Gift: GiftIcon,
  }

  return (
    <div className="about-page">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="about-hero-section" id="hero">
          <div className="about-hero-container">
            <div className={`about-hero-content ${isVisible ? 'fade-in-up' : ''}`}>
              <div className="about-hero-badge">
                <LeafIcon className="badge-icon" aria-hidden="true" />
                <span>Về chúng tôi</span>
              </div>
              <h1 className="about-hero-title">
                ESCE Du Lịch Sinh Thái
                <span className="about-hero-title-highlight"> Đà Nẵng</span>
              </h1>
              <p className="about-hero-description">
                Chúng tôi là đơn vị tiên phong trong lĩnh vực du lịch sinh thái tại Đà Nẵng, chuyên cung cấp
                các dịch vụ du lịch bền vững, thân thiện với môi trường và mang lại trải nghiệm tuyệt vời
                cho khách hàng.
              </p>
            </div>
          </div>
        </section>

        {/* About Company Section */}
        <section className="about-company-section" id="company" aria-labelledby="company-title">
          <div className="section-container">
            <div className="about-company-grid">
              <div className={`about-company-content ${isVisible ? 'fade-in-left' : ''}`}>
                <h2 id="company-title" className="section-title">
                  Câu chuyện của chúng tôi
                </h2>
                <div className="about-company-text">
                  <p>
                    ESCE Du Lịch Sinh Thái được thành lập với sứ mệnh mang đến những trải nghiệm du lịch độc
                    đáo, bền vững tại Đà Nẵng - một trong những điểm đến du lịch hàng đầu Việt Nam.
                  </p>
                  <p>
                    Với đội ngũ chuyên nghiệp, giàu kinh nghiệm và đam mê du lịch, chúng tôi không chỉ cung
                    cấp dịch vụ đặt tour theo nhóm thông minh mà còn cam kết góp phần bảo vệ môi trường và
                    phát triển du lịch bền vững.
                  </p>
                  <p>
                    Chúng tôi tin rằng du lịch không chỉ là khám phá mà còn là cơ hội để kết nối với thiên
                    nhiên, hiểu biết về văn hóa địa phương và tạo ra những kỷ niệm đáng nhớ cùng bạn bè, gia
                    đình.
                  </p>
                </div>
              </div>
              <div className={`about-company-image ${isVisible ? 'fade-in-right' : ''}`}>
                <div className="about-image-wrapper">
                  <LazyImage
                    src={baNaHillImage}
                    alt="Du lịch sinh thái Đà Nẵng"
                    className="about-img"
                    fallbackSrc={baNaHillImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="mission-vision-section" id="mission" aria-labelledby="mission-title">
          <div className="section-container">
            <div className="mission-vision-grid">
              <Card className={`mission-card ${isVisible ? 'fade-in-up' : ''}`}>
                <CardContent className="mission-content">
                  <div className="mission-icon-wrapper">
                    <div className="mission-icon-bg">
                      <StarIcon className="mission-icon" />
                    </div>
                  </div>
                  <h3 className="mission-title">Sứ mệnh</h3>
                  <p className="mission-text">
                    Mang đến những trải nghiệm du lịch sinh thái bền vững, chất lượng cao tại Đà Nẵng, góp
                    phần bảo vệ môi trường và phát triển du lịch có trách nhiệm. Chúng tôi cam kết tạo ra giá
                    trị cho khách hàng, cộng đồng địa phương và thiên nhiên.
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`vision-card ${isVisible ? 'fade-in-up' : ''}`}
                style={{ animationDelay: '0.2s' }}
              >
                <CardContent className="vision-content">
                  <div className="vision-icon-wrapper">
                    <div className="vision-icon-bg">
                      <MapPinIcon className="vision-icon" />
                    </div>
                  </div>
                  <h3 className="vision-title">Tầm nhìn</h3>
                  <p className="vision-text">
                    Trở thành đơn vị dẫn đầu trong lĩnh vực du lịch sinh thái tại miền Trung Việt Nam, được
                    công nhận về chất lượng dịch vụ, tính bền vững và đóng góp tích cực cho cộng đồng. Chúng
                    tôi hướng tới việc xây dựng một hệ sinh thái du lịch xanh, thông minh và phát triển bền
                    vững.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="values-section" id="values" aria-labelledby="values-title">
          <div className="section-container">
            <div className="section-header">
              <h2 id="values-title" className="section-title">
                Giá trị cốt lõi
              </h2>
              <p className="section-subtitle">Những giá trị định hướng mọi hoạt động và quyết định của chúng tôi</p>
            </div>

            <div className="values-grid">
              {coreValues.map((value, index) => {
                const IconComponent = iconMap[value.icon]

                return (
                  <article
                    key={value.id}
                    className={`value-card ${isVisible ? 'fade-in-up' : ''}`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <Card className="value-card-inner">
                      <CardContent className="value-content">
                        <div className="value-icon-wrapper" aria-hidden="true">
                          <div className="value-icon-bg">
                            {IconComponent && <IconComponent className="value-icon" />}
                          </div>
                        </div>
                        <h3 className="value-title">{value.title}</h3>
                        <p className="value-description">{value.description}</p>
                      </CardContent>
                    </Card>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats-section" id="stats" aria-labelledby="stats-title">
          <div className="section-container">
            <div className="section-header">
              <h2 id="stats-title" className="section-title">
                Thành tựu của chúng tôi
              </h2>
              <p className="section-subtitle">Những con số thể hiện sự tin tưởng và hài lòng của khách hàng</p>
            </div>

            <div className={`about-stats-grid ${isVisible ? 'fade-in-up' : ''}`}>
              {stats.map((stat) => (
                <div key={stat.id} className="about-stat-item">
                  <div className={`about-stat-value ${stat.color}`} aria-label={stat.value}>
                    {stat.value}
                  </div>
                  <div className="about-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta-section" id="cta" aria-labelledby="cta-title">
          <div className="section-container">
            <div className={`about-cta-content ${isVisible ? 'fade-in-up' : ''}`}>
              <h2 id="cta-title" className="about-cta-title">
                Sẵn sàng khám phá cùng chúng tôi?
              </h2>
              <p className="about-cta-subtitle">
                Hãy để chúng tôi mang đến cho bạn những trải nghiệm du lịch sinh thái tuyệt vời và ý nghĩa
                nhất tại Đà Nẵng.
              </p>
              <div className="about-cta-buttons">
                <Button size="lg" className="about-cta-button-primary" asChild>
                  <Link to="/services" aria-label="Khám phá các dịch vụ du lịch ngay">
                    Khám phá dịch vụ ngay
                    <ArrowRightIcon className="btn-icon" aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="about-cta-button-secondary" asChild>
                  <Link to="/contact" aria-label="Liên hệ với chúng tôi">
                    Liên hệ với chúng tôi
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AboutPage

