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
        console.error('Loader Error:', err);
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


    productsToShow.forEach(p => {

        const card = document.createElement('div');
        card.className = "producto-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-hover transition-colors duration-300 relative group";

        let color = 'sky';
        if (p.category === 'smartphones') color = 'green';
        if (p.category === 'tablets') color = 'pink';
        if (p.category === 'accesorios') color = 'indigo';

        const productJson = JSON.stringify(p).replace(/"/g, '&quot;').replace(/'/g, "&#39;");

        card.innerHTML = `
            <div class="relative h-48 overflow-hidden cursor-pointer flex items-center justify-center bg-white dark:bg-gray-700"
                 onclick='openProductModal(${productJson})'>
                <img src="${p.image_url}" alt="${p.name}" class="h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110">
                
                ${p.is_new_arrival ? `<div class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 animate-pulse">NUEVO</div>` : ''}
                
                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                </div>
            </div>
            <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold tracking-wider text-${color}-600 dark:text-${color}-400 uppercase bg-${color}-50 dark:bg-${color}-900/30 px-2 py-1 rounded">${p.category}</span>
                    <div class="flex text-yellow-400 text-xs">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-sky-600 transition leading-tight min-h-[3rem]" onclick='openProductModal(${productJson})'>${p.name}</h3>
                
                <div class="my-3 border-t border-gray-100 dark:border-gray-700"></div>

                <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Precio</span>
                        <span class="text-xl font-bold text-gray-900 dark:text-white">S/. ${parseFloat(p.price).toLocaleString()}</span>
                    </div>
                    <button type="button" class="w-10 h-10 rounded-full bg-${color}-600 text-white flex items-center justify-center hover:bg-${color}-700 transition shadow-lg transform hover:scale-110" 
                        onclick="event.stopPropagation(); addToCartSimple('${p.name}', ${p.price})" title="Agregar al carrito">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    renderPaginator();
}

// Helper Cart Function (to avoid relying on DOM traversing in script.js)
window.addToCartSimple = function (name, price) {
    if (window.cartManager) {
        window.cartManager.addToCart(name, price);
    } else {
        console.error('CartManager missing');
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
        btn.className = `w-10 h-10 rounded-full flex items-center justify-center border transition ${isDisabled ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-sky-600 border-sky-600 hover:bg-sky-600 hover:text-white'}`;
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
        btn.className = `w-10 h-10 rounded-full flex items-center justify-center border transition font-medium ${i === currentPage ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'text-gray-600 border-gray-300 hover:border-sky-600 hover:text-sky-600'}`;
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

window.filterCategory = function (cat, btnElement) {
    catalogState.filters.category = cat;

    // Update UI buttons
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-300');
    });
    // Add active class to clicked button if passed, or find it
    if (btnElement) {
        btnElement.classList.remove('bg-gray-100', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-300');
        btnElement.classList.add('bg-sky-600', 'text-white');
    }

    applyFilters();
}

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

window.resetCatalogFilters = function () {
    catalogState.filters = {
        category: 'all',
        search: '',
        brands: [],
        priceMax: 10000,
        sort: 'default'
    };

    // UI Reset
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.brand-checkbox').forEach(c => c.checked = false);
    document.getElementById('priceRange').value = 10000;
    document.getElementById('priceValue').textContent = 'S/. 10,000';
    document.getElementById('sortSelect').value = 'default';

    // Reset category buttons visual
    filterCategory('all', document.querySelector('.filter-btn[data-filter="all"]'));
}

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

    document.getElementById('modalProdImage').src = product.image_url;
    document.getElementById('modalProdTitle').textContent = product.name;
    document.getElementById('modalProdPrice').textContent = parseFloat(product.price).toLocaleString();
    document.getElementById('modalProdCategory').textContent = product.category;

    // Specs Logic
    const specsContainer = document.getElementById('modalProdSpecs');
    let specsHtml = '<div class="divide-y divide-gray-200 dark:divide-gray-700">';

    let hasJsonSpecs = product.specifications && Object.keys(product.specifications).length > 0;

    if (hasJsonSpecs) {
        Object.entries(product.specifications).forEach(([key, val]) => {
            specsHtml += `
            <div class="py-3 grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt class="font-medium text-gray-500 dark:text-gray-400">${key}</dt>
                <dd class="text-gray-900 dark:text-white font-medium text-right sm:text-left">${val}</dd>
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
                    <div class="py-3 grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <dt class="font-medium text-gray-500 dark:text-gray-400">${key}</dt>
                        <dd class="text-gray-900 dark:text-white font-medium text-right sm:text-left">${val}</dd>
                    </div>`;
                } else if (line.length < 60 && line.indexOf('.') === -1) {
                    specsHtml += `
                    <div class="py-3 grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <dt class="font-medium text-gray-500 dark:text-gray-400">Detalle</dt>
                        <dd class="text-gray-900 dark:text-white font-medium text-right sm:text-left">${line}</dd>
                    </div>`;
                }
            });
        }
        if (specsHtml === '<div class="divide-y divide-gray-200 dark:divide-gray-700">') {
            specsHtml += '<div class="py-3 text-gray-500 italic">No hay especificaciones detalladas disponibles.</div>';
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

            window.cartManager.addToCart(product.name, parseFloat(product.price), quantity);

            newBtn.innerHTML = '<i class="fas fa-check"></i> Agregado';
            setTimeout(() => {
                newBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar al Carrito';
            }, 1000);
        }
    };

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

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

// INIT
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRenderProducts);
} else {
    loadAndRenderProducts();
}

