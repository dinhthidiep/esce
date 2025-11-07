import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../utils/toast';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if booking data exists
    if (!bookingData || !bookingData.bookingId) {
      showToast.error('Không tìm thấy thông tin booking!');
      navigate('/tours');
    }
  }, [bookingData, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast.error('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    const loadingToast = showToast.loading('Đang tạo link thanh toán...');

    try {
      const paymentPayload = {
        BookingId: bookingData.bookingId,
        ReturnUrl: `${window.location.origin}/payment/success?bookingId=${bookingData.bookingId}`,
        CancelUrl: `${window.location.origin}/payment/cancel?bookingId=${bookingData.bookingId}`
      };

      const response = await fetch('https://localhost:7267/api/payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check if payment already exists
        if (errorText.includes('Payment already exists') || errorText.includes('already exists')) {
          throw new Error('Booking này đã được thanh toán hoặc đang có yêu cầu thanh toán. Vui lòng kiểm tra lại trong lịch sử đặt tour.');
        }

        throw new Error(errorText || 'Không thể tạo link thanh toán');
      }

      const data = await response.json();

      // Check if CheckoutUrl exists
      if (!data.CheckoutUrl) {
        throw new Error('Không nhận được link thanh toán từ server');
      }

      // Store paymentId in localStorage for later use
      if (data.Id) {
        localStorage.setItem('currentPaymentId', data.Id);
      }

      showToast.update(loadingToast, {
        render: 'Đang chuyển đến trang thanh toán...',
        type: 'success',
        isLoading: false,
        autoClose: 1000
      });

      // Redirect to PayOS payment page
      setTimeout(() => {
        window.location.href = data.CheckoutUrl;
      }, 1000);

    } catch (err) {
      console.error('Error creating payment:', err);
      showToast.update(loadingToast, {
        render: 'Lỗi: ' + err.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return null;
  }

  return (
    <div className="payment-page">
      <Header />
      
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-header">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#059669" fillOpacity="0.1"/>
                <path d="M20 32L28 40L44 24" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Đặt tour thành công!</h1>
            <p className="subtitle">Vui lòng thanh toán để hoàn tất đặt tour</p>
          </div>

          <div className="booking-summary">
            <h2>Thông tin đặt tour</h2>
            
            <div className="summary-item">
              <span className="label">Mã booking:</span>
              <span className="value booking-id">#{bookingData.bookingId}</span>
            </div>

            <div className="summary-item">
              <span className="label">Tour:</span>
              <span className="value">{bookingData.tourName}</span>
            </div>

            <div className="summary-item">
              <span className="label">Ngày đi:</span>
              <span className="value">
                {formatDate(bookingData.startDate)} - {formatDate(bookingData.endDate)}
              </span>
            </div>

            <div className="summary-item">
              <span className="label">Số lượng:</span>
              <span className="value">{bookingData.quantity} người</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item total">
              <span className="label">Tổng tiền:</span>
              <span className="value">{formatPrice(bookingData.totalAmount)}</span>
            </div>
          </div>

          <div className="payment-actions">
            <button 
              className="btn-payment"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </button>
            
            <button 
              className="btn-cancel"
              onClick={() => navigate('/profile')}
              disabled={isProcessing}
            >
              Thanh toán sau
            </button>
          </div>

          <div className="payment-note">
            <p>
              <strong>Lưu ý:</strong> Bạn có thể thanh toán sau trong mục "Lịch sử đặt tour" 
              tại trang cá nhân. Booking sẽ được giữ trong 24 giờ.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;

