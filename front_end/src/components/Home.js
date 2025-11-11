import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Home.css';

const Home = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { id: 1, value: '1,284+', label: 'Khach hang', color: 'emerald' },
    { id: 2, value: '127', label: 'Nhom dich vu', color: 'blue' },
    { id: 3, value: '4.8', label: 'Danh gia', color: 'orange' }
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        const [servicesResponse, reviewsResponse] = await Promise.all([
          fetch('https://localhost:7267/api/home/most-liked-combos?limit=10'),
          fetch('https://localhost:7267/api/home/testimonials?limit=5')
        ]);

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setPopularServices(servicesData);
        }

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const features = [
    {
      id: 1,
      title: 'Dat Dich Vu Nhom Thong Minh',
      description: 'Tao nhom de dang, moi ban be va nhan uu dai hap dan khi di dong nguoi',
      icon: 'users'
    },
    {
      id: 2,
      title: 'Du Lich Sinh Thai Ben Vung',
      description: 'Kham pha thien nhien Da Nang voi cac dich vu than thien moi truong',
      icon: 'leaf'
    },
    {
      id: 3,
      title: 'An Toan & Tin Cay',
      description: 'Doi ngu huong dan vien chuyen nghiep, bao hiem toan dien',
      icon: 'shield'
    },
    {
      id: 4,
      title: 'Uu Dai Doc Quyen',
      description: 'Giam gia len den 8% khi dat dich vu nhom tu 12 nguoi tro len',
      icon: 'gift'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="home-page">
      <Header />

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-text">
              <div className="hero-badge">
                Du lịch sinh thái bền vững
              </div>
              <h1 className="hero-title">
                Khám phá Đà Nẵng
                <span className="highlight">cùng nhóm bạn</span>
              </h1>
              <p className="hero-description">
                Đặt dịch vụ theo nhóm thông minh, tiết kiệm chi phí và tạo những kỷ niệm đáng nhớ
                với các dịch vụ du lịch sinh thái tại Đà Nẵng.
              </p>
              <Link to="/tours" className="btn-hero">
                Khám phá ngay
                <span className="arrow">&rarr;</span>
              </Link>
            </div>

            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"
                alt="Du lịch sinh thái Đà Nẵng"
              />
            </div>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.id} className="stat-item">
                <div className={`stat-value stat-${stat.color}`}>
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

      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Tại sao chọn ESCE Du lịch?</h2>
            <p className="section-description">
              Chúng tôi mang đến trải nghiệm du lịch sinh thái độc đáo với công nghệ đặt dịch vụ nhóm tiên tiến
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.id} className="feature-card">
                <div className="feature-icon">
                  <span className={`icon-${feature.icon}`}></span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="section-container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Dịch vụ được yêu thích nhất</h2>
              <p className="section-description">
                Khám phá những điểm đến tuyệt vời nhất Đà Nẵng
              </p>
            </div>
            <Link to="/tours" className="btn-outline">
              Xem tất cả
              <span className="arrow">&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Dang tai...</p>
            </div>
          ) : popularServices.length === 0 ? (
            <div className="empty-container">
              <p>Khong co dich vu nao</p>
            </div>
          ) : (
            <div className="services-grid">
              {popularServices.map((service) => (
                <div key={service.Id} className="service-card">
                  <div className="service-image">
                    <img src={service.Image} alt={service.Name} />
                    {service.DiscountLabel && (
                      <div className="discount-badge">
                        {service.DiscountLabel}
                      </div>
                    )}
                  </div>
                  <div className="service-content">
                    <h3 className="service-name">{service.Name}</h3>
                    <p className="service-address">{service.Address}</p>
                    <div className="service-rating">
                      <span className="stars">{'★'.repeat(Math.floor(service.AverageRating))}</span>
                      <span className="rating-text">({service.AverageRating} - {service.TotalReviews} danh gia)</span>
                    </div>
                    <div className="service-price">
                      <span className="price-value">{formatPrice(service.Price)}</span>
                    </div>
                    <Link to={`/tour/${service.Id}`} className="btn-service">
                      Xem chi tiet
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Trai nghiem tu khach hang</h2>
            <p className="section-description">
              Hon 1,000+ khach hang da tin tuong va co nhung trai nghiem tuyet voi cung ESCE Du lich
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Dang tai...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-container">
              <p>Chua co danh gia nao</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-stars">
                    {'★'.repeat(review.Rating)}
                  </div>
                  <div className="review-quote">"</div>
                  <p className="review-comment">{review.Content}</p>
                  <div className="review-divider"></div>
                  <div className="review-author">
                    <div className="author-avatar">
                      {review.AuthorAvatar ? (
                        <img src={review.AuthorAvatar} alt={review.AuthorName} />
                      ) : (
                        <span>{review.AuthorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="author-info">
                      <div className="author-name">{review.AuthorName}</div>
                      <div className="author-meta">
                        {review.ServiceName} - {review.TimeAgo}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng khám phá cùng chúng tôi?</h2>
            <p className="cta-description">
              Hãy để chúng tôi mang đến cho bạn những trải nghiệm du lịch sinh thái
              tuyệt vời và ý nghĩa nhất.
            </p>
            <div className="cta-buttons">
              <Link to="/tours" className="btn-cta-primary">
                Khám phá dịch vụ ngay
                <span className="arrow">&rarr;</span>
              </Link>
              <Link to="/about" className="btn-cta-secondary">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
