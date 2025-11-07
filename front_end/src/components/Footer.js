import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-circle">
                <span className="logo-text-brand">ESCE</span>
              </div>
              <div className="logo-info">
                <h3>Du Lịch Sinh thái</h3>
                <p>Đà Nẵng</p>
              </div>
            </div>
            <p className="footer-description">
              Khám phá vẻ đẹp thiên nhiên Đà Nẵng với các tour du lịch sinh thái 
              bền vững, mang đến trải nghiệm đáng nhớ cho bạn và gia đình.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="icon-facebook"></span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="icon-instagram"></span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="icon-twitter"></span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="icon-youtube"></span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Khám phá</h4>
            <ul className="footer-links">
              <li><Link to="/home">Trang chủ</Link></li>
              <li><Link to="/tours">Tours du lịch</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Dịch vụ</h4>
            <ul className="footer-links">
              <li><Link to="/tours?category=sinh-thai">Du lịch sinh thái</Link></li>
              <li><Link to="/tours?category=nghi-duong">Nghỉ dưỡng</Link></li>
              <li><Link to="/tours?category=van-hoa">Văn hóa</Link></li>
              <li><Link to="/tours?category=phieu-luu">Phiêu lưu</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Hỗ trợ</h4>
            <ul className="footer-links">
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/support">Hỗ trợ khách hàng</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Liên hệ</h4>
            <ul className="footer-contact">
              <li>
                <span className="icon-location"></span>
                <span>123 Đường ABC, Quận Hải Châu, Đà Nẵng</span>
              </li>
              <li>
                <span className="icon-phone"></span>
                <span>1900 xxxx</span>
              </li>
              <li>
                <span className="icon-email"></span>
                <span>info@esce.vn</span>
              </li>
              <li>
                <span className="icon-clock"></span>
                <span>T2 - CN: 8:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} ESCE Du Lịch Sinh thái. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/terms">Điều khoản</Link>
              <span className="separator">|</span>
              <Link to="/privacy">Bảo mật</Link>
              <span className="separator">|</span>
              <Link to="/sitemap">Sơ đồ trang</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

