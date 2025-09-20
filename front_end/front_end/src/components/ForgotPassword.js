import React, { useState } from 'react';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email là bắt buộc');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <h2 className="brand-name">ESCE</h2>
          <p className="brand-sub">Du lịch sinh thái</p>
        </div>

        <div className="fp-icon">✉️</div>
        <h3 className="title">Quên mật khẩu</h3>
        <p className="subtitle">Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu</p>

        {sent ? (
          <div className="fp-success">Đã gửi liên kết đặt lại mật khẩu tới {email}</div>
        ) : (
          <form onSubmit={handleSubmit} className="fp-form">
            <label htmlFor="fp-email">Email</label>
            <div className="input-wrapper">
              <input
                id="fp-email"
                type="email"
                placeholder="nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? 'error' : ''}
              />
            </div>
            {error && <span className="error-message">{error}</span>}

            <button type="submit" className={`login-button ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <><div className="spinner"></div>Đang gửi...</> : 'Gửi liên kết đặt lại'}
            </button>
          </form>
        )}

        <a href="/login" className="fp-back">← Quay lại đăng nhập</a>
      </div>
    </div>
  );
};

export default ForgotPassword;


