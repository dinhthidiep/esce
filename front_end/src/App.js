import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';
import Register from './components/Register';
import OTPVerification from './components/OTPVerification';
import ResetPassword from './components/ResetPassword';
import CreateTour from './components/CreateTour';
import SocialMedia from './components/SocialMedia';
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
          <Route path="/create-tour" element={<CreateTour />} />
          <Route path="/social-media" element={<SocialMedia />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
