// Variables de estado global del catálogo
let catalogState = {
    allProducts: [],
    filteredProducts: [],
    currentPage: 1,
    productsPerPage: 16,
    filters: {
        category: 'all',
        search: '',
        brands: [],
        priceMax: 10000,
        sort: 'default'
    }
};

// --- CORE LOADER ---

// Cargar productos al inicio
async function loadAndRenderProducts() {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    // Loader inicial
    grid.innerHTML = '<div class="col-span-1 md:col-span-2 lg:col-span-4 text-center py-20"><i class="fas fa-circle-notch fa-spin text-4xl text-sky-600"></i><p class="mt-4 text-gray-500 dark:text-gray-400">Cargando catálogo...</p></div>';

    try {
        const client = window.supabaseClient || window.supabase;
        if (!client) throw new Error("Supabase no inicializado");

        const { data: products, error } = await client
            .from('products')
            .select('*')
            .order('is_new_arrival', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!products || products.length === 0) {
            grid.innerHTML = '<div class="col-span-4 text-center text-gray-500">No hay productos disponibles.</div>';
            return;
        }

        // Guardar todos los productos
        catalogState.allProducts = products;

        // Aplicar filtros iniciales (default)
        applyFilters();

    } catch (err) {
        
        grid.innerHTML = `<div class="col-span-4 text-center text-red-500">Error al cargar: ${err.message}</div>`;
    }
}

// --- FILTERING LOGIC ---

function applyFilters() {
    let { allProducts, filters } = catalogState;
    let filtered = [...allProducts];

    // 1. Categoría
    if (filters.category !== 'all') {
        filtered = filtered.filter(p => p.category === filters.category);
    }

    // 2. Buscador (Nombre o Descripción)
    if (filters.search) {
        const term = filters.search.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term))
        );
    }

    // 3. Marca (Texto en Nombre o marca si existe)
    if (filters.brands.length > 0) {
        filtered = filtered.filter(p => {
            const prodName = p.name.toLowerCase();
            // Check if any selected brand is in the name
            return filters.brands.some(brand => prodName.includes(brand.toLowerCase()));
        });
    }

    // 4. Precio
    if (filters.priceMax < 10000) {
        filtered = filtered.filter(p => parseFloat(p.price) <= filters.priceMax);
    }

    // 5. Ordenamiento
    if (filters.sort !== 'default') {
        filtered.sort((a, b) => {
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();

            switch (filters.sort) {
                case 'price-low': return priceA - priceB;
                case 'price-high': return priceB - priceA;
                case 'name-asc': return nameA.localeCompare(nameB);
                case 'name-desc': return nameB.localeCompare(nameA);
                default: return 0;
            }
        });
    }

    catalogState.filteredProducts = filtered;
    catalogState.currentPage = 1; // Reset page

    updateProductCountHTML();
    renderCurrentPage();
}

function updateProductCountHTML() {
    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = catalogState.filteredProducts.length;
}

// --- RENDERING ---

