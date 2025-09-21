import React, { useState } from 'react';
import './ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        minLength: !minLength,
        hasUpperCase: !hasUpperCase,
        hasLowerCase: !hasLowerCase,
        hasNumbers: !hasNumbers,
        hasSpecialChar: !hasSpecialChar
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu trống
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Kiểm tra mật khẩu khớp
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Kiểm tra độ mạnh mật khẩu
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
      return;
    }

    setLoading(true);

    // Giả lập gửi yêu cầu đổi mật khẩu
    await new Promise(r => setTimeout(r, 2000));

    setLoading(false);
    setSuccess(true);

    // Sau 3 giây chuyển về trang đăng nhập
    setTimeout(() => {
      window.location.href = '/login';
    }, 3000);
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="brand">
            <h2 className="brand-name">ESCE</h2>
            <p className="brand-sub">Du lịch sinh thái</p>
          </div>

          <div className="success-icon">✅</div>
          <h3 className="title">Đổi mật khẩu thành công!</h3>
          <p className="subtitle">Mật khẩu của bạn đã được cập nhật thành công</p>
          <p className="redirect-message">Đang chuyển về trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <h2 className="brand-name">ESCE</h2>
          <p className="brand-sub">Du lịch sinh thái</p>
        </div>

        <div className="reset-icon">🔑</div>
        <h3 className="title">Đặt lại mật khẩu</h3>
        <p className="subtitle">Nhập mật khẩu mới của bạn</p>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword.newPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={error ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('newPassword')}
              >
                {showPassword.newPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword.confirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={error ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirmPassword')}
              >
                {showPassword.confirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <span className="error-message">{error}</span>}

          <div className="password-requirements">
            <p className="requirements-title">Mật khẩu phải có:</p>
            <ul className="requirements-list">
              <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                Ít nhất 8 ký tự
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                Một chữ cái viết hoa
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                Một chữ cái viết thường
              </li>
              <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                Một số
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : ''}>
                Một ký tự đặc biệt
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
          >
            {loading ? <><div className="spinner"></div>Đang cập nhật...</> : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <a href="/login" className="fp-back">← Quay lại đăng nhập</a>
      </div>
    </div>
  );
};

export default ResetPassword;
