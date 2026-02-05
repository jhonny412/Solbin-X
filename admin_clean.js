
// Lógica del Panel de Administración

// Global error handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Error en admin.js:', msg, 'en', url, 'línea', lineNo);
    return false;
};

// Tabs Logic
window.switchAdminTab = function (tab) {
    try {
        const dashboardSection = document.getElementById('dashboardSection');
        const productsSection = document.getElementById('productsSection');
        const ordersSection = document.getElementById('ordersSection');

        // Sidebar buttons
        const navButtons = {
            dashboard: document.getElementById('sideBtnDashboard'),
            products: document.getElementById('sideBtnProducts'),
            orders: document.getElementById('sideBtnOrders'),
            carousel: document.getElementById('sideBtnCarousel'),
            offers: document.getElementById('sideBtnOffers'),
            alerts: document.getElementById('sideBtnAlerts')
        };

        // Hide all
        dashboardSection?.classList.add('hidden');
        productsSection?.classList.add('hidden');
        ordersSection?.classList.add('hidden');
        document.getElementById('carouselSection')?.classList.add('hidden');
        document.getElementById('offersSection')?.classList.add('hidden');
        document.getElementById('alertsSection')?.classList.add('hidden');

        // Reset buttons
        Object.values(navButtons).forEach(btn => {
            if (btn) btn.classList.remove('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
        });

        // Show selected
        if (tab === 'dashboard') {
            dashboardSection?.classList.remove('hidden');
            navButtons.dashboard?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
            // Cargar estadísticas de visitas
            if (typeof loadVisitStats === 'function') {
                loadVisitStats();
            }
        } else if (tab === 'products') {
            productsSection?.classList.remove('hidden');
            navButtons.products?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
            // Load products
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
            // Resize grid after showing section
            setTimeout(() => {
                if (jQuery && jQuery('#productsGrid').length > 0) {
                    const gridWidth = jQuery('#productsGrid').closest('.overflow-x-auto').width();
                    if (gridWidth > 0) {
                        try {
                            jQuery('#productsGrid').jqGrid('setGridWidth', gridWidth);
                            jQuery('#productsGrid').trigger('reloadGrid');
                        } catch (e) { /* Grid not ready */ }
                    }
                }
            }, 200);
        } else if (tab === 'orders') {
            ordersSection?.classList.remove('hidden');
            navButtons.orders?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
            // Load orders
            if (typeof loadOrders === 'function') {
                loadOrders();
            }
            // Resize grid after showing section
            setTimeout(() => {
                if (jQuery && jQuery('#ordersGrid').length > 0) {
                    const gridWidth = jQuery('#ordersGrid').closest('.overflow-x-auto').width();
                    if (gridWidth > 0) {
                        try {
                            jQuery('#ordersGrid').jqGrid('setGridWidth', gridWidth);
                            jQuery('#ordersGrid').trigger('reloadGrid');
                        } catch (e) { /* Grid not ready */ }
                    }
                }
            }, 200);
        } else if (tab === 'carousel') {
            document.getElementById('carouselSection')?.classList.remove('hidden');
            navButtons.carousel?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
            if (typeof loadCarouselImages === 'function') {
                loadCarouselImages();
            }
        } else if (tab === 'offers') {
            document.getElementById('offersSection')?.classList.remove('hidden');
            navButtons.offers?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
            if (typeof loadOfferSettings === 'function') {
                loadOfferSettings();
            }
        } else if (tab === 'alerts') {
            document.getElementById('alertsSection')?.classList.remove('hidden');
            navButtons.alerts?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
            if (typeof loadAlertSettings === 'function') {
                loadAlertSettings();
            }
        }
    } catch (err) {
        console.error('Error en switchAdminTab:', err);
    }
};




// jqGrid instances
let productsGrid = null;
let ordersGrid = null;

// Resize jqGrid when window is resized
window.addEventListener('resize', function () {
    if (jQuery('#productsGrid').length > 0 && !jQuery('#productsGrid').closest('#productsSection').hasClass('hidden')) {
        jQuery('#productsGrid').jqGrid('setGridWidth', jQuery('#productsGrid').closest('.overflow-x-auto').width());
    }
    if (jQuery('#ordersGrid').length > 0 && !jQuery('#ordersGrid').closest('#ordersSection').hasClass('hidden')) {
        jQuery('#ordersGrid').jqGrid('setGridWidth', jQuery('#ordersGrid').closest('.overflow-x-auto').width());
    }
});

// Initialize jqGrid for Products
function initProductsGrid() {
    jQuery('#productsGrid').jqGrid({
        datatype: 'local',
        colModel: [
            {
                name: 'id',
                label: 'REF.',
                width: 80,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return `<span class="text-[11px] font-bold text-slate-400">#${cellvalue}</span>`;
                }
            },
            {
                name: 'name_display',
                label: 'Especificación',
                width: 400,
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'category_display',
                label: 'Categoría',
                width: 150,
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'stock_display',
                label: 'Stock',
                width: 120,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'price_display',
                label: 'Valorización',
                width: 150,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'actions',
                label: 'Operaciones',
                width: 150,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            }
        ],
        viewrecords: true,
        width: null,
        height: 'auto',
        rowNum: 10,
        rowList: [10, 20, 30, 50],
        pager: '#productsPager',
        styleUI: 'jQueryUI',
        gridview: true,
        autoencode: false,
        pginput: true,
        pgbuttons: true,
        pgtext: 'Página {0} de {1}',
        recordpos: 'left',
        pagerpos: 'center',
        loadComplete: function () {
                    }
    });

        productsGrid = true;
}

// Initialize jqGrid for Orders
function initOrdersGrid() {
        jQuery('#ordersGrid').jqGrid({
        datatype: 'local',
        colModel: [
            {
                name: 'id_display',
                label: 'Ref.',
                width: 100,
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'date_display',
                label: 'Fecha',
                width: 150,
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'channel_display',
                label: 'Canal',
                width: 200,
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'total_display',
                label: 'Total',
                width: 150,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'status_display',
                label: 'Estado',
                width: 150,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            },
            {
                name: 'actions',
                label: 'Acciones',
                width: 150,
                align: 'center',
                formatter: function (cellvalue, options, rowObject) {
                    return cellvalue || '';
                }
            }
        ],
        viewrecords: true,
        width: null,
        height: 'auto',
        rowNum: 10,
        rowList: [10, 20, 30, 50],
        pager: '#ordersPager',
        styleUI: 'jQueryUI',
        gridview: true,
        autoencode: false,
        pginput: true,
        pgbuttons: true,
        pgtext: 'Página {0} de {1}',
        recordpos: 'left',
        pagerpos: 'center',
        loadComplete: function () {
                    }
    });

        ordersGrid = true;
}


// Cargar estadísticas de visitas
window.loadVisitStats = async function (retryCount = 0) {
    try {
                let client = window.supabaseClient || window.supabase;

        // Si el cliente no está listo, reintentar un par de veces
        if (!client && retryCount < 5) {
            console.log(`[Visitas] Cliente no listo, reintentando en 500ms... (${retryCount + 1}/5)`);
            setTimeout(() => window.loadVisitStats(retryCount + 1), 500);
            return;
        }

        if (!client) {
            console.error('[Visitas] Cliente Supabase no disponible después de varios intentos');
            updateVisitCounter('Error');
            return;
        }

        // Primero intentar usar la función RPC get_visit_count (si existe)
        try {
            const { data: rpcData, error: rpcError } = await client.rpc('get_visit_count');

            if (!rpcError && rpcData !== null) {
                                updateVisitCounter(rpcData);
                return;
            } else if (rpcError) {
                console.warn('[Visitas] Error en RPC get_visit_count:', rpcError);
            }
        } catch (rpcErr) {
                    }

        // Si RPC falla, intentar consulta directa a la tabla
        const { data, error } = await client
            .from('site_stats')
            .select('visit_count')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('[Visitas] Error al cargar estadísticas desde tabla:', error);
            // Si hay error, mostrar lo que había
            return;
        }

        if (data && data.visit_count !== undefined) {
                        updateVisitCounter(data.visit_count);
        } else {
                        updateVisitCounter(0);
        }

    } catch (e) {
        console.error('[Visitas] Error general en loadVisitStats:', e);
    }
};

// Función auxiliar para actualizar el contador en el DOM
function updateVisitCounter(count) {
    const visitCounter = document.getElementById('visitCounter');
    if (visitCounter) {
        visitCounter.textContent = count.toLocaleString('es-PE');
            } else {
        console.error('[Visitas] Elemento visitCounter no encontrado');
    }
}

// Cargar productos
window.loadProducts = async function () {
    try {
                // Mostrar loading
        showProductsLoading();

        const client = window.supabaseClient || window.supabase;
        const { data: products, error } = await client
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

                console.log('Productos ordenados desde Supabase:', products.map(p => ({ id: p.id, sku: 'SKU-' + p.id.toString().padStart(5, '0') })));
        console.log('Primeros 5 IDs:', products.slice(0, 5).map(p => p.id));
        console.log('Últimos 5 IDs:', products.slice(-5).map(p => p.id));

        window.allAdminProducts = products;

        // Dashboard count update
        const dashCount = document.getElementById('dashProductsCount');
        if (dashCount) dashCount.textContent = products.length;

        // Initialize grid if not done
        if (!productsGrid) {
                        initProductsGrid();
        }

        // Render with jqGrid
                renderProductsToGrid(products);

        // Ocultar loading
        hideProductsLoading();

            } catch (err) {
        console.error('Error cargando productos:', err);
        hideProductsLoading();
        Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
    }
}