function renderCurrentPage() {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    const { filteredProducts, currentPage, productsPerPage } = catalogState;

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="col-span-4 text-center text-gray-500 py-10">No se encontraron productos con estos filtros.</div>';
        document.getElementById('paginacion-controls').innerHTML = '';
        return;
    }

    // Paginación
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    grid.innerHTML = '';


    productsToShow.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = "producto-card group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700";

        // Agregar atributos data para debugging
        card.setAttribute('data-product-id', p.id || index);
        card.setAttribute('data-product-name', p.name);

        // Get images array - support both old and new format
        const images = (p.images && Array.isArray(p.images) && p.images.length > 0)
            ? p.images
            : (p.image_url ? [p.image_url] : []);
        const mainImage = images[0] || '';
        const imageCount = images.length;

        let color = 'sky';
        let categoryIcon = 'fa-laptop';
        if (p.category === 'smartphones') { color = 'green'; categoryIcon = 'fa-mobile-alt'; }
        if (p.category === 'tablets') { color = 'pink'; categoryIcon = 'fa-tablet-alt'; }
        if (p.category === 'accesorios') { color = 'indigo'; categoryIcon = 'fa-headphones'; }
        if (p.category === 'gaming') { color = 'purple'; categoryIcon = 'fa-gamepad'; }

        const productJson = JSON.stringify(p).replace(/"/g, '&quot;').replace(/'/g, "&#39;");

        // Generar badges
        let badges = '';
        if (p.is_new_arrival) {
            badges += `<div class="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-10 animate-pulse flex items-center gap-1">
                <i class="fas fa-sparkles"></i> NUEVO
            </div>`;
        }
        if (p.is_bestseller) {
            badges += `<div class="absolute top-3 left-3 ${!p.is_new_arrival ? '' : 'top-10'} bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                <i class="fas fa-fire"></i> MÁS VENDIDO
            </div>`;
        }
        if (p.old_price && parseFloat(p.old_price) > parseFloat(p.price)) {
            const discount = Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100);
            badges += `<div class="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10">
                -${discount}%
            </div>`;
        }

        // Generar specs preview
        let specsPreview = '';
        if (p.specifications) {
            const specs = Object.entries(p.specifications).slice(0, 2);
            specsPreview = specs.map(([key, val]) => `<span class="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">${val}</span>`).join('');
        }

        // Escapar comillas simples en el nombre para evitar romper el onclick
        const safeName = p.name.replace(/'/g, "\\'");

        card.innerHTML = `
            <!-- Imagen Container -->
            <div class="relative h-56 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 cursor-pointer" onclick='openProductModal(${productJson})'>
                <img src="${mainImage}" alt="${p.name}" class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" loading="lazy">
                
                ${badges}
                
                ${imageCount > 1 ? `
                <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                    <i class="fas fa-images"></i> ${imageCount}
                </div>
                ` : ''}
                
                <!-- Overlay de acciones -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <i class="fas fa-eye mr-2"></i>Vista Rápida
                    </span>
                </div>
            </div>
            
            <!-- Botón de favorito -->
            <button type="button" onclick="event.stopPropagation(); toggleWishlist('${safeName}', ${p.price}, '${mainImage}')" 
                class="absolute top-3 right-3 ${p.old_price && parseFloat(p.old_price) > parseFloat(p.price) ? 'top-10' : ''} w-9 h-9 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 z-20 wishlist-btn" data-product="${safeName}">
                <i class="fas fa-heart"></i>
            </button>

            <!-- Contenido -->
            <div class="p-5">
                <!-- Categoría y Rating -->
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-bold tracking-wider text-${color}-600 dark:text-${color}-400 uppercase bg-${color}-50 dark:bg-${color}-900/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <i class="fas ${categoryIcon}"></i> ${p.category}
                    </span>
                    <div class="flex items-center text-yellow-400 text-xs">
                        <i class="fas fa-star"></i>
                        <span class="ml-1 text-gray-500 dark:text-gray-400">4.9</span>
                    </div>
                </div>
                
                <!-- Nombre del producto -->
                <h3 class="text-base font-bold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-sky-600 transition leading-snug line-clamp-2 min-h-[2.5rem]" onclick='openProductModal(${productJson})'>
                    ${p.name}
                </h3>
                
                <!-- Specs preview -->
                <div class="flex flex-wrap gap-1 mb-3">
                    ${specsPreview}
                </div>
                
                <!-- Stock indicator -->
                <div class="flex items-center gap-1 mb-3">
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="text-xs text-green-600 dark:text-green-400 font-medium">En stock</span>
                </div>

                <!-- Separador -->
                <div class="border-t border-gray-100 dark:border-gray-700 my-3"></div>

                <!-- Precio y Acción -->
                <div class="flex justify-between items-end">
                    <div class="flex flex-col">
                        ${p.old_price && parseFloat(p.old_price) > parseFloat(p.price) ?
                `<span class="text-xs text-gray-400 line-through">S/. ${parseFloat(p.old_price).toLocaleString()}</span>` : ''}
                        <span class="text-xl font-bold text-gray-900 dark:text-white">S/. ${parseFloat(p.price).toLocaleString()}</span>
                    </div>
                    <button type="button" 
                        class="add-to-cart-btn flex items-center gap-2 bg-${color}-600 text-white px-4 py-2.5 rounded-xl hover:bg-${color}-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm"
                        data-name="${safeName}" 
                        data-price="${p.price}"
                        data-product='${JSON.stringify(p).replace(/'/g, "\\'")}'
                        title="Agregar al carrito">
                        <i class="fas fa-cart-plus"></i>
                        <span class="hidden sm:inline">Agregar</span>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    renderPaginator();

    // Configurar botones del carrito después de renderizar
    setTimeout(() => {
        if (typeof window.setupCartButtons === 'function') {
            window.setupCartButtons();
        } else if (typeof setupCartButtons === 'function') {
            setupCartButtons();
        }
    }, 100);
}

// Helper Cart Function (to avoid relying on DOM traversing in script.js)
window.addToCartSimple = function (name, price, productData = null) {
    if (window.cartManager) {
        window.cartManager.addToCart(name, price, 1, productData);
        return true;
    } else {
        
        return false;
    }
};

// Función para configurar botones del carrito después de renderizar
window.refreshCartButtons = function () {
    if (typeof window.setupCartButtons === 'function') {
        window.setupCartButtons();
    } else if (typeof setupCartButtons === 'function') {
        setupCartButtons();
    }
};

function renderPaginator() {
    const container = document.getElementById('paginacion-controls');
    if (!container) return;

    container.innerHTML = '';
    const { filteredProducts, productsPerPage, currentPage } = catalogState;
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (totalPages <= 1) return;

    // Helper for buttons
    const createBtn = (html, isDisabled, onClick) => {
        const btn = document.createElement('button');
        btn.innerHTML = html;
        btn.className = `w-10 h-10 rounded-full flex items-center justify-center border transition ${isDisabled ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-[#0D9488] border-[#0D9488] hover:bg-[#0D9488] hover:text-white'}`;
        btn.disabled = isDisabled;
        btn.onclick = onClick;
        return btn;
    };

    // Ant
    container.appendChild(createBtn('<i class="fas fa-chevron-left"></i>', currentPage === 1, () => {
        if (currentPage > 1) { catalogState.currentPage--; renderCurrentPage(); container.scrollIntoView({ behavior: 'smooth', block: 'end' }); }
    }));

    // Pages (Max 5 for visuals)
    for (let i = 1; i <= totalPages; i++) {
        // Simple ellipsis logic could go here, for now just show all or limit if too many
        if (totalPages > 8 && (i !== 1 && i !== totalPages && Math.abs(currentPage - i) > 2)) continue;

        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `w-10 h-10 rounded-full flex items-center justify-center border transition font-medium ${i === currentPage ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-md' : 'text-gray-600 border-gray-300 hover:border-[#0D9488] hover:text-[#0D9488]'}`;
        btn.onclick = () => {
            catalogState.currentPage = i;
            renderCurrentPage();
            container.scrollIntoView({ behavior: 'smooth', block: 'end' });
        };
        container.appendChild(btn);
    }

    // Sig
    container.appendChild(createBtn('<i class="fas fa-chevron-right"></i>', currentPage === totalPages, () => {
        if (currentPage < totalPages) { catalogState.currentPage++; renderCurrentPage(); container.scrollIntoView({ behavior: 'smooth', block: 'end' }); }
    }));
}

// --- EXPOSED FILTER FUNCTIONS ---

window.filterSearch = function (val) {
    catalogState.filters.search = val;
    applyFilters();
}

function filterCategory(cat, btnElement) {
    catalogState.filters.category = cat;

    // Actualizar estados visuales en toda la página (Navbar, Sidebar, Footer, etc.)
    document.querySelectorAll('[data-filter]').forEach(el => {
        const filterVal = el.getAttribute('data-filter');
        if (filterVal === cat) {
            if (el.classList.contains('filter-btn')) {
                // Estilo para botones del sidebar
                el.classList.add('bg-[#0D9488]', 'text-white');
                el.classList.remove('bg-gray-100', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-300');
                const checkIcon = el.querySelector('.fa-check-circle');
                if (checkIcon) checkIcon.classList.remove('hidden');
            } else {
                // Estilo para links del navbar/footer
                el.classList.add('text-[#0D9488]', 'font-bold');
                el.classList.remove('text-gray-700', 'text-gray-600', 'dark:text-gray-300', 'dark:text-gray-400');
            }
        } else {
            if (el.classList.contains('filter-btn')) {
                // Reset sidebar buttons
                el.classList.remove('bg-[#0D9488]', 'text-white');
                el.classList.add('bg-gray-100', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-300');
                const checkIcon = el.querySelector('.fa-check-circle');
                if (checkIcon) checkIcon.classList.add('hidden');
            } else {
                // Reset navbar/footer links
                el.classList.remove('text-[#0D9488]', 'font-bold');
                if (el.closest('.lg\\:flex')) {
                    el.classList.add('text-gray-700', 'dark:text-gray-300');
                } else {
                    el.classList.add('text-gray-600', 'dark:text-gray-400');
                }
            }
        }
    });

    applyFilters();
}

// Exponer globalmente
window.filterCategory = filterCategory;

window.filterBrand = function (checkbox) {
    const val = checkbox.value;
    if (checkbox.checked) {
        catalogState.filters.brands.push(val);
    } else {
        catalogState.filters.brands = catalogState.filters.brands.filter(b => b !== val);
    }
    applyFilters();
}

window.filterPrice = function (val) {
    const num = parseInt(val);
    catalogState.filters.priceMax = num;
    document.getElementById('priceValue').textContent = `S/. ${num.toLocaleString()}`;
    applyFilters();
}

window.filterPriceRange = function (min, max) {
    const range = document.getElementById('priceRange');
    if (range) {
        range.value = max;
        filterPrice(max); // Trigger filter
    }
}

window.filterSort = function (val) {
    catalogState.filters.sort = val;
    applyFilters();
}

function resetCatalogFilters(triggerElement) {
    // 1. Resetear el estado de filtros
    catalogState.filters = {
        category: 'all',
        search: '',
        brands: [],
        priceMax: 10000,
        sort: 'default'
    };

    // 2. Limpiar todos los campos de búsqueda (Global, Móvil y Lateral)
    ['globalSearch', 'mobileSearch', 'searchInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });

    // 3. Limpiar selección de marcas
    document.querySelectorAll('.brand-checkbox').forEach(c => c.checked = false);

    // 4. Resetear rango de precios
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.value = 10000;
        const priceValue = document.getElementById('priceValue');
        if (priceValue) priceValue.textContent = 'S/. 10,000';
    }

    // 5. Resetear ordenamiento
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    // 6. Sincronizar UI de categorías y aplicar filtros
    filterCategory('all', triggerElement);
    applyFilters();
}

// Exponer globalmente
window.resetCatalogFilters = resetCatalogFilters;

// --- MODAL LOGIC (Kept same) ---

window.switchProductTab = function (tabName) {
    const specsBtn = document.getElementById('btnSpecs');
    const descBtn = document.getElementById('btnDesc');
    const specsContent = document.getElementById('modalProdSpecs');
    const descContent = document.getElementById('modalProdDescContent');

    if (tabName === 'specs') {
        specsBtn.classList.add('text-red-600', 'border-red-600');
        specsBtn.classList.remove('text-gray-500', 'border-transparent');
        descBtn.classList.remove('text-red-600', 'border-red-600');
        descBtn.classList.add('text-gray-500', 'border-transparent');

        specsContent.classList.remove('hidden');
        descContent.classList.add('hidden');
    } else {
        descBtn.classList.add('text-red-600', 'border-red-600');
        descBtn.classList.remove('text-gray-500', 'border-transparent');
        specsBtn.classList.remove('text-red-600', 'border-red-600');
        specsBtn.classList.add('text-gray-500', 'border-transparent');

        descContent.classList.remove('hidden');
        specsContent.classList.add('hidden');
    }
}

window.openProductModal = function (product) {
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    // Get images array - support both old and new format
    const images = (product.images && Array.isArray(product.images) && product.images.length > 0)
        ? product.images
        : (product.image_url ? [product.image_url] : []);
    const mainImage = images[0] || '';

    document.getElementById('modalProdImage').src = mainImage;
    document.getElementById('modalProdTitle').textContent = product.name;
    document.getElementById('modalProdPrice').textContent = parseFloat(product.price).toLocaleString();
    document.getElementById('modalProdCategory').textContent = product.category;

    // Setup image gallery in modal
    setupModalImageGallery(images);

    // Specs Logic
    const specsContainer = document.getElementById('modalProdSpecs');
    let specsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';

    let hasJsonSpecs = product.specifications && Object.keys(product.specifications).length > 0;

    if (hasJsonSpecs) {
        Object.entries(product.specifications).forEach(([key, val]) => {
            specsHtml += `
            <div class="flex flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <dt class="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${key}</dt>
                <dd class="text-xs font-bold text-gray-900 dark:text-white truncate ml-2">${val}</dd>
            </div>`;
        });
    } else {
        const descText = product.description || '';
        const lines = descText.split('\n').filter(line => line.trim() !== '');

        if (lines.length > 0) {
            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length > 1 && line.length < 100) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').trim();
                    specsHtml += `
                    <div class="flex flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                        <dt class="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${key}</dt>
                        <dd class="text-xs font-bold text-gray-900 dark:text-white truncate ml-2">${val}</dd>
                    </div>`;
                } else if (line.length < 40 && line.indexOf('.') === -1) {
                    specsHtml += `
                    <div class="flex flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                        <dt class="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalle</dt>
                        <dd class="text-xs font-bold text-gray-900 dark:text-white truncate ml-2">${line}</dd>
                    </div>`;
                }
            });
        }
        if (specsHtml === '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">') {
            specsHtml += '<div class="col-span-2 py-4 text-center text-gray-500 italic text-[10px] uppercase tracking-widest">Información técnica no disponible</div>';
        }
    }
    specsHtml += '</div>';
    specsContainer.innerHTML = specsHtml;
    specsContainer.classList.remove('hidden');

    // Description Logic
    let descContainer = document.getElementById('modalProdDescContent');
    if (!descContainer) {
        descContainer = document.createElement('div');
        descContainer.id = 'modalProdDescContent';
        descContainer.className = 'py-4 text-gray-700 dark:text-gray-300 leading-relaxed hidden text-left';
        specsContainer.parentNode.appendChild(descContainer);
    }
    descContainer.innerHTML = product.description ? `<p>${product.description.replace(/\n/g, '<br>')}</p>` : '<p class="text-gray-500 italic">Sin descripción.</p>';
    descContainer.classList.add('hidden');

    // Default to specs
    switchProductTab('specs');

    // Reset Quantity
    const qtyInput = document.getElementById('modalProdQuantity');
    if (qtyInput) qtyInput.value = 1;

    // Modal AddToCart
    const addBtn = document.getElementById('modalAddToCartBtn');
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.onclick = function () {
        if (window.cartManager) {
            const qtyInput = document.getElementById('modalProdQuantity');
            let quantity = parseInt(qtyInput ? qtyInput.value : 1);
            if (isNaN(quantity) || quantity < 1) quantity = 1;

            // Check stock if available
            if (product.stock !== undefined && product.stock !== null && quantity > product.stock) {
                Swal.fire('Stock Insuficiente', `Solo quedan ${product.stock} unidades.`, 'error');
                return;
            }

            window.cartManager.addToCart(product.name, parseFloat(product.price), quantity, product);

            newBtn.innerHTML = '<i class="fas fa-check"></i> Agregado';
            setTimeout(() => {
                newBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar al Carrito';
            }, 1000);
        }
    };

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

