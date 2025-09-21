import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OTPVerification.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Đếm ngược thời gian gửi lại mã
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleInputChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

    // Xóa thông báo lỗi khi người dùng nhập lại
    if (error) {
      setError('');
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call với validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Giả lập kiểm tra OTP (trong thực tế sẽ gọi API)
    const correctOTP = '123456'; // Mã OTP đúng để test
    
    if (otpString === correctOTP) {
      // Chuyển sang màn hình reset password
      navigate('/reset-password');
    } else {
      setError('Mã OTP không chính xác. Vui lòng thử lại.');
      // Reset OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    // Simulate gửi lại mã OTP
    console.log('Đang gửi lại mã OTP...');
    
    // Focus vào ô đầu tiên
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <h2 className="brand-name">ESCE</h2>
          <p className="brand-sub">Du lịch sinh thái</p>
        </div>

        <div className="otp-icon">🔐</div>
        <h3 className="title">Xác thực OTP</h3>
        <p className="subtitle">Nhập mã OTP 6 số để tiếp tục</p>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`otp-input ${error ? 'error' : ''}`}
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`} 
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? <><div className="spinner"></div>Đang xác thực...</> : 'Xác thực OTP'}
          </button>
        </form>

        <div className="resend-section">
          {canResend ? (
            <button 
              type="button" 
              className="resend-button"
              onClick={handleResend}
            >
              Gửi lại mã OTP
            </button>
          ) : (
            <p className="resend-timer">
              Gửi lại mã sau {resendTimer}s
            </p>
          )}
        </div>

        <a href="/forgot-password" className="fp-back">← Quay lại</a>
      </div>
    </div>
  );
};

export default OTPVerification;