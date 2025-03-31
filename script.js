// Mobile Menu Toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    const nav = document.querySelector('nav');
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                document.querySelector('nav').style.display = 'none';
            }
        }
    });
});

// Sticky Header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically send the form data to a server
        // For this demo, we'll just show an alert
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Animation on Scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .step, .testimonial-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Carousel Functionality
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.steps-carousel');
    const container = carousel.querySelector('.steps-container');
    const steps = carousel.querySelectorAll('.step');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const indicators = carousel.querySelectorAll('.indicator');

    let currentIndex = 0;
    const totalSteps = steps.length;

    // Initialize carousel
    function updateCarousel() {
        // Update active step
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentIndex);
        });

        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });

        // Move container
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Next step
    function nextStep() {
        currentIndex = (currentIndex + 1) % totalSteps;
        updateCarousel();
    }

    // Previous step
    function prevStep() {
        currentIndex = (currentIndex - 1 + totalSteps) % totalSteps;
        updateCarousel();
    }

    // Go to specific step
    function goToStep(index) {
        currentIndex = index;
        updateCarousel();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToStep(index));
    });

    // Auto-advance (optional)
    let autoSlide = setInterval(nextStep, 5000);

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carousel.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextStep, 5000);
    });

    // Initialize
    updateCarousel();
});

// Set initial state for animated elements
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.feature-card, .step, .testimonial-card');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Trigger animation on load for elements in view
    setTimeout(animateOnScroll, 500);
});

// Animate elements on scroll
window.addEventListener('scroll', animateOnScroll);