// Setup image gallery in product modal
function setupModalImageGallery(images) {
    const mainImg = document.getElementById('modalProdImage');
    const imageContainer = document.getElementById('modalImageContainer') || mainImg?.closest('.relative');
    let galleryContainer = document.getElementById('modalImageGallery');

    if (!mainImg || !imageContainer) return;

    // Remove existing gallery if any
    if (galleryContainer) {
        galleryContainer.remove();
    }

    // Create gallery container
    galleryContainer = document.createElement('div');
    galleryContainer.id = 'modalImageGallery';
    galleryContainer.className = 'flex flex-wrap gap-2 justify-center mt-6 w-full';

    if (images.length > 1) {
        images.forEach((imgUrl, idx) => {
            const thumbBtn = document.createElement('button');
            thumbBtn.className = `w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${idx === 0 ? 'border-sky-500 ring-2 ring-sky-200 shadow-sm' : 'border-gray-200 dark:border-gray-600 hover:border-sky-400'}`;
            thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Imagen ${idx + 1}" class="w-full h-full object-cover">`;
            thumbBtn.onclick = () => {
                mainImg.src = imgUrl;
                galleryContainer.querySelectorAll('button').forEach((btn, i) => {
                    btn.className = `w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === idx ? 'border-sky-500 ring-2 ring-sky-200 shadow-sm' : 'border-gray-200 dark:border-gray-600 hover:border-sky-400'}`;
                });
            };
            galleryContainer.appendChild(thumbBtn);
        });

        // Append gallery to image container (will show below the image because of flex-col)
        imageContainer.appendChild(galleryContainer);
    }
}

