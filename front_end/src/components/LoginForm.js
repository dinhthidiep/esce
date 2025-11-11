import React, { useState } from 'react';
import './LoginForm.css';
import { login } from '../API/Au';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

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
      
      // Lưu token vào localStorage
      if (response.Token || response.token) {
        localStorage.setItem('token', response.Token || response.token);
      }

      // Lưu thông tin user nếu có (backend có thể trả về UserInfo hoặc userInfo)
      const userInfo = response.UserInfo || response.userInfo;
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      // Kiểm tra role và chuyển hướng
      if (userInfo && userInfo.RoleId === 4) {
        // Role 4 = Customer/User - chuyển đến trang home
        alert('Đăng nhập thành công! Chào mừng đến với ESCE!');
        navigate('/home');
      } else if (userInfo && userInfo.RoleId !== 4) {
        // Các role khác (Admin, Staff, etc.)
        alert(`Đăng nhập thành công! Tuy nhiên, tài khoản của bạn không phải là tài khoản khách hàng (Customer). Role ID: ${userInfo.RoleId}`);
        // Có thể chuyển đến trang admin hoặc dashboard khác
        // navigate('/admin'); // Uncomment nếu có trang admin

        // Tạm thời logout và quay về login
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setGeneralError('Tài khoản này không có quyền truy cập trang khách hàng.');
      } else {
        // Không có thông tin userInfo
        alert('Đăng nhập thành công nhưng không nhận được thông tin người dùng.');
        navigate('/home');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
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
              <span className="toggle-icon" aria-hidden>👁️</span>
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
              <input type="checkbox" />
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

        <button className="google-button">
          <span className="g-icon">G</span>
          Đăng nhập bằng Google
        </button>

        <div className="signup-link">
          <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
