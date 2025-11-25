import React, { useState } from 'react';
import './LoginForm.css';
import googleAuthService from '../services/googleAuth';
import { login } from '../API/Au';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      const response = await login(formData.email, formData.password);
      
      // Chọn storage dựa trên "Ghi nhớ đăng nhập"
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Lưu token vào storage (localStorage hoặc sessionStorage)
      if (response.Token || response.token) {
        storage.setItem('token', response.Token || response.token);
        // Xóa token cũ từ storage khác nếu có
        if (rememberMe) {
          sessionStorage.removeItem('token');
        } else {
          localStorage.removeItem('token');
        }
      }
      
      // Lưu thông tin user nếu có
      const userInfo = response.UserInfo || response.userInfo;
      if (userInfo) {
        storage.setItem('userInfo', JSON.stringify(userInfo));
        // Xóa userInfo cũ từ storage khác nếu có
        if (rememberMe) {
          sessionStorage.removeItem('userInfo');
        } else {
          localStorage.removeItem('userInfo');
        }
      }
      
          // Đăng nhập thành công - chuyển hướng hoặc hiển thị thông báo
          // Set flag để hiển thị welcome message trên landing page
          sessionStorage.setItem('justLoggedIn', 'true');
          
          // Kiểm tra returnUrl từ location.state
          const returnUrl = location.state?.returnUrl;
          if (returnUrl) {
            // Chuyển về trang ban đầu mà người dùng muốn truy cập
            navigate(returnUrl, { replace: true });
          } else {
            // Chuyển hướng đến trang landing page
            navigate('/', { replace: true });
          }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      const result = await googleAuthService.signIn();
      
      if (result.success) {
        console.log('Google Login Success:', result.user);
        alert(`Đăng nhập Google thành công! Chào mừng ${result.user.name}!`);
        // Here you would typically send the user data to your backend
        // to create/login the user account
      } else {
        alert(`Đăng nhập Google thất bại: ${result.error}`);
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      alert('Có lỗi xảy ra khi đăng nhập Google. Vui lòng thử lại!');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <h2 className="brand-name">ESCE</h2>
          <p className="brand-sub">Du lịch sinh thái</p>
        </div>

        <h3 className="title">Đăng nhập</h3>
        <p className="subtitle">Nhập thông tin tài khoản để đăng nhập</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nhập email của bạn"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper with-toggle">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="nhập mật khẩu"
                className={errors.password ? 'error' : ''}
              />
              <span className="toggle-icon" aria-hidden></span>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {generalError && (
          <div className="error-message general-error" style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {generalError}
          </div>
        )}

          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Ghi nhớ đăng nhập
            </label>
            <a href="/forgot-password" className="forgot-password">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="divider"><span>HOẶC</span></div>

        <button 
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <div className="spinner"></div>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <span className="g-icon">G</span>
              Đăng nhập bằng Google
            </>
          )}
        </button>

        <div className="signup-link">
          <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
