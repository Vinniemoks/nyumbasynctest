// =============================================
// Enhanced Mobile Menu Toggle with Animation
// =============================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (!mobileMenuBtn || !navMenu) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('show');
        document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking on a link or outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && e.target !== mobileMenuBtn) {
            navMenu.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Close menu on link click (for smooth scrolling)
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });
}

// =============================================
// Advanced Smooth Scrolling with Easing
// =============================================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate offset considering sticky header
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Smooth scroll with custom easing
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 800;
                let startTime = null;
                
                function easeOutCubic(t) {
                    return 1 - Math.pow(1 - t, 3);
                }
                
                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);
                    
                    window.scrollTo(0, startPosition + distance * easeOutCubic(progress));
                    
                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    }
                }
                
                requestAnimationFrame(animation);
            }
        });
    });
}

// =============================================
// Enhanced Sticky Header with Multiple States
// =============================================
function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    let lastScrollTop = 0;
    const headerHeight = header.offsetHeight;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on scroll position
        if (scrollTop > headerHeight) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll down/up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// =============================================
// Enhanced Form Submission with Visual Feedback
// =============================================
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Add loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        // Simulate form submission
        setTimeout(() => {
            // Create and show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = '✅ Thank you for your message! We will get back to you soon.';
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success-gradient);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: var(--shadow-medium);
                z-index: 1001;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            
            document.body.appendChild(successMsg);
            
            // Animate in
            setTimeout(() => {
                successMsg.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after delay
            setTimeout(() => {
                successMsg.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    successMsg.parentNode?.removeChild(successMsg);
                }, 300);
            }, 3000);
            
            // Reset form and button
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }, 1500);
    });
}

// =============================================
// Scroll Animation with Intersection Observer
// =============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add stagger animation for elements with .stagger class
                if (entry.target.classList.contains('stagger')) {
                    const children = entry.target.querySelectorAll('.fade-in');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// =============================================
// Enhanced Carousel with Touch Support
// =============================================
function initCarousel() {
    const carousel = document.querySelector('.steps-carousel');
    if (!carousel) return;

    const container = carousel.querySelector('.steps-container');
    const steps = carousel.querySelectorAll('.step');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const indicators = carousel.querySelectorAll('.indicator');

    let currentIndex = 0;
    let isAnimating = false;
    let autoSlideInterval;
    const totalSteps = steps.length;

    // Touch handling
    let touchStartX = 0;
    let touchEndX = 0;

    function updateCarousel() {
        if (isAnimating) return;
        isAnimating = true;

        // Update active step with smooth transition
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentIndex);
        });

        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });

        // Move container with easing
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function nextStep() {
        if (isAnimating) return;
        currentIndex = (currentIndex + 1) % totalSteps;
        updateCarousel();
    }

    function prevStep() {
        if (isAnimating) return;
        currentIndex = (currentIndex - 1 + totalSteps) % totalSteps;
        updateCarousel();
    }

    function goToStep(index) {
        if (isAnimating || index === currentIndex) return;
        currentIndex = index;
        updateCarousel();
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToStep(index));
    });

    // Touch events
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextStep();
            } else {
                prevStep();
            }
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevStep();
        if (e.key === 'ArrowRight') nextStep();
    });

    // Auto-advance with better management
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextStep, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Pause on hover and focus
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
    carousel.addEventListener('focusin', stopAutoSlide);
    carousel.addEventListener('focusout', startAutoSlide);

    // Pause when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });

    // Initialize
    updateCarousel();
    startAutoSlide();
}

// =============================================
// Parallax Effect for Hero Section
// =============================================
function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    });
}

// =============================================
// Dynamic Theme Color Based on Scroll Position
// =============================================
function initDynamicColors() {
    const sections = document.querySelectorAll('section');
    const colors = [
        'rgba(102, 126, 234, 0.1)', // Primary
        'rgba(240, 147, 251, 0.1)', // Secondary
        'rgba(79, 172, 254, 0.1)',  // Accent
        'rgba(44, 62, 80, 0.1)'     // Dark
    ];

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop - 100 && 
                scrollPosition < sectionTop + sectionHeight - 100) {
                document.body.style.backgroundColor = colors[index % colors.length];
            }
        });
    });
}

// =============================================
// Enhanced Feature Card Interactions
// =============================================
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0)';
        });
    });
}

// =============================================
// Testimonial Card Rotation
// =============================================
function initTestimonialRotation() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length === 0) return;
    
    let currentTestimonial = 0;
    
    setInterval(() => {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.opacity = index === currentTestimonial ? '1' : '0.7';
            testimonial.style.transform = index === currentTestimonial ? 
                'scale(1.05)' : 'scale(1)';
        });
        
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }, 3000);
}

// =============================================
// Performance Optimization - Debounce scroll events
// =============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================
// Main Initialization
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initSmoothScrolling();
    initStickyHeader();
    initContactForm();
    initScrollAnimations();
    initCarousel();
    initParallax();
    initDynamicColors();
    initFeatureCards();
    initTestimonialRotation();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Initialize scroll observers
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            if (el.dataset.observed !== 'true') {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.1 });
                
                observer.observe(el);
                el.dataset.observed = 'true';
            }
        });
    }, 100);
});

// =============================================
// Additional Styles Injection
// =============================================
const additionalStyles = `
    /* Mobile Menu Styles */
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 1001;
            transition: transform 0.3s ease;
        }
        
        .mobile-menu-btn.active {
            transform: rotate(90deg);
        }
        
        nav ul {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.98);
            z-index: 1000;
            padding: 2rem;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        }
        
        nav ul.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }
        
        nav ul li {
            margin: 1rem 0;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }
        
        nav ul.show li {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Stagger animation for menu items */
        nav ul.show li:nth-child(1) { transition-delay: 0.1s; }
        nav ul.show li:nth-child(2) { transition-delay: 0.2s; }
        nav ul.show li:nth-child(3) { transition-delay: 0.3s; }
        nav ul.show li:nth-child(4) { transition-delay: 0.4s; }
        nav ul.show li:nth-child(5) { transition-delay: 0.5s; }
        nav ul.show li:nth-child(6) { transition-delay: 0.6s; }
        
        /* Make buttons full width on mobile */
        nav ul li a.btn {
            display: block;
            width: 100%;
            text-align: center;
            padding: 0.75rem;
        }
        
        /* Prevent scrolling when menu is open */
        body.menu-open {
            overflow: hidden;
        }
    }
    
    /* Header Styles */
    .header-hidden {
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }
    
    .scrolled {
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        background: rgba(255,255,255,0.98);
        backdrop-filter: blur(5px);
    }
    
    /* Success Message */
    .success-message {
        font-weight: 600;
        border-left: 4px solid rgba(255,255,255,0.5);
    }
    
    /* Animations */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Feature Cards */
    .feature-card {
        transition: all 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Testimonials */
    .testimonial-card {
        transition: all 0.5s ease;
    }
    
    /* Body transitions */
    body {
        transition: background-color 0.5s ease;
    }
    
    body.loaded {
        animation: fadeIn 0.5s ease;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);