window.updateModalQuantity = function (change) {
    const input = document.getElementById('modalProdQuantity');
    if (!input) return;
    let val = parseInt(input.value) + change;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
};

window.closeProductModal = function () {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

// Renderizar productos destacados
function renderFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid || !catalogState.allProducts.length) return;

    // Obtener productos destacados (is_bestseller o is_new_arrival o con descuento)
    let featured = catalogState.allProducts.filter(p =>
        p.is_bestseller || p.is_new_arrival || (p.old_price && parseFloat(p.old_price) > parseFloat(p.price))
    ).slice(0, 4);

    // Si no hay suficientes destacados, completar con los primeros productos
    if (featured.length < 4) {
        const remaining = catalogState.allProducts.filter(p => !featured.includes(p)).slice(0, 4 - featured.length);
        featured = [...featured, ...remaining];
    }

    grid.innerHTML = '';

    featured.forEach(p => {
        const card = document.createElement('div');
        card.className = "group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer";

        // Get images array
        const images = (p.images && Array.isArray(p.images) && p.images.length > 0)
            ? p.images
            : (p.image_url ? [p.image_url] : []);
        const mainImage = images[0] || '';

        let color = 'sky';
        if (p.category === 'smartphones') color = 'green';
        if (p.category === 'tablets') color = 'pink';
        if (p.category === 'accesorios') color = 'indigo';

        const productJson = JSON.stringify(p).replace(/"/g, '&quot;').replace(/'/g, "&#39;");

        // Badge
        let badge = '';
        if (p.is_bestseller) {
            badge = `<div class="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
                <i class="fas fa-fire"></i> TOP
            </div>`;
        } else if (p.old_price && parseFloat(p.old_price) > parseFloat(p.price)) {
            const discount = Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100);
            badge = `<div class="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                -${discount}%
            </div>`;
        } else if (p.is_new_arrival) {
            badge = `<div class="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                NUEVO
            </div>`;
        }

        // Escapar comillas simples en el nombre para evitar romper el onclick
        const safeName = p.name.replace(/'/g, "\\'");

        card.innerHTML = `
            <div class="relative h-40 sm:h-48 overflow-hidden bg-gray-50 dark:bg-gray-800" onclick='openProductModal(${productJson})'>
                <img src="${mainImage}" alt="${p.name}" class="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110">
                ${badge}
            </div>
            <div class="p-3 sm:p-4">
                <span class="text-[9px] font-bold text-${color}-600 dark:text-${color}-400 uppercase">${p.category}</span>
                <h3 class="text-sm font-bold text-gray-800 dark:text-white mt-1 line-clamp-2 min-h-[2.5rem] leading-tight" onclick='openProductModal(${productJson})'>${p.name}</h3>
                <div class="flex items-center gap-1 mt-1">
                    <div class="flex text-yellow-400 text-xs">
                        <i class="fas fa-star"></i>
                        <span class="ml-1 text-gray-500 text-[10px]">4.9</span>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div>
                        ${p.old_price && parseFloat(p.old_price) > parseFloat(p.price) ?
                `<span class="text-[10px] text-gray-400 line-through">S/. ${parseFloat(p.old_price).toLocaleString()}</span>` : ''}
                        <span class="text-lg font-bold text-gray-900 dark:text-white">S/. ${parseFloat(p.price).toLocaleString()}</span>
                    </div>
                    <button type="button" 
                        class="add-to-cart-btn w-8 h-8 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition flex items-center justify-center"
                        data-name="${safeName}" 
                        data-price="${p.price}"
                        data-product='${JSON.stringify(p).replace(/'/g, "\\'")}'
                        title="Agregar al carrito">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Configurar botones del carrito después de renderizar destacados
    refreshCartButtons();
}

// --- RECURSOS DINÁMICOS (CARRUSEL) ---

// Función para precargar imágenes en segundo plano
function preloadImages(imageUrls) {
    imageUrls.forEach((url, index) => {
        if (index === 0) return; // La primera ya se está cargando
        const img = new Image();
        img.src = url;
    });
}

// Función para enviar imágenes al Service Worker para cacheo
function sendCarouselImagesToSW(imageUrls) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        
        navigator.serviceWorker.controller.postMessage({
            type: 'PRECACHE_CAROUSEL',
            urls: imageUrls
        });
    }
}

// Función para verificar si el Service Worker está listo
async function waitForServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return registration.active;
}

// Función para crear skeleton loader
function createSkeletonLoader() {
    return `
        <div class="carousel-skeleton w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer flex items-center justify-center">
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/50 animate-pulse"></div>
                <div class="w-32 h-4 mx-auto bg-gray-500/50 rounded animate-pulse"></div>
            </div>
        </div>
    `;
}

async function loadAndRenderCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots-container');
    if (!track || !dotsContainer) return;

    // Mostrar skeleton loader inmediatamente
    if (!localStorage.getItem('carousel_cache')) {
        track.innerHTML = createSkeletonLoader();
    }

    // Función interna para precargar una imagen específica
    const preloadSingleImage = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    // Función interna para renderizar con transición suave
    const renderImages = async (images) => {
        if (!images || images.length === 0) return;

        // Evitar re-renderizado innecesario si ya tenemos las mismas imágenes
        const currentSrcs = Array.from(track.querySelectorAll('img')).map(img => img.src);
        const newSrcs = images.map(img => img.image_url);
        if (JSON.stringify(currentSrcs) === JSON.stringify(newSrcs)) {
            
            return;
        }

        // Precargar la primera imagen antes de renderizar
        if (images[0]) {
            await preloadSingleImage(images[0].image_url);
        }

        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        images.forEach((img, index) => {
            // Slide
            const slide = document.createElement('div');
            slide.className = `carousel-slide bg-slate-900 ${index === 0 ? 'active' : ''}`;

            // Optimización de carga de imágenes - solo la primera tiene alta prioridad
            const loadingAttr = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
            const decodingAttr = index === 0 ? 'decoding="sync"' : 'decoding="async"';

            slide.innerHTML = `<img src="${img.image_url}" alt="Promoción Solbin-X" class="w-full h-full object-cover" ${loadingAttr} ${decodingAttr} style="object-position: center;" width="1200" height="370">`;
            track.appendChild(slide);

            // Dot
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('data-slide', index);
            dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
            dotsContainer.appendChild(dot);
        });

        // Precargar el resto de imágenes en segundo plano
        setTimeout(() => {
            const urlsToPreload = images.slice(1).map(img => img.image_url);
            preloadImages(urlsToPreload);
        }, 100);

        // Enviar todas las URLs al Service Worker para cacheo agresivo
        const allUrls = images.map(img => img.image_url);
        sendCarouselImagesToSW(allUrls);

        // Reiniciar el carrusel
        if (typeof window.restartCarousel === 'function') {
            window.restartCarousel();
        }
    };

    try {
        // ESTRATEGIA DE CACHÉ OPTIMIZADA

        // 1. Carga inmediata desde caché local (si existe)
        const cachedCarousel = localStorage.getItem('carousel_cache');
        let imagesFromCache = null;

        if (cachedCarousel) {
            
            imagesFromCache = JSON.parse(cachedCarousel);
            // Renderizar inmediatamente desde caché
            await renderImages(imagesFromCache);
        }

        // 2. Actualización en segundo plano desde Supabase
        const client = window.supabaseClient || window.supabase;
        const { data: images, error } = await client
            .from('carousel_images')
            .select('*')
            .eq('active', true)
            .order('order_index', { ascending: true });

        if (error) throw error;

        if (images && images.length > 0) {
            // Solo actualizar si hay cambios
            const cacheChanged = !imagesFromCache ||
                JSON.stringify(images.map(img => img.image_url)) !==
                JSON.stringify(imagesFromCache.map(img => img.image_url));

            if (cacheChanged) {
                
                localStorage.setItem('carousel_cache', JSON.stringify(images));
                await renderImages(images);
            } else {
                
            }
        }

    } catch (err) {
        
        // Si no hay caché y falló la red, mostrar error
        if (!localStorage.getItem('carousel_cache')) {
            track.innerHTML = `
                <div class="flex items-center justify-center h-full text-white text-center">
                    <div>
                        <i class="fas fa-exclamation-triangle text-4xl mb-4 text-yellow-500"></i>
                        <p>Error al cargar el carrusel</p>
                    </div>
                </div>
            `;
        }
    }
}

// Función para generar datos estructurados Schema.org para productos
function generateProductSchema(products) {
    if (!products || products.length === 0) return;

    const productSchemas = products.slice(0, 10).map(p => {
        const images = (p.images && Array.isArray(p.images) && p.images.length > 0)
            ? p.images
            : (p.image_url ? [p.image_url] : []);

        const mainImage = images[0] || '';
        const hasDiscount = p.old_price && parseFloat(p.old_price) > parseFloat(p.price);
        const discount = hasDiscount ? Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0;

        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `https://solbin-x.com/#product-${p.id}`,
            "name": p.name,
            "image": images,
            "description": p.description || `${p.name} - ${p.category}`,
            "sku": p.id.toString(),
            "brand": {
                "@type": "Brand",
                "name": p.brand || "Solbin-X"
            },
            "category": p.category,
            "offers": {
                "@type": "Offer",
                "url": "https://solbin-x.com/",
                "priceCurrency": "PEN",
                "price": p.price.toString(),
                "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": "Solbin-X"
                },
                ...(hasDiscount && {
                    "priceSpecification": {
                        "@type": "PriceSpecification",
                        "price": p.price.toString(),
                        "priceCurrency": "PEN",
                        "valueAddedTaxIncluded": true
                    }
                })
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "150"
            },
            ...(hasDiscount && {
                "priceSpecification": {
                    "@type": "PriceSpecification",
                    "price": p.price.toString(),
                    "priceCurrency": "PEN"
                }
            })
        };
    });

    // Crear script tag para los datos estructurados
    const existingScript = document.getElementById('product-schema');
    if (existingScript) {
        existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'product-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(productSchemas.length === 1 ? productSchemas[0] : productSchemas);
    document.head.appendChild(script);

    
}

