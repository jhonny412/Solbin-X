// Theme Toggle Functionality - SIMPLE Y DIRECTO
document.addEventListener('DOMContentLoaded', function () {
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');

    // Cargar tema guardado al cargar la página
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    }

    // Función para cambiar tema
    function toggleTheme() {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    }

    // Agregar event listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

    // Carousel Functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const totalSlides = slides.length;

    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Auto advance carousel every 5 seconds
    let carouselInterval = setInterval(nextSlide, 5000);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);

            // Reset interval when user manually changes slide
            clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 5000);
        });
    });

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 64; // 64px for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Catalog Filter Functionality
    // NOTE: Logic moved to loader.js to handle pagination and filtering centrally.

    window.refreshCatalogUI = function () {
        // Re-attach observers if needed for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.producto-card, .card-hover').forEach(el => {
            if (!el.classList.contains('observed')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
                el.classList.add('observed');
            }
        });

        // Setup cart buttons handled inline now.
    };

    // Initial call
    // setTimeout(window.refreshCatalogUI, 500);


    // Validate form input - prevent XSS
    function validateFormInput(input, maxLength = 255) {
        if (typeof input !== 'string') return '';
        return input.trim().substring(0, maxLength);
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get and validate form values
        const nombre = validateFormInput(document.getElementById('nombre').value, 100);
        const email = validateFormInput(document.getElementById('email').value, 255);
        const telefono = validateFormInput(document.getElementById('telefono').value, 20);
        const asunto = validateFormInput(document.getElementById('asunto').value, 200);
        const mensaje = validateFormInput(document.getElementById('mensaje').value, 1000);

        // Validate form (basic validation)
        if (!nombre || !email || !telefono || !asunto || !mensaje) {
            showMessage('Por favor, completa todos los campos.', 'error');
            return;
        }

        // Email validation (strict regex)
        const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            showMessage('Por favor, ingresa un email válido.', 'error');
            return;
        }

        // Phone validation (basic format)
        const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
        if (!phoneRegex.test(telefono)) {
            showMessage('Por favor, ingresa un teléfono válido.', 'error');
            return;
        }

        // Simulate form submission (in a real scenario, you would send this to a server)
        showMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');

        // Reset form
        contactForm.reset();

        // In a real application, you would send the data to a server here:
        // fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        //     body: JSON.stringify({ nombre, email, telefono, asunto, mensaje })
        // });
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.classList.remove('hidden');

        if (type === 'success') {
            formMessage.classList.remove('text-red-600');
            formMessage.classList.add('text-green-600', 'bg-green-50', 'p-4', 'rounded-lg', 'font-semibold');
        } else {
            formMessage.classList.remove('text-green-600');
            formMessage.classList.add('text-red-600', 'bg-red-50', 'p-4', 'rounded-lg', 'font-semibold');
        }

        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('shadow-xl');
        } else {
            navbar.classList.remove('shadow-xl');
        }

        lastScroll = currentScroll;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.producto-card, .card-hover').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Counter animation for statistics
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString() + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString() + '+';
            }
        }, 20);
    }

    // Trigger counter animation when visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.text-4xl');
                counters.forEach(counter => {
                    const text = counter.textContent;
                    const number = parseInt(text.replace(/\D/g, ''));
                    if (number && !counter.classList.contains('animated')) {
                        counter.classList.add('animated');
                        animateCounter(counter, number);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('#nosotros .grid.grid-cols-2');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Active navigation link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.classList.remove('text-sky-600');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-sky-600');
            }
        });
    });

    // Sanitize HTML - prevent XSS attacks
    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Validate URL - prevent javascript: protocol
    function isValidImageUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    // Image Modal Functionality
    function openModal(imageSrc, caption) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');

        // Validate URL before setting
        if (!isValidImageUrl(imageSrc)) {
            console.error('Invalid image URL');
            return;
        }

        modal.classList.add('active');
        modalImg.src = imageSrc;
        const div = document.createElement('div');
        div.textContent = caption;
        modalCaption.textContent = div.textContent;

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    function closeModal(event) {
        const modal = document.getElementById('imageModal');

        // Close only if clicking outside the image or on the close button
        if (event.target === modal || event.target.className === 'modal-close') {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Exponer funciones al ámbito global para onclick en HTML
    window.openModal = openModal;
    window.closeModal = closeModal;

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modal = document.getElementById('imageModal');
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });

    // Shopping Cart Functionality usando CartManager global
    // (La funcionalidad del carrito ahora está en cart.js)

    // Setup add to cart button handler
    function setupCartButtons() {
        const addToCartButtons = document.querySelectorAll('.producto-card button');
        console.log('Configurando', addToCartButtons.length, 'botones de carrito');

        addToCartButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productCard = button.closest('.producto-card');
                if (!productCard) {
                    console.error('No se encontró .producto-card para el botón', index);
                    return;
                }
                const productName = productCard.getAttribute('data-name');
                const productPrice = parseInt(productCard.getAttribute('data-price'));

                if (!productName || isNaN(productPrice)) {
                    console.error('Datos inválidos:', { productName, productPrice });
                    return;
                }

                console.log('Agregando al carrito:', productName, productPrice);
                // Usar el CartManager global
                if (window.cartManager) {
                    window.cartManager.addToCart(productName, productPrice);
                } else {
                    console.error('CartManager no está disponible');
                }
            });
        });
    }

    // Setup cart buttons cuando el DOM esté listo
    // Esperar un momento para asegurarse de que CartManager esté inicializado
    setTimeout(() => {
        setupCartButtons();
    }, 100);

    window.refreshCatalogUI = function () {
        updateProductDisplay();
        setupCartButtons();
        // Re-attach observers
        document.querySelectorAll('.producto-card, .card-hover').forEach(el => {
            if (!el.classList.contains('observed')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
                el.classList.add('observed');
            }
        });
    };

    console.log('SOLBIN website loaded successfully! 🚀');

}); // FIN de DOMContentLoaded

