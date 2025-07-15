import React, { useState, useEffect, useRef } from 'react';
import apiService from '../api/api';
import '../css/LoginForm.css';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  const [loginCardVisible, setLoginCardVisible] = useState(false);

  const loginCardRef = useRef(null);

  // Email/Phone validation patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;

  useEffect(() => {
    // Hide loading screen and show login card after a delay
    const loadingTimer = setTimeout(() => {
      setLoadingScreenVisible(false);
      setLoginCardVisible(true);
    }, 1500);

    return () => clearTimeout(loadingTimer); // Cleanup timer
  }, []);

  // Basic validation
const LoginForm = () => {
  return (
    <>
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
      </div>

      {/* Loading Screen */}
      <div className={`loading-screen ${loadingScreenVisible ? '' : 'hidden'}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading NyumbaSync...</p>
        </div>
      </div>

      <div className="login-wrapper">
        <div className={`login-card ${loginCardVisible ? 'visible' : ''}`} ref={loginCardRef}>

          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-icon">
                <i className="fas fa-home"></i>
              </div>
              <span className="logo-text">NyumbaSync</span>
            </div>
          </div>

          {/* Login Header */}
          <div className="login-header">
            <h2 className="fade-in-up">Welcome back!</h2>
            <p className="fade-in-up delay-1">Please enter your credentials to login</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-container" style={{ opacity: progress > 0 ? 1 : 0 }}>
            <div className={`progress-bar ${progress === 100 ? 'complete' : ''}`} style={{ width: `${progress}%` }}></div>
          </div>

          {/* Form Container */}
          <form id="loginForm" className="login-form">

            {/* Email/Phone Input */}
            <div className="form-group fade-in-up delay-2">
              <label htmlFor="identifier">Email or Phone</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <i className={`fas fa-user ${identifier && (identifierError ? 'error-icon' : 'success-icon-color')}`}></i>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    onBlur={validateIdentifier}
                    required placeholder="example@email.com" />
                  <div className="input-line"></div>
                  <i className="fas fa-exclamation-circle validation-icon error-icon"></i>
                </div>
              </div>
              <div className="field-error" id="identifierError"></div>
            </div>

            {/* Password Input */}
            <div className="form-group fade-in-up delay-3">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <i className={`fas fa-lock ${password && (passwordError ? 'error-icon' : 'success-icon-color')}`}></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={validatePassword}
                    required placeholder="••••••••" />
                  <div className="input-line"></div>
                  <i className="fas fa-eye toggle-password" id="togglePassword"></i>
                </div>
              </div>
              <div className="field-error" id="passwordError"></div>
              <div className="password-strength" id="passwordStrength">
                <div className="strength-meter">
                  <div className="strength-fill"></div>
                </div>
                <span className="strength-text">Password strength</span>
              </div>
            </div>

            {/* Form Options */}
            <div className="form-options fade-in-up delay-4">
              <div className="remember-me">
                <div className="custom-checkbox">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">
                    <span className="checkmark">
                      <i className="fas fa-check"></i>
                    </span>
                    Remember me
                  </label>
                </div>
              </div>
              <a href="/forgot-password.html" className="forgot-password">
                <i className="fas fa-question-circle"></i>
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button type="submit" className={`login-button fade-in-up delay-5 ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              <span className="button-text">Sign In</span>
              <div className="button-loader">
                <div className="loader"></div>
              </div>
              {isLoading && <div className="button-loader"><div className="loader"></div></div>}
              {!isLoading && <span className="button-text">Sign In</span>}
              {!isLoading && <i className="fas fa-arrow-right button-icon"></i>}
              <i className="fas fa-arrow-right button-icon"></i>
            </button>

            {/* Divider */}
            <div className="divider fade-in-up delay-6">
              <span>or continue with</span>
            </div>

            {/* Social Login */}
            <div className="social-login fade-in-up delay-7">
              <button type="button" className="social-button google" data-provider="google">
                <i className="fab fa-google"></i>
                <span className="tooltip">Continue with Google</span>
              </button>
              <button type="button" className="social-button facebook" data-provider="facebook">
                <i className="fab fa-facebook-f"></i>
                <span className="tooltip">Continue with Facebook</span>
              </button>
              <button type="button" className="social-button apple" data-provider="apple">
                <i className="fab fa-apple"></i>
                <span className="tooltip">Continue with Apple</span>
              </button>
            </div>

            {/* Signup Link */}
            <div className="signup-link fade-in-up delay-8">
              Don't have an account? <a href="/signup.html">Sign up</a>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-content">
            <div className="success-icon">
              <i className="fas fa-check"></i>
            </div>
            <h3>Login Successful!</h3>
            <p>Redirecting to your dashboard...</p>
            <div className="success-progress">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
};

export default LoginForm;
