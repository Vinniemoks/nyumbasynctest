<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NyumbaSync Login</title>
  <link rel="stylesheet" href="/css/login.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Animated Background -->
  <div class="animated-background">
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="shape shape-6"></div>
    </div>
  </div>

  <!-- Loading Screen -->
  <div class="loading-screen" id="loadingScreen">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading NyumbaSync...</p>
    </div>
  </div>

  <div class="login-wrapper">
    <div class="login-card" id="loginCard">
      
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="fas fa-home"></i>
          </div>
          <span class="logo-text">NyumbaSync</span>
        </div>
      </div>

      <!-- Login Header -->
      <div class="login-header">
        <h2 class="fade-in-up">Welcome back!</h2>
        <p class="fade-in-up delay-1">Please enter your credentials to login</p>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar" id="progressBar"></div>
      </div>

      <!-- Form Container -->
      <form id="loginForm" class="login-form">
        
        <!-- Email/Phone Input -->
        <div class="form-group fade-in-up delay-2">
          <label for="identifier">Email or Phone</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <i class="fas fa-user"></i>
              <input type="text" id="identifier" name="identifier" required placeholder="example@email.com" />
              <div class="input-line"></div>
              <i class="fas fa-check-circle validation-icon success-icon"></i>
              <i class="fas fa-exclamation-circle validation-icon error-icon"></i>
            </div>
          </div>
          <div class="field-error" id="identifierError"></div>
        </div>
        
        <!-- Password Input -->
        <div class="form-group fade-in-up delay-3">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <i class="fas fa-lock"></i>
              <input type="password" id="password" name="password" required placeholder="••••••••" />
              <div class="input-line"></div>
              <i class="fas fa-eye toggle-password" id="togglePassword"></i>
              <i class="fas fa-check-circle validation-icon success-icon"></i>
              <i class="fas fa-exclamation-circle validation-icon error-icon"></i>
            </div>
          </div>
          <div class="field-error" id="passwordError"></div>
          <div class="password-strength" id="passwordStrength">
            <div class="strength-meter">
              <div class="strength-fill"></div>
            </div>
            <span class="strength-text">Password strength</span>
          </div>
        </div>
        
        <!-- Form Options -->
        <div class="form-options fade-in-up delay-4">
          <div class="remember-me">
            <div class="custom-checkbox">
              <input type="checkbox" id="remember">
              <label for="remember">
                <span class="checkmark">
                  <i class="fas fa-check"></i>
                </span>
                Remember me
              </label>
            </div>
          </div>
          <a href="/forgot-password.html" class="forgot-password">
            <i class="fas fa-question-circle"></i>
            Forgot password?
          </a>
        </div>
        
        <!-- Login Button -->
        <button type="submit" class="login-button fade-in-up delay-5" id="loginButton">
          <span class="button-text">Sign In</span>
          <div class="button-loader">
            <div class="loader"></div>
          </div>
          <i class="fas fa-arrow-right button-icon"></i>
        </button>

        <!-- Divider -->
        <div class="divider fade-in-up delay-6">
          <span>or continue with</span>
        </div>

        <!-- Social Login -->
        <div class="social-login fade-in-up delay-7">
          <button type="button" class="social-button google" data-provider="google">
            <i class="fab fa-google"></i>
            <span class="tooltip">Continue with Google</span>
          </button>
          <button type="button" class="social-button facebook" data-provider="facebook">
            <i class="fab fa-facebook-f"></i>
            <span class="tooltip">Continue with Facebook</span>
          </button>
          <button type="button" class="social-button apple" data-provider="apple">
            <i class="fab fa-apple"></i>
            <span class="tooltip">Continue with Apple</span>
          </button>
        </div>

        <!-- Signup Link -->
        <div class="signup-link fade-in-up delay-8">
          Don't have an account? <a href="/signup.html">Sign up</a>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <div class="success-modal" id="successModal">
      <div class="modal-content">
        <div class="success-icon">
          <i class="fas fa-check"></i>
        </div>
        <h3>Login Successful!</h3>
        <p>Redirecting to your dashboard...</p>
        <div class="success-progress">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    class LoginManager {
      constructor() {
        this.form = document.getElementById('loginForm');
        this.loginButton = document.getElementById('loginButton');
        this.progressBar = document.getElementById('progressBar');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loginCard = document.getElementById('loginCard');
        this.successModal = document.getElementById('successModal');
        
        this.identifierInput = document.getElementById('identifier');
        this.passwordInput = document.getElementById('password');
        this.togglePassword = document.getElementById('togglePassword');
        this.rememberCheckbox = document.getElementById('remember');
        
        this.init();
      }

      init() {
        this.setupEventListeners();
        this.setupValidation();
        this.setupAnimations();
        this.hideLoadingScreen();
      }

      hideLoadingScreen() {
        setTimeout(() => {
          this.loadingScreen.classList.add('hidden');
          this.loginCard.classList.add('visible');
        }, 1500);
      }

      setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Password toggle
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Social login buttons
        document.querySelectorAll('.social-button').forEach(button => {
          button.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Real-time validation
        this.identifierInput.addEventListener('input', () => this.validateIdentifier());
        this.identifierInput.addEventListener('blur', () => this.validateIdentifier());
        
        this.passwordInput.addEventListener('input', () => {
          this.validatePassword();
          this.updatePasswordStrength();
        });
        this.passwordInput.addEventListener('blur', () => this.validatePassword());

        // Progress tracking
        [this.identifierInput, this.passwordInput].forEach(input => {
          input.addEventListener('input', () => this.updateProgress());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
      }

      setupValidation() {
        // Email/Phone validation patterns
        this.emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      }

      setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate');
            }
          });
        }, observerOptions);

        document.querySelectorAll('.fade-in-up').forEach(el => {
          observer.observe(el);
        });
      }

      validateIdentifier() {
        const value = this.identifierInput.value.trim();
        const wrapper = this.identifierInput.closest('.input-wrapper');
        const errorElement = document.getElementById('identifierError');

        if (!value) {
          this.showFieldError(wrapper, errorElement, 'Email or phone is required');
          return false;
        }

        const isEmail = this.emailPattern.test(value);
        const isPhone = this.phonePattern.test(value);

        if (!isEmail && !isPhone) {
          this.showFieldError(wrapper, errorElement, 'Please enter a valid email or phone number');
          return false;
        }

        this.showFieldSuccess(wrapper, errorElement);
        return true;
      }

      validatePassword() {
        const value = this.passwordInput.value;
        const wrapper = this.passwordInput.closest('.input-wrapper');
        const errorElement = document.getElementById('passwordError');

        if (!value) {
          this.showFieldError(wrapper, errorElement, 'Password is required');
          return false;
        }

        if (value.length < 6) {
          this.showFieldError(wrapper, errorElement, 'Password must be at least 6 characters');
          return false;
        }

        this.showFieldSuccess(wrapper, errorElement);
        return true;
      }

      updatePasswordStrength() {
        const password = this.passwordInput.value;
        const strengthElement = document.getElementById('passwordStrength');
        const strengthFill = strengthElement.querySelector('.strength-fill');
        const strengthText = strengthElement.querySelector('.strength-text');

        if (!password) {
          strengthElement.style.opacity = '0';
          return;
        }

        strengthElement.style.opacity = '1';

        let strength = 0;
        let strengthLabel = '';

        // Check various criteria
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 10;

        // Determine strength label and color
        if (strength < 40) {
          strengthLabel = 'Weak';
          strengthFill.className = 'strength-fill weak';
        } else if (strength < 70) {
          strengthLabel = 'Medium';
          strengthFill.className = 'strength-fill medium';
        } else {
          strengthLabel = 'Strong';
          strengthFill.className = 'strength-fill strong';
        }

        strengthFill.style.width = `${Math.min(strength, 100)}%`;
        strengthText.textContent = `Password strength: ${strengthLabel}`;
      }

      showFieldError(wrapper, errorElement, message) {
        wrapper.classList.add('error');
        wrapper.classList.remove('success');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }

      showFieldSuccess(wrapper, errorElement) {
        wrapper.classList.add('success');
        wrapper.classList.remove('error');
        errorElement.style.display = 'none';
      }

      updateProgress() {
        const fields = [this.identifierInput, this.passwordInput];
        const filledFields = fields.filter(field => field.value.trim() !== '').length;
        const progress = (filledFields / fields.length) * 100;
        
        this.progressBar.style.width = `${progress}%`;
        
        if (progress === 100) {
          this.progressBar.classList.add('complete');
        } else {
          this.progressBar.classList.remove('complete');
        }
      }

      togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        this.togglePassword.classList.toggle('fa-eye-slash');
        
        // Add a subtle animation
        this.passwordInput.classList.add('password-reveal');
        setTimeout(() => {
          this.passwordInput.classList.remove('password-reveal');
        }, 300);
      }

      async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const isIdentifierValid = this.validateIdentifier();
        const isPasswordValid = this.validatePassword();
        
        if (!isIdentifierValid || !isPasswordValid) {
          this.shakeForm();
          return;
        }

        // Show loading state
        this.setLoadingState(true);
        
        try {
          // Simulate API call
          await this.simulateLogin();
          
          // Show success and redirect
          this.showSuccessModal();
          
        } catch (error) {
          this.showError(error.message);
          this.setLoadingState(false);
        }
      }

      async simulateLogin() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate success for demo
            resolve({ success: true });
          }, 2000);
        });
      }

      setLoadingState(isLoading) {
        const buttonText = this.loginButton.querySelector('.button-text');
        const buttonLoader = this.loginButton.querySelector('.button-loader');
        const buttonIcon = this.loginButton.querySelector('.button-icon');
        
        if (isLoading) {
          this.loginButton.classList.add('loading');
          this.loginButton.disabled = true;
          buttonText.style.opacity = '0';
          buttonIcon.style.opacity = '0';
          buttonLoader.style.opacity = '1';
        } else {
          this.loginButton.classList.remove('loading');
          this.loginButton.disabled = false;
          buttonText.style.opacity = '1';
          buttonIcon.style.opacity = '1';
          buttonLoader.style.opacity = '0';
        }
      }

      showSuccessModal() {
        this.successModal.classList.add('active');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 3000);
      }

      handleSocialLogin(e) {
        const provider = e.currentTarget.dataset.provider;
        const button = e.currentTarget;
        
        // Add loading state to social button
        button.classList.add('loading');
        button.innerHTML = '<div class="social-loader"></div>';
        
        // Simulate social login
        setTimeout(() => {
          console.log(`Logging in with ${provider}`);
          // Reset button state
          button.classList.remove('loading');
          // Restore original content based on provider
          this.restoreSocialButton(button, provider);
        }, 1500);
      }

      restoreSocialButton(button, provider) {
        const icons = {
          google: 'fab fa-google',
          facebook: 'fab fa-facebook-f',
          apple: 'fab fa-apple'
        };
        
        button.innerHTML = `<i class="${icons[provider]}"></i>`;
      }

      shakeForm() {
        this.loginCard.classList.add('shake');
        setTimeout(() => {
          this.loginCard.classList.remove('shake');
        }, 600);
      }

      showError(message) {
        // Create error notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-notification';
        errorNotification.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <span>${message}</span>
          <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(errorNotification);
        
        // Show notification
        setTimeout(() => {
          errorNotification.classList.add('show');
        }, 100);
        
        // Close notification
        const closeBtn = errorNotification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
          errorNotification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(errorNotification);
          }, 300);
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
          if (errorNotification.parentNode) {
            errorNotification.classList.remove('show');
            setTimeout(() => {
              if (errorNotification.parentNode) {
                document.body.removeChild(errorNotification);
              }
            }, 300);
          }
        }, 5000);
      }

      handleKeyboardShortcuts(e) {
        // Enter key submits form
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
          e.preventDefault();
          this.handleSubmit(e);
        }
        
        // Escape key clears focus
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
      }
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      new LoginManager();
    });
  </script>
</body>
</html>