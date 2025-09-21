import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OTPVerification.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

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
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Chuyển sang màn hình reset password
    navigate('/reset-password');
    setLoading(false);
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
                className="otp-input"
                autoComplete="off"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`} 
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? <><div className="spinner"></div>Đang xác thực...</> : 'Xác thực OTP'}
          </button>
        </form>

        <a href="/forgot-password" className="fp-back">← Quay lại</a>
      </div>
    </div>
  );
};

export default OTPVerification;