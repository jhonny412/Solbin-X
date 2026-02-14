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
    
    

    if (window.cartManager) {
        // Agregar método para actualizar la visualización del carrito - Nuevo diseño e-commerce
        window.cartManager.updateCartDisplay = function () {
            
            const cartEmpty = document.getElementById('cart-empty');
            const cartItems = document.getElementById('cart-items');
            const cartContainer = document.getElementById('cart-items-container');
            const checkoutBtn = document.getElementById('checkout-btn');
            const cartItemCount = document.getElementById('cart-item-count');

            if (!cartEmpty || !cartItems || !cartContainer || !checkoutBtn) {
                
                return;
            }

            

            // Actualizar contador
            if (cartItemCount) {
                const totalItems = this.cart.reduce((acc, item) => acc + item.quantity, 0);
                cartItemCount.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
            }

            if (this.cart.length === 0) {
                
                cartEmpty.classList.remove('hidden');
                cartItems.classList.add('hidden');
                checkoutBtn.disabled = true;
            } else {
                
                cartEmpty.classList.add('hidden');
                cartItems.classList.remove('hidden');
                checkoutBtn.disabled = false;

                cartContainer.innerHTML = '';
                this.cart.forEach((item, index) => {
                    // Get product images - support both old and new format
                    const productImage = item.image || item.image_url || '';
                    const productImages = item.images || (item.image_url ? [item.image_url] : []);

                    // Build thumbnails HTML for additional images
                    let thumbnailsHtml = '';
                    if (productImages.length > 1) {
                        thumbnailsHtml = '<div class="flex gap-1 mt-2 overflow-x-auto pb-1">';
                        productImages.forEach((imgUrl, imgIdx) => {
                            thumbnailsHtml += `
                                <img src="${imgUrl}" 
                                    class="w-10 h-10 rounded-lg object-cover border-2 border-transparent hover:border-sky-500 transition-colors cursor-pointer flex-shrink-0" 
                                    alt="Imagen ${imgIdx + 1}"
                                    onclick="viewProductImages(${index})">
                            `;
                        });
                        thumbnailsHtml += '</div>';
                    }

                    const card = document.createElement('div');
                    card.className = 'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full';

                    // Image with gallery indicator
                    let imageHtml = '';
                    if (productImage) {
                        imageHtml = `<img src="${productImage}" alt="${this.sanitizeHTML(item.name)}" class="w-full h-full object-contain p-2">`;
                    } else {
                        imageHtml = `<i class="fas fa-box text-3xl text-gray-300 dark:text-gray-500"></i>`;
                    }

                    card.innerHTML = `
                        <!-- Imagen del producto con miniaturas -->
                        <div class="w-full sm:w-28 flex flex-col items-center flex-shrink-0">
                            <div class="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative">
                                ${imageHtml}
                            </div>
                            ${productImages.length > 1 ? `<div class="text-[9px] text-gray-400 mt-1">+${productImages.length - 1} imagen${productImages.length > 2 ? 'es' : ''}</div>` : ''}
                            ${thumbnailsHtml}
                        </div>
                        
                        <!-- Información del producto -->
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base line-clamp-2">${this.sanitizeHTML(item.name)}</h3>
                            <p class="text-sky-600 dark:text-cyan-400 font-semibold mt-1">S/. ${item.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u</p>
                            <p class="text-gray-500 dark:text-gray-400 text-xs mt-0.5">En stock</p>
                        </div>
                        
                        <!-- Controles de cantidad -->
                        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                            <button onclick="updateQuantity(${index}, -1)" 
                                class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-500 transition shadow-sm"
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-10 text-center font-semibold text-gray-800 dark:text-white text-sm">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)" 
                                class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-500 transition shadow-sm">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                        
                        <!-- Subtotal -->
                        <div class="text-right min-w-[100px]">
                            <p class="font-bold text-gray-800 dark:text-white text-lg">S/. ${(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <button onclick="removeFromCart(${index})" 
                                class="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 mt-1 ml-auto transition">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                        </div>
                    `;

                    cartContainer.appendChild(card);
                });
            }

            this.updateSummary();
            this.updateCartBadge();
        };



        // Agregar método para actualizar el resumen - Nuevo diseño
        window.cartManager.updateSummary = function () {
            const subtotalElement = document.getElementById('subtotal');
            const igvElement = document.getElementById('igv');
            const discountElement = document.getElementById('discount');
            const totalElement = document.getElementById('total');

            if (subtotalElement && igvElement && totalElement) {
                const subtotal = this.getSubtotal();
                const igv = this.getIGV();
                const total = this.getTotal();

                subtotalElement.textContent = `S/. ${subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                igvElement.textContent = `S/. ${igv.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                totalElement.textContent = `S/. ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                // Si hay elemento de descuento, mostrarlo
                if (discountElement) {
                    const discount = this.getDiscount ? this.getDiscount() : 0;
                    discountElement.textContent = discount > 0 ? `- S/. ${discount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '- S/. 0.00';
                }
            }

            // Actualizar el badge del header
            this.updateCartBadge && this.updateCartBadge();
        };

        // LLamada inicial para renderizar el carrito
        window.cartManager.updateCartDisplay();

        // Configurar botón de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                if (window.cartManager.cart.length === 0) {
                    Swal.fire('Carrito vacío', 'Agrega productos antes de proceder.', 'warning');
                    return;
                }

                // Phone Validation
                const phoneInput = document.getElementById('customer-phone');
                const nameInput = document.getElementById('customer-name');
                const customerNameUser = nameInput ? nameInput.value.trim() : '';
                const phoneNumberUser = phoneInput ? phoneInput.value.trim() : '';

                if (!customerNameUser) {
                    Swal.fire('Falta información', 'Por favor ingresa tu nombre completo para el registro del pedido.', 'warning');
                    if (nameInput) nameInput.focus();
                    return;
                }

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
                    const shipping = window.cartManager.getShipping ? window.cartManager.getShipping() : 0;
                    const total = window.cartManager.getTotal();

                    let orderId = 'PENDING-' + Date.now();

                    const orderData = {
                        items: window.cartManager.cart,
                        total: total,
                        status: 'iniciado',
                        customer_info: {
                            name: customerNameUser,
                            phone: phoneNumberUser,
                            subtotal: subtotal,
                            igv: igv,
                            user_agent: navigator.userAgent
                        }
                    };

                    const { data, error } = await client
                        .from('orders')
                        .insert([orderData])
                        .select(); // Return data to get ID

                    if (error) {
                        
                        throw new Error("Error guardando el pedido: " + error.message);
                    }

                    if (data && data.length > 0) {
                        orderId = data[0].id; // Real DB ID
                    }

                    

                    // 2. Prepare WhatsApp Message

                    // Crear mensaje para WhatsApp con emojis
                    let message = `*SOLBIN - Pedido de Compra #${orderId}*\n\n`;
                    message += `¡Hola! Me llamo *${customerNameUser || 'Cliente'}* y me gustaría realizar el siguiente pedido:\n\n`;
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
            clearCartBtn.addEventListener('click', function (e) {
                e.preventDefault();
                Swal.fire({
                    title: '¿Vaciar carrito?',
                    text: "Se eliminarán todos los productos seleccionados.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Sí, vaciar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.cartManager.clearCart();
                        Swal.fire('Vaciado', 'Tu carrito ha sido vaciado.', 'success');
                    }
                });
            });
        }

        // Configurar eventos de imágenes de productos
        setupProductImageModal();
    } else {
        
    }

    
});

