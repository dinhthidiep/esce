import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Header from './Header';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import LoadingSpinner from './LoadingSpinner';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CreditCardIcon
} from './icons/index';
import { formatPrice } from '../lib/utils';
import { API_ENDPOINTS } from '../config/api';
import * as couponService from '../services/couponService';
import './PaymentPage.css';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const estimateBaseAmount = (bookingData) => {
    if (!bookingData) return 0;

    const serviceCombo = bookingData.ServiceCombo || bookingData.serviceCombo;
    const rawPrice = serviceCombo?.Price ?? serviceCombo?.price;
    const unitPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0;

    const rawQuantity = bookingData.Quantity ?? bookingData.quantity ?? 0;
    const quantity = typeof rawQuantity === 'number' ? rawQuantity : parseInt(rawQuantity, 10) || 0;

    let baseAmount = unitPrice * quantity;

    const roleName =
      bookingData?.User?.Role?.Name ||
      bookingData?.User?.Role?.name ||
      bookingData?.user?.role?.Name ||
      bookingData?.user?.role?.name ||
      '';

    if (typeof roleName === 'string' && roleName.toLowerCase() === 'agency') {
      baseAmount *= 0.97;
    }

    if (!baseAmount) {
      return bookingData.TotalAmount || bookingData.totalAmount || 0;
    }

    return baseAmount;
  };

  // Lấy returnUrl và returnTab từ location.state
  const returnUrl = location.state?.returnUrl || '/services';
  const returnTab = location.state?.returnTab || null;

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || isNaN(parseInt(bookingId))) {
        setError('ID đặt dịch vụ không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKING}/${bookingId}`);
        console.log(' PaymentPage: Nhận được dữ liệu booking:', response.data);

        const bookingData = response.data;
        if (!bookingData) {
          setError('Không tìm thấy thông tin đặt dịch vụ');
          return;
        }

        setBooking(bookingData);
        
        const bookingTotal = bookingData.TotalAmount || bookingData.totalAmount || 0;
        
        // Tính toán giá gốc (trước khi giảm Agency và coupon)
        const serviceCombo = bookingData.ServiceCombo || bookingData.serviceCombo;
        const rawPrice = serviceCombo?.Price ?? serviceCombo?.price;
        const unitPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0;
        const rawQuantity = bookingData.Quantity ?? bookingData.quantity ?? 0;
        const quantity = typeof rawQuantity === 'number' ? rawQuantity : parseInt(rawQuantity, 10) || 0;
        const originalPriceBeforeDiscount = unitPrice * quantity; // Giá gốc chưa giảm Agency

        const bookingCoupons = bookingData.BookingCoupons || bookingData.bookingCoupons || [];
        if (bookingCoupons.length > 0) {
          const couponWrapper = bookingCoupons[0];
          const coupon = couponWrapper?.Coupon || couponWrapper?.coupon;
          if (coupon) {
            setAppliedCoupon(coupon);
            setCouponCode(coupon.Code || coupon.code || '');

            // Khi có coupon: originalTotal = giá sau khi giảm Agency (trước khi giảm coupon)
            // discountAmount = giảm giá từ coupon
            const estimatedBaseTotal = estimateBaseAmount(bookingData); // Giá sau khi giảm Agency
            if (estimatedBaseTotal > bookingTotal) {
              setOriginalTotal(estimatedBaseTotal);
              setDiscountAmount(Math.max(0, estimatedBaseTotal - bookingTotal));
            } else {
              setOriginalTotal(originalPriceBeforeDiscount);
              setDiscountAmount(Math.max(0, originalPriceBeforeDiscount - bookingTotal));
            }
          }
        } else {
          setAppliedCoupon(null);
          setCouponCode('');
          
          // Khi không có coupon: hiển thị giảm giá Agency nếu có
          const roleName =
            bookingData?.User?.Role?.Name ||
            bookingData?.User?.Role?.name ||
            bookingData?.user?.role?.Name ||
            bookingData?.user?.role?.name ||
            '';
          
          if (typeof roleName === 'string' && roleName.toLowerCase() === 'agency') {
            // Agency được giảm 3%, nên giá gốc = bookingTotal / 0.97
            const agencyDiscountRate = 0.97;
            const originalPriceWithAgencyDiscount = bookingTotal / agencyDiscountRate;
            setOriginalTotal(originalPriceWithAgencyDiscount);
            setDiscountAmount(Math.max(0, originalPriceWithAgencyDiscount - bookingTotal));
          } else {
            // Không phải Agency, không có giảm giá
            setOriginalTotal(bookingTotal);
            setDiscountAmount(0);
          }
        }

        // Kiểm tra trạng thái thanh toán hiện tại (nếu có)
        // Không hiển thị lỗi nếu chưa có payment - đây là trường hợp bình thường
        try {
          console.log(` PaymentPage: Đang kiểm tra payment status cho bookingId=${bookingId}`);
          const paymentStatusResponse = await axiosInstance.get(
            `${API_ENDPOINTS.PAYMENT}/status/${bookingId}`
          );
          console.log(' PaymentPage: Nhận được payment status:', paymentStatusResponse.data);
          if (paymentStatusResponse.data) {
            setPaymentStatus(paymentStatusResponse.data);
          }
        } catch (err) {
          // 200 với Status="pending" hoặc 404 là bình thường - chưa có payment nào
          // Chỉ log nếu không phải 200 hoặc 404
          if (err.response?.status === 200 && err.response?.data?.Status === 'pending') {
            // Backend trả về 200 với Status="pending" khi chưa có payment
            console.log('PaymentPage: Chưa có payment, status pending');
            if (err.response.data) {
              setPaymentStatus(err.response.data);
            }
          } else if (err.response?.status !== 404 && err.response?.status !== 200) {
            console.warn(' PaymentPage: Không thể kiểm tra trạng thái thanh toán:', {
              status: err.response?.status,
              message: err.response?.data?.message || err.message
            });
          }
          // Không set error vì đây là trường hợp bình thường khi chưa thanh toán
        }
      } catch (err) {
        console.error(' Lỗi khi tải thông tin booking:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy thông tin đặt dịch vụ');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Bạn không có quyền xem thông tin này. Vui lòng đăng nhập lại.');
          // Redirect ngay lập tức
          navigate('/login', { state: { returnUrl: `/payment/${bookingId}` }, replace: true });
        } else {
          setError('Không thể tải thông tin đặt dịch vụ. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    if (!booking) {
      setCouponError('Chưa tải được thông tin booking');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const serviceComboId = booking.ServiceComboId || booking.serviceComboId;
      if (!serviceComboId) {
        setCouponError('Không tìm thấy thông tin dịch vụ');
        return;
      }

      // Validate coupon
      const validateResponse = await couponService.validateCoupon(couponCode.trim(), serviceComboId);
      
      if (!validateResponse.IsValid) {
        setCouponError('Mã giảm giá không hợp lệ');
        return;
      }

      // Calculate discount với original total
      const currentTotal = booking.TotalAmount || booking.totalAmount || 0;
      const discountResponse = await couponService.calculateDiscount(couponCode.trim(), currentTotal);
      const discount = discountResponse.Discount || 0;

      if (discount <= 0) {
        setCouponError('Mã giảm giá không áp dụng được cho đơn hàng này');
        return;
      }

      // Apply coupon
      const bookingIdValue = booking.Id || booking.id;
      await couponService.applyCoupon(bookingIdValue, couponCode.trim());

      // Reload booking để lấy TotalAmount mới
      const updatedBookingResponse = await axiosInstance.get(`${API_ENDPOINTS.BOOKING}/${bookingIdValue}`);
      const updatedBooking = updatedBookingResponse.data;
      const updatedTotal = updatedBooking.TotalAmount || updatedBooking.totalAmount || 0;
      const previousTotal = currentTotal;

      const bookingCoupons = updatedBooking.BookingCoupons || updatedBooking.bookingCoupons || [];
      const latestCoupon = bookingCoupons.length > 0 ? (bookingCoupons[0].Coupon || bookingCoupons[0].coupon) : null;

      setBooking(updatedBooking);
      setAppliedCoupon(latestCoupon);

      if (previousTotal > updatedTotal) {
        setOriginalTotal(previousTotal);
        setDiscountAmount(Math.max(0, previousTotal - updatedTotal));
      } else {
        setOriginalTotal(updatedTotal);
        setDiscountAmount(0);
      }
      setCouponError('');
    } catch (err) {
      console.error(' Error applying coupon:', err);
      
      if (err.response?.status === 404) {
        setCouponError('Mã giảm giá không tồn tại');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'Mã giảm giá không hợp lệ';
        setCouponError(errorMessage);
      } else if (err.response?.data?.message) {
        setCouponError(err.response.data.message);
      } else {
        setCouponError('Không thể áp dụng mã giảm giá. Vui lòng thử lại.');
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!appliedCoupon || !booking) {
      return;
    }

    try {
      const bookingIdValue = booking.Id || booking.id;
      await couponService.removeCoupon(bookingIdValue, appliedCoupon.Code);

      // Reload booking để lấy TotalAmount gốc
      const updatedBookingResponse = await axiosInstance.get(`${API_ENDPOINTS.BOOKING}/${bookingIdValue}`);
      const updatedBooking = updatedBookingResponse.data;
      setBooking(updatedBooking);
      
      setCouponCode('');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setOriginalTotal(updatedBooking.TotalAmount || updatedBooking.totalAmount || 0);
      setCouponError('');
    } catch (err) {
      console.error(' Error removing coupon:', err);
      setCouponError('Không thể gỡ mã giảm giá. Vui lòng thử lại.');
    }
  };

  const handlePayment = async () => {
    if (!booking) {
      console.error(' PaymentPage.handlePayment: Booking không tồn tại');
      setError('Không tìm thấy thông tin đặt dịch vụ');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Tạo payment intent
      const bookingIdValue = booking.Id || booking.id;
      const totalAmount = booking.TotalAmount || booking.totalAmount || 0;
      
      if (!bookingIdValue || totalAmount <= 0) {
        throw new Error('Thông tin đặt dịch vụ không hợp lệ');
      }

      // Backend đã giữ TotalAmount sau khi áp dụng coupon
      const paymentAmount = totalAmount;
      if (paymentAmount <= 0) {
        throw new Error('Số tiền thanh toán phải lớn hơn 0');
      }
      
      const paymentRequest = {
        BookingId: bookingIdValue,
        Amount: paymentAmount,
        Description: `Thanh toán cho đặt dịch vụ #${bookingIdValue}`
      };

      console.log(' PaymentPage.handlePayment: Tạo payment intent:', paymentRequest);
      console.log(`   Endpoint: ${API_ENDPOINTS.PAYMENT}/create-intent`);

      const response = await axiosInstance.post(
        `${API_ENDPOINTS.PAYMENT}/create-intent`,
        paymentRequest
      );

      console.log(' PaymentPage.handlePayment: Payment intent tạo thành công:', response.data);

      // Thử nhiều cách để lấy checkoutUrl
      const checkoutUrl = response.data?.CheckoutUrl 
        || response.data?.checkoutUrl 
        || response.data?.data?.checkoutUrl
        || response.data?.data?.CheckoutUrl;
        
      if (!checkoutUrl) {
        console.error(' PaymentPage.handlePayment: Không tìm thấy checkoutUrl trong response:', response.data);
        throw new Error('Không nhận được URL thanh toán từ server. Vui lòng thử lại sau.');
      }

      console.log(` PaymentPage.handlePayment: Redirecting to checkout URL: ${checkoutUrl}`);
      // Chuyển hướng đến PayOS checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(' PaymentPage.handlePayment: Lỗi khi tạo payment intent:', err);
      console.error('   Error type:', err.constructor.name);
      console.error('   Response status:', err.response?.status);
      console.error('   Response data:', JSON.stringify(err.response?.data, null, 2));
      console.error('   Response headers:', err.response?.headers);
      console.error('   Error message:', err.message);
      console.error('   Stack trace:', err.stack);
      
      // Xử lý các loại lỗi khác nhau
      if (err.response?.status === 401 || err.response?.status === 403) {
        const errorMsg = 'Bạn không có quyền thực hiện thanh toán. Vui lòng đăng nhập lại.';
        setError(errorMsg);
        console.log(' PaymentPage.handlePayment: Redirecting to login');
        // Redirect ngay lập tức
        navigate('/login', { state: { returnUrl: `/payment/${bookingId}` }, replace: true });
        return; // Không set processing = false vì đang redirect
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy thông tin đặt dịch vụ. Vui lòng kiểm tra lại.');
      } else if (err.response?.status === 500) {
        // Lỗi từ server - hiển thị message từ backend
        const errorData = err.response?.data || {};
        let errorMessage = errorData.message 
          || errorData.error 
          || errorData.innerException
          || 'Đã xảy ra lỗi từ server. Vui lòng thử lại sau.';
        
        // Nếu là lỗi DNS, hiển thị thông báo chi tiết hơn
        if (errorData.error && (
          errorData.error.includes('name is valid, but no data') ||
          errorData.error.includes('DNS') ||
          errorData.error.includes('resolve') ||
          errorData.error.includes('No such host')
        )) {
          errorMessage = 'Không thể kết nối đến PayOS do lỗi DNS. Vui lòng kiểm tra:\n\n' +
            '1. Kết nối internet\n' +
            '2. DNS server (thử đổi DNS sang 8.8.8.8 hoặc 1.1.1.1)\n' +
            '3. Firewall/Antivirus có chặn kết nối không\n' +
            '4. Proxy/VPN có ảnh hưởng không\n\n' +
            'Nếu vẫn không được, vui lòng liên hệ bộ phận hỗ trợ.';
        } else if (errorData.message && (
          errorData.message.includes('DNS') ||
          errorData.message.includes('kết nối đến PayOS')
        )) {
          // Sử dụng message từ backend nếu có
          errorMessage = errorData.message;
        }
        
        setError(errorMessage);
        console.error('   Server error details:', JSON.stringify(errorData, null, 2));
      } else if (err.response?.status === 400) {
        // Bad request - validation error
        const errorMessage = err.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        setError(errorMessage);
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.code === 'ERR_CONNECTION_REFUSED') {
        setError('Không thể kết nối đến server. Vui lòng:\n\n' +
          '1. Kiểm tra backend có đang chạy không (http://localhost:5002)\n' +
          '2. Kiểm tra kết nối mạng\n' +
          '3. Thử refresh trang và thử lại');
      } else if (err.message) {
        // Lỗi từ throw Error hoặc các lỗi khác
        setError(err.message);
      } else {
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || 'Không thể tạo thanh toán. Vui lòng thử lại sau.';
        setError(errorMessage);
      }
      setProcessing(false);
    }
  };


  if (loading) {
    return (
      <div className="payment-page">
        <Header />
        <main className="payment-main">
          <LoadingSpinner message="Đang tải thông tin thanh toán..." />
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="payment-page">
        <Header />
        <main className="payment-main">
          <div className="payment-container">
            <div className="error-container" role="alert">
              <h2 className="error-title">Không thể tải thông tin thanh toán</h2>
              <p className="error-message">{error || 'Thông tin đặt dịch vụ không tồn tại'}</p>
              <Button variant="default" onClick={() => navigate('/services')}>
                <ArrowLeftIcon className="button-icon" />
                Quay lại danh sách dịch vụ
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const bookingIdValue = booking.Id || booking.id;
  const totalAmount = booking.TotalAmount || booking.totalAmount || 0;
  const bookingStatus = booking.Status || booking.status || 'pending';
  const bookingStatusLower = bookingStatus.toLowerCase();
  const isPaid = paymentStatus?.Status === 'completed' || paymentStatus?.Status === 'paid';
  const isPending = paymentStatus?.Status === 'pending' || !paymentStatus;
  
  // Kiểm tra xem có thể thanh toán không
  // Không cho thanh toán nếu booking đã bị hủy, đã xác nhận, hoặc đã hoàn thành
  const canPay = !isPaid && 
                 bookingStatusLower !== 'cancelled' && 
                 bookingStatusLower !== 'confirmed' && 
                 bookingStatusLower !== 'completed';
  
  // Tổng tiền hiển thị (backend đã trừ discount)
  const finalTotal = totalAmount;
  const hasDiscount = discountAmount > 0 && originalTotal > totalAmount;

  return (
    <div className="payment-page">
      <Header />
      
      <main className="payment-main">
        <div className="payment-container">
          {/* Header */}
          <div className="payment-header">
            <Button 
              variant="outline" 
              onClick={() => {
                // Nếu có returnTab, navigate đến profile với tab đó
                if (returnTab) {
                  navigate(returnUrl, { state: { activeTab: returnTab } });
                } else {
                  // Nếu có returnUrl, quay về đó, không thì quay về trang trước
                  navigate(returnUrl || -1);
                }
              }}
              className="back-button"
            >
              <ArrowLeftIcon className="button-icon" />
              Quay lại
            </Button>
            <h1 className="payment-page-title">Thanh toán</h1>
          </div>

          <div className="payment-content">
            {/* Left Column - Payment Info */}
            <div className="payment-left">
              <Card className="payment-info-card">
                <CardContent>
                  <h2 className="card-title">Thông tin đặt dịch vụ</h2>
                  
                  <div className="payment-info">
                    <div className="info-row">
                      <span className="info-label">Mã đặt dịch vụ</span>
                      <span className="info-value">#{bookingIdValue}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">Trạng thái</span>
                      <span className={`info-value status-badge status-${bookingStatus.toLowerCase()}`}>
                        {bookingStatus === 'pending' ? 'Chờ xác nhận' : 
                         bookingStatus === 'confirmed' ? 'Đã xác nhận' :
                         bookingStatus === 'processing' ? 'Đang xử lý' :
                         bookingStatus === 'completed' ? 'Hoàn thành' :
                         bookingStatus === 'cancelled' ? 'Đã hủy' : bookingStatus}
                      </span>
                    </div>

                    {booking.StartDate && (
                      <div className="info-row">
                        <span className="info-label">Ngày bắt đầu</span>
                        <span className="info-value">
                          {new Date(booking.StartDate || booking.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}

                    {booking.EndDate && (
                      <div className="info-row">
                        <span className="info-label">Ngày kết thúc</span>
                        <span className="info-value">
                          {new Date(booking.EndDate || booking.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}

                    {booking.Quantity && (
                      <div className="info-row">
                        <span className="info-label">Số lượng</span>
                        <span className="info-value">{booking.Quantity || booking.quantity} người</span>
                      </div>
                    )}

                    {booking.Notes && (
                      <div className="info-row">
                        <span className="info-label">Ghi chú</span>
                        <span className="info-value">{booking.Notes || booking.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Coupon Section */}
                  {canPay && (
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
                        Mã giảm giá
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="Nhập mã giảm giá"
                          disabled={validatingCoupon || !!appliedCoupon}
                          style={{ flex: 1 }}
                        />
                        {!appliedCoupon ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || !couponCode.trim()}
                          >
                            {validatingCoupon ? 'Đang kiểm tra...' : 'Áp dụng'}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveCoupon}
                          >
                            Gỡ mã
                          </Button>
                        )}
                      </div>
                      
                      {couponError && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>
                          {couponError}
                        </p>
                      )}
                      
                      {appliedCoupon && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #86efac',
                          borderRadius: '6px',
                          marginTop: '8px'
                        }}>
                          <CheckCircleIcon style={{ color: '#22c55e', width: '20px', height: '20px' }} />
                          <span style={{ flex: 1, color: '#166534', fontWeight: '500' }}>
                            Mã {appliedCoupon.Code} đã áp dụng
                            {appliedCoupon.Description && (
                              <span style={{ display: 'block', fontSize: '0.875rem', color: '#15803d', marginTop: '2px' }}>
                                {appliedCoupon.Description}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="payment-right">
              <Card className="payment-summary-card">
                <CardContent>
                  <h2 className="card-title">Tóm tắt thanh toán</h2>
                  
                  <div className="payment-summary-content">
                    <div className="summary-row">
                      <span className="summary-label">Tổng tiền</span>
                      <span className="summary-value">
                        {formatPrice(hasDiscount ? originalTotal : totalAmount)}
                      </span>
                    </div>
                    
                    {hasDiscount && (
                      <>
                        <div className="summary-divider"></div>
                        <div className="summary-row" style={{ color: '#22c55e' }}>
                          <span className="summary-label">Giảm giá</span>
                          <span className="summary-value" style={{ color: '#22c55e', fontWeight: '600' }}>
                            -{formatPrice(discountAmount)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="summary-divider"></div>
                    <div className="summary-row summary-row-total">
                      <span className="summary-label">Thành tiền</span>
                      <span className="summary-value summary-total">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>

                    {paymentStatus && paymentStatus.Amount > 0 && (
                      <>
                        <div className="summary-divider"></div>
                        <div className="summary-row">
                          <span className="summary-label">Số tiền đã thanh toán</span>
                          <span className="summary-value">
                            {formatPrice(paymentStatus.Amount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div className="alert alert-error">
                      <AlertCircleIcon className="alert-icon" />
                      <div className="alert-content">
                        <strong>Lỗi</strong>
                        <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
                      </div>
                    </div>
                  )}

                  {isPaid || bookingStatusLower === 'confirmed' || bookingStatusLower === 'completed' ? (
                    <div className="payment-success-box">
                      <CheckCircleIcon className="success-icon" />
                      <div className="success-content">
                        <strong>Thanh toán thành công!</strong>
                        <p>Đơn đặt dịch vụ của bạn đã được thanh toán thành công.</p>
                      </div>
                      <Button 
                        variant="default" 
                        onClick={() => navigate('/')}
                        className="success-button"
                      >
                        Về trang chủ
                      </Button>
                    </div>
                  ) : bookingStatusLower === 'cancelled' ? (
                    <div className="payment-cancelled-box">
                      <AlertCircleIcon className="cancelled-icon" />
                      <div className="cancelled-content">
                        <strong>Đơn đặt dịch vụ đã bị hủy</strong>
                        <p>Đơn đặt dịch vụ này đã bị hủy và không thể thanh toán.</p>
                      </div>
                      <Button 
                        variant="default" 
                        onClick={() => navigate('/services')}
                        className="cancelled-button"
                      >
                        Xem dịch vụ khác
                      </Button>
                    </div>
                  ) : (
                    <div className="payment-actions">
                      <Button
                        variant="default"
                        size="lg"
                        className="pay-button"
                        onClick={handlePayment}
                        disabled={processing || !canPay}
                      >
                        {processing ? (
                          'Đang xử lý...'
                        ) : (
                          <>
                            <CreditCardIcon className="button-icon" />
                            Thanh toán ngay
                          </>
                        )}
                      </Button>
                      
                      <p className="payment-hint">
                        Bạn sẽ được chuyển đến trang thanh toán PayOS để hoàn tất giao dịch
                      </p>
                    </div>
                  )}

                  <div className="payment-info-box">
                    <div className="info-box-content">
                      <strong>Thông tin quan trọng</strong>
                      <ul>
                        <li>Thanh toán được xử lý an toàn qua PayOS</li>
                        <li>Bạn sẽ nhận được email xác nhận sau khi thanh toán thành công</li>
                        <li>Nếu có vấn đề, vui lòng liên hệ bộ phận hỗ trợ</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;

