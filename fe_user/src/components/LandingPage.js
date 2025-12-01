import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import LazyImage from './LazyImage';
import { 
  ArrowRightIcon, 
  UsersIcon, 
  LeafIcon, 
  ShieldIcon, 
  GiftIcon, 
  StarIcon 
} from './icons';
import { stats } from '../data/stats';
import { features } from '../data/features';
import { reviews } from '../data/reviews';
import { popularServices } from '../data/services';
import { formatPrice, createSlug, getImageUrl } from '../lib/utils';
import { useTours } from '../hooks/useTours';
import { API_BASE_URL } from '../config/api';
import './LandingPage.css';

// Sử dụng đường dẫn public URL thay vì import
const baNaHillImage = '/img/banahills.jpg';

const iconMap = {
  Users: UsersIcon,
  Leaf: LeafIcon,
  Shield: ShieldIcon,
  Gift: GiftIcon
};

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [ratings, setRatings] = useState({}); // Map serviceId -> rating
  const [ratingsLoaded, setRatingsLoaded] = useState(false); // Flag để biết ratings đã load xong
  const { tours, loading, error } = useTours();
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    // Scroll to top khi vào trang
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [location.pathname]);

  // Kiểm tra nếu user vừa đăng nhập/đăng ký
  useEffect(() => {
    // Kiểm tra cả localStorage và sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    
    if (token && userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        setUserInfo(user);
        
        // Kiểm tra nếu có flag "justLoggedIn" trong sessionStorage
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (justLoggedIn === 'true') {
          setShowWelcomeMessage(true);
          sessionStorage.removeItem('justLoggedIn');
          
          // Tự động ẩn message sau 5 giây
          setTimeout(() => {
            setShowWelcomeMessage(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
  }, []);

  // Fetch ratings for all services
  useEffect(() => {
    const fetchRatings = async () => {
      if (!tours || tours.length === 0) return;

      const ratingPromises = tours.map(async (tour) => {
        const id = tour.Id !== undefined ? tour.Id : (tour.id !== undefined ? tour.id : null);
        if (!id) return null;

        try {
          const response = await axios.get(`${API_BASE_URL}/Review/servicecombo/${id}/average-rating`);
          const rating = response.data.AverageRating || 0;
          return { id, rating: parseFloat(rating) || 0 };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Không thể lấy rating cho service ${id}:`, error);
          }
          return { id, rating: 0 };
        }
      });

      const ratingResults = await Promise.all(ratingPromises);
      const ratingsMap = {};
      ratingResults.forEach(result => {
        if (result) {
          ratingsMap[result.id] = result.rating;
        }
      });
      setRatings(ratingsMap);
      setRatingsLoaded(true);
    };

    fetchRatings();
  }, [tours]);

  // Map dữ liệu từ API sang format mà ServiceCard cần
  // API trả về PascalCase (Id, Name, Price, etc.) nhưng có thể map tự động
  const mapServiceComboToService = useMemo(() => {
    return (serviceCombo) => {
    // Xử lý cả PascalCase và camelCase - ưu tiên PascalCase vì API trả về PascalCase
    const id = serviceCombo.Id !== undefined ? serviceCombo.Id : (serviceCombo.id !== undefined ? serviceCombo.id : null);
    const name = serviceCombo.Name || serviceCombo.name || '';
    // Ưu tiên PascalCase vì API trả về PascalCase
    const imagePath = serviceCombo.Image || serviceCombo.image || '';
    
    // Xử lý trường hợp có nhiều ảnh phân cách bởi dấu phẩy - lấy ảnh đầu tiên cho card
    let firstImage = imagePath;
    if (imagePath && typeof imagePath === 'string' && imagePath.includes(',')) {
      firstImage = imagePath.split(',')[0].trim();
    }
    
    // Sử dụng getImageUrl để xử lý đường dẫn ảnh từ database
    const image = getImageUrl(firstImage, baNaHillImage);
    
    // Debug: Log để kiểm tra
    if (!imagePath || imagePath.trim() === '') {
      console.warn(`  [LandingPage] Service ${id} (${name}) không có imagePath, dùng fallback: ${image}`);
    } else {
      console.log(`[LandingPage] Service ${id} (${name}): imagePath="${imagePath}" → image="${image}"`);
    }
    
    const address = serviceCombo.Address || serviceCombo.address || '';
    const price = parseFloat(serviceCombo.Price || serviceCombo.price || 0);
    const availableSlots = serviceCombo.AvailableSlots !== undefined 
      ? serviceCombo.AvailableSlots 
      : (serviceCombo.availableSlots !== undefined ? serviceCombo.availableSlots : 0);
    const status = serviceCombo.Status || serviceCombo.status || 'open';

    // Lấy rating từ state, mặc định là 0 nếu chưa có
    const serviceRating = ratings[id] !== undefined ? ratings[id] : 0;

    const mappedService = {
      id: id,
      name: name,
      slug: createSlug(name) || `service-${id}`,
      image: image,
      address: address,
      rating: serviceRating, // Rating từ API
      priceFrom: price,
      originalPrice: null, // Có thể tính từ discount nếu có
      discountPercent: null, // Có thể tính từ price và originalPrice
      availableSlots: availableSlots,
      status: status
    };

    console.log(`   → [LandingPage] Mapped service object:`, mappedService);
    return mappedService;
    };
  }, [ratings]);

  // Sử dụng dữ liệu từ API, fallback về dữ liệu tĩnh nếu có lỗi hoặc không có dữ liệu
  const displayServices = useMemo(() => {
    if (loading) {
      return []; // Hoặc có thể return skeleton data
    }
    
    if (error || !tours || tours.length === 0) {
      // Fallback về dữ liệu tĩnh nếu API lỗi hoặc không có dữ liệu
      console.warn(' Không thể lấy dữ liệu từ API, sử dụng dữ liệu tĩnh');
      return popularServices.slice(0, 6);
    }

    console.log('[LandingPage] Dữ liệu tours từ API:', tours);
    console.log('[LandingPage] Số lượng tours:', tours.length);
    
    // Kiểm tra dữ liệu từ API
    if (tours.length > 0) {
      console.log('[LandingPage] Sample tour từ API:', tours[0]);
      console.log('[LandingPage] Sample tour Image:', tours[0].Image || tours[0].image);
    }

    // Lọc các service có status 'open' và map sang format cần thiết
    // Xử lý cả PascalCase và camelCase - ưu tiên PascalCase
    const activeServices = tours
      .filter(service => {
        const status = service.Status || service.status || 'open';
        const isOpen = status.toLowerCase() === 'open';
        if (!isOpen) {
          console.log(`  [LandingPage] Bỏ qua service có status: ${status}`);
        }
        return isOpen;
      })
      .map(mapServiceComboToService)
      // Sắp xếp theo rating từ cao xuống thấp
      .sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA; // Giảm dần
      })
      // Chỉ lấy các service có rating cao nhất (top 6)
      // Chỉ filter rating > 0 khi ratings đã được load xong
      .filter(service => {
        if (!ratingsLoaded) {
          // Nếu ratings chưa load, hiển thị tất cả (sẽ được sắp xếp lại sau)
          return true;
        }
        // Nếu ratings đã load, chỉ lấy services có rating > 0
        return service.rating > 0;
      })
      .slice(0, 6); // Lấy 6 service có rating cao nhất

    console.log('[LandingPage] Services sau khi map và sắp xếp theo rating:', activeServices);
    console.log('[LandingPage] Số lượng services sau khi map:', activeServices.length);
    
    // Log từng service để debug
    activeServices.forEach((service, index) => {
      console.log(`   → [LandingPage] Service ${index + 1}:`, {
        id: service.id,
        name: service.name,
        rating: service.rating,
        image: service.image,
        imageType: typeof service.image
      });
    });

    // Nếu không đủ 6 service, bổ sung bằng dữ liệu tĩnh
    if (activeServices.length < 6) {
      const staticServices = popularServices.slice(0, 6 - activeServices.length);
      return [...activeServices, ...staticServices];
    }

    return activeServices;
  }, [tours, loading, error, mapServiceComboToService, ratingsLoaded]);

  const displayReviews = useMemo(() => reviews.slice(0, 3), []);

  return (
    <div className="landing-page">
      <Header />
      
      {/* Welcome Message */}
      {showWelcomeMessage && userInfo && (
        <div className="welcome-message">
          <div className="welcome-content">
            <span className="welcome-icon"></span>
            <span className="welcome-text">
              Chào mừng <strong>{userInfo.Name || userInfo.name || userInfo.Email || userInfo.email}</strong> đến với ESCE! 
              Bạn đã đăng nhập thành công.
            </span>
            <button 
              className="welcome-close" 
              onClick={() => setShowWelcomeMessage(false)}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <main>
        {/* Hero Section */}
        <section className="hero-section" id="hero">
          <div className="hero-container">
            <div className="hero-grid">
              {/* Left Column - Text Content */}
              <div className={`hero-content ${isVisible ? 'fade-in-left' : ''}`}>
                {/* Badge */}
                <div className="hero-badge" role="banner">
                  <UsersIcon className="badge-icon" aria-hidden="true" />
                  <span>Du lịch sinh thái bền vững</span>
                </div>

                {/* Main Heading */}
                <div className="hero-text">
                  <h1 className="hero-title">
                    Khám phá Đà Nẵng
                    <span className="hero-title-highlight"> cùng nhóm bạn</span>
                  </h1>
                  <p className="hero-description">
                    Đặt dịch vụ theo nhóm thông minh, tiết kiệm chi phí và tạo những kỷ niệm đáng nhớ 
                    với các dịch vụ du lịch sinh thái tại Đà Nẵng.
                  </p>
                </div>

                {/* CTA Button */}
                <Button size="lg" className="hero-cta" asChild>
                  <Link to="/services" aria-label="Khám phá các dịch vụ du lịch">
                    Khám phá ngay
                    <ArrowRightIcon className="btn-icon" aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              {/* Right Column - Image */}
              <div className={`hero-image ${isVisible ? 'fade-in-right' : ''}`}>
                <div className="hero-image-wrapper">
                  <LazyImage
                    src={baNaHillImage}
                    alt="Du lịch sinh thái Đà Nẵng - Bà Nà Hills"
                    className="hero-img"
                    fallbackSrc={baNaHillImage}
                  />
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className={`hero-stats ${isVisible ? 'fade-in-up' : ''}`} role="region" aria-label="Thống kê">
              {stats.map((stat) => (
                <div key={stat.id} className="stat-item">
                  <div className={`stat-value ${stat.color}`} aria-label={stat.value}>
                    {stat.value}
                  </div>
                  <div className="stat-label">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" id="features" aria-labelledby="features-title">
          <div className="section-container">
            <div className="section-header">
              <h2 id="features-title" className="section-title">
                Tại sao chọn ESCE Du lịch?
              </h2>
              <p className="section-subtitle">
                Chúng tôi mang đến trải nghiệm du lịch sinh thái độc đáo với công nghệ đặt dịch vụ nhóm tiên tiến
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                
                return (
                  <article 
                    key={feature.id} 
                    className={`feature-card ${isVisible ? 'fade-in-up' : ''}`} 
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <Card className="feature-card-inner">
                      <CardContent className="feature-content">
                        <div className="feature-icon-wrapper" aria-hidden="true">
                          <div className="feature-icon-bg">
                            {IconComponent && <IconComponent className="feature-icon" />}
                          </div>
                        </div>
                        <h3 className="feature-title">
                          {feature.title}
                        </h3>
                        <p className="feature-description">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular Services Section */}
        <section className="services-section" id="services" aria-labelledby="services-title">
          <div className="section-container">
            <div className="services-header">
              <div className="services-header-text">
                <h2 id="services-title" className="section-title">
                  Dịch vụ được yêu thích nhất
                </h2>
                <p className="section-subtitle">
                  Khám phá những điểm đến tuyệt vời nhất Đà Nẵng
                </p>
              </div>
              
              <Button size="lg" className="services-view-all" asChild>
                <Link to="/services" aria-label="Xem tất cả dịch vụ">
                  Xem tất cả
                  <ArrowRightIcon className="btn-icon" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="services-grid">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="service-card-skeleton">
                    <Card className="service-card-inner">
                      <div className="service-image-wrapper" style={{ backgroundColor: '#f1f5f9', height: '220px' }}></div>
                      <CardContent className="service-content">
                        <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '12px' }}></div>
                        <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', width: '60%' }}></div>
                        <div style={{ height: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '16px', width: '40%' }}></div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : displayServices.length > 0 ? (
              <div className="services-grid">
                {displayServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    index={index}
                    isVisible={isVisible}
                  />
                ))}
              </div>
            ) : (
              <div className="services-empty">
                <p>Hiện tại không có dịch vụ nào. Vui lòng quay lại sau.</p>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section" id="testimonials" aria-labelledby="testimonials-title">
          <div className="section-container">
            <div className="section-header">
              <h2 id="testimonials-title" className="section-title">
                Trải nghiệm từ khách hàng
              </h2>
              <p className="section-subtitle">
                Hơn 1,000+ khách hàng đã tin tưởng và có những trải nghiệm tuyệt vời cùng ESCE Du lịch
              </p>
            </div>

            <div className="reviews-grid">
              {displayReviews.map((review, index) => (
                <article 
                  key={review.id} 
                  className={`review-card ${isVisible ? 'fade-in-up' : ''}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <Card className="review-card-inner">
                    <CardContent className="review-content">
                      <div className="review-stars" aria-label={`Đánh giá ${review.rating} sao`}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i}
                            className="review-star"
                            filled={i < review.rating}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <div className="review-quote" aria-hidden="true">"</div>
                      <blockquote className="review-text">
                        {review.comment}
                      </blockquote>
                      <div className="review-divider"></div>
                      <div className="review-author">
                        <div className="review-avatar" aria-hidden="true">
                          <span className="review-initials">
                            {review.initials}
                          </span>
                        </div>
                        <div className="review-author-info">
                          <p className="review-author-name">{review.name}</p>
                          <p className="review-author-meta">
                            {review.service} • {review.timeAgo}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" id="cta" aria-labelledby="cta-title">
          <div className="section-container">
            <div className={`cta-content ${isVisible ? 'fade-in-up' : ''}`}>
              <h2 id="cta-title" className="cta-title">
                Sẵn sàng khám phá cùng chúng tôi?
              </h2>
              <p className="cta-subtitle">
                Hãy để chúng tôi mang đến cho bạn những trải nghiệm du lịch sinh thái 
                tuyệt vời và ý nghĩa nhất.
              </p>
              <div className="cta-buttons">
                <Link 
                  to="/services" 
                  className="btn btn-default btn-lg cta-button-primary"
                  aria-label="Khám phá các dịch vụ du lịch ngay"
                >
                  Khám phá dịch vụ ngay
                  <ArrowRightIcon className="btn-icon" aria-hidden="true" />
                </Link>
                <Link 
                  to="/about" 
                  className="btn btn-outline btn-lg cta-button-secondary"
                  aria-label="Tìm hiểu thêm về ESCE"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Service Card Component - Extracted for better organization
const ServiceCard = ({ service, index, isVisible }) => {
  // Log để debug
  useEffect(() => {
    console.log(`[LandingPage ServiceCard ${index}]:`, {
      id: service?.id,
      name: service?.name,
      image: service?.image,
      imageType: typeof service?.image,
      hasImage: !!service?.image,
      serviceKeys: service ? Object.keys(service) : []
    });
  }, [service, index]);

  // Đảm bảo service.image luôn có giá trị
  const imageSrc = service?.image || baNaHillImage;

  return (
    <article 
      className={`service-card ${isVisible ? 'fade-in-up' : ''}`}
      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
    >
      <Card className="service-card-inner">
        <div className="service-image-wrapper">
          <LazyImage
            src={imageSrc}
            alt={service?.name || 'Service'}
            className="service-image"
            fallbackSrc={baNaHillImage}
          />
          
          {service.discountPercent && (
            <Badge variant="destructive" className="service-badge">
              Giảm {service.discountPercent}%
            </Badge>
          )}
          {service.availableSlots !== undefined && service.availableSlots > 0 && (
            <Badge variant="success" className="service-badge service-badge-slots">
              Còn {service.availableSlots} chỗ
            </Badge>
          )}
        </div>
        <CardContent className="service-content">
          <h3 className="service-name">
            {service.name}
          </h3>
          {service.address && (
            <p className="service-address">
              {service.address}
            </p>
          )}
          {service.rating !== undefined && service.rating !== null && (
            <div className="service-rating">
              <div className="stars" aria-label={`Đánh giá ${service.rating} sao`}>
                {(() => {
                  const rating = service.rating || 0;
                  const fullStars = Math.floor(rating);
                  const hasHalfStar = (rating % 1) >= 0.5;
                  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                  
                  return [
                    ...Array(fullStars).fill('full'),
                    ...(hasHalfStar ? ['half'] : []),
                    ...Array(emptyStars).fill('empty')
                  ].map((type, i) => (
                    <StarIcon 
                      key={i}
                      className="star-icon"
                      filled={type === 'full'}
                      half={type === 'half'}
                      aria-hidden="true"
                    />
                  ));
                })()}
              </div>
              <span className="rating-text">
                ({service.rating?.toFixed(1) || '0.0'})
              </span>
            </div>
          )}
          <div className="service-price-wrapper">
            <div>
              <span className="service-price">
                {formatPrice(service.priceFrom)}
              </span>
              {service.originalPrice && (
                <span className="service-price-old">
                  {formatPrice(service.originalPrice)}
                </span>
              )}
            </div>
          </div>
          <Button className="service-button" asChild>
            <Link to={`/services/${service.id}`} aria-label={`Xem chi tiết ${service.name}`}>
              Xem chi tiết
            </Link>
          </Button>
        </CardContent>
      </Card>
    </article>
  );
};

export default LandingPage;
