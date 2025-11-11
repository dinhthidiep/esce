import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { showToast } from '../utils/toast';
import './TourDetail.css';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
    notes: '',
    couponCodes: []
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  // Fetch tour detail from API
  useEffect(() => {
    const fetchTourDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://localhost:7267/api/tour/tour-combo/${id}`);

        if (!response.ok) {
          throw new Error('Không thể tải thông tin tour');
        }

        const data = await response.json();
        setTour(data);

      } catch (err) {
        console.error('Error fetching tour detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTourDetail();
    }
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateTotal = () => {
    if (!tour) return 0;
    const basePrice = tour.Price;
    const total = basePrice * bookingData.quantity;
    return total;
  };

  const handleAddCoupon = () => {
    if (couponInput.trim() && !bookingData.couponCodes.includes(couponInput.trim())) {
      setBookingData({
        ...bookingData,
        couponCodes: [...bookingData.couponCodes, couponInput.trim()]
      });
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = (code) => {
    setBookingData({
      ...bookingData,
      couponCodes: bookingData.couponCodes.filter(c => c !== code)
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    // Validate
    if (!bookingData.startDate) {
      showToast.warning('Vui lòng chọn ngày bắt đầu!');
      return;
    }

    if (!bookingData.endDate) {
      showToast.warning('Vui lòng chọn ngày kết thúc!');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showToast.error('Vui lòng đăng nhập để đặt tour!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    setIsBooking(true);
    const loadingToast = showToast.loading('Đang xử lý đặt tour...');

    try {
      const bookingPayload = {
        ComboId: parseInt(id),
        StartDate: new Date(bookingData.startDate).toISOString(),
        EndDate: new Date(bookingData.endDate).toISOString(),
        Quantity: bookingData.quantity,
        Notes: bookingData.notes || '',
        CouponCodes: bookingData.couponCodes
      };

      const response = await fetch('https://localhost:7267/api/booking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể đặt tour');
      }

      const data = await response.json();

      showToast.update(loadingToast, {
        render: `Đặt tour thành công! Mã booking: ${data.booking.Id}`,
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

      // Navigate to payment page after 2 seconds
      setTimeout(() => {
        navigate('/payment', {
          state: {
            bookingId: data.booking.Id,
            tourName: data.booking.ComboName,
            totalAmount: data.booking.TotalAmount,
            quantity: data.booking.Quantity,
            startDate: data.booking.StartDate,
            endDate: data.booking.EndDate
          }
        });
      }, 2000);

    } catch (err) {
      console.error('Error booking tour:', err);
      showToast.update(loadingToast, {
        render: 'Lỗi: ' + err.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="tour-detail-page">
        <Header />
        <div className="loading-container">
          <p>Đang tải thông tin tour...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-detail-page">
        <Header />
        <div className="error-container">
          <p>Lỗi: {error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Thử lại
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="tour-detail-page">
        <Header />
        <div className="error-container">
          <p>Không tìm thấy tour</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Mock tour data OLD (REMOVED - now using API)
  const mockToursOLDREMOVED = {
    'yen-retreat-farm-OLD': {
      id: 1,
      slug: 'yen-retreat-farm',
      name: 'Yên Retreat Farm',
      area: 'Đà Nẵng',
      category: ['Nghỉ dưỡng', 'Sinh thái'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200'
      ],
      rating: 4.9,
      reviewsCount: 156,
      priceFrom: 1200000,
      discountPercent: 11,
      days: 2,
      duration: '2 ngày 1 đêm',
      description: 'Trải nghiệm nghỉ dưỡng tại Yên Retreat Farm với không gian xanh mát, thư giãn giữa thiên nhiên. Tận hưởng không khí trong lành, thức ăn organic và các hoạt động nông nghiệp.',
      highlights: [
        'Không gian xanh mát, yên tĩnh',
        'Thức ăn organic từ trang trại',
        'Các hoạt động nông nghiệp trải nghiệm',
        'Yoga buổi sáng',
        'BBQ tối'
      ],
      schedule: [
        {
          day: 1,
          title: 'Ngày 1: Đón khách và Check-in',
          activities: [
            '08:00 - Đón khách tại điểm hẹn',
            '10:00 - Đến Yên Retreat Farm, check-in',
            '12:00 - Ăn trưa với thực phẩm organic',
            '14:00 - Tham quan trang trại',
            '16:00 - Trải nghiệm hoạt động nông nghiệp',
            '18:00 - BBQ tối',
            '20:00 - Nghỉ ngơi tự do'
          ]
        },
        {
          day: 2,
          title: 'Ngày 2: Yoga và Trở về',
          activities: [
            '06:00 - Yoga buổi sáng',
            '07:30 - Ăn sáng',
            '09:00 - Check-out',
            '10:00 - Trở về điểm đón'
          ]
        }
      ],
      included: [
        'Xe đưa đón',
        'Bữa ăn theo chương trình',
        'Hướng dẫn viên',
        'Bảo hiểm du lịch'
      ],
      notIncluded: [
        'Chi phí cá nhân',
        'Đồ uống có cồn',
        'Tip cho hướng dẫn viên'
      ],
      reviews: [
        {
          id: 1,
          userName: 'Nguyễn Văn A',
          rating: 5,
          date: '2024-03-15',
          title: 'Trải nghiệm tuyệt vời!',
          content: 'Không gian rất đẹp, thức ăn ngon, nhân viên thân thiện. Sẽ quay lại lần sau!'
        },
        {
          id: 2,
          userName: 'Trần Thị B',
          rating: 4,
          date: '2024-03-10',
          title: 'Rất đáng để thử',
          content: 'Tour rất thú vị, phù hợp cho gia đình. Chỉ có điều thời tiết hơi nóng.'
        }
      ]
    },
    'ba-na-hills': {
      id: 3,
      slug: 'ba-na-hills',
      name: 'Bà Nà Hills - Cầu Vàng',
      area: 'Đà Nẵng',
      category: ['Văn hóa', 'Phiêu lưu'],
      images: [
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
      ],
      rating: 4.8,
      reviewsCount: 234,
      priceFrom: 1800000,
      discountPercent: 15,
      days: 1,
      duration: '1 ngày',
      description: 'Khám phá Bà Nà Hills và Cầu Vàng nổi tiếng thế giới. Trải nghiệm cáp treo dài nhất thế giới, tham quan làng Pháp cổ kính.',
      highlights: [
        'Cáp treo dài nhất thế giới',
        'Cầu Vàng - biểu tượng của Đà Nẵng',
        'Làng Pháp cổ kính',
        'Vườn hoa Le Jardin D\'Amour',
        'Chùa Linh Ứng'
      ],
      schedule: [
        {
          day: 1,
          title: 'Ngày 1: Khám phá Bà Nà Hills',
          activities: [
            '07:00 - Đón khách tại khách sạn',
            '08:00 - Đến Bà Nà Hills, lên cáp treo',
            '09:00 - Tham quan Cầu Vàng',
            '11:00 - Tham quan Làng Pháp',
            '12:00 - Ăn trưa buffet',
            '14:00 - Tham quan vườn hoa',
            '16:00 - Xuống núi',
            '17:00 - Trở về khách sạn'
          ]
        }
      ],
      included: [
        'Xe đưa đón',
        'Vé cáp treo',
        'Bữa trưa buffet',
        'Hướng dẫn viên',
        'Bảo hiểm'
      ],
      notIncluded: [
        'Chi phí cá nhân',
        'Vé các trò chơi',
        'Đồ uống'
      ],
      reviews: [
        {
          id: 1,
          userName: 'Lê Văn C',
          rating: 5,
          date: '2024-03-18',
          title: 'Cảnh đẹp tuyệt vời!',
          content: 'Cầu Vàng thật sự rất ấn tượng. Cáp treo cũng rất thú vị!'
        }
      ]
    }
  };

  // REMOVED OLD CODE - Now using API

  if (!tour) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin tour...</p>
      </div>
    );
  }

  return (
    <div className="tour-detail-page">
      <Header />

      {/* Main Content */}
      <main className="tour-detail-main">
        <div className="tour-detail-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/home">Trang chủ</Link>
            <span>/</span>
            <Link to="/tours">Tours</Link>
            <span>/</span>
            <span>{tour.Name}</span>
          </div>

          {/* Tour Header */}
          <div className="tour-header">
            <div className="tour-header-left">
              <h1>{tour.Name}</h1>
              <div className="tour-meta">
                <span className="location">{tour.Address}</span>
                <span className="rating">
                  {tour.AverageRating} ★ ({tour.TotalReviews} đánh giá)
                </span>
                <span className="status">
                  {tour.Status === 'open' ? `Còn ${tour.AvailableSlots} chỗ` : 'Hết chỗ'}
                </span>
              </div>
            </div>
            <div className="tour-header-right">
              <div className="price-info">
                <div className="price">
                  <span className="label">Giá</span>
                  <span className="value">{formatPrice(tour.Price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="tour-gallery">
            <div className="main-image">
              <img src={tour.Image} alt={tour.Name} />
            </div>
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Left Column - Tour Info */}
            <div className="tour-info">
              {/* Tabs */}
              <div className="tabs">
                <button
                  className={activeTab === 'overview' ? 'active' : ''}
                  onClick={() => setActiveTab('overview')}
                >
                  Tổng quan
                </button>
                <button
                  className={activeTab === 'schedule' ? 'active' : ''}
                  onClick={() => setActiveTab('schedule')}
                >
                  Lịch trình
                </button>
                <button
                  className={activeTab === 'services' ? 'active' : ''}
                  onClick={() => setActiveTab('services')}
                >
                  Dịch vụ ({tour.Services?.length || 0})
                </button>
                <button
                  className={activeTab === 'reviews' ? 'active' : ''}
                  onClick={() => setActiveTab('reviews')}
                >
                  Đánh giá ({tour.TotalReviews})
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-content">
                    <h2>Mô tả</h2>
                    <p>{tour.Description}</p>

                    <h3>Thông tin Host</h3>
                    <div className="host-info">
                      <div className="host-avatar">
                        {tour.Host?.Avatar ? (
                          <img src={tour.Host.Avatar} alt={tour.Host.Name} />
                        ) : (
                          <div className="avatar-placeholder">{tour.Host?.Name?.charAt(0)}</div>
                        )}
                      </div>
                      <div className="host-details">
                        <h4>{tour.Host?.Name}</h4>
                        <p>Email: {tour.Host?.Email}</p>
                        <p>Điện thoại: {tour.Host?.Phone}</p>
                      </div>
                    </div>

                    <h3>Chính sách hủy</h3>
                    <p>{tour.CancellationPolicy}</p>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="services-content">
                    <h2>Dịch vụ bao gồm</h2>
                    {tour.Services && tour.Services.length > 0 ? (
                      <div className="services-list">
                        {tour.Services.map((service) => (
                          <div key={service.Id} className="service-item">
                            <div className="service-header">
                              <h4>{service.Name}</h4>
                              <span className="service-quantity">x{service.Quantity}</span>
                            </div>
                            <p className="service-description">{service.Description}</p>
                            <p className="service-price">{formatPrice(service.Price)} / người</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Chưa có thông tin dịch vụ</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="reviews-content">
                    {tour.Reviews && tour.Reviews.length > 0 ? (
                      tour.Reviews.map((review) => (
                        <div key={review.Id} className="review-item">
                          <div className="review-header">
                            <div className="review-user">
                              <div className="avatar">
                                {review.Author?.Avatar ? (
                                  <img src={review.Author.Avatar} alt={review.Author.Name} />
                                ) : (
                                  review.Author?.Name?.charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="user-name">{review.Author?.Name}</div>
                                <div className="review-date">
                                  {new Date(review.CreatedAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </div>
                            <div className="review-rating">
                              {'★'.repeat(review.Rating)}
                            </div>
                          </div>
                          <div className="review-content">
                            <p>{review.Content}</p>
                          </div>
                          {review.Replies && review.Replies.length > 0 && (
                            <div className="review-replies">
                              {review.Replies.map((reply, idx) => (
                                <div key={idx} className="reply-item">
                                  <p>{reply.Content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>Chưa có đánh giá nào</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Widget */}
            <div className="booking-sidebar">
              <div className="booking-widget">
                <h3>Đặt tour</h3>
                <form onSubmit={handleBooking}>
                  <div className="form-group">
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngày kết thúc</label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                      required
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Số lượng người</label>
                    <div className="counter">
                      <button
                        type="button"
                        onClick={() => setBookingData({...bookingData, quantity: Math.max(1, bookingData.quantity - 1)})}
                      >
                        -
                      </button>
                      <span>{bookingData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setBookingData({...bookingData, quantity: bookingData.quantity + 1})}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      placeholder="Nhập ghi chú (nếu có)..."
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mã giảm giá</label>
                    <div className="coupon-input">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCoupon();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCoupon}
                        className="btn-add-coupon"
                      >
                        Thêm
                      </button>
                    </div>
                    {bookingData.couponCodes.length > 0 && (
                      <div className="coupon-list">
                        {bookingData.couponCodes.map((code, index) => (
                          <div key={index} className="coupon-tag">
                            <span>{code}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoupon(code)}
                              className="btn-remove-coupon"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="price-summary">
                    <div className="summary-row">
                      <span>Giá tour</span>
                      <span>{formatPrice(tour.Price)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Số lượng</span>
                      <span>x {bookingData.quantity}</span>
                    </div>
                    <div className="summary-total">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <button type="submit" className="btn-book" disabled={isBooking}>
                    {isBooking ? 'Đang xử lý...' : 'Đặt ngay'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowImageModal(false)}>&times;</button>
            <img src={tour.images[selectedImage]} alt={tour.name} />
            <div className="modal-thumbnails">
              {tour.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${tour.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TourDetail;

