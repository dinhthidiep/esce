import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PaymentResult.css';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const orderCode = searchParams.get('orderCode');
    console.log('Payment cancelled - BookingId:', bookingId, 'OrderCode:', orderCode);
  }, [searchParams]);

  return (
    <div className="payment-result-page">
      <Header />
      
      <div className="payment-result-container">
        <div className="payment-result-content cancel">
          <div className="result-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#dc2626" fillOpacity="0.1"/>
              <circle cx="40" cy="40" r="32" fill="#dc2626" fillOpacity="0.2"/>
              <path d="M30 30L50 50M50 30L30 50" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1>Thanh toán đã bị hủy</h1>
          <p className="message">
            Bạn đã hủy thanh toán. Booking của bạn vẫn được giữ và bạn có thể 
            thanh toán lại bất cứ lúc nào trong vòng 24 giờ.
          </p>

          <div className="result-info warning">
            <p>
              <strong>Lưu ý:</strong> Booking sẽ tự động bị hủy nếu không được thanh toán 
              trong vòng 24 giờ kể từ khi đặt.
            </p>
          </div>

          <div className="result-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/profile')}
            >
              Xem booking và thanh toán
            </button>
            
            <button 
              className="btn-secondary"
              onClick={() => navigate('/tours')}
            >
              Quay lại danh sách tour
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentCancel;