// Mostrar loading de productos
function showProductsLoading() {
    const gridContainer = document.getElementById('productsGrid');
    if (gridContainer) {
        // Crear overlay de loading si no existe
        let loadingOverlay = document.getElementById('productsLoadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'productsLoadingOverlay';
            loadingOverlay.className = 'absolute inset-0 bg-white/90 flex items-center justify-center z-50';
            loadingOverlay.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    <span class="mt-3 text-sm font-medium text-slate-600">Cargando productos...</span>
                </div>
            `;
            gridContainer.parentElement.style.position = 'relative';
            gridContainer.parentElement.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }
}

// Ocultar loading de productos (con delay para mejor UX)
function hideProductsLoading() {
    setTimeout(() => {
        const loadingOverlay = document.getElementById('productsLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 800); // Delay de 800ms para que el loading sea visible
}

// Render products using jqGrid
function renderProductsToGrid(products) {
        // Clear existing data
    jQuery('#productsGrid').jqGrid('clearGridData');

    const gridData = products.map(p => {
        // Category Badge Tech
        let catClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        if (p.category === 'laptops') catClasses = 'bg-brand-50 text-brand-600 border-brand-200';
        if (p.category === 'smartphones') catClasses = 'bg-sky-50 text-sky-600 border-sky-200';
        if (p.category === 'tablets') catClasses = 'bg-purple-50 text-purple-600 border-purple-200';
        if (p.category === 'accesorios') catClasses = 'bg-amber-50 text-amber-600 border-amber-200';

        // Stock Logic with Premium Badges
        let stockHtml = '';
        if (p.stock <= 5) {
            stockHtml = `<span class="px-2 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-semibold uppercase">Crítico: ${p.stock}</span>`;
        } else if (p.stock <= 15) {
            stockHtml = `<span class="px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-semibold uppercase">Bajo: ${p.stock}</span>`;
        } else {
            stockHtml = `<span class="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-semibold uppercase">Óptimo: ${p.stock}</span>`;
        }

        // Get main image - support both old (image_url) and new (images array) format
        const mainImage = (p.images && Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : (p.image_url || '');
        const imageCount = (p.images && Array.isArray(p.images)) ? p.images.length : (p.image_url ? 1 : 0);

        const cleanP = JSON.stringify(p).replace(/'/g, "&#39;").replace(/"/g, '&quot;');

        const actionsHtml = `
        <div class="flex items-center justify-center space-x-1">
                <button onclick="viewProductById('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-brand-500 hover:text-white transition-colors">
                    <i class="fas fa-eye text-[11px]"></i>
                </button>
                <button onclick="editProductById('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-blue-500 hover:text-white transition-colors">
                    <i class="fas fa-pen text-[11px]"></i>
                </button>
                <button onclick="deleteProduct('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white transition-colors">
                    <i class="fas fa-trash text-[11px]"></i>
                </button>
            </div>
        `;

        return {
            id: p.id,
            name_display: `
        <div class="flex items-center space-x-2">
                    <div class="product-img-futuristic w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                        <img src="${mainImage}" class="w-full h-full object-contain p-0.5">
                        ${imageCount > 1 ? `<span class="absolute -bottom-1 -right-1 bg-brand-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">+${imageCount - 1}</span>` : ''}
                    </div>
                    <div>
                        <span class="block text-[12px] font-semibold text-slate-700 leading-tight">${p.name}</span>
                        <span class="text-[9px] font-medium text-slate-400 uppercase tracking-wide">SKU-${p.id.toString().padStart(5, '0')}</span>
                    </div>
                </div> `,
            category_display: `
        <div class="flex items-center">
            <span class="px-2 py-1 text-[9px] font-semibold rounded-lg ${catClasses} uppercase tracking-wide border">${p.category}</span>
                </div> `,
            stock_display: stockHtml,
            price_display: `
        <div class="flex flex-col items-center">
            <div class="bg-slate-50 border border-slate-100 px-3 py-1 rounded-md">
                <span class="text-[13px] font-semibold text-slate-700">
                    <span class="text-brand-500 mr-0.5">S/.</span>${parseFloat(p.price).toFixed(2)}
                </span>
            </div>
                </div> `,
            actions: actionsHtml
        };
    });

        if (gridData.length > 0) {
            }
    console.log('GridData orden:', gridData.map(g => g.id));

    // Add data to jqGrid usando el ID real del producto
    for (let i = 0; i < gridData.length; i++) {
        jQuery('#productsGrid').jqGrid('addRowData', gridData[i].id, gridData[i]);
    }

    console.log('Filas en grid después de agregar:', jQuery('#productsGrid').jqGrid('getGridParam', 'data').map(row => row.id));

    // Trigger resize to ensure grid fits properly
    setTimeout(() => {
        const gridWidth = jQuery('#productsGrid').closest('.overflow-x-auto').width();
        if (gridWidth > 0) {
            jQuery('#productsGrid').jqGrid('setGridWidth', gridWidth);
        }
        jQuery('#productsGrid').trigger('reloadGrid');
    }, 100);

    updateProductStats(products);
    }

// Update inventory stats
function updateProductStats(products) {
    const totalEl = document.getElementById('statsProductCount');
    const inStockEl = document.getElementById('statsInStock');
    const lowStockEl = document.getElementById('statsLowStock');
    const newArrivalsEl = document.getElementById('statsNewArrivals');

    if (totalEl) totalEl.textContent = products.length;
    if (inStockEl) inStockEl.textContent = products.filter(p => p.stock > 15).length;
    if (lowStockEl) lowStockEl.textContent = products.filter(p => p.stock <= 5).length;
    if (newArrivalsEl) newArrivalsEl.textContent = products.filter(p => p.is_new_arrival).length;
}

// --- PEDIDOS (ORDERS) LOGIC ---





// --- PEDIDOS (ORDERS) LOGIC ---

window.loadOrders = async function () {
    try {
                // Mostrar loading
        showOrdersLoading();

        const client = window.supabaseClient || window.supabase;
        const { data: orders, error } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

                console.log('Datos de ejemplo:', orders.slice(0, 2));

        // Save for export
        window.allAdminOrders = orders;

        // Dashboard count update
        const dashCount = document.getElementById('dashOrdersCount');
        if (dashCount) dashCount.textContent = orders.length;

        // Initialize grid if not done
        if (!ordersGrid) {
                        initOrdersGrid();
        }

        // Render with jqGrid
                renderOrdersToGrid(orders);

        // Ocultar loading
        hideOrdersLoading();

            } catch (err) {
        console.error('Error cargando ventas:', err);
        hideOrdersLoading();
        Swal.fire('Error', 'No se pudieron cargar las ventas.', 'error');
    }
}

// Mostrar loading de pedidos
function showOrdersLoading() {
    const gridContainer = document.getElementById('ordersGrid');
    if (gridContainer) {
        // Crear overlay de loading si no existe
        let loadingOverlay = document.getElementById('ordersLoadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'ordersLoadingOverlay';
            loadingOverlay.className = 'absolute inset-0 bg-white/90 flex items-center justify-center z-50';
            loadingOverlay.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    <span class="mt-3 text-sm font-medium text-slate-600">Cargando pedidos...</span>
                </div>
            `;
            gridContainer.parentElement.style.position = 'relative';
            gridContainer.parentElement.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }
}

// Ocultar loading de pedidos (con delay para mejor UX)
function hideOrdersLoading() {
    setTimeout(() => {
        const loadingOverlay = document.getElementById('ordersLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 800); // Delay de 800ms para que el loading sea visible
}

// Render orders using jqGrid
function renderOrdersToGrid(orders) {
        // Clear existing data
    jQuery('#ordersGrid').jqGrid('clearGridData');

    const gridData = orders.map(order => {
        // Status Badge Pro (Premium Tech Colors)
        let statusClasses = '';
        let statusLabel = '';
        let dotColor = '';

        if (order.status === 'iniciado') {
            statusClasses = 'bg-indigo-50/50 text-indigo-600 border-indigo-200/50';
            statusLabel = 'En Cola';
            dotColor = 'bg-indigo-500';
        } else if (order.status === 'en_proceso') {
            statusClasses = 'bg-amber-50/50 text-amber-600 border-amber-200/50';
            statusLabel = 'Preparación';
            dotColor = 'bg-amber-500';
        } else if (order.status === 'terminado') {
            statusClasses = 'bg-emerald-50/50 text-emerald-600 border-emerald-200/50';
            statusLabel = 'Venta Exitosa';
            dotColor = 'bg-emerald-500';
        } else if (order.status === 'cancelado') {
            statusClasses = 'bg-rose-50/50 text-rose-600 border-rose-200/50';
            statusLabel = 'Anulado';
            dotColor = 'bg-rose-500';
        }

        const dateObj = new Date(order.created_at);
        const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const orderJson = JSON.stringify(order).replace(/'/g, "&#39;").replace(/"/g, '&quot;');

        const actionsHtml = `
        <div class="flex items-center justify-center">
            <button onclick="viewOrderById('${order.id}')"
                class="flex items-center space-x-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700 transition-colors font-semibold text-[10px] uppercase tracking-wide">
                <i class="fas fa-eye text-[10px]"></i>
                <span>Ver</span>
            </button>
            </div>
        `;

        return {
            id: order.id,
            id_display: `
        <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                        <i class="fas fa-fingerprint text-[10px]"></i>
                    </div>
                    <span class="font-semibold text-slate-600 text-sm">ID-${order.id}</span>
                </div> `,
            date_display: `
        <div class="flex flex-col">
                    <span class="text-[12px] font-semibold text-slate-600">${dateStr}</span>
                    <span class="text-[10px] font-medium text-slate-400">${timeStr}</span>
                </div> `,
            channel_display: `
        <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-100">
                        <i class="fab fa-whatsapp text-sm"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-medium text-slate-400 block">Canal</span>
                        <span class="text-[11px] font-semibold text-slate-600">WhatsApp</span>
                    </div>
                </div> `,
            total_display: `
        <div class="flex flex-col items-center">
                    <div class="bg-slate-50 border border-slate-100 px-3 py-1 rounded-md">
                        <span class="text-[13px] font-semibold text-slate-700">
                            <span class="text-brand-500 mr-0.5">S/.</span>${parseFloat(order.total).toFixed(2)}
                        </span>
                    </div>
                </div> `,
            status_display: `
        <div class="flex justify-center">
            <span class="px-3 py-1.5 inline-flex items-center text-[10px] font-semibold rounded-md ${statusClasses} border">
                <span class="w-1.5 h-1.5 rounded-full ${dotColor} mr-1.5"></span>
                ${statusLabel}
            </span>
                </div> `,
            actions: actionsHtml
        };
    });

        if (gridData.length > 0) {
            }

    // Add data to jqGrid usando el ID real de la orden
    for (let i = 0; i < gridData.length; i++) {
        jQuery('#ordersGrid').jqGrid('addRowData', gridData[i].id, gridData[i]);
    }

    // Trigger resize to ensure grid fits properly
    setTimeout(() => {
        const gridWidth = jQuery('#ordersGrid').closest('.overflow-x-auto').width();
        if (gridWidth > 0) {
            jQuery('#ordersGrid').jqGrid('setGridWidth', gridWidth);
        }
        jQuery('#ordersGrid').trigger('reloadGrid');
    }, 100);

    }


// Order Modal Vars
let currentOrderId = null;

window.viewOrder = function (order) {
    currentOrderId = order.id;
    window.currentFullOrder = order; // Save full object

                    document.getElementById('orderModalId').textContent = '#' + order.id;

    const dateObj = new Date(order.created_at);
    document.getElementById('orderDate').textContent = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Status Pro Badge
    const statusEl = document.getElementById('orderStatusDisplay');
    statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full mr-2 animate-pulse bg-current"></span> ${order.status.replace('_', ' ').toUpperCase()} `;

    let statusPillClasses = 'border-slate-200 text-slate-500 bg-slate-50';
    if (order.status === 'iniciado') statusPillClasses = 'border-indigo-100 text-indigo-600 bg-indigo-50/50';
    if (order.status === 'en_proceso') statusPillClasses = 'border-amber-100 text-amber-600 bg-amber-50/50';
    if (order.status === 'terminado') statusPillClasses = 'border-emerald-100 text-emerald-600 bg-emerald-50/50';
    if (order.status === 'cancelado') statusPillClasses = 'border-rose-100 text-rose-600 bg-rose-50/50';

    statusEl.className = 'inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ' + statusPillClasses;

    // Select init
    document.getElementById('orderStatusSelect').value = order.status;

    // Customer Info refined
    const infoEl = document.getElementById('orderCustomerInfo');
    if (order.customer_info) {
        let infoHtml = '';
        let info = order.customer_info;

        // Robust parsing
        if (typeof info === 'string') {
            try { info = JSON.parse(info); } catch (e) { console.error('Error parsing customer_info:', e); }
        }

        if (info) {
            // Bloque de Nombre
            if (info.name) {
                infoHtml += `
                <div class="flex items-center space-x-3 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm mb-3">
                    <div class="w-9 h-9 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <i class="fas fa-user text-sm"></i>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Cliente</span>
                        <span class="text-[13px] font-black text-slate-800 leading-none">${info.name}</span>
                    </div>
                </div>`;
            }

            // Bloque de WhatsApp
            if (info.phone) {
                infoHtml += `
                <div class="flex items-center space-x-3 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-sm">
                    <div class="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <i class="fab fa-whatsapp text-sm"></i>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">WhatsApp Contact</span>
                        <span class="text-[13px] font-black text-slate-800 leading-none">${info.phone}</span>
                    </div>
                </div>`;
            }
        }
        infoEl.innerHTML = infoHtml || '<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin datos adicionales</p>';
    } else {
        infoEl.innerHTML = '<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin información adicional</p>';
    }

    // Items List Pro
    const itemsBody = document.getElementById('orderItemsTable');
    itemsBody.innerHTML = '';

    let items = order.items;
    if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { }
    }

    if (Array.isArray(items)) {
        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b border-slate-50/50';

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-[12px] font-bold text-slate-700 leading-tight mb-1 uppercase">${item.name}</span>
                        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SKU-${item.id || 'N/A'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="text-[11px] font-bold text-slate-600">${item.quantity}ud.</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="text-[12px] font-bold text-slate-700">S/. ${(item.price * item.quantity).toFixed(2)}</span>
                </td>
            `;
            itemsBody.appendChild(row);
        });
    }

    // Summary Breakdown
    let info = order.customer_info;
    if (typeof info === 'string') { try { info = JSON.parse(info); } catch (e) { } }

    if (info && info.shipping !== undefined) {
        const summaryRows = [
            { label: 'Costo de Envío', value: info.shipping, classes: info.shipping === 0 ? 'text-emerald-500' : 'text-slate-400' }
        ];

        summaryRows.forEach(rowInfo => {
            const tr = document.createElement('tr');
            tr.className = 'bg-slate-50/20 border-t border-slate-50/50';
            tr.innerHTML = `
                <td colspan="2" class="px-6 py-3 text-[9px] font-black uppercase tracking-widest ${rowInfo.classes}">${rowInfo.label}</td>
                <td class="px-6 py-3 text-right text-[11px] font-black text-slate-600">S/. ${parseFloat(rowInfo.value).toFixed(2)}</td>
            `;
            itemsBody.appendChild(tr);
        });
    }

    document.getElementById('orderTotal').innerHTML = `
        <div class="flex items-center justify-end gap-1.5">
            <span class="text-[14px] font-bold text-blue-400">S/.</span>
            <span class="text-[26px] font-black text-blue-700 tracking-tighter">${parseFloat(order.total).toFixed(2)}</span>
        </div>
    `;

    document.getElementById('orderModal').classList.remove('hidden');
}

window.closeOrderModal = function () {
    document.getElementById('orderModal').classList.add('hidden');
}

window.updateOrderStatus = async function () {
    if (!currentOrderId) return;

    const newStatus = document.getElementById('orderStatusSelect').value;
    const previousStatus = window.currentFullOrder?.status;
    const client = window.supabaseClient || window.supabase;

    // Validar que no se esté intentando cambiar al mismo estado
    if (newStatus === previousStatus) {
        Swal.fire('Sin cambios', 'El pedido ya tiene ese estado.', 'info');
        return;
    }

    // Verificar que los productos estén cargados antes de procesar cambios de stock
    if (newStatus === 'terminado' || (previousStatus === 'terminado' && newStatus === 'cancelado')) {
        if (!window.allAdminProducts || window.allAdminProducts.length === 0) {
            console.error('[Stock] Productos no cargados al intentar actualizar stock');
            Swal.fire({
                title: 'Error',
                text: 'No se pueden actualizar los stocks porque la lista de productos no está cargada. Por favor, recarga la página e intenta nuevamente.',
                icon: 'error'
            });
            return;
        }
    }

    try {
        let stockUpdates = [];
        let stockErrors = [];

        // Caso 1: Cambio a "terminado" (ÉXITO) - DESCONTAR stock
        if (newStatus === 'terminado' && previousStatus !== 'terminado') {
                                                try {
                let items = window.currentFullOrder.items;
                if (typeof items === 'string') items = JSON.parse(items);

                                if (!Array.isArray(items)) {
                    console.error('[Stock] Items no es un array:', items);
                    stockErrors.push('Error: Formato de items inválido');
                } else if (!window.allAdminProducts || window.allAdminProducts.length === 0) {
                    console.error('[Stock] No hay productos cargados en allAdminProducts');
                    stockErrors.push('Error: Lista de productos no disponible. Recarga la página.');
                } else {
                    for (const item of items) {
                                                if (!item.name) {
                            console.error('[Stock] Item sin nombre:', item);
                            stockErrors.push('Item sin nombre identificado');
                            continue;
                        }

                        // Intentar buscar por ID primero (más confiable)
                        let product = null;
                        if (item.id) {
                            product = window.allAdminProducts.find(p => p.id === item.id);
                                                    }

                        // Si no se encuentra por ID, buscar por nombre (comparación normalizada)
                        if (!product) {
                            const normalizedItemName = item.name.trim().toLowerCase();
                            product = window.allAdminProducts.find(p => {
                                const normalizedProductName = (p.name || '').trim().toLowerCase();
                                return normalizedProductName === normalizedItemName;
                            });
                                                    }

                        if (!product) {
                            console.error(`[Stock] Producto no encontrado: "${item.name}" (ID: ${item.id || 'N/A'})`);
                            console.log('[Stock] Productos disponibles:', window.allAdminProducts.slice(0, 5).map(p => ({ id: p.id, name: p.name })));
                            stockErrors.push(`${item.name}: Producto no encontrado en el catálogo`);
                            continue;
                        }

                        if (!product.id) {
                            console.error(`[Stock] Producto sin ID:`, product);
                            stockErrors.push(`${item.name}: Producto sin ID válido`);
                            continue;
                        }

                        // Verificar si hay suficiente stock
                        const quantity = parseInt(item.quantity) || 0;
                        if (product.stock < quantity) {
                            stockErrors.push(`${item.name}: Stock insuficiente (disponible: ${product.stock}, requerido: ${quantity})`);
                            continue;
                        }

                        const newStock = product.stock - quantity;
                        console.log(`[Stock] Actualizando ${product.name} (ID: ${product.id}): ${product.stock} -> ${newStock}`);

                        const { error: updateError } = await client
                            .from('products')
                            .update({ stock: newStock })
                            .eq('id', product.id);

                        if (updateError) {
                            console.error(`[Stock] Error actualizando ${product.name}:`, updateError);
                            stockErrors.push(`${product.name}: ${updateError.message}`);
                        } else {
                                                        stockUpdates.push(`${product.name}: -${quantity} unidades`);

                            // Actualizar el stock en memoria para futuras operaciones
                            product.stock = newStock;
                        }
                    }

                    if (stockUpdates.length > 0) {
                                            }
                    if (stockErrors.length > 0) {
                                            }
                }
            } catch (err) {
                console.error('Error descontando stock:', err);
                stockErrors.push('Error general al actualizar stock: ' + err.message);
            }
        }

        // Caso 2: Cambio desde "terminado" a "cancelado" - RESTAURAR stock
        if (previousStatus === 'terminado' && newStatus === 'cancelado') {
                        try {
                let items = window.currentFullOrder.items;
                if (typeof items === 'string') items = JSON.parse(items);

                if (Array.isArray(items) && window.allAdminProducts) {
                    for (const item of items) {
                        // Intentar buscar por ID primero (más confiable)
                        let product = null;
                        if (item.id) {
                            product = window.allAdminProducts.find(p => p.id === item.id);
                        }

                        // Si no se encuentra por ID, buscar por nombre (comparación normalizada)
                        if (!product) {
                            const normalizedItemName = item.name.trim().toLowerCase();
                            product = window.allAdminProducts.find(p => {
                                const normalizedProductName = (p.name || '').trim().toLowerCase();
                                return normalizedProductName === normalizedItemName;
                            });
                        }

                        if (product) {
                            const quantity = parseInt(item.quantity) || 0;
                            const newStock = product.stock + quantity;
                                                        const { error: updateError } = await client
                                .from('products')
                                .update({ stock: newStock })
                                .eq('id', product.id);

                            if (updateError) {
                                stockErrors.push(`${product.name}: ${updateError.message}`);
                            } else {
                                stockUpdates.push(`${product.name}: +${quantity} unidades (restaurado)`);
                                // Actualizar el stock en memoria
                                product.stock = newStock;
                            }
                        } else {
                            console.error(`[Stock] Producto no encontrado para restaurar: "${item.name}"`);
                            stockErrors.push(`${item.name}: No se pudo restaurar - producto no encontrado`);
                        }
                    }

                    if (stockUpdates.length > 0) {
                                            }
                }
            } catch (err) {
                console.error('Error restaurando stock:', err);
                stockErrors.push('Error general al restaurar stock: ' + err.message);
            }
        }

        // Actualizar el estado del pedido
        const { error } = await client
            .from('orders')
            .update({ status: newStatus })
            .eq('id', currentOrderId);

        if (error) throw error;

        // Mostrar mensaje según el resultado
        let message = 'Estado del pedido cambiado exitosamente.';
        let icon = 'success';

        if (stockUpdates.length > 0) {
            message += `\n\nActualizaciones de stock:\n${stockUpdates.join('\n')}`;
        }

        if (stockErrors.length > 0) {
            message += `\n\nErrores en stock:\n${stockErrors.join('\n')}`;
            icon = stockUpdates.length > 0 ? 'warning' : 'error';
        }

        Swal.fire({
            title: 'Actualizado',
            text: message,
            icon: icon,
            confirmButtonText: 'Aceptar'
        });

        // Cerrar modal y refrescar datos
        closeOrderModal();
        loadOrders();
        loadProducts();

    } catch (e) {
        console.error('Error en updateOrderStatus:', e);
        Swal.fire('Error', 'No se pudo actualizar el estado: ' + e.message, 'error');
    }
}

// Print Order
window.printOrder = function () {
    if (!window.currentFullOrder) return;
    const order = window.currentFullOrder;

    // Parse items if string
    let items = order.items;
    if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { }
    }

    // Build Receipt HTML
    let itemsHtml = '';
    if (Array.isArray(items)) {
        items.forEach(item => {
            itemsHtml += `
        <tr>
                <td style="padding: 5px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: right;">S/. ${item.price}</td>
                <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: right;">S/. ${(item.price * item.quantity).toFixed(2)}</td>
            </tr> `;
        });
    }

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Solbin-X Elite Receipt #${order.id}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <style>
                            body {
                                font-family: 'Plus Jakarta Sans', sans-serif;
                            padding: 40px;
                            padding-bottom: 100px;
                            color: #1e293b;
                            line-height: 1.5;
                }
                            .header {
                                text-align: left;
                            margin-bottom: 20px;
                            border-bottom: 2px solid #f1f5f9;
                            padding-bottom: 15px;
                }
                            .logo-img {height: 100px; width: auto; }
                            .order-title-section {
                                text-align: center;
                                margin-bottom: 25px;
                            }
                            .order-title-section h1 {
                                font-size: 18px;
                                font-weight: 800;
                                text-transform: uppercase;
                                letter-spacing: 0.15em;
                                color: #1e293b;
                                margin: 0 0 12px 0;
                            }
                            .order-meta {
                                display: flex;
                                justify-content: center;
                                gap: 20px;
                                flex-wrap: wrap;
                            }
                            .order-meta p {
                                margin: 0;
                                font-size: 12px;
                                font-weight: 700;
                                color: #64748b;
                            }
                            .info {
                                margin - bottom: 30px;
                            padding: 20px;
                            background: #f8fafc;
                            border-radius: 12px;
                            border: 1px solid #e2e8f0;
                }
                            .info p {margin: 5px 0; font-size: 13px; font-weight: 600; }
                            table {width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th {
                                text - align: left;
                            padding: 12px;
                            border-bottom: 2px solid #e2e8f0;
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            color: #64748b;
                }
                            td {padding: 12px; font-size: 13px; font-weight: 500; }
                            .total {
                                text - align: right;
                            font-size: 20px;
                            font-weight: 800;
                            color: #2563eb;
                            margin-top: 10px;
                            border-top: 2px solid #e2e8f0;
                            padding-top: 15px;
                }
                }
                            .footer {
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                right: 0;
                                background: white;
                                padding: 15px 40px;
                                text-align: left;
                                font-size: 11px;
                                font-family: Arial, sans-serif;
                                color: #1e3a8a;
                                font-weight: normal;
                                z-index: 1000;
                                width: 100%;
                                box-sizing: border-box;
                            }
                            .footer p {
                                margin: 0;
                                line-height: 1.6;
                            }
                            @media print {
                                .footer {
                                    position: fixed !important;
                                    bottom: 0 !important;
                                }
                                body {
                                    padding-bottom: 100px !important;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="Imagenes/Version_Web.svg" class="logo-img" alt="Solbin-X Logo">
                        </div>
                        <div class="order-title-section">
                            <h1>ORDEN DE VENTA</h1>
                            <div class="order-meta">
                                <p><strong>Orden ID:</strong> #${order.id}</p>
                                <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                                <p><strong>Hora:</strong> ${new Date(order.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div class="info">
                            <p><strong>Cliente:</strong> ${order.customer_info?.name || 'Cliente'}</p>
                            <p><strong>WhatsApp:</strong> ${order.customer_info?.phone || 'N/A'}</p>
                            <p><strong>Estado:</strong> ${order.status.toUpperCase()}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Prod</th>
                                    <th style="text-align: center;">Cant</th>
                                    <th style="text-align: right;">P.U.</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <div class="total">
                            Total a Pagar: S/. ${parseFloat(order.total).toFixed(2)}
                        </div>
                        <div class="footer">
                            <p style="margin: 0; font-size: 11px; font-family: Arial, sans-serif; color: #1e3a8a; font-weight: normal; line-height: 1.6;">Gracias por confiar en Solbin-X</p>
                            <p style="margin: 0; font-size: 11px; font-family: Arial, sans-serif; color: #1e3a8a; font-weight: normal; line-height: 1.6;">www.solbin-x.com</p>
                        </div>
                        <script>
                            window.onload = function() {window.print(); window.close(); }
                        </script>
                    </body>
                </html>
                `);
    printWindow.document.close();
}

// Modal Logica
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

// Image Gallery Logic
let productImages = []; // Array to store multiple image URLs
let activeImageTab = 'upload'; // default

window.switchImageTab = function (tab) {
    activeImageTab = tab;
    const tabUpload = document.getElementById('tabUpload');
    const tabUrl = document.getElementById('tabUrl');
    const uploadInput = document.getElementById('uploadInputContainer');
    const urlInput = document.getElementById('urlInputContainer');

    if (tab === 'upload') {
        tabUpload.classList.add('text-sky-600', 'border-b-2', 'border-sky-600');
        tabUpload.classList.remove('text-gray-500');
        tabUrl.classList.remove('text-sky-600', 'border-b-2', 'border-sky-600');
        tabUrl.classList.add('text-gray-500');

        uploadInput.classList.remove('hidden');
        urlInput.classList.add('hidden');
    } else {
        tabUrl.classList.add('text-sky-600', 'border-b-2', 'border-sky-600');
        tabUrl.classList.remove('text-gray-500');
        tabUpload.classList.remove('text-sky-600', 'border-b-2', 'border-sky-600');
        tabUpload.classList.add('text-gray-500');

        urlInput.classList.remove('hidden');
        uploadInput.classList.add('hidden');
    }
};

// Add image to gallery
window.addImageToGallery = function (url, isFile = false) {
    if (!url) return;

    // Check if image already exists
    if (productImages.includes(url)) {
        Swal.fire('Atención', 'Esta imagen ya está en la galería', 'warning');
        return;
    }

    productImages.push(url);
    renderImageGallery();

    // Clear inputs
    if (!isFile) {
        document.getElementById('prodImage').value = '';
    }
};

// Remove image from gallery
window.removeImageFromGallery = function (index) {
    productImages.splice(index, 1);
    renderImageGallery();
};

// Render image gallery
function renderImageGallery() {
    // Early return if elements don't exist (modal not open yet)
    const galleryContainer = document.getElementById('imageGalleryContainer');
    const galleryPreview = document.getElementById('imageGalleryPreview');
    const countBadge = document.getElementById('imageCountBadge');

    // Update count badge if exists
    if (countBadge) {
        countBadge.textContent = `${productImages.length} imagen${productImages.length !== 1 ? 'es' : ''}`;
    }

    if (!galleryContainer || !galleryPreview) return;

    if (productImages.length === 0) {
        galleryContainer.classList.add('hidden');
        return;
    }

    galleryContainer.classList.remove('hidden');
    galleryPreview.innerHTML = '';

    if (productImages.length === 0) return;

    productImages.forEach((url, index) => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'relative group';
        imgWrapper.innerHTML = `
            <div class="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-brand-400 transition-all">
                <img src="${url}" class="w-full h-full object-cover" alt="Imagen ${index + 1}" onerror="this.src=''">
            </div>
            <button type="button" onclick="window.removeImageFromGallery(${index})" 
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600">
                <i class="fas fa-times text-xs"></i>
            </button>
            ${index === 0 ? '<span class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">Principal</span>' : ''}
        `;
        galleryPreview.appendChild(imgWrapper);
    });
}

// Preview single image (for backward compatibility)
function previewImage() {
    const preview = document.getElementById('imagePreview');
    const img = preview.querySelector('img');

    if (activeImageTab === 'url') {
        const url = document.getElementById('prodImage').value;
        if (url) {
            img.src = url;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    } else {
        // Upload mode
        const fileInput = document.getElementById('prodImageFile');
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;
                preview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
        }
    }
}

// Handle file upload for gallery
window.handleGalleryFileUpload = async function (input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    const client = window.supabaseClient || window.supabase;
    let uploadedCount = 0;

    Swal.fire({
        title: 'Subiendo imágenes...',
        text: `0 de ${files.length} imágenes subidas`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${i}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error: uploadError } = await client.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                continue;
            }

            // Get Public URL
            const { data: { publicUrl } } = client.storage
                .from('products')
                .getPublicUrl(filePath);

            addImageToGallery(publicUrl, true);
            uploadedCount++;

            Swal.update({
                text: `${uploadedCount} de ${files.length} imágenes subidas`
            });

        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }

    Swal.close();

    if (uploadedCount > 0) {
        Swal.fire('Éxito', `${uploadedCount} imágenes subidas correctamente`, 'success');
    } else {
        Swal.fire('Error', 'No se pudieron subir las imágenes', 'error');
    }

    // Clear input
    input.value = '';
};

// Add URL image to gallery
window.addUrlImageToGallery = function () {
    const url = document.getElementById('prodImage').value.trim();
    if (!url) {
        Swal.fire('Error', 'Ingresa una URL válida', 'error');
        return;
    }

    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        Swal.fire('Error', 'La URL ingresada no es válida', 'error');
        return;
    }

    addImageToGallery(url);
    previewImage();
};


// Info Tabs Logic
window.switchInfoTab = function (tab) {
    const tabDesc = document.getElementById('tabDesc');
    const tabSpecs = document.getElementById('tabSpecs');
    const infoDesc = document.getElementById('infoDescContainer');
    const infoSpecs = document.getElementById('infoSpecsContainer');

    if (tab === 'desc') {
        tabDesc.className = 'flex-1 py-2 text-sm font-medium text-sky-600 border-b-2 border-sky-600 focus:outline-none';
        tabSpecs.className = 'flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none';
        infoDesc.classList.remove('hidden');
        infoSpecs.classList.add('hidden');
    } else {
        tabSpecs.className = 'flex-1 py-2 text-sm font-medium text-sky-600 border-b-2 border-sky-600 focus:outline-none';
        tabDesc.className = 'flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none';
        infoSpecs.classList.remove('hidden');
        infoDesc.classList.add('hidden');
    }
}

// Specs Dynamic Rows
window.addSpecRow = function (key = '', value = '') {
    const container = document.getElementById('specsList');
    const rowId = 'spec-' + Date.now();
    const div = document.createElement('div');
    div.className = 'flex space-x-2 items-center mb-2';
    div.id = rowId;
    div.innerHTML = `
                <input type="text" placeholder="Característica (ej. Color)" class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-sky-500 outline-none" value="${key}">
                    <input type="text" placeholder="Valor (ej. Rojo)" class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-sky-500 outline-none" value="${value}">
                        <button type="button" onclick="removeSpecRow('${rowId}')" class="text-red-500 hover:text-red-700 px-2 rounded">
                            <i class="fas fa-trash"></i>
                        </button>
                        `;
    container.appendChild(div);
}

window.removeSpecRow = function (id) {
    const row = document.getElementById(id);
    if (row) row.remove();
}

// Importar especificaciones desde archivo Excel
window.importSpecsFromExcel = function (input) {
    const file = input.files[0];
    if (!file) return;

        const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Leer la primera hoja
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                        if (jsonData.length < 2) {
                Swal.fire('Error', 'El archivo Excel está vacío o no tiene el formato correcto. Debe tener al menos una fila de encabezado y una fila de datos.', 'error');
                return;
            }

            // Buscar las columnas "Característica" y "Valor"
            const headers = jsonData[0].map(h => h.toString().trim().toLowerCase());
            const caracteristicaIndex = headers.findIndex(h => h.includes('caracteristica') || h.includes('característica') || h.includes('atributo') || h.includes('key'));
            const valorIndex = headers.findIndex(h => h.includes('valor') || h.includes('value') || h.includes('descripcion') || h.includes('descripción'));

            if (caracteristicaIndex === -1 || valorIndex === -1) {
                Swal.fire('Error', 'No se encontraron las columnas requeridas. El archivo debe tener columnas llamadas "Característica" y "Valor" (o sinónimos en inglés).', 'error');
                return;
            }

            // Limpiar especificaciones actuales
            document.getElementById('specsList').innerHTML = '';

            // Agregar filas desde el Excel
            let addedCount = 0;
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row[caracteristicaIndex] && row[valorIndex]) {
                    const key = row[caracteristicaIndex].toString().trim();
                    const value = row[valorIndex].toString().trim();
                    if (key && value) {
                        addSpecRow(key, value);
                        addedCount++;
                    }
                }
            }

            if (addedCount > 0) {
                Swal.fire('Importación Exitosa', `Se importaron ${addedCount} especificaciones desde el archivo Excel.`, 'success');
            } else {
                Swal.fire('Advertencia', 'No se encontraron datos válidos para importar. Verifica que el archivo tenga datos en las columnas correctas.', 'warning');
            }

        } catch (error) {
            console.error('Error al importar Excel:', error);
            Swal.fire('Error', 'No se pudo leer el archivo Excel. Verifica que sea un archivo válido.', 'error');
        }
    };

    reader.readAsArrayBuffer(file);
    input.value = ''; // Reset input para permitir importar el mismo archivo nuevamente
}

