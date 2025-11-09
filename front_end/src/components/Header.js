import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../API/SocialMediaApi';

const Header = ({ showMenuButton = false, onMenuToggle, sidebarActive = false }) => {
  const [userName, setUserName] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      // First try to get from localStorage (fast)
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          const user = JSON.parse(storedUserInfo);
          setUserInfo(user);
          setUserName(user.Name || user.name || 'User');
        } catch (err) {
          console.error('Error parsing user info:', err);
        }
      }

      // Then fetch fresh data from API to ensure we have the latest avatar
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUserInfo(currentUser);
          setUserName(currentUser.Name || currentUser.name || 'User');
          // Update localStorage with fresh data
          localStorage.setItem('userInfo', JSON.stringify(currentUser));
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        // If API fails, keep using localStorage data
      }
    };

    loadUserInfo();
  }, []);

  return (
    <header className="header" role="banner">
      {showMenuButton && (
        <button
          className="menu-button"
          onClick={onMenuToggle}
          aria-label="Mở/đóng menu"
          aria-expanded={sidebarActive}
        >
          <span aria-hidden="true">☰</span>
        </button>
      )}
      <div className="header-logo">
        <img src="/img/esce_logo.png" alt="Logo ESCE" width="60" height="auto" loading="lazy" />
        <h1>Du lịch sinh thái</h1>
      </div>
      <nav className="header-menu" role="navigation" aria-label="Menu điều hướng chính">
        <a href="#" className="header-menu-select">Trang chủ</a>
        <a href="#" className="header-menu-select">Giới thiệu</a>
        <a href="#" className="header-menu-select">Dịch vụ phổ biến</a>
        <a href="#" className="header-menu-select">Liên lạc</a>
      </nav>
      <div className="header-menu-user">
        <img 
          src={
            (userInfo?.Avatar && userInfo.Avatar.trim() !== '') 
              ? userInfo.Avatar 
              : (userInfo?.avatar && userInfo.avatar.trim() !== '')
                ? userInfo.avatar
                : "/img/stock_nimg.jpg"
          } 
          alt="Ảnh đại diện người dùng" 
          width="32" 
          height="32" 
          loading="lazy"
          onError={(e) => {
            e.target.src = "/img/stock_nimg.jpg";
          }}
        />
        <p>{userName}</p>
      </div>
    </header>
  );
};

export default Header;

