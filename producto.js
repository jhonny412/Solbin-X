// producto.js
// Manejo exclusivo de la página de detalles de producto

let currentProduct = null;

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html#catalogo';
        return;
    }

    try {
        let retries = 0;
        while (!window.supabaseClient && !window.supabase && retries < 10) {
            await new Promise(r => setTimeout(r, 200));
            retries++;
        }

        const client = window.supabaseClient || window.supabase;
        if (!client) {
            throw new Error("No se pudo conectar a la base de datos.");
        }

        const { data: product, error } = await client
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error || !product) {
            throw new Error("Producto no encontrado o error de base de datos.");
        }

        currentProduct = product;
        renderProductData(product);
        updateProductSchema(product);
        loadRelatedProducts(product);
        initImageZoom();
        initQuantitySelector();

        document.getElementById('product-loading').classList.add('hidden');
        
        const area = document.getElementById('product-detail-area');
        area.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        area.classList.add('opacity-100', 'translate-y-0');

    } catch (err) {
        console.error(err);
        const loading = document.getElementById('product-loading');
        loading.innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-6"></i>
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-3">Producto No Encontrado</h2>
                <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">El producto que buscas no existe o ha sido movido del catálogo.</p>
                <a href="index.html#catalogo" class="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-sky-700 transition-all transform hover:-translate-y-1">
                    <i class="fas fa-arrow-left"></i> Volver al Catálogo
                </a>
            </div>
        `;
    }
}

function initQuantitySelector() {
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const qtyInput = document.getElementById('product-quantity');
    
    if (!minusBtn || !plusBtn || !qtyInput) return;
    
    let quantity = 1;
    
    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            qtyInput.value = quantity;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        const maxStock = currentProduct?.stock || 99;
        if (quantity < maxStock) {
            quantity++;
            qtyInput.value = quantity;
        }
    });
    
    qtyInput.addEventListener('change', () => {
        let val = parseInt(qtyInput.value);
        const maxStock = currentProduct?.stock || 99;
        if (val < 1) val = 1;
        if (val > maxStock) val = maxStock;
        quantity = val;
        qtyInput.value = quantity;
    });
}

function initImageZoom() {
    const container = document.getElementById('main-image-container');
    const img = document.getElementById('main-product-image');
    
    if (!container || !img) return;
    
    // Ensure container has overflow explicitly hidden to clip the zoomed image
    container.style.overflow = 'hidden';
    
    // Smooth transition for scale and translation
    img.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position relative to container (0 to 1)
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // Zoom factor
        const zoom = 1.6;
        
        // Calculate movement needed so that the point under the mouse stays under the mouse
        // Formula: translation = (0.5 - percentage) * containerSize * (zoom - 1)
        // Expressed in percentage of the image itself:
        const moveX = (0.5 - x) * (zoom - 1) * 100 / zoom;
        const moveY = (0.5 - y) * (zoom - 1) * 100 / zoom;
        
        img.style.transform = `scale(${zoom}) translate(${moveX}%, ${moveY}%)`;
    });
    
    container.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1) translate(0, 0)';
    });
}

function updateProductSchema(p) {
    const el = document.getElementById('product-ld');
    if (!el) return;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "image": p.images || [p.image_url],
        "description": p.description,
        "brand": {
            "@type": "Brand",
            "name": p.brand || "Solbin-X"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "PEN",
            "price": p.price,
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "12"
        }
    };
    el.textContent = JSON.stringify(schema);
}

async function loadRelatedProducts(product) {
    const section = document.getElementById('related-products-section');
    const grid = document.getElementById('related-products-grid');
    if (!section || !grid) return;

    try {
        const client = window.supabaseClient || window.supabase;
        const { data: related, error } = await client
            .from('products')
            .select('*')
            .eq('category', product.category)
            .neq('id', product.id)
            .limit(4);

        if (error || !related || related.length === 0) return;

        grid.innerHTML = '';
        related.forEach(p => {
            const card = document.createElement('div');
            card.className = "producto-card group bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer";
            card.onclick = () => window.location.href = `producto.html?id=${p.id}`;
            
            const img = (p.images && p.images[0]) || p.image_url || '';
            const hasDiscount = p.old_price && parseFloat(p.old_price) > parseFloat(p.price);
            
            let badgeHtml = '';
            if (p.is_new_arrival) {
                badgeHtml += `<span class="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">NUEVO</span>`;
            } else if (p.is_bestseller) {
                badgeHtml += `<span class="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">TOP</span>`;
            } else if (hasDiscount) {
                const discount = Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100);
                badgeHtml += `<span class="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">-${discount}%</span>`;
            }
            
            card.innerHTML = `
                <div class="relative h-40 mb-4 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    ${badgeHtml}
                    <img src="${img}" alt="${p.name}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy">
                </div>
                <h3 class="text-sm font-bold text-gray-800 dark:text-white line-clamp-2 mb-2 flex-grow group-hover:text-[#0D9488] transition-colors">
                    ${p.name}
                </h3>
                <div class="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            ${hasDiscount ? `<span class="text-xs text-gray-400 line-through">S/. ${parseFloat(p.old_price).toLocaleString()}</span>` : ''}
                            <span class="text-lg font-black text-gray-900 dark:text-white block">S/. ${parseFloat(p.price).toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        class="related-add-cart-btn w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                        data-product-id="${p.id}"
                        data-product-name="${p.name}"
                        data-product-price="${p.price}"
                        onclick="event.stopPropagation()">
                        <i class="fas fa-cart-plus text-sm"></i>
                        <span>Agregar al Carrito</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);

            // Activar botón de agregar al carrito de la tarjeta relacionada
            const addBtn = card.querySelector('.related-add-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.cartManager) {
                        window.cartManager.addToCart(p.name, parseFloat(p.price), 1, p);
                        addBtn.innerHTML = `<i class="fas fa-check-circle text-sm"></i><span>¡Agregado!</span>`;
                        addBtn.classList.add('bg-emerald-500');
                        addBtn.classList.remove('bg-[#0D9488]');
                        setTimeout(() => {
                            addBtn.innerHTML = `<i class="fas fa-cart-plus text-sm"></i><span>Agregar al Carrito</span>`;
                            addBtn.classList.remove('bg-emerald-500');
                            addBtn.classList.add('bg-[#0D9488]');
                        }, 2000);
                        if (window.updateCartBadge) window.updateCartBadge();
                    } else {
                        window.location.href = `producto.html?id=${p.id}`;
                    }
                });
            }
        });

        section.classList.remove('hidden');

    } catch (err) {
        console.error("Error loading related products", err);
    }
}

function switchTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.product-tab').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('animate-fade-in'); 
    });
    
    // Remove active styles from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'text-sky-600', 'bg-white', 'dark:bg-gray-800');
        btn.classList.add('text-gray-500', 'bg-gray-50/50', 'dark:bg-gray-900/50');
    });
    
    // Show active content with a small fade in
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.remove('hidden');
        activeTab.classList.add('animate-fade-in');
    }
    
    // Set active button styles
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active-tab', 'text-sky-600', 'bg-white', 'dark:bg-gray-800');
        activeBtn.classList.remove('text-gray-500', 'bg-gray-50/50', 'dark:bg-gray-900/50');
    }
}

function renderProductData(product) {
    document.title = `${product.name} | Solbin-X`;
    document.getElementById('bread-category').textContent = product.category;
    document.getElementById('bread-name').textContent = product.name;
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-brand-badge').textContent = product.brand || product.category;
    
    const desc = product.description ? product.description.replace(/\n/g, '<br>') : 'Sin descripción disponible.';
    document.getElementById('product-description').innerHTML = desc;
    
    const priceFormatted = parseFloat(product.price).toLocaleString();
    document.getElementById('product-price').textContent = `S/. ${priceFormatted}`;
    
    if (product.old_price && parseFloat(product.old_price) > parseFloat(product.price)) {
        const oldFormatted = parseFloat(product.old_price).toLocaleString();
        const oldEl = document.getElementById('product-old-price');
        oldEl.textContent = `S/. ${oldFormatted}`;
        oldEl.classList.remove('hidden');

        const discount = Math.round(((parseFloat(product.old_price) - parseFloat(product.price)) / parseFloat(product.old_price)) * 100);
        const discBadge = document.getElementById('product-discount-badge');
        discBadge.textContent = `-${discount}%`;
        discBadge.classList.remove('hidden');
    }

    const images = (product.images && Array.isArray(product.images) && product.images.length > 0)
        ? product.images
        : (product.image_url ? [product.image_url] : []);
    
    if (images.length > 0) {
        document.getElementById('main-product-image').src = images[0];
        
        if (images.length > 1) {
            const thumbContainer = document.getElementById('thumbnail-gallery');
            thumbContainer.innerHTML = '';
            images.forEach((img, idx) => {
                const thumb = document.createElement('button');
                thumb.className = `flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 overflow-hidden cursor-pointer transition-all bg-white dark:bg-gray-800 p-2 shadow-sm;
                                   ${idx === 0 ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-gray-200 dark:border-gray-600 hover:border-sky-400'}`;
                thumb.setAttribute('aria-label', `Ver imagen ${idx + 1}`);
                
                thumb.innerHTML = `<img src="${img}" class="w-full h-full object-contain" alt="Thumbnail ${idx + 1}">`;
                thumb.onclick = () => {
                    document.getElementById('main-product-image').src = img;
                    Array.from(thumbContainer.children).forEach(t => {
                        t.classList.remove('border-sky-500', 'ring-2', 'ring-sky-500/30');
                        t.classList.add('border-gray-200', 'dark:border-gray-600');
                    });
                    thumb.classList.remove('border-gray-200', 'dark:border-gray-600');
                    thumb.classList.add('border-sky-500', 'ring-2', 'ring-sky-500/30');
                };
                thumbContainer.appendChild(thumb);
            });
        }
        
        document.getElementById('image-count').textContent = `${images.length} imágenes`;
    }

    const badgesContainer = document.getElementById('product-badges');
    badgesContainer.innerHTML = '';
    if (product.is_bestseller) badgesContainer.innerHTML += `<span class="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold w-max shadow-sm">🔥 MÁS VENDIDO</span>`;
    if (product.is_new_arrival) badgesContainer.innerHTML += `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold w-max shadow-sm">✨ NUEVO</span>`;

    const specsContainer = document.getElementById('product-specs-grid');
    const specsSection = document.getElementById('product-specs-container');
    const noSpecsMsg = document.getElementById('no-specs-message');
    
    let specsHtml = '';
    let hasSpecs = false;

    if (product.specifications && Object.keys(product.specifications).length > 0) {
        Object.entries(product.specifications).forEach(([key, val]) => {
            specsHtml += `
            <div class="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 px-4 rounded-lg transition-colors">
                <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${key}</span>
                <span class="text-base font-medium text-gray-900 dark:text-white ml-4 text-right break-words max-w-[60%]">${val}</span>
            </div>`;
            hasSpecs = true;
        });
    }

    if (hasSpecs) {
        specsContainer.innerHTML = specsHtml;
        specsSection.classList.remove('hidden');
        if (noSpecsMsg) noSpecsMsg.classList.add('hidden');
    } else {
        if (noSpecsMsg) noSpecsMsg.classList.remove('hidden');
    }

    const btnCart = document.getElementById('add-to-cart-big-btn');
    btnCart.onclick = () => {
        const qtyInput = document.getElementById('product-quantity');
        const quantity = parseInt(qtyInput?.value || 1);
        
        if (window.cartManager) {
            window.cartManager.addToCart(product.name, parseFloat(product.price), quantity, product);
            btnCart.innerHTML = `<i class="fas fa-check-circle text-2xl"></i> ¡Agregado!`;
            btnCart.classList.add('bg-emerald-600', 'hover:bg-emerald-600');
            
            setTimeout(() => {
                btnCart.innerHTML = `<i class="fas fa-cart-plus text-2xl"></i> Añadir al Carrito`;
                btnCart.classList.remove('bg-emerald-600', 'hover:bg-emerald-600');
            }, 2000);
            
            if (window.updateCartBadge) window.updateCartBadge();
        } else {
            Swal.fire('Atención', 'El carrito aún se está inicializando...', 'warning');
        }
    };

    const msg = `Hola Solbin-X! Estoy interesado en: *${product.name}* (S/. ${priceFormatted}). ¿Cuáles son las opciones de pago y envío?`;
    document.getElementById('buy-whatsapp-btn').href = `https://wa.me/51945297289?text=${encodeURIComponent(msg)}`;
    
    // Inicializar primera tab
    setTimeout(() => switchTab('description'), 100);
}

window.switchTab = switchTab;

window.toggleWishlistBtn = function(btn) {
    if (!currentProduct) return;
    const isLoved = btn.classList.contains('text-red-500');
    
    const img = (currentProduct.images && currentProduct.images[0]) || currentProduct.image_url || '';
    
    if (isLoved) {
        btn.classList.remove('text-red-500');
        btn.classList.add('text-gray-400');
        btn.innerHTML = '<i class="fas fa-heart text-xl"></i>';
        if (window.toggleWishlist) {
            window.toggleWishlist(currentProduct.name, currentProduct.price, img);
        }
    } else {
        btn.classList.add('text-red-500');
        btn.classList.remove('text-gray-400');
        btn.innerHTML = '<i class="fas fa-heart text-xl animate-pulse"></i>';
        if (window.toggleWishlist) {
            window.toggleWishlist(currentProduct.name, currentProduct.price, img);
        }
    }
};

window.switchTab = switchTab;

document.addEventListener('DOMContentLoaded', initProductPage);
