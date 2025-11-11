import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/home" className="logo-section">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <span className="logo-text-brand">ESCE</span>
              </div>
              <div className="logo-info">
                <h1 className="logo-title">Du Lịch Sinh thái</h1>
                <p className="logo-subtitle">Đà Nẵng</p>
              </div>
            </div>
          </Link>

          <nav className="desktop-nav">
            <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
              Trang chủ
            </Link>
            <Link to="/tours" className={`nav-link ${isActive('/tours') ? 'active' : ''}`}>
              Tours
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
              Về chúng tôi
            </Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
              Liên hệ
            </Link>
          </nav>

          <div className="desktop-auth">
            {isLoggedIn ? (
              <div className="user-section" ref={dropdownRef}>
                <div className="notification-icon">
                  <span className="icon-bell"></span>
                  <span className="badge">3</span>
                </div>
                <div className="user-dropdown" onClick={toggleUserDropdown}>
                  <img 
                    src={userInfo?.Avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.Name || 'User')}&background=10b981&color=fff`}
                    alt="User" 
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <p className="user-name">{userInfo?.Name || 'User'}</p>
                    <p className="user-role">Khách hàng</p>
                  </div>
                  <span className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`}></span>
                </div>
                {isUserDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <span className="icon-user"></span> Thông tin cá nhân
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <span className="icon-settings"></span> Cài đặt
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span className="icon-logout"></span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-outline">Đăng nhập</Link>
                <Link to="/register" className="btn-primary">Đăng ký</Link>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <span className="icon-close"></span> : <span className="icon-menu"></span>}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mobile-nav">
            <Link 
              to="/home" 
              className={`mobile-nav-link ${isActive('/home') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link 
              to="/tours" 
              className={`mobile-nav-link ${isActive('/tours') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Về chúng tôi
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Liên hệ
            </Link>
            <div className="mobile-auth">
              {isLoggedIn ? (
                <div className="mobile-user-info">
                  <img 
                    src={userInfo?.Avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.Name || 'User')}&background=10b981&color=fff`}
                    alt="User" 
                    className="user-avatar"
                  />
                  <div>
                    <p className="user-name">{userInfo?.Name || 'User'}</p>
                    <p className="user-role">Khách hàng</p>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-outline full-width">Đăng nhập</Link>
                  <Link to="/register" className="btn-primary full-width">Đăng ký</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

