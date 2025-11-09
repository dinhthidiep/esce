import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';
import Register from './components/Register';
import OTPVerification from './components/OTPVerification';
import ResetPassword from './components/ResetPassword';
import CreateService from './components/CreateService';
import EditService from './components/EditService';
import ServiceManager from './components/ServiceManager';
import ServiceComboManager from './components/ServiceComboManager';
import CreateServiceCombo from './components/CreateServiceCombo';
import EditServiceCombo from './components/EditServiceCombo';
import CreateCoupon from './components/CreateCoupon';
import EditCoupon from './components/EditCoupon';
import CouponManager from './components/CouponManager';
import SocialMedia from './components/SocialMedia';
import YourSocialMediaPost from './components/YourSocialMediaPost';
import ServiceComboPreview from './components/ServiceComboPreview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-service" element={<CreateService />} />
          <Route path="/edit-service" element={<EditService />} />
          <Route path="/service-manager" element={<ServiceManager />} />
          <Route path="/service-combo-manager" element={<ServiceComboManager />} />
          <Route path="/create-service-combo" element={<CreateServiceCombo />} />
          <Route path="/edit-service-combo" element={<EditServiceCombo />} />
          <Route path="/create-coupon" element={<CreateCoupon />} />
          <Route path="/edit-coupon" element={<EditCoupon />} />
          <Route path="/coupon-manager" element={<CouponManager />} />
          <Route path="/social-media" element={<SocialMedia />} />
          <Route path="/your-posts" element={<YourSocialMediaPost />} />
          <Route path="/service-combo-preview" element={<ServiceComboPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