function openModal(product = null) {
    // Resetear formulario
    form.reset();
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('prodId').value = '';
    // Clear specs list
    document.getElementById('specsList').innerHTML = '';

    // Reset image gallery
    productImages = [];
    renderImageGallery();

    // Default tabs
    switchImageTab('upload');
    switchInfoTab('desc');

    if (product) {
        // Modo Edición
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        document.getElementById('prodId').value = product.id;
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodPrice').value = product.price;
        document.getElementById('prodStock').value = product.stock || 0;
        document.getElementById('prodCategory').value = product.category;
        document.getElementById('prodDesc').value = product.description || '';

        // Load Images - Support both old (image_url) and new (images array) format
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            productImages = [...product.images];
        } else if (product.image_url) {
            // Backward compatibility - convert single image_url to array
            productImages = [product.image_url];
        }
        renderImageGallery();

        // Load Specs
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            Object.entries(product.specifications).forEach(([key, val]) => {
                addSpecRow(key, val);
            });
        } else {
            addSpecRow(); // Add one empty row
        }

        // Nuevo Ingreso checkbox
        document.getElementById('prodNewArrival').checked = !!product.is_new_arrival;

    } else {
        // Modo Creación
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        addSpecRow(); // Start with one row
        document.getElementById('prodNewArrival').checked = false;
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// Función auxiliar para llamar a openModal desde el HTML string
window.editProduct = function (product) {
    openModal(product);
}


// Guardar
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const client = window.supabaseClient || window.supabase;
        const id = document.getElementById('prodId').value;
        const name = document.getElementById('prodName').value;

        // Collect Specs
        const specsContainer = document.getElementById('specsList');
        const specsRows = specsContainer.querySelectorAll('div'); // direct children?
        const specifications = {};

        specsRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                const key = inputs[0].value.trim();
                const val = inputs[1].value.trim();
                if (key && val) {
                    specifications[key] = val;
                }
            }
        });

        // Validate images
        if (productImages.length === 0) {
            throw new Error("Debes agregar al menos una imagen del producto.");
        }

        const productData = {
            name: name,
            price: parseFloat(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value),
            category: document.getElementById('prodCategory').value,
            description: document.getElementById('prodDesc').value,
            images: productImages, // Array of image URLs
            image_url: productImages[0], // Keep first image as main for backward compatibility
            specifications: specifications,
            is_new_arrival: document.getElementById('prodNewArrival').checked
        };

        let error;
        if (id) {
            // Update
            const res = await client.from('products').update(productData).eq('id', id);
            error = res.error;
        } else {
            // Insert
            const res = await client.from('products').insert([productData]);
            error = res.error;
        }

        if (error) throw error;

        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: id ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
            timer: 1500,
            showConfirmButton: false
        });

        closeModal();
        loadProducts();

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message
        });
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

