// Carrito Page - Funcionalidad específica para la página del carrito
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

    // Extender el CartManager con funcionalidad específica del carrito
    console.log('Verificando CartManager:', window.cartManager);
    console.log('Carrito actual:', window.cartManager ? window.cartManager.cart : 'No disponible');

    if (window.cartManager) {
        // Agregar método para actualizar la visualización del carrito
        window.cartManager.updateCartDisplay = function () {
            console.log('updateCartDisplay llamado, carrito:', this.cart);
            const cartEmpty = document.getElementById('cart-empty');
            const cartItems = document.getElementById('cart-items');
            const cartBody = document.getElementById('cart-body');
            const checkoutBtn = document.getElementById('checkout-btn');

            if (!cartEmpty || !cartItems || !cartBody || !checkoutBtn) {
                console.error('Elementos del carrito no encontrados');
                return;
            }

            console.log('Cantidad de items en el carrito:', this.cart.length);

            if (this.cart.length === 0) {
                console.log('Mostrando carrito vacío');
                cartEmpty.classList.remove('hidden');
                cartItems.classList.add('hidden');
                checkoutBtn.disabled = true;
            } else {
                console.log('Mostrando items del carrito:', this.cart);
                cartEmpty.classList.add('hidden');
                cartItems.classList.remove('hidden');
                checkoutBtn.disabled = false;

                cartBody.innerHTML = '';
                this.cart.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition';

                    // Crear celdas de la tabla
                    const nameCell = document.createElement('td');
                    nameCell.className = 'px-6 py-4 text-sm text-gray-800 dark:text-gray-300 font-medium';
                    nameCell.textContent = this.sanitizeHTML(item.name);

                    const priceCell = document.createElement('td');
                    priceCell.className = 'px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-300';
                    priceCell.textContent = `S/. ${item.price.toLocaleString()}`;

                    // Controles de cantidad
                    const quantityCell = document.createElement('td');
                    quantityCell.className = 'px-6 py-4 text-center';
                    quantityCell.innerHTML = `
                        <div class="flex items-center justify-center space-x-2">
                            <button class="bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-3 py-1 rounded hover:bg-sky-300 dark:hover:bg-sky-800 transition font-bold" onclick="updateQuantity(${index}, -1)">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-8 text-center font-semibold text-gray-800 dark:text-gray-300">${item.quantity}</span>
                            <button class="bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-3 py-1 rounded hover:bg-sky-300 dark:hover:bg-sky-800 transition font-bold" onclick="updateQuantity(${index}, 1)">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    `;

                    // Precio total
                    const totalCell = document.createElement('td');
                    totalCell.className = 'px-6 py-4 text-center text-sm font-bold text-sky-600 dark:text-cyan-400';
                    totalCell.textContent = `S/. ${(item.price * item.quantity).toLocaleString()}`;

                    // Botón eliminar
                    const deleteCell = document.createElement('td');
                    deleteCell.className = 'px-6 py-4 text-center';
                    deleteCell.innerHTML = `
                        <button class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition font-semibold hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 px-3 py-2 rounded" onclick="removeFromCart(${index})">
                            <i class="fas fa-trash mr-1"></i>Eliminar
                        </button>
                    `;

                    row.appendChild(nameCell);
                    row.appendChild(priceCell);
                    row.appendChild(quantityCell);
                    row.appendChild(totalCell);
                    row.appendChild(deleteCell);

                    cartBody.appendChild(row);
                });
            }

            this.updateSummary();
            this.updateCartBadge();
        };

        // Agregar método para actualizar el resumen
        window.cartManager.updateSummary = function () {
            const subtotalElement = document.getElementById('subtotal');
            const igvElement = document.getElementById('igv');
            const shippingElement = document.getElementById('shipping');
            const totalElement = document.getElementById('total');

            if (subtotalElement && igvElement && shippingElement && totalElement) {
                const subtotal = this.getSubtotal();
                const igv = this.getIGV();
                const shipping = this.getShipping();
                const total = this.getTotal();

                subtotalElement.textContent = `S/. ${subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                igvElement.textContent = `S/. ${igv.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                shippingElement.textContent = `S/. ${shipping.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                totalElement.textContent = `S/. ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        };

        // Configurar botón de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async function () {
                if (window.cartManager.cart.length === 0) {
                    Swal.fire('Carrito vacío', 'Agrega productos antes de proceder.', 'warning');
                    return;
                }

                // Phone Validation
                const phoneInput = document.getElementById('customer-phone');
                const phoneNumberUser = phoneInput ? phoneInput.value.trim() : '';

                if (!phoneNumberUser || phoneNumberUser.length < 9) {
                    Swal.fire('Falta información', 'Por favor ingresa tu número de WhatsApp válido (9 dígitos) para poder contactarte.', 'warning');
                    if (phoneInput) phoneInput.focus();
                    return;
                }

                // Show loading state
                const originalText = checkoutBtn.innerHTML;
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Procesando...';

                try {
                    // 1. Save Order to Supabase
                    let client = window.supabaseClient || window.supabase;

                    // Double check if client is valid (has .from method)
                    if (!client || typeof client.from !== 'function') {
                        console.warn("Supabase client not ready. Attempting to re-initialize...");
                        if (typeof initSupabase === 'function') {
                            initSupabase();
                            client = window.supabaseClient;
                        }
                    }

                    if (!client || typeof client.from !== 'function') {
                        throw new Error("No se pudo conectar con el sistema de pedidos. Por favor recarga la página.");
                    }

                    const subtotal = window.cartManager.getSubtotal();
                    const igv = window.cartManager.getIGV();
                    const shipping = window.cartManager.getShipping();
                    const total = window.cartManager.getTotal();

                    let orderId = 'PENDING-' + Date.now();

                    const orderData = {
                        items: window.cartManager.cart,
                        total: total,
                        status: 'iniciado',
                        customer_info: {
                            phone: phoneNumberUser,
                            subtotal: subtotal,
                            igv: igv,
                            shipping: shipping,
                            user_agent: navigator.userAgent
                        }
                    };

                    const { data, error } = await client
                        .from('orders')
                        .insert([orderData])
                        .select(); // Return data to get ID

                    if (error) {
                        console.error('Supabase Error:', error);
                        throw new Error("Error guardando el pedido: " + error.message);
                    }

                    if (data && data.length > 0) {
                        orderId = data[0].id; // Real DB ID
                    }

                    console.log('Order created with ID:', orderId);

                    // 2. Prepare WhatsApp Message

                    // Crear mensaje para WhatsApp con emojis
                    let message = `*SOLBIN - Pedido de Compra #${orderId}*\n\n`;
                    message += `¡Hola! Me gustaría realizar el siguiente pedido:\n\n`;
                    message += `*Productos Solicitados:*\n`;
                    message += `------------------------------\n\n`;
                    window.cartManager.cart.forEach((item, index) => {
                        message += `${index + 1}. *${item.name}*\n`;
                        message += `   Cantidad: ${item.quantity} unidad${item.quantity > 1 ? 'es' : ''}\n`;
                        message += `   Precio unitario: S/. ${item.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                        message += `   Subtotal: S/. ${(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
                    });
                    message += `------------------------------\n`;
                    message += `*Resumen del Pedido:*\n\n`;
                    message += `• Subtotal: S/. ${subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                    message += `• IGV (18%): S/. ${igv.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                    message += `• Envío: ${shipping === 0 ? 'GRATIS' : 'S/. ' + shipping.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
                    message += `*TOTAL A PAGAR: S/. ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n`;
                    message += `------------------------------\n\n`;
                    message += `Espero su confirmación para proceder con el pago. ¡Gracias!`;

                    const phoneNumber = '51945297289';
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

                    // Open WA
                    window.open(whatsappUrl, '_blank');

                    // Optional: Clear cart after successful "order placement"? 
                    // Usually better to keep it until they actually pay, but for this flow:
                    window.cartManager.clearCart(); // Auto-clear as requested
                    Swal.fire('¡Pedido Iniciado!', `Tu pedido #${orderId} ha sido registrado. Completa el pago en WhatsApp.`, 'success');

                } catch (err) {
                    console.error('Error processing order:', err);
                    Swal.fire('Error', 'Hubo un problema al registrar el pedido.', 'error');
                } finally {
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = originalText;
                }
            });
        }

        // Configurar botón de vaciar carrito
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function () {
                if (confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
                    window.cartManager.clearCart();
                }
            });
        }

        // Inicializar la visualización del carrito
        setTimeout(() => {
            window.cartManager.updateCartDisplay();
        }, 100);

    } else {
        console.error('CartManager no está disponible en la página del carrito');
    }

    console.log('Página del carrito cargada exitosamente! 🛒');
});
