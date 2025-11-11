import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../utils/toast';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      // Try to get paymentId from URL first, then from localStorage
      let paymentId = searchParams.get('paymentId');
      if (!paymentId) {
        paymentId = localStorage.getItem('currentPaymentId');
      }

      const orderCode = searchParams.get('orderCode');

      console.log('Payment successful - PaymentId:', paymentId, 'OrderCode:', orderCode);

      if (!paymentId) {
        console.error('No paymentId found');
        setIsUpdating(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setIsUpdating(false);
          return;
        }

        // Call API to update payment status
        // Status: 1 = Completed (Success)
        const response = await fetch('https://localhost:7267/api/payment/update-status', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            PaymentId: parseInt(paymentId),
            Status: 1
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update payment status');
        }

        console.log('Payment status updated successfully');

        // Clear paymentId from localStorage after successful update
        localStorage.removeItem('currentPaymentId');
      } catch (error) {
        console.error('Error updating payment status:', error);
        showToast.error('Không thể cập nhật trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.');
      } finally {
        setIsUpdating(false);
      }
    };

    updatePaymentStatus();
  }, [searchParams]);

  return (
    <div className="payment-result-page">
      <Header />

      <div className="payment-result-container">
        <div className="payment-result-content success">
          {isUpdating ? (
            <>
              <div className="result-icon">
                <div className="spinner"></div>
              </div>
              <h1>Đang xác nhận thanh toán...</h1>
              <p className="message">
                Vui lòng đợi trong giây lát
              </p>
            </>
          ) : (
            <>
              <div className="result-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="40" fill="#059669" fillOpacity="0.1"/>
                  <circle cx="40" cy="40" r="32" fill="#059669" fillOpacity="0.2"/>
                  <path d="M25 40L35 50L55 30" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h1>Thanh toán thành công!</h1>
              <p className="message">
                Cảm ơn bạn đã thanh toán. Chúng tôi đã nhận được thanh toán của bạn và
                đã xác nhận booking của bạn.
              </p>
            </>
          )}

          <div className="result-info">
            <p>
              Thông tin chi tiết về booking đã được gửi đến email của bạn. 
              Bạn có thể xem lại thông tin booking trong mục "Lịch sử đặt tour".
            </p>
          </div>

          <div className="result-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/profile')}
            >
              Xem lịch sử đặt tour
            </button>
            
            <button 
              className="btn-secondary"
              onClick={() => navigate('/tours')}
            >
              Tiếp tục khám phá
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;

