import React, { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './ResetPassword.css'
import { resetPassword } from '~/API/instances/Au'

interface FormData {
  newPassword: string
  confirmPassword: string
}

interface ShowPassword {
  newPassword: boolean
  confirmPassword: boolean
}

interface PasswordValidation {
  isValid: boolean
  errors: {
    minLength: boolean
    hasUpperCase: boolean
    hasLowerCase: boolean
    hasNumbers: boolean
    hasSpecialChar: boolean
  }
}

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const otp = searchParams.get('otp') || ''
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState<ShowPassword>({
    newPassword: false,
    confirmPassword: false,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const togglePasswordVisibility = (field: keyof ShowPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validatePassword = (password: string): PasswordValidation => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        minLength: !minLength,
        hasUpperCase: !hasUpperCase,
        hasLowerCase: !hasLowerCase,
        hasNumbers: !hasNumbers,
        hasSpecialChar: !hasSpecialChar,
      },
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Kiểm tra mật khẩu trống
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    // Kiểm tra mật khẩu khớp
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    // Kiểm tra độ mạnh mật khẩu
    const passwordValidation = validatePassword(formData.newPassword)
    if (!passwordValidation.isValid) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (!email || !otp) {
        setError('Thiếu thông tin email hoặc OTP. Vui lòng thử lại từ đầu.')
        setLoading(false)
        return
      }

      await resetPassword(email, otp, formData.newPassword)

      setLoading(false)
      setSuccess(true)

      // Sau 3 giây chuyển về trang đăng nhập
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      console.error('Reset password error:', err)
      setError((err as Error).message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="brand">
            <h2 className="brand-name">ESCE</h2>
            <p className="brand-sub">Du lịch sinh thái</p>
          </div>

          <div className="success-icon"></div>
          <h3 className="title">Đổi mật khẩu thành công!</h3>
          <p className="subtitle">Mật khẩu của bạn đã được cập nhật thành công</p>
          <p className="redirect-message">Đang chuyển về trang đăng nhập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <h2 className="brand-name">ESCE</h2>
          <p className="brand-sub">Du lịch sinh thái</p>
        </div>

        <div className="reset-icon"></div>
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
                {showPassword.newPassword ? 'Hide' : 'Show'}
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
                {showPassword.confirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <span className="error-message">{error}</span>}

          <div className="password-requirements">
            <p className="requirements-title">Mật khẩu phải có:</p>
            <ul className="requirements-list">
              <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>Ít nhất 8 ký tự</li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>Một chữ cái viết hoa</li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>Một chữ cái viết thường</li>
              <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>Một số</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : ''}>
                Một ký tự đặc biệt
              </li>
            </ul>
          </div>

          <button type="submit" className={`login-button ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Đang cập nhật...
              </>
            ) : (
              'Đặt lại mật khẩu'
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

export default ResetPassword

