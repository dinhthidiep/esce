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

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Đang tải...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/create-tour" element={<CreateTour />} />
          <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