// INIT
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadAndRenderProducts();
        loadAndRenderCarousel();
        setupCategoryButtons();
    });
} else {
    loadAndRenderProducts();
    loadAndRenderCarousel();
    setupCategoryButtons();
}

// Configurar botones de categoría después de que el DOM esté listo
function setupCategoryButtons() {
    // Botón "Todas las Categorías" del navbar
    const btnTodasCategorias = document.getElementById('btn-todas-categorias');
    if (btnTodasCategorias) {
        btnTodasCategorias.addEventListener('click', function (e) {
            resetCatalogFilters(this);
        });
    }

    // Botón "Todos los Productos" del menú móvil
    const btnTodosProductos = document.getElementById('btn-todos-productos');
    if (btnTodosProductos) {
        btnTodosProductos.addEventListener('click', function (e) {
            resetCatalogFilters(this);
        });
    }
}

// Renderizar destacados después de cargar productos
const originalApplyFilters = applyFilters;
applyFilters = function () {
    originalApplyFilters();
    renderFeaturedProducts();
    // Generar datos estructurados Schema.org para productos visibles (SEO)
    if (catalogState.filteredProducts && catalogState.filteredProducts.length > 0) {
        generateProductSchema(catalogState.filteredProducts.slice(0, 10));
    }
};

// Increment Site Visits on Load
(async function () {
    try {
        // Wait a small delay to ensure Supabase is ready
        setTimeout(async () => {
            const client = window.supabaseClient || window.supabase;
            if (client && typeof client.rpc === 'function') {
                if (!sessionStorage.getItem('visit_tracked')) {
                    try {
                        
                        const { data, error } = await client.rpc('increment_visit_count');

                        if (error) {
                            
                        } else {
                            
                            sessionStorage.setItem('visit_tracked', 'true');
                        }
                    } catch (rpcError) {
                        
                    }
                } else {
                    
                }
            } else {
                
            }
        }, 1000);
    } catch (e) {
        
    }
})();

