import React, { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import { forgotPassword } from '~/API/instances/Au'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Email là bắt buộc')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email, '')
      // Chuyển đến màn hình OTP với type=forgot-password
      navigate(`/otp-verification?email=${encodeURIComponent(email)}&type=forgot-password`)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError((err as Error).message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <h2 className="brand-name">ESCE</h2>
          <p className="brand-sub">Du lịch sinh thái</p>
        </div>

        <div className="fp-icon"></div>
        <h3 className="title">Quên mật khẩu</h3>
        <p className="subtitle">Nhập email của bạn và chúng tôi sẽ gửi mã OTP để xác thực</p>

        <form onSubmit={handleSubmit} className="fp-form">
          <label htmlFor="fp-email">Email</label>
          <div className="input-wrapper">
            <input
              id="fp-email"
              type="email"
              placeholder="nhập email của bạn"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className={error ? 'error' : ''}
            />
          </div>
          {error && <span className="error-message">{error}</span>}

          <button type="submit" className={`login-button ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Đang gửi...
              </>
            ) : (
              'Gửi mã OTP'
            )}
          </button>
        </form>

        <a href="/login" className="fp-back">
          ← Quay lại đăng nhập
        </a>
      </div>
    </div>
  )
}

export default ForgotPassword

