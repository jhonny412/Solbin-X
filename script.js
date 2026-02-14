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

    // NOTE: Carousel functionality moved to carousel.js

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

    // Contact Form Submission - Integrado con Formspree
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('contact-submit-btn');
            const originalBtnContent = submitBtn.innerHTML;

            // Get and validate form values
            const nombre = validateFormInput(document.getElementById('nombre').value, 100);
            const email = validateFormInput(document.getElementById('email').value, 255);
            const telefono = validateFormInput(document.getElementById('telefono').value, 20);
            const asunto = validateFormInput(document.getElementById('asunto').value, 200);
            const mensaje = validateFormInput(document.getElementById('mensaje').value, 1000);

            // Validate form (basic validation)
            if (!nombre || !email || !telefono || !asunto || !mensaje) {
                showFormMessage('Por favor, completa todos los campos.', 'error');
                return;
            }

            // Email validation (strict regex)
            const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                showFormMessage('Por favor, ingresa un email válido.', 'error');
                return;
            }

            // Phone validation (basic format)
            const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
            if (!phoneRegex.test(telefono)) {
                showFormMessage('Por favor, ingresa un teléfono válido.', 'error');
                return;
            }

            // Mostrar estado de carga
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';

            try {
                // Enviar a Formspree
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Éxito - redirigir a página de gracias
                    window.location.href = 'gracias.html';
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        showFormMessage(data.errors.map(error => error.message).join(', '), 'error');
                    } else {
                        showFormMessage('Hubo un error al enviar el mensaje. Intenta de nuevo.', 'error');
                    }
                }
            } catch (error) {
                
                showFormMessage('Error de conexión. Por favor intenta más tarde.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.classList.remove('hidden');

        if (type === 'success') {
            formMessage.classList.remove('text-red-600', 'bg-red-50');
            formMessage.classList.add('text-green-600', 'bg-green-50', 'p-4', 'rounded-lg', 'font-semibold');
        } else {
            formMessage.classList.remove('text-green-600', 'bg-green-50');
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

    // Setup add to cart button handler - AHORA GLOBAL
    window.setupCartButtons = function () {
        // Buscar botones con clase específica add-to-cart-btn (nueva implementación)
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

        addToCartButtons.forEach((button, index) => {
            // Remover listener anterior si existe para evitar duplicados
            button.removeEventListener('click', handleAddToCart);
            // Agregar nuevo listener
            button.addEventListener('click', handleAddToCart);
        });
    }

    // Handler separado para poder removerlo si es necesario
    function handleAddToCart(e) {
        e.preventDefault();
        e.stopPropagation();

        const button = e.currentTarget;
        const productName = button.getAttribute('data-name');
        const productPrice = parseFloat(button.getAttribute('data-price'));

        // Get product data if available
        let productData = null;
        const productDataAttr = button.getAttribute('data-product');
        if (productDataAttr) {
            try {
                productData = JSON.parse(productDataAttr.replace(/\\'/g, "'"));
            } catch (err) {
                
            }
        }

        if (!productName || isNaN(productPrice)) {
            return;
        }

        // Usar el CartManager global
        if (window.cartManager) {
            window.cartManager.addToCart(productName, productPrice, 1, productData);

            // Feedback visual en el botón
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> <span class="hidden sm:inline">Agregado</span>';
            button.classList.add('bg-green-600');
            button.classList.remove('bg-[#0D9488]', 'bg-green-600', 'bg-pink-600', 'bg-indigo-600', 'bg-purple-600');

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('bg-green-600');
                // Restaurar color original basado en la clase del botón
                if (button.classList.contains('add-to-cart-btn')) {
                    button.classList.add('bg-[#0D9488]');
                }
            }, 1500);
        } else {
            
        }
    }

    // Setup cart buttons cuando el DOM esté listo
    // Esperar un momento para asegurarse de que CartManager esté inicializado
    setTimeout(() => {
        if (typeof window.setupCartButtons === 'function') {
            window.setupCartButtons();
        }
    }, 800); // Aumentado a 800ms para asegurar que el catálogo esté cargado

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

    // Wishlist / Favoritos functionality
    window.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    window.toggleWishlist = function (name, price, image) {
        const index = window.wishlist.findIndex(item => item.name === name);
        if (index === -1) {
            window.wishlist.push({ name, price, image, addedAt: new Date().toISOString() });
            showToast('Producto agregado a favoritos', 'success');
        } else {
            window.wishlist.splice(index, 1);
            showToast('Producto eliminado de favoritos', 'info');
        }
        localStorage.setItem('wishlist', JSON.stringify(window.wishlist));
        updateWishlistUI();
    };

    window.updateWishlistUI = function () {
        const badge = document.getElementById('wishlist-badge');
        if (badge) {
            if (window.wishlist.length > 0) {
                badge.textContent = window.wishlist.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        // Update wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productName = btn.getAttribute('data-product');
            const isInWishlist = window.wishlist.some(item => item.name === productName);
            if (isInWishlist) {
                btn.classList.add('text-red-500', 'bg-red-50');
                btn.classList.remove('text-gray-400');
            } else {
                btn.classList.remove('text-red-500', 'bg-red-50');
                btn.classList.add('text-gray-400');
            }
        });
    };

    window.showWishlist = function () {
        if (window.wishlist.length === 0) {
            showToast('Tu lista de favoritos está vacía', 'info');
            return;
        }

        let html = '<div class="grid gap-4 max-h-[60vh] overflow-y-auto">';
        window.wishlist.forEach(item => {
            html += `
                <div class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded">
                    <div class="flex-1">
                        <p class="font-medium text-gray-800 dark:text-white text-sm">${item.name}</p>
                        <p class="text-sky-600 font-bold">S/. ${parseFloat(item.price).toLocaleString()}</p>
                    </div>
                    <button onclick="toggleWishlist('${item.name}', ${item.price}, '${item.image}')" class="text-red-500 hover:text-red-700 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        html += '</div>';

        Swal.fire({
            title: 'Mis Favoritos',
            html: html,
            showCloseButton: true,
            showConfirmButton: false,
            width: '500px'
        });
    };

    // Global search function
    window.filterSearchGlobal = function (val) {
        // If on catalog section, trigger the existing filter
        if (typeof window.filterSearch === 'function') {
            window.filterSearch(val);
        }
        // Scroll to catalog if searching
        if (val.length > 2) {
            const catalogo = document.getElementById('catalogo');
            if (catalogo && val.length > 3) {
                catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Toast notification helper
    window.showToast = function (message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-sky-500',
            warning: 'bg-amber-500'
        };
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-circle'
        };

        toast.className = `fixed bottom-24 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[9999] transform translate-x-full transition-transform duration-300`;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Initialize wishlist UI
    updateWishlistUI();

    // Web Alert System
    async function initWebAlert() {
        
        try {
            const client = window.supabaseClient || window.supabase;
            if (!client) {
                
                return;
            }

            
            const { data, error } = await client
                .from('site_settings')
                .select('value, updated_at')
                .eq('key', 'web_alert')
                .single();

            if (error) {
                
                return;
            }

            if (!data?.value) {
                
                return;
            }

            const config = data.value;
            

            if (!config.isActive) {
                
                return;
            }

            if (!config.message) {
                
                return;
            }

            const banner = document.getElementById('web-alert-banner');
            const content = document.getElementById('web-alert-content');
            const icon = document.getElementById('web-alert-icon');
            const iconBg = document.getElementById('web-alert-icon-bg');
            const iconPing = document.getElementById('web-alert-ping');
            const message = document.getElementById('web-alert-message');

            if (!banner || !content || !icon || !message) {
                
                return;
            }

            // --- Cache & Closed Logic ---
            // We use type + message (start) + updated_at to create a unique key
            // This ensures that if the admin updates the alert, it shows up again even if it was closed
            let closedAlerts = [];
            try {
                const stored = localStorage.getItem('closedAlerts');
                closedAlerts = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(closedAlerts)) closedAlerts = [];
            } catch (e) {
                
                closedAlerts = [];
            }

            const version = data.updated_at ? new Date(data.updated_at).getTime() : 'initial';
            const alertKey = `wa_${config.type}_${version}_${config.message.substring(0, 15)}`;
            

            if (closedAlerts.includes(alertKey)) {
                return;
            }

            // Set gradient backgrounds and styles based on type
            const styles = {
                info: {
                    gradient: 'alert-gradient-info',
                    icon: 'fa-info-circle',
                    iconBg: 'bg-white/20',
                    iconColor: 'text-white',
                    textColor: 'text-white',
                    pingBg: 'bg-white'
                },
                success: {
                    gradient: 'alert-gradient-success',
                    icon: 'fa-check-circle',
                    iconBg: 'bg-white/20',
                    iconColor: 'text-white',
                    textColor: 'text-white',
                    pingBg: 'bg-white'
                },
                warning: {
                    gradient: 'alert-gradient-warning',
                    icon: 'fa-triangle-exclamation',
                    iconBg: 'bg-black/10',
                    iconColor: 'text-slate-900',
                    textColor: 'text-slate-900',
                    pingBg: 'bg-slate-900'
                },
                error: {
                    gradient: 'alert-gradient-error',
                    icon: 'fa-times-circle',
                    iconBg: 'bg-white/20',
                    iconColor: 'text-white',
                    textColor: 'text-white',
                    pingBg: 'bg-white'
                }
            };

            const alertType = (config.type || 'info').toLowerCase().trim();
            const style = styles[alertType] || styles.info;

            // Apply gradient background
            content.className = `relative rounded-2xl shadow-2xl p-5 overflow-hidden backdrop-blur-sm border-2 border-white/30 ${style.gradient}`;

            // Apply icon styles
            icon.className = `fas ${style.icon} ${style.iconColor} text-2xl`;
            if (iconBg) iconBg.className = `w-12 h-12 rounded-full flex items-center justify-center animate-bounce-slow shadow-lg ${style.iconBg}`;
            if (iconPing) iconPing.className = `absolute inset-0 rounded-full animate-ping opacity-25 ${style.pingBg}`;

            // Apply message styles
            message.className = `text-base font-bold leading-relaxed animate-fade-in ${style.textColor}`;
            message.textContent = config.message;

            // Store alert key for closure functionality
            banner.dataset.alertKey = alertKey;

            // MOSTRAR BANNER
            banner.classList.remove('hidden');
            



        } catch (e) {
            
        }
    }

    window.closeWebAlert = function () {
        const banner = document.getElementById('web-alert-banner');
        if (banner) {
            const alertKey = banner.dataset.alertKey;

            if (alertKey) {
                try {
                    let closedAlerts = [];
                    const stored = localStorage.getItem('closedAlerts');
                    closedAlerts = stored ? JSON.parse(stored) : [];
                    if (Array.isArray(closedAlerts)) {
                        if (!closedAlerts.includes(alertKey)) {
                            closedAlerts.push(alertKey);
                            // Limitar tamaño de localStorage para evitar llenarlo si hay muchas alertas
                            if (closedAlerts.length > 30) closedAlerts.shift();
                            localStorage.setItem('closedAlerts', JSON.stringify(closedAlerts));
                        }
                    }
                } catch (e) {
                    
                }
            }

            banner.classList.add('hidden');
        }
    };

    // Initialize web alert after a short delay to ensure Supabase is ready
    setTimeout(() => {
        initWebAlert();
    }, 500);

    // Countdown Timer para Banner de Ofertas
    // Countdown Timer para Banner de Ofertas
    async function initCountdownTimer() {
        const offerBanner = document.getElementById('offer-banner-section');
        
        if (!offerBanner) {
            return;
        }

        // Default Config - oculto por defecto hasta obtener configuración
        let config = {
            isActive: false,
            endDate: new Date(new Date().getTime() + (72 * 60 * 60 * 1000)).toISOString()
        };

        // Esperar a que Supabase esté disponible (máximo 5 intentos)
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
            const client = window.supabaseClient || window.supabase;
            if (client && client.from) {
                try {
                    const { data, error } = await client
                        .from('site_settings')
                        .select('value')
                        .eq('key', 'offer_banner')
                        .maybeSingle();

                    if (error) {
                        console.error('Error fetching offer banner config:', error);
                    } else if (data && data.value) {
                        config = data.value;
                        console.log('Offer banner config loaded:', config);
                    } else {
                        console.log('No offer banner config found, using defaults');
                    }
                    break; // Éxito, salir del bucle
                } catch (e) {
                    console.error('Exception fetching offer banner config:', e);
                    break;
                }
            }
            
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 300));
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.warn('Supabase client not available after maximum attempts');
        }

        // Apply Visibility based on isActive setting
        if (config.isActive) {
            offerBanner.classList.remove('hidden');
        } else {
            offerBanner.classList.add('hidden');
            return; // Don't start timer if hidden
        }

        // Get countdown elements after showing banner
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
            return;
        }

        const endDate = new Date(config.endDate);

        function updateCountdown() {
            const now = new Date();
            const diff = endDate - now;

            if (diff <= 0) {
                // Oferta expirada
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    initCountdownTimer();

    // NOTE: Carousel functionality moved to carousel.js
    // Global carousel functions are now defined in carousel.js

}); // FIN de DOMContentLoaded

