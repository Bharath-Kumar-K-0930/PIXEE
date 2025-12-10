// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Pricing Cards Click Handler
const initPricingCards = () => {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                // Scroll to the clicked pricing section smoothly
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Add a highlight animation
                this.style.animation = 'pulse 0.6s ease-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 600);
            }
        });
    });
};

// Call pricing init when DOM is ready
document.addEventListener('DOMContentLoaded', initPricingCards);

// Dropdown menu functionality
const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
dropdownItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            this.classList.toggle('active');
        }
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    dropdownItems.forEach(item => {
        if (!item.contains(e.target)) {
            item.classList.remove('active');
        }
    });
});

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', function() {
    this.classList.toggle('active');
    // Mobile menu would be handled here
});

// Add scroll effect to navbar
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.borderBottomColor = 'rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.borderBottomColor = '#f0f0f0';
    }
    
    lastScrollTop = scrollTop;
});

// Button click handlers
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-signin, .btn-signup, .btn-outline').forEach(button => {
    button.addEventListener('click', function(e) {
        // Add ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards and sections
document.querySelectorAll('.feature-card, .step, .testimonial-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for stats
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9.]/g, ''));
        const suffix = counter.textContent.replace(/[0-9.]/g, '');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        updateCounter();
    });
};

// Trigger counters when stats section is in view
const statsSection = document.querySelector('.hero-stats');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// Mobile menu toggle
const createMobileMenu = () => {
    const navbar = document.querySelector('.navbar .container');
    const navMenu = document.querySelector('.nav-menu');
    const navButtons = document.querySelector('.nav-right');
    
    if (window.innerWidth <= 768 && navMenu && !document.querySelector('.mobile-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-toggle';
        menuToggle.innerHTML = '☰';
        menuToggle.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
        `;
        
        navbar.insertBefore(menuToggle, navMenu);
        
        menuToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navButtons.style.display = navButtons.style.display === 'flex' ? 'none' : 'flex';
            
            navMenu.style.cssText += `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                flex-direction: column;
                background: white;
                padding: 1rem;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            `;
        });
    }
};

window.addEventListener('resize', createMobileMenu);
createMobileMenu();

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openMenus = document.querySelectorAll('.nav-menu[style*="flex"]');
        openMenus.forEach(menu => menu.style.display = 'none');
    }
});

console.log('PixSee Landing Page - Interactive features loaded');
