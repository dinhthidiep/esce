import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';
import Register from './components/Register';
import OTPVerification from './components/OTPVerification';
import ResetPassword from './components/ResetPassword';
import CreateTour from './components/CreateTour';
import SocialMedia from './components/SocialMedia';
import Home from './components/Home';
import TourList from './components/TourList';
import TourDetail from './components/TourDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tours" element={<TourList />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-tour" element={<CreateTour />} />
          <Route path="/social-media" element={<SocialMedia />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