// Product Image Modal Functions
function setupProductImageModal() {
    // Create modal structure if it doesn't exist
    let modal = document.getElementById('productImageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productImageModal';
        modal.className = 'fixed inset-0 z-[200] hidden overflow-y-auto';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity" onclick="closeProductImageModal()"></div>
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
                    <div class="bg-slate-50/50 px-8 py-6 flex justify-between items-center border-b border-slate-100 dark:border-gray-700">
                        <h3 id="productImageModalTitle" class="text-xl font-bold text-gray-800 dark:text-white">Imágenes del Producto</h3>
                        <button onclick="closeProductImageModal()" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-700 text-slate-400 hover:text-rose-500 transition flex items-center justify-center">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-8">
                        <!-- Main Image -->
                        <div class="aspect-square bg-slate-50 dark:bg-gray-700 rounded-[2rem] overflow-hidden flex items-center justify-center mb-6">
                            <img id="productImageModalMain" src="" alt="Imagen principal" class="w-full h-full object-contain p-6">
                        </div>
                        <!-- Thumbnails -->
                        <div id="productImageModalThumbs" class="flex flex-wrap gap-3 justify-center"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// View product images from cart
window.viewProductImages = function (index) {
    const item = window.cartManager.cart[index];
    if (!item) return;

    const images = item.images || (item.image ? [item.image] : []);
    if (images.length === 0) {
        Swal.fire('Sin imágenes', 'Este producto no tiene imágenes disponibles.', 'info');
        return;
    }

    const modal = document.getElementById('productImageModal');
    const mainImg = document.getElementById('productImageModalMain');
    const thumbsContainer = document.getElementById('productImageModalThumbs');
    const titleEl = document.getElementById('productImageModalTitle');

    if (!modal || !mainImg || !thumbsContainer) return;

    // Set title
    if (titleEl) titleEl.textContent = item.name;

    // Set main image
    mainImg.src = images[0];

    // Build thumbnails
    thumbsContainer.innerHTML = '';
    images.forEach((imgUrl, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 dark:border-gray-600 hover:border-brand-300'}`;
        thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Imagen ${idx + 1}" class="w-full h-full object-cover">`;
        thumbBtn.onclick = () => {
            mainImg.src = imgUrl;
            thumbsContainer.querySelectorAll('button').forEach((btn, i) => {
                btn.className = `w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 dark:border-gray-600 hover:border-brand-300'}`;
            });
        };
        thumbsContainer.appendChild(thumbBtn);
    });

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeProductImageModal = function () {
    const modal = document.getElementById('productImageModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};
