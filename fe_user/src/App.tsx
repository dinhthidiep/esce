import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import LandingPage from '~/components/LandingPage'
import LoginForm from '~/components/LoginForm'
import Register from '~/components/Register'
import ForgotPassword from '~/components/ForgotPassword'
import OTPVerification from '~/components/OTPVerification'
import ResetPassword from '~/components/ResetPassword'
import ServicesPage from '~/components/ServicesPage'
import ServiceDetail from '~/components/ServiceDetail'
import BookingPage from '~/components/BookingPage'
import PaymentPage from '~/components/PaymentPage'
import ProfilePage from '~/components/ProfilePage'
import AboutPage from '~/components/AboutPage'
import CreateTour from '~/components/CreateTour'
import NewsPage from '~/components/NewsPage'
import NewsDetailPage from '~/components/NewsDetailPage'
import PolicyPage from '~/components/PolicyPage'
import ForumPage from '~/components/ForumPage'

// Log để debug
if (import.meta.env.DEV) {
  console.log('✅ [App.tsx] App component đang được load')
}

function App() {
  try {
    if (import.meta.env.DEV) {
      console.log('✅ [App.tsx] App component đang render')
    }

    return (
      <BrowserRouter>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '1.2rem',
            color: '#64748b'
          }}>
            Đang tải...
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/create-tour" element={<CreateTour />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="*" element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                fontSize: '1.2rem',
                color: '#64748b'
              }}>
                404 - Không tìm thấy trang
              </div>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    )
  } catch (error) {
    console.error('❌ [App.tsx] Lỗi khi render App:', error)
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h1 style={{ color: '#dc2626' }}>⚠️ Lỗi khi tải ứng dụng</h1>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          Vui lòng mở Console (F12) để xem chi tiết lỗi.
        </p>
      </div>
    )
  }
}

export default App