// Eliminar
window.deleteProduct = async function (id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const client = window.supabaseClient || window.supabase;
            const { error } = await client.from('products').delete().eq('id', id);
            if (error) throw error;

            Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
            loadProducts();
        } catch (err) {
            Swal.fire('Error', 'No se pudo eliminar: ' + err.message, 'error');
        }
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    const client = window.supabaseClient || window.supabase;
    await client.auth.signOut();
    window.location.href = 'login.html';
});

// Init
async function checkAuth() {
        try {
        const client = window.supabaseClient || window.supabase;
        if (!client) {
            console.error('Supabase client no inicializado');
            return;
        }
        const { data: { session } } = await client.auth.getSession();
        if (!session) {
            console.warn('Sin sesión activada, redirigiendo a login...');
            window.location.href = 'login.html';
        } else {
                        const userEmailEl = document.getElementById('userEmail');
            if (userEmailEl) userEmailEl.textContent = session.user.email;
        }
    } catch (err) {
        console.error('Error en checkAuth:', err);
    }
}
document.addEventListener('DOMContentLoaded', checkAuth);

// Ver detalle de producto
window.viewProductDetail = function (product) {
        // Guardar referencia al producto actual
    window.currentProductDetail = product;

    // Get images array - support both old and new format
    const images = (product.images && Array.isArray(product.images) && product.images.length > 0)
        ? product.images
        : (product.image_url ? [product.image_url] : []);

    // Actualizar elementos del modal
    document.getElementById('detailProductName').textContent = product.name || 'Sin nombre';
    document.getElementById('detailProductPrice').textContent = 'S/. ' + (parseFloat(product.price) || 0).toFixed(2);
    document.getElementById('detailProductStock').textContent = product.stock || 0;
    document.getElementById('detailProductCategory').textContent = product.category || '-';
    document.getElementById('detailProductDesc').textContent = product.description || 'Sin descripción';

    // Setup image gallery
    setupProductImageGallery(images);

    // Actualizar status pill según el stock
    const statusPill = document.getElementById('detailStatusPill');
    if (product.stock <= 5) {
        statusPill.className = 'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-rose-100 text-rose-600';
        statusPill.textContent = 'Stock Crítico';
    } else if (product.stock <= 15) {
        statusPill.className = 'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-600';
        statusPill.textContent = 'Stock Bajo';
    } else {
        statusPill.className = 'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-600';
        statusPill.textContent = 'Stock Disponible';
    }

    // Cargar especificaciones técnicas
    const specsContainer = document.getElementById('detailProductSpecs');
    const noSpecsMessage = document.getElementById('noSpecsMessage');
    const specsWrapper = document.getElementById('detailSpecsContainer');

    specsContainer.innerHTML = ''; // Limpiar especificaciones anteriores

    // Debug: Ver todas las propiedades del producto
    console.log('Todas las propiedades del producto:', Object.keys(product));
            let specsData = [];

    // Intentar encontrar las especificaciones en cualquier campo posible
    let specsField = product.specs || product.specifications || product.especificaciones || product.caracteristicas;
        // Procesar especificaciones según el formato
    if (specsField) {
        if (typeof specsField === 'string') {
            try {
                specsData = JSON.parse(specsField);
                            } catch (e) {
                console.error('Error parsing specs:', e);
                // Si no se puede parsear, intentar dividir por líneas
                specsData = specsField.split('\n').filter(line => line.trim()).map(line => {
                    const parts = line.split(':');
                    return {
                        key: parts[0]?.trim() || 'Especificación',
                        value: parts[1]?.trim() || line.trim()
                    };
                });
            }
        } else if (Array.isArray(specsField)) {
            specsData = specsField;
                    } else if (typeof specsField === 'object') {
            // Convertir objeto a array de pares clave-valor
            specsData = Object.entries(specsField).map(([key, value]) => ({ key, value }));
                    }
    } else {
            }

        if (specsData && specsData.length > 0) {
        // Mostrar especificaciones
        specsData.forEach((spec, index) => {
            console.log('Procesando spec:', spec, 'Tipo:', typeof spec, 'Es array:', Array.isArray(spec));


            let title, value;

            // Si spec es un array [key, value]
            if (Array.isArray(spec)) {
                title = spec[0] || `Especificación ${index + 1}`;
                value = spec[1] || '-';
            }
            // Si spec es un objeto
            else if (typeof spec === 'object' && spec !== null) {
                // Buscar en todas las posibles propiedades
                title = spec.key ||
                    spec.caracteristica ||
                    spec.Característica ||
                    spec.Caracteristica ||
                    spec[0] ||
                    spec['Característica'] ||
                    Object.keys(spec)[0] ||
                    `Especificación ${index + 1}`;

                value = spec.value ||
                    spec.valor ||
                    spec.Valor ||
                    spec[1] ||
                    spec['Valor'] ||
                    Object.values(spec)[1] ||
                    Object.values(spec)[0] ||
                    '-';
            }
            // Si spec es un string
            else if (typeof spec === 'string') {
                title = spec;
                value = '-';
            }

                        // Solo agregar si tenemos un título válido
            if (title && title !== 'undefined' && title !== 'null') {
                const specItem = document.createElement('div');
                specItem.className = 'flex flex-row justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm';

                specItem.innerHTML = `
                    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">${title}</span>
                    <span class="text-xs font-semibold text-slate-800 text-right ml-2">${value}</span>
                `;
                specsContainer.appendChild(specItem);
            }
        });

        specsContainer.classList.remove('hidden');
        noSpecsMessage.classList.add('hidden');
    } else {
        // No hay especificaciones
        specsContainer.classList.add('hidden');
        noSpecsMessage.classList.remove('hidden');
    }

    // Mostrar el modal
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Setup product image gallery in detail modal
function setupProductImageGallery(images) {
    const mainImageEl = document.getElementById('detailProductImage');
    const galleryContainer = document.getElementById('detailImageGallery');

    if (!mainImageEl || !galleryContainer) return;

    if (images.length === 0) {
        mainImageEl.src = '';
        galleryContainer.innerHTML = '';
        return;
    }

    // Set main image
    mainImageEl.src = images[0];

    // Clear and rebuild gallery
    galleryContainer.innerHTML = '';

    if (images.length > 1) {
        images.forEach((imgUrl, index) => {
            const thumbBtn = document.createElement('button');
            thumbBtn.className = `w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${index === 0 ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'}`;
            thumbBtn.innerHTML = `<img src="${imgUrl}" class="w-full h-full object-cover" alt="Imagen ${index + 1}">`;
            thumbBtn.onclick = () => {
                // Update main image
                mainImageEl.src = imgUrl;
                // Update active state
                galleryContainer.querySelectorAll('button').forEach((btn, i) => {
                    btn.className = `w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === index ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'}`;
                });
            };
            galleryContainer.appendChild(thumbBtn);
        });
        galleryContainer.classList.remove('hidden');
    } else {
        galleryContainer.classList.add('hidden');
    }
}

// Cerrar modal de detalle de producto
window.closeProductDetailModal = function () {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    window.currentProductDetail = null;
}

// Imprimir detalle de producto usando iframe oculto (sin nueva pestaña)
window.printProductDetail = function () {
    if (!window.currentProductDetail) return;

    const product = window.currentProductDetail;

    // Crear iframe oculto para impresión
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
        <html>
        <head>
            <title>Ficha de Producto - ${product.name}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @media print {
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    
                    @page {
                        size: A4;
                        margin: 5mm;
                    }
                    
                    html, body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        padding: 0; 
                        background: white; 
                        margin: 0;
                        width: 100%;
                        height: 100%;
                    }
                    
                    body {
                        display: flex;
                        flex-direction: column;
                        padding: 5mm;
                        padding-bottom: 20mm;
                        min-height: 100vh;
                    }
                    
                    /* Header con Logo - Alineado a la izquierda, logo grande, sin slogan */
                    .print-header { 
                        text-align: left; 
                        margin-bottom: 8px; 
                        padding-bottom: 8px; 
                        border-bottom: 2px solid #3b82f6; 
                    }
                    .logo-container { margin-bottom: 0; }
                    .logo-container img { height: 55px; width: auto; }
                    .company-name { display: none; }
                    
                    /* Product Header - Ultra compacto */
                    .product-header { 
                        text-align: center; 
                        margin-bottom: 4px; 
                    }
                    .product-header h1 { 
                        margin: 0 0 2px 0; 
                        font-size: 11px; 
                        color: #1e293b; 
                        font-weight: 700; 
                        line-height: 1.2;
                        max-height: 28px;
                        overflow: hidden;
                    }
                    .product-header .sku { 
                        display: inline-block; 
                        background: #f1f5f9; 
                        padding: 1px 6px; 
                        border-radius: 8px; 
                        font-size: 8px; 
                        color: #475569; 
                        font-weight: 600; 
                    }
                    
                    /* Main Content - Layout de 2 columnas */
                    .main-content {
                        display: flex;
                        gap: 8px;
                        margin: 6px 0;
                        align-items: flex-start;
                    }
                    
                    /* Columna Izquierda - Imagen grande */
                    .left-column {
                        flex: 1.5;
                    }
                    
                    .product-image-container { 
                        text-align: center; 
                        padding: 8px;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .product-image { 
                        width: 100%;
                        max-width: 220px; 
                        max-height: 220px; 
                        border-radius: 8px; 
                        object-fit: contain;
                    }
                    
                    /* Columna Derecha - Tarjetas apiladas */
                    .right-column {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                    }
                    
                    /* Tarjetas de información */
                    .info-card {
                        border-radius: 10px;
                        padding: 8px 6px;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .card-price { 
                        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); 
                        border: 1px solid #3b82f6; 
                    }
                    .card-stock { 
                        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); 
                        border: 1px solid #f59e0b; 
                    }
                    .card-category { 
                        background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); 
                        border: 1px solid #6366f1; 
                    }
                    
                    .card-price .card-icon, .card-stock .card-icon, .card-category .card-icon { 
                        width: 16px; 
                        height: 16px; 
                        border-radius: 4px; 
                        display: inline-flex; 
                        align-items: center; 
                        justify-content: center; 
                        margin-bottom: 2px;
                        color: white;
                        font-size: 9px;
                    }
                    .card-price .card-icon { background: #3b82f6; }
                    .card-stock .card-icon { background: #f59e0b; }
                    .card-category .card-icon { background: #6366f1; }
                    
                    .card-price .card-title, .card-stock .card-title, .card-category .card-title { 
                        font-size: 6px; 
                        font-weight: 700; 
                        text-transform: uppercase; 
                        letter-spacing: 0.2px;
                        margin-bottom: 1px;
                    }
                    .card-price .card-title { color: #1d4ed8; }
                    .card-stock .card-title { color: #b45309; }
                    .card-category .card-title { color: #4338ca; }
                    
                    .card-price .card-value { 
                        font-size: 12px; 
                        font-weight: 800; 
                        color: #2563eb;
                    }
                    .card-stock .card-value { 
                        font-size: 14px; 
                        font-weight: 800; 
                        color: #1e293b;
                    }
                    .card-stock .card-unit {
                        font-size: 6px;
                        color: #78716c;
                    }
                    .card-category .card-value { 
                        font-size: 9px; 
                        font-weight: 700; 
                        color: #1e293b;
                        text-transform: uppercase;
                    }
                    
                    /* Status Badge - Ultra compacto */
                    .status-badge {
                        display: inline-block;
                        padding: 2px 6px;
                        border-radius: 8px;
                        font-size: 7px;
                        font-weight: 700;
                        text-transform: uppercase;
                        margin-top: 3px;
                    }
                    .status-available { background: #d1fae5; color: #065f46; }
                    .status-critical { background: #fee2e2; color: #991b1b; }
                    
                    /* Description Section - Compacta para una página */
                    .description { 
                        margin-top: 4px; 
                        padding: 5px; 
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                        border-radius: 6px; 
                        border: 1px solid #e2e8f0; 
                    }
                    .description-header {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        margin-bottom: 3px;
                        padding-bottom: 2px;
                        border-bottom: 1px solid #cbd5e1;
                    }
                    .description-header i {
                        color: #3b82f6;
                        font-size: 8px;
                    }
                    .description h3 { 
                        margin: 0; 
                        font-size: 7px; 
                        color: #475569; 
                        text-transform: uppercase;
                        letter-spacing: 0.2px;
                        font-weight: 700;
                    }
                    .description p { 
                        margin: 0; 
                        font-size: 8px; 
                        line-height: 1.3; 
                        color: #334155; 
                        white-space: pre-wrap;
                    }
                    
                    /* Specifications Section */
                    .specs-section {
                        margin-top: 4px;
                        padding: 5px;
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        border-radius: 6px;
                        border: 1px solid #bae6fd;
                    }
                    .specs-header {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        margin-bottom: 3px;
                        padding-bottom: 2px;
                        border-bottom: 1px solid #7dd3fc;
                    }
                    .specs-header i {
                        color: #0284c7;
                        font-size: 8px;
                    }
                    .specs-section h3 {
                        margin: 0;
                        font-size: 7px;
                        color: #0369a1;
                        text-transform: uppercase;
                        letter-spacing: 0.2px;
                        font-weight: 700;
                    }
                    .specs-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 3px;
                    }
                    .spec-item {
                        background: white;
                        padding: 3px 4px;
                        border-radius: 4px;
                        border: 1px solid #e0f2fe;
                    }
                    .spec-title {
                        font-size: 6px;
                        font-weight: 700;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 0.2px;
                        margin-bottom: 1px;
                    }
                    .spec-value {
                        font-size: 8px;
                        font-weight: 600;
                        color: #0c4a6e;
                    }
                    
                    /* Footer - Anclado a la parte inferior */
                    .print-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        padding: 5mm;
                        border-top: 1px solid #e2e8f0;
                        text-align: center;
                        font-size: 8px;
                        color: #64748b;
                        background: white;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Header con Logo -->
            <div class="print-header">
                <div class="logo-container">
                    <img src="Imagenes/Version_Web.svg" alt="Solbin-X">
                </div>
            </div>
            
            <!-- Contenido Principal -->
            <div class="page-content">
            
            <!-- Product Header -->
            <div class="product-header">
                <h1>${product.name}</h1>
                <div class="sku">SKU: SKU-${product.id.toString().padStart(5, '0')}</div>
            </div>
            
            <!-- Main Content: 2 Columnas -->
            <div class="main-content">
                <!-- Columna Izquierda: Imagen -->
                <div class="left-column">
                    <div class="product-image-container">
                        <img src="${product.image_url}" class="product-image" alt="${product.name}" onload="setTimeout(function() { window.print(); }, 200);">
                    </div>
                </div>
                
                <!-- Columna Derecha: Tarjetas -->
                <div class="right-column">
                    <!-- Precio -->
                    <div class="info-card card-price">
                        <div class="card-icon"><i class="fas fa-coins"></i></div>
                        <div class="card-title">Precio Unitario</div>
                        <div class="card-value">S/. ${parseFloat(product.price).toFixed(2)}</div>
                    </div>
                    
                    <!-- Stock -->
                    <div class="info-card card-stock">
                        <div class="card-icon"><i class="fas fa-box-open"></i></div>
                        <div class="card-title">Existencia</div>
                        <div class="card-value">${product.stock}</div>
                        <div class="card-unit">unidades</div>
                    </div>
                    
                    <!-- Categoría -->
                    <div class="info-card card-category">
                        <div class="card-icon"><i class="fas fa-tags"></i></div>
                        <div class="card-title">Categoría</div>
                        <div class="card-value">${product.category}</div>
                    </div>
                </div>
            </div>
            
            <!-- Status Badge -->
            <div style="text-align: center;">
                <span class="status-badge ${product.stock > 5 ? 'status-available' : 'status-critical'}">
                    ${product.stock > 5 ? '✓ Disponible' : '✕ Stock Crítico'}
                </span>
            </div>
            
            <!-- Description -->
            <div class="description">
                <div class="description-header">
                    <i class="fas fa-align-left"></i>
                    <h3>Descripción Técnica</h3>
                </div>
                <p>${product.description || 'Sin descripción disponible'}</p>
            </div>
            
            <!-- Specifications -->
            ${(() => {
            let specsHtml = '';
            let specsData = [];

            // Intentar encontrar las especificaciones
            let specsField = product.specs || product.specifications || product.especificaciones || product.caracteristicas;

            if (specsField) {
                if (typeof specsField === 'string') {
                    try {
                        specsData = JSON.parse(specsField);
                    } catch (e) {
                        specsData = specsField.split('\\n').filter(line => line.trim()).map(line => {
                            const parts = line.split(':');
                            return { key: parts[0]?.trim() || 'Especificación', value: parts[1]?.trim() || line.trim() };
                        });
                    }
                } else if (Array.isArray(specsField)) {
                    specsData = specsField;
                } else if (typeof specsField === 'object') {
                    specsData = Object.entries(specsField).map(([key, value]) => ({ key, value }));
                }
            }

            if (specsData && specsData.length > 0) {
                specsHtml += `
            <div class="specs-section">
                <div class="specs-header">
                    <i class="fas fa-sliders-h"></i>
                    <h3>Especificaciones Técnicas</h3>
                </div>
                <div class="specs-grid">
                    ${specsData.map((spec, index) => {
                    let title, value;

                    if (Array.isArray(spec)) {
                        title = spec[0] || `Espec ${index + 1}`;
                        value = spec[1] || '-';
                    } else if (typeof spec === 'object' && spec !== null) {
                        title = spec.key || spec.caracteristica || spec.Característica || spec.Caracteristica || Object.keys(spec)[0] || `Espec ${index + 1}`;
                        value = spec.value || spec.valor || spec.Valor || Object.values(spec)[1] || Object.values(spec)[0] || '-';
                    } else if (typeof spec === 'string') {
                        title = spec;
                        value = '-';
                    }

                    if (title && title !== 'undefined' && title !== 'null') {
                        return `
                    <div class="spec-item">
                        <div class="spec-title">${title}</div>
                        <div class="spec-value">${value}</div>
                    </div>`;
                    }
                    return '';
                }).join('')}
                </div>
            </div>`;
            }

            return specsHtml;
        })()}
            
            </div><!-- Fin page-content -->
            
            <!-- Footer -->
            <div class="print-footer">
                Documento generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} • Solbin-X
            </div>
        </body>
        </html>
    `);
    iframeDoc.close();

    // Eliminar el iframe después de la impresión
    iframe.contentWindow.onafterprint = function () {
        document.body.removeChild(iframe);
    };

    // Fallback: eliminar después de 5 segundos si no se dispara el evento
    setTimeout(function () {
        if (iframe.parentNode) {
            document.body.removeChild(iframe);
        }
    }, 5000);
}

// --- CAROUSEL MANAGEMENT ---

window.loadCarouselImages = async function () {
        const grid = document.getElementById('carouselImagesGrid');
    const noImages = document.getElementById('noCarouselImages');

    if (grid) grid.innerHTML = '<div class="col-span-full flex justify-center py-10"><i class="fas fa-spinner fa-spin text-4xl text-brand-500"></i></div>';

    try {
        const client = window.supabaseClient || window.supabase;
        const { data, error } = await client
            .from('carousel_images')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;

        window.allCarouselImages = data || [];
        renderCarouselImages(window.allCarouselImages);
    } catch (err) {
        console.error('Error al cargar carrusel:', err);
        if (grid) grid.innerHTML = `<p class="col-span-full text-center text-rose-500">Error: ${err.message}</p>`;
    }
}

function renderCarouselImages(images) {
    const grid = document.getElementById('carouselImagesGrid');
    const noImages = document.getElementById('noCarouselImages');

    if (!grid) return;

    if (!images || images.length === 0) {
        grid.innerHTML = '';
        noImages?.classList.remove('hidden');
        return;
    }

    noImages?.classList.add('hidden');
    grid.innerHTML = '';

    images.forEach((img) => {
        const card = document.createElement('div');
        card.className = "group relative bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1";
        card.innerHTML = `
            <div class="w-full overflow-hidden bg-slate-200" style="aspect-ratio: 1200/370;">
                <img src="${img.image_url}" class="w-full h-full object-fill transition-transform duration-700 group-hover:scale-105">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-between p-6">
                <div class="text-white">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-70">Posición: ${img.order_index}</p>
                </div>
                <button onclick="deleteCarouselImage(${img.id}, '${img.image_url}')" 
                    class="w-12 h-12 rounded-2xl bg-rose-500/20 backdrop-blur-md text-white border border-rose-500/30 hover:bg-rose-500 hover:scale-110 transition-all flex items-center justify-center">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.uploadCarouselImages = async function (input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    const client = window.supabaseClient || window.supabase;

    Swal.fire({
        title: 'Subiendo imágenes...',
        html: `Procesando <b>0</b> de ${files.length} archivos`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `carousel/${fileName}`;

        try {
            // 1. Subir a Storage
            const { error: uploadError } = await client.storage
                .from('carousel')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Obtener URL pública
            const { data: { publicUrl } } = client.storage
                .from('carousel')
                .getPublicUrl(filePath);

            // 3. Guardar en Base de Datos
            const { error: dbError } = await client
                .from('carousel_images')
                .insert([{
                    image_url: publicUrl,
                    order_index: (window.allCarouselImages?.length || 0) + successCount
                }]);

            if (dbError) throw dbError;

            successCount++;
            Swal.getHtmlContainer().querySelector('b').textContent = successCount;
        } catch (err) {
            console.error(`Error subiendo ${file.name}:`, err);
            errorCount++;
        }
    }

    input.value = ''; // Limpiar input
    await loadCarouselImages();

    Swal.fire({
        icon: errorCount === 0 ? 'success' : 'info',
        title: 'Proceso completado',
        text: `Se subieron ${successCount} imágenes correctamente.${errorCount > 0 ? ` Fallaron ${errorCount} archivos.` : ''}`
    });
}

window.deleteCarouselImage = async function (id, imageUrl) {
    const result = await Swal.fire({
        title: '¿Eliminar imagen?',
        text: "Esta acción quitará la imagen del carrusel principal.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const client = window.supabaseClient || window.supabase;

            // 1. Eliminar de la base de datos
            const { error: dbError } = await client
                .from('carousel_images')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // 2. Intentar eliminar del Storage si es de nuestro bucket
            if (imageUrl.includes('carousel')) {
                const fileName = imageUrl.split('/').pop();
                await client.storage
                    .from('carousel')
                    .remove([`carousel/${fileName}`]);
            }

            Swal.fire('Eliminado', 'La imagen ha sido quitada del carrusel.', 'success');
            loadCarouselImages();
        } catch (err) {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar la imagen: ' + err.message, 'error');
        }
    }
}

// --- END CAROUSEL MANAGEMENT ---

// Funcionalidad de búsqueda para jqGrid
document.addEventListener('DOMContentLoaded', function () {
    // Buscador de productos
    const productsSearch = document.getElementById('productsSearch');
    if (productsSearch) {
        productsSearch.addEventListener('input', function (e) {
            const searchText = e.target.value.toLowerCase();
            filterProductsGrid(searchText);
        });
    }

    // Buscador de ventas
    const ordersSearch = document.getElementById('ordersSearch');
    if (ordersSearch) {
        ordersSearch.addEventListener('input', function (e) {
            const searchText = e.target.value.toLowerCase();
            filterOrdersGrid(searchText);
        });
    }
});

// Filtrar grid de productos
function filterProductsGrid(searchText) {
    if (!window.allAdminProducts || !productsGrid) return;

    const filteredData = window.allAdminProducts.filter(p => {
        const searchableText = `${p.name} ${p.category} ${p.id}`.toLowerCase();
        return searchableText.includes(searchText);
    });

    // Limpiar y recargar grid con datos filtrados
    jQuery('#productsGrid').jqGrid('clearGridData');
    renderProductsToGrid(filteredData);
}

// Filtrar grid de ventas
function filterOrdersGrid(searchText) {
    if (!window.allAdminOrders || !ordersGrid) return;

    const filteredData = window.allAdminOrders.filter(o => {
        const searchableText = `${o.id} ${o.status} ${o.total}`.toLowerCase();
        return searchableText.includes(searchText);
    });

    // Limpiar y recargar grid con datos filtrados
    jQuery('#ordersGrid').jqGrid('clearGridData');
    renderOrdersToGrid(filteredData);
}

// Auxiliares para buscar y procesar productos por ID desde la caché local
window.viewProductById = function (id) {
        if (!window.allAdminProducts) {
        console.warn('No hay productos cargados en memoria. Intentando cargar...');
        loadProducts().then(() => {
            const product = window.allAdminProducts.find(p => p.id == id);
            if (product) window.viewProductDetail(product);
        });
        return;
    }
    const product = window.allAdminProducts.find(p => p.id == id);
        if (product) {
        window.viewProductDetail(product);
    } else {
        console.error('Producto no encontrado id:', id);
    }
};

window.editProductById = function (id) {
        if (!window.allAdminProducts) {
        console.warn('No hay productos cargados en memoria. Intentando cargar...');
        loadProducts().then(() => {
            const product = window.allAdminProducts.find(p => p.id == id);
            if (product) window.editProduct(product);
        });
        return;
    }
    const product = window.allAdminProducts.find(p => p.id == id);
        if (product) {
        window.editProduct(product);
    } else {
        console.error('Producto no encontrado para edición id:', id);
    }
};

window.viewOrderById = function (id) {
        if (!window.allAdminOrders) {
        console.warn('No hay pedidos cargados en memoria. Intentando cargar...');
        loadOrders().then(() => {
            const order = window.allAdminOrders.find(o => o.id == id);
            if (order) window.viewOrder(order);
        });
        return;
    }
    const order = window.allAdminOrders.find(o => o.id == id);
        if (order) {
        window.viewOrder(order);
    } else {
        console.error('Pedido no encontrado id:', id);
    }
};


// --- OFFERS LOGIC ---

window.loadOfferSettings = async function () {
        try {
        const client = window.supabaseClient || window.supabase;
        const { data, error } = await client
            .from('site_settings')
            .select('value')
            .eq('key', 'offer_banner')
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
            return;
        }

        if (data && data.value) {
            const config = data.value;

            // Set Toggle
            const toggle = document.getElementById('offerActiveToggle');
            const statusText = document.getElementById('offerStatusText');

            if (toggle) {
                toggle.checked = config.isActive;
                if (statusText) statusText.textContent = config.isActive ? 'Activado' : 'Desactivado';

                // Toggle event listener for immediate text update
                toggle.onchange = function () {
                    if (statusText) statusText.textContent = this.checked ? 'Activado' : 'Desactivado';
                };
            }

            // Set Date
            const dateInput = document.getElementById('offerEndDate');
            if (dateInput && config.endDate) {
                // Determine format
                // datetime-local expects YYYY-MM-DDThh:mm
                // config.endDate might be ISO string "2026-02-14T23:59:59"
                dateInput.value = config.endDate.slice(0, 16); // Cut off seconds/timezone if needed for input
            }
        }
    } catch (err) {
        console.error('Error loading offer settings:', err);
    }
};

window.saveOfferSettings = async function () {
    const toggle = document.getElementById('offerActiveToggle');
    const dateInput = document.getElementById('offerEndDate');

    try {
        const newConfig = {
            isActive: toggle ? toggle.checked : false,
            endDate: dateInput ? dateInput.value : null
        };

        if (!newConfig.endDate) {
            Swal.fire('Error', 'Debes seleccionar una fecha de finalización.', 'error');
            return;
        }

        const client = window.supabaseClient || window.supabase;

        const { error } = await client
            .from('site_settings')
            .upsert({
                key: 'offer_banner',
                value: newConfig,
                updated_at: new Date().toISOString()
            });

        if (error) {
            let errorTitle = 'Error al Guardar';
            let errorMessage = '';

            if (error.code === '42501' || error.message.includes('row-level security')) {
                errorTitle = 'Error de Permisos';
                errorMessage = `
                    <div class="text-left">
                        <p class="font-bold mb-2">No tienes permisos para guardar esta configuración.</p>
                        <p class="text-sm mb-2">Debes estar autenticado para realizar cambios en las ofertas.</p>
                        <p class="text-sm mt-3 text-gray-600">
                            <strong>Solución:</strong> Asegúrate de estar autenticado en el sistema.
                        </p>
                    </div>
                `;
            } else {
                errorMessage = `
                    <div class="text-left">
                        <p class="font-bold mb-2">Ocurrió un error:</p>
                        <p class="text-sm bg-gray-100 p-2 rounded mt-2 font-mono">${error.message}</p>
                    </div>
                `;
            }

            Swal.fire({
                icon: 'error',
                title: errorTitle,
                html: errorMessage,
                confirmButtonColor: '#dc2626',
                width: '600px'
            });

            console.error('Error saving offer settings:', error);
            return;
        }

        Swal.fire('Guardado', 'La configuración de ofertas ha sido actualizada.', 'success');

    } catch (err) {
        console.error('Error saving settings:', err);
        Swal.fire({
            icon: 'error',
            title: 'Error Crítico',
            html: `
                <div class="text-left">
                    <p class="font-bold mb-2">Ocurrió un error crítico:</p>
                    <p class="text-sm bg-gray-100 p-2 rounded mt-2 font-mono">${err.message}</p>
                </div>
            `,
            confirmButtonColor: '#dc2626',
            width: '600px'
        });
    }
};


// ============================================
// ALERT SETTINGS FUNCTIONS
// ============================================

window.loadAlertSettings = async function () {
    try {
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('value')
            .eq('key', 'web_alert')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        const config = data?.value || {
            isActive: false,
            type: 'info',
            message: ''
        };

        // Update UI
        const toggle = document.getElementById('alertActiveToggle');
        const statusText = document.getElementById('alertStatusText');
        const typeSelect = document.getElementById('alertType');
        const messageTextarea = document.getElementById('alertMessage');

        if (toggle) {
            toggle.checked = config.isActive;
            if (statusText) {
                statusText.textContent = config.isActive ? 'Activado' : 'Desactivado';
            }
        }

        if (typeSelect) typeSelect.value = config.type || 'info';
        if (messageTextarea) messageTextarea.value = config.message || '';

        // Update preview
        updateAlertPreview();

    } catch (err) {
        console.error('Error loading alert settings:', err);
        Swal.fire('Error', 'No se pudieron cargar las configuraciones: ' + err.message, 'error');
    }
};

window.saveAlertSettings = async function () {
    try {
        const toggle = document.getElementById('alertActiveToggle');
        const typeSelect = document.getElementById('alertType');
        const messageTextarea = document.getElementById('alertMessage');

        const message = messageTextarea?.value?.trim() || '';

        // Validation
        if (message.length > 200) {
            Swal.fire('Error', 'El mensaje no puede exceder 200 caracteres.', 'warning');
            return;
        }

        if (toggle?.checked && !message) {
            Swal.fire('Error', 'Debes escribir un mensaje para activar la alerta.', 'warning');
            return;
        }

        const config = {
            isActive: toggle?.checked || false,
            type: typeSelect?.value || 'info',
            message: message
        };

        // Upsert to database
        const { error } = await window.supabaseClient
            .from('site_settings')
            .upsert({
                key: 'web_alert',
                value: config,
                updated_at: new Date().toISOString()
            });

        if (error) {
            // Provide detailed error messages based on error type
            let errorTitle = 'Error al Guardar';
            let errorMessage = '';

            if (error.code === '42501' || error.message.includes('row-level security')) {
                errorTitle = 'Error de Permisos';
                errorMessage = `
                    <div class="text-left">
                        <p class="font-bold mb-2">No tienes permisos para guardar esta configuración.</p>
                        <p class="text-sm mb-2">Posibles causas:</p>
                        <ul class="list-disc list-inside text-sm space-y-1">
                            <li><strong>No estás autenticado:</strong> Debes iniciar sesión en el panel administrativo.</li>
                            <li><strong>Políticas RLS:</strong> Las políticas de seguridad de la base de datos requieren autenticación.</li>
                            <li><strong>Sesión expirada:</strong> Tu sesión puede haber expirado. Intenta cerrar sesión y volver a entrar.</li>
                        </ul>
                        <p class="text-sm mt-3 text-gray-600">
                            <strong>Solución:</strong> Asegúrate de estar autenticado en el sistema antes de guardar cambios.
                        </p>
                    </div>
                `;
            } else if (error.code === 'PGRST301') {
                errorTitle = 'Error de Conexión';
                errorMessage = `
                    <div class="text-left">
                        <p class="font-bold mb-2">No se pudo conectar con la base de datos.</p>
                        <p class="text-sm">Verifica tu conexión a internet e intenta nuevamente.</p>
                    </div>
                `;
            } else if (error.message.includes('JWT')) {
                errorTitle = 'Sesión Expirada';
                errorMessage = `
                    <div class="text-left">
                        <p class="font-bold mb-2">Tu sesión ha expirado.</p>
                        <p class="text-sm">Por favor, cierra sesión y vuelve a iniciar sesión para continuar.</p>
                    </div>
                `;
            } else {
                errorMessage = `
                    <div class="text-left">
                        <p class="font-bold mb-2">Ocurrió un error inesperado:</p>
                        <p class="text-sm bg-gray-100 p-2 rounded mt-2 font-mono">${error.message}</p>
                        <p class="text-sm mt-2 text-gray-600">
                            <strong>Código:</strong> ${error.code || 'N/A'}
                        </p>
                    </div>
                `;
            }

            Swal.fire({
                icon: 'error',
                title: errorTitle,
                html: errorMessage,
                confirmButtonColor: '#dc2626',
                width: '600px'
            });

            console.error('Error saving alert settings:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return;
        }

        Swal.fire('Guardado', 'La configuración de alertas ha sido actualizada.', 'success');

    } catch (err) {
        console.error('Error saving alert settings:', err);
        Swal.fire({
            icon: 'error',
            title: 'Error Crítico',
            html: `
                <div class="text-left">
                    <p class="font-bold mb-2">Ocurrió un error crítico al guardar:</p>
                    <p class="text-sm bg-gray-100 p-2 rounded mt-2 font-mono">${err.message}</p>
                    <p class="text-sm mt-3 text-gray-600">
                        Por favor, recarga la página e intenta nuevamente. Si el problema persiste, contacta al soporte técnico.
                    </p>
                </div>
            `,
            confirmButtonColor: '#dc2626',
            width: '600px'
        });
    }
};

function updateAlertPreview() {
    const typeSelect = document.getElementById('alertType');
    const messageTextarea = document.getElementById('alertMessage');
    const preview = document.getElementById('alertPreview');
    const toggle = document.getElementById('alertActiveToggle');

    if (!preview) return;

    const message = messageTextarea?.value?.trim() || '';
    const type = typeSelect?.value || 'info';
    const isActive = toggle?.checked || false;

    if (!message || !isActive) {
        preview.innerHTML = `
            <i class="fas fa-eye-slash mb-2 text-2xl"></i>
            <p class="text-sm">La vista previa aparecerá aquí</p>
        `;
        preview.className = 'p-4 rounded-xl border-2 border-dashed border-slate-300 text-center text-slate-400';
        return;
    }

    const styles = {
        info: {
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            icon: 'fa-info-circle',
            shadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
        },
        success: {
            gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
            icon: 'fa-check-circle',
            shadow: '0 10px 40px rgba(11, 163, 96, 0.4)'
        },
        warning: {
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            icon: 'fa-exclamation-triangle',
            shadow: '0 10px 40px rgba(240, 147, 251, 0.4)'
        },
        error: {
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            icon: 'fa-times-circle',
            shadow: '0 10px 40px rgba(250, 112, 154, 0.4)'
        }
    };

    const style = styles[type] || styles.info;

    preview.style.background = style.gradient;
    preview.style.boxShadow = style.shadow;
    preview.className = 'relative p-5 rounded-2xl border-2 border-white/30 overflow-hidden';

    preview.innerHTML = `
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10 pointer-events-none">
            <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.3) 35px, rgba(255,255,255,.3) 70px);"></div>
        </div>
        
        <!-- Content -->
        <div class="relative flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                <i class="fas ${style.icon} text-white text-2xl"></i>
            </div>
            <p class="text-base font-bold text-white flex-1">${message}</p>
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <i class="fas fa-times text-white"></i>
            </div>
        </div>
    `;
}

// Event listeners for preview
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('alertActiveToggle');
    const typeSelect = document.getElementById('alertType');
    const messageTextarea = document.getElementById('alertMessage');
    const statusText = document.getElementById('alertStatusText');

    if (toggle) {
        toggle.addEventListener('change', function () {
            if (statusText) {
                statusText.textContent = this.checked ? 'Activado' : 'Desactivado';
            }
            updateAlertPreview();
        });
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', updateAlertPreview);
    }

    if (messageTextarea) {
        messageTextarea.addEventListener('input', updateAlertPreview);
    }

    // Cargar estadísticas de visitas al iniciar el panel
    setTimeout(() => {
        if (typeof loadVisitStats === 'function') {
                        loadVisitStats();
        }
    }, 500);
});
