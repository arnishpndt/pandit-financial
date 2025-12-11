document.addEventListener('DOMContentLoaded', () => {
    // Current Year for Footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav ul');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // Scroll Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.service-card, .mission-content, .contact-container, .hero-content');
    animateElements.forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });

    // Handle Intro Loader
    const loader = document.getElementById('intro-loader');
    if (loader) {
        // Wait a bit to show animation, then fade out
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 2200); // 2.2 seconds display time
    }

    // Contact Form Handling (Real Backend)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-primary');
            const originalText = btn.textContent;

            // UI Loading State
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            // Gather Data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Use Web3Forms API
                const apiUrl = 'https://api.web3forms.com/submit';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Success UI
                    btn.textContent = 'Message Sent!';
                    btn.style.backgroundColor = '#10b981'; // Green
                    btn.style.borderColor = '#10b981';
                    btn.style.opacity = '1';

                    contactForm.reset();

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.borderColor = '';
                        btn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Failed to send');
                }

            } catch (error) {
                console.error('Submission Error:', error);

                // Error UI
                btn.textContent = 'Error. Try Again.';
                btn.style.backgroundColor = '#ef4444'; // Red
                btn.style.borderColor = '#ef4444';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // Vertical sticky stack handled by CSS entirely.
    // Preserving empty block if needed or removing.

    // 3D Carousel Logic
    const carouselStage = document.querySelector('.carousel-stage');
    if (carouselStage) {
        const items = Array.from(document.querySelectorAll('.carousel-item'));
        const totalItems = items.length;
        let activeIndex = 0; // Start with first item

        // Configuration
        const xOffsetStep = 400; // Wider spread
        // const zOffsetStep = -250; 
        // const rotateYStep = 30; 

        function updateCarousel() {
            items.forEach((item, index) => {
                // Calculate distance from active index
                // Handle circular wrapping logic visually if desired, 
                // but effectively we just want a linear focus for now or simple wrap.
                // Let's do a simple centering logic:
                let offset = index - activeIndex;

                // Add class resetting
                item.className = 'carousel-item';

                if (offset === 0) {
                    item.classList.add('active');
                    // Much larger scale and brought forward
                    item.style.transform = `translateX(0) translateZ(100px) rotateY(0) scale(1.1)`;
                    item.style.zIndex = 20;
                    item.style.opacity = 1;
                    item.style.pointerEvents = 'auto'; // Ensure clickable
                } else {
                    const absOffset = Math.abs(offset);
                    // Direction
                    const direction = offset > 0 ? 1 : -1;

                    // Simple stack effect
                    // Limit visible stack to +/- 2 for performance/visuals
                    if (absOffset > 2) {
                        item.style.opacity = 0;
                        item.style.pointerEvents = 'none';
                        item.style.transform = `translateX(${direction * xOffsetStep * 2}px) translateZ(-600px)`;
                    } else {
                        item.style.opacity = 0.5; // Dimmer side cards
                        item.style.pointerEvents = 'auto'; // allow clicking to navigate

                        // Calculated pos
                        const xVal = direction * (320 + (absOffset * 60)); // 320px offset base
                        const zVal = -absOffset * 250;
                        const rVal = -direction * 25; // More rotation
                        const sVal = 0.9 - (absOffset * 0.1);

                        item.style.transform = `translateX(${xVal}px) translateZ(${zVal}px) rotateY(${rVal}deg) scale(${sVal})`;
                        item.style.zIndex = 10 - absOffset;
                    }
                }
            });
        }

        // Add Click Listeners
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                activeIndex = index;
                updateCarousel();
            });
        });

        // Arrow Listeners
        const prevBtn = document.querySelector('.carousel-nav.prev');
        const nextBtn = document.querySelector('.carousel-nav.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (activeIndex > 0) {
                    activeIndex--;
                    updateCarousel();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (activeIndex < totalItems - 1) {
                    activeIndex++;
                    updateCarousel();
                }
            });
        }


        // Initialize
        updateCarousel();
    }
});
