// Carrito de Compras - Funcionalidad Global
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.updateCartBadge();
    }

    // Cargar carrito desde localStorage
    loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');

            if (savedCart) {
                const parsed = JSON.parse(savedCart);

                // Validar estructura del carrito
                if (Array.isArray(parsed)) {
                    this.cart = parsed.filter(item =>
                        item &&
                        typeof item.name === 'string' &&
                        typeof item.price === 'number' &&
                        typeof item.quantity === 'number' &&
                        item.name.length > 0 &&
                        item.price > 0 &&
                        item.quantity > 0
                    );
                } else {
                    this.cart = [];
                }
            } else {
                this.cart = [];
            }
        } catch (e) {
            console.error('CartManager: Error al cargar el carrito:', e);
            this.cart = [];
        }
        return this.cart;
    }

    // Guardar carrito en localStorage
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error al guardar el carrito:', e);
        }
    }

    // Agregar producto al carrito
    addToCart(productName, productPrice, quantity = 1, productData = null) {
        const existingItem = this.cart.find(item => item.name === productName);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const item = {
                name: productName,
                price: productPrice,
                quantity: quantity
            };

            // Add product info if available (for image display)
            if (productData) {
                item.id = productData.id || null;
                item.image = (productData.images && Array.isArray(productData.images) && productData.images.length > 0)
                    ? productData.images[0]
                    : (productData.image_url || '');
                item.images = productData.images || (productData.image_url ? [productData.image_url] : []);
                item.stock = productData.stock || 999;
            }

            this.cart.push(item);
        }

        this.saveCart();
        this.updateCartBadge();

        // Mostrar notificación
        this.showNotification(productName, quantity);
    }

    // Actualizar cantidad de un producto
    updateQuantity(index, change) {
        if (index >= 0 && index < this.cart.length) {
            this.cart[index].quantity += change;

            if (this.cart[index].quantity <= 0) {
                this.cart.splice(index, 1);
            }

            this.saveCart();
            this.updateCartBadge();

            // Si estamos en la página del carrito, actualizar la visualización
            if (typeof this.updateCartDisplay === 'function') {
                this.updateCartDisplay();
            }
        }
    }

    // Eliminar producto del carrito
    removeFromCart(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartBadge();

            // Si estamos en la página del carrito, actualizar la visualización
            if (typeof this.updateCartDisplay === 'function') {
                this.updateCartDisplay();
            }
        }
    }

    // Vaciar carrito
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartBadge();

        // Si estamos en la página del carrito, actualizar la visualización
        if (typeof this.updateCartDisplay === 'function') {
            this.updateCartDisplay();
        }
    }

    // Actualizar badge del carrito
    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        const headerTotal = document.getElementById('cart-total-header');

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = this.getTotal();

        // Actualizar badge
        if (badge) {
            if (totalItems > 0) {
                badge.classList.remove('hidden');
                badge.textContent = totalItems;
                badge.classList.remove('scale-0');
                badge.classList.add('scale-100');
            } else {
                badge.classList.add('hidden');
                badge.classList.remove('scale-100');
                badge.classList.add('scale-0');
            }
        }

        // Actualizar total en header
        if (headerTotal) {
            headerTotal.textContent = `S/. ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }

    // Obtener total de productos
    getTotalItems() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Obtener total de los items (Precio con IGV incluido)
    getItemsTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Obtener subtotal (Base imponible: Precio / 1.18)
    getSubtotal() {
        return this.getItemsTotal() / 1.18;
    }

    // Obtener IGV (18% del subtotal)
    getIGV() {
        return this.getItemsTotal() - this.getSubtotal();
    }

    // Obtener costo de envío (pagado por el cliente en el courier)
    getShipping() {
        return 0;
    }

    // Obtener total (Items solamente, sin envío)
    getTotal() {
        return this.getItemsTotal();
    }

    // Sanitizar HTML para prevenir XSS
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Mostrar notificación
    showNotification(productName, quantity = 1) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300';

        const iconElement = document.createElement('i');
        iconElement.className = 'fas fa-check-circle text-2xl mr-3';

        const textContainer = document.createElement('div');

        const productNameElement = document.createElement('p');
        productNameElement.className = 'font-bold';
        productNameElement.textContent = this.sanitizeHTML(productName);

        const messageElement = document.createElement('p');
        messageElement.className = 'text-sm';
        messageElement.textContent = quantity > 1 ? `${quantity} unidades agregadas` : 'Agregado al carrito';

        textContainer.appendChild(productNameElement);
        textContainer.appendChild(messageElement);

        const container = document.createElement('div');
        container.className = 'flex items-center';
        container.appendChild(iconElement);
        container.appendChild(textContainer);

        notification.appendChild(container);
        document.body.appendChild(notification);

        // Mostrar notificación
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);

        // Ocultar notificación
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Crear instancia global del carrito
window.cartManager = new CartManager();

// Funciones globales para compatibilidad
function addToCart(productName, productPrice, quantity = 1) {
    window.cartManager.addToCart(productName, productPrice, quantity);
}

function updateQuantity(index, change) {
    window.cartManager.updateQuantity(index, change);
}

function removeFromCart(index) {
    window.cartManager.removeFromCart(index);
}

function clearCart() {
    window.cartManager.clearCart();
}