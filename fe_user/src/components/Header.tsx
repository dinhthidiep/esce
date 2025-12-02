import React, { useState, useEffect, useRef, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserIcon, LogOutIcon, SettingsIcon, ChevronDownIcon, BellIcon, CrownIcon } from '~/components/icons'
import './Header.css'

// Sử dụng đường dẫn public URL thay vì import
const logoEsce = '/img/logo_esce.png'

interface UserInfo {
  Avatar?: string
  avatar?: string
  Name?: string
  name?: string
  Email?: string
  email?: string
  Role?: { Name?: string }
  role?: { name?: string }
  RoleName?: string
  roleName?: string
  RoleId?: number
  roleId?: number
  [key: string]: unknown
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoginStatus = () => {
      // Kiểm tra cả localStorage và sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')

      if (token && userInfoStr) {
        try {
          const user = JSON.parse(userInfoStr) as UserInfo
          setIsLoggedIn(true)
          setUserInfo(user)
        } catch (error) {
          console.error('Error parsing userInfo:', error)
          setIsLoggedIn(false)
          setUserInfo(null)
        }
      } else {
        setIsLoggedIn(false)
        setUserInfo(null)
      }
    }

    checkLoginStatus()

    // Lắng nghe sự kiện storage để cập nhật khi login/logout
    const handleStorageChange = () => {
      checkLoginStatus()
    }

    window.addEventListener('storage', handleStorageChange)

    // Kiểm tra lại mỗi khi location thay đổi (khi navigate)
    checkLoginStatus()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [location])

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside as unknown as EventListener)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    // Xóa token và userInfo từ cả localStorage và sessionStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userInfo')
    setIsLoggedIn(false)
    setUserInfo(null)
    setShowUserMenu(false)
    navigate('/')
    window.location.reload() // Reload để cập nhật UI
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  // Lấy avatar hoặc initials
  const getUserDisplay = () => {
    if (userInfo?.Avatar || userInfo?.avatar) {
      return (
        <img
          src={(userInfo.Avatar || userInfo.avatar) as string}
          alt="Avatar"
          className="user-avatar-img"
        />
      )
    }

    const name =
      (userInfo?.Name as string) ||
      (userInfo?.name as string) ||
      (userInfo?.Email as string) ||
      (userInfo?.email as string) ||
      'U'
    const initials = name.substring(0, 2).toUpperCase()
    return <span className="user-avatar-initials">{initials}</span>
  }

  // Lấy role name
  const getRoleName = () => {
    if (userInfo?.Role?.Name || userInfo?.role?.name) {
      const roleName = (userInfo.Role?.Name || userInfo.role?.name) as string
      // Map "User" to "Tourist" for display
      if (roleName === 'User') return 'Tourist'
      return roleName
    }
    if (userInfo?.RoleName || userInfo?.roleName) {
      const roleName = (userInfo.RoleName || userInfo.roleName) as string
      // Map "User" to "Tourist" for display
      if (roleName === 'User') return 'Tourist'
      return roleName
    }
    // Default role names based on RoleId
    // ID: 1 = Admin, ID: 2 = Host, ID: 3 = User (display as Tourist), ID: 4 = Agency
    const roleId = userInfo?.RoleId || userInfo?.roleId
    if (roleId === 1) return 'Admin'
    if (roleId === 2) return 'Host'
    if (roleId === 3) return 'Tourist' // User role displayed as Tourist
    if (roleId === 4) return 'Agency'
    return 'User'
  }

  // Handler cho logo click - luôn navigate về trang chủ
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      // Nếu đang ở trang chủ, reload trang để hiển thị lại từ đầu
      e.preventDefault()
      window.location.href = '/'
    }
    // Nếu đang ở trang khác, để Link component xử lý navigation
  }

  // Handler cho "Trang chủ" link click - luôn navigate về trang chủ
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      // Nếu đang ở trang chủ, reload trang để hiển thị lại từ đầu
      e.preventDefault()
      window.location.href = '/'
    }
    // Nếu đang ở trang khác, để Link component xử lý navigation
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo-section" onClick={handleLogoClick}>
          <img src={logoEsce} alt="ESCE Logo" className="logo" />
          <div className="logo-text">
            <div className="logo-text-main">Du Lịch Sinh thái</div>
            <div className="logo-text-sub">Đà Nẵng</div>
          </div>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            Trang chủ
          </Link>
          <Link
            to="/services"
            className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            Dịch vụ
          </Link>
          <Link
            to="/about"
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            Giới thiệu
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Liên hệ
          </Link>
        </nav>

        <div className="header-actions">
          {isLoggedIn && userInfo ? (
            <>
              {/* Notification Bell */}
              <button className="notification-bell" aria-label="Notifications">
                <BellIcon className="bell-icon" />
                <span className="notification-badge">3</span>
              </button>

              {/* User Menu */}
              <div className="user-menu-container" ref={userMenuRef}>
                <button
                  className="user-menu-trigger"
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <div className="user-avatar">{getUserDisplay()}</div>
                  <div className="user-info-inline">
                    <div className="user-name-inline">
                      {(userInfo.Name || userInfo.name || 'Người dùng') as string}
                    </div>
                    <div className="user-role-inline">{getRoleName()}</div>
                  </div>
                  <ChevronDownIcon className={`user-menu-chevron ${showUserMenu ? 'open' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <Link
                      to="/profile"
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="user-menu-icon" />
                      <span>Thông tin cá nhân</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <SettingsIcon className="user-menu-icon" />
                      <span>Cài đặt</span>
                    </Link>

                    <div className="user-menu-divider"></div>

                    <Link
                      to="/upgrade"
                      className="user-menu-item user-menu-item-upgrade"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CrownIcon className="user-menu-icon" />
                      <span>Nâng cấp tài khoản</span>
                    </Link>

                    <div className="user-menu-divider"></div>

                    <button className="user-menu-item user-menu-item-logout" onClick={handleLogout}>
                      <LogOutIcon className="user-menu-icon" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

