
// Lógica del Panel de Administración

// Verificar autenticación al inicio
async function checkAuth() {
    const client = window.supabaseClient || window.supabase;
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    // Mostrar usuario
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) userEmailEl.textContent = session.user.email;

    // Cargar datos iniciales
    loadProducts();
    loadOrders();
    trackVisits();
}

// Track and Load Site Visits
async function trackVisits() {
    try {
        const client = window.supabaseClient || window.supabase;
        // Increment visit count via RPC
        await client.rpc('increment_visit_count');

        // Fetch current count
        const { data, error } = await client
            .from('site_visits')
            .select('count')
            .eq('id', 1)
            .single();

        if (error) throw error;

        const counterEl = document.getElementById('visitCounter');
        if (counterEl && data) {
            // Animate number change for striking effect
            animateNumber(counterEl, 0, data.count, 1500);
        }
    } catch (err) {
        console.error('Error tracking visits:', err);
    }
}

// Helper to animate numbers strikingly
function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Tabs Logic
window.switchAdminTab = function (tab) {
    const dashboardSection = document.getElementById('dashboardSection');
    const productsSection = document.getElementById('productsSection');
    const ordersSection = document.getElementById('ordersSection');

    // Sidebar buttons
    const navButtons = {
        dashboard: document.getElementById('sideBtnDashboard'),
        products: document.getElementById('sideBtnProducts'),
        orders: document.getElementById('sideBtnOrders')
    };

    // Hide all
    dashboardSection?.classList.add('hidden');
    productsSection?.classList.add('hidden');
    ordersSection?.classList.add('hidden');

    // Reset buttons
    Object.values(navButtons).forEach(btn => {
        if (btn) btn.classList.remove('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
    });

    // Show selected
    if (tab === 'dashboard') {
        dashboardSection?.classList.remove('hidden');
        navButtons.dashboard?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
    } else if (tab === 'products') {
        productsSection?.classList.remove('hidden');
        navButtons.products?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
        loadProducts();
    } else if (tab === 'orders') {
        ordersSection?.classList.remove('hidden');
        navButtons.orders?.classList.add('active', 'bg-white/10', 'border-l-4', 'border-blue-500', 'text-white');
        loadOrders();
    }
}



// Pagination state (No longer needed with DataTables, but kept for compatibility if referenced elsewhere)
let currentProductPage = 1;
const productsPerPage = 10;
let inventoryDataTable = null;
let ordersDataTable = null;

const spanishLanguage = {
    "decimal": "",
    "emptyTable": "No hay datos disponibles en la tabla",
    "info": "Mostrando _START_ a _END_ de _TOTAL_ entradas",
    "infoEmpty": "Mostrando 0 a 0 de 0 entradas",
    "infoFiltered": "(filtrado de _MAX_ entradas totales)",
    "infoPostFix": "",
    "thousands": ",",
    "lengthMenu": "Mostrar _MENU_ entradas",
    "loadingRecords": "Cargando...",
    "processing": "Procesando...",
    "search": "Buscar:",
    "zeroRecords": "No se encontraron registros coincidentes",
    "paginate": {
        "first": "Primero",
        "last": "Último",
        "next": "Siguiente",
        "previous": "Anterior"
    },
    "aria": {
        "sortAscending": ": activar para ordenar la columna ascendente",
        "sortDescending": ": activar para ordenar la columna descendente"
    }
};

// Initialize DataTables
function initInventoryTable() {
    if ($.fn.DataTable.isDataTable('#inventoryTable')) {
        return $('#inventoryTable').DataTable();
    }

    return $('#inventoryTable').DataTable({
        language: spanishLanguage,
        pageLength: 10,
        responsive: true,
        autoWidth: false,
        width: '100%',
        order: [[0, 'desc']], // Order by No. (Most recent first)
        columnDefs: [
            {
                targets: 0,
                type: 'num',
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<span class="text-[11px] font-bold solid-slate-400 block text-center">#${data}</span>`;
                    }
                    return data;
                }
            },
            { orderable: false, targets: [5] }, // Non-orderable columns (Actions)
            { className: "dt-center", targets: [0, 3, 4, 5] }
        ],
        dom: '<"flex justify-between items-center mb-6"lf>rt<"flex justify-between items-center mt-6"ip>',
        drawCallback: function () {
            $('.futuristic-row').addClass('fadeInUp');
        }
    });
}

// Initialize Orders DataTables
function initOrdersTable() {
    if ($.fn.DataTable.isDataTable('#ordersTable')) {
        return $('#ordersTable').DataTable();
    }

    return $('#ordersTable').DataTable({
        language: spanishLanguage,
        pageLength: 10,
        responsive: true,
        autoWidth: false,
        width: '100%',
        order: [[1, 'desc']], // Order by Date
        columnDefs: [
            { orderable: false, targets: [5] }, // Non-orderable columns (Actions)
            { className: "dt-center", targets: [3, 4, 5] }
        ],
        dom: '<"flex justify-between items-center mb-8"lf>rt<"flex justify-between items-center mt-8"ip>',
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('futuristic-row group');
        },
        drawCallback: function () {
            $('.futuristic-row').addClass('fadeInUp');
        }
    });
}

// Cargar productos
window.loadProducts = async function () {
    try {
        const client = window.supabaseClient || window.supabase;
        const { data: products, error } = await client
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        window.allAdminProducts = products;

        // Dashboard count update
        const dashCount = document.getElementById('dashProductsCount');
        if (dashCount) dashCount.textContent = products.length;

        // Initialize table if not done
        if (!inventoryDataTable) {
            inventoryDataTable = initInventoryTable();
        }

        // Render with DataTables
        renderProductsToTable(products);

    } catch (err) {
        console.error('Error cargando productos:', err);
        Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
    }
}

// Render products using DataTables
function renderProductsToTable(products) {
    if (!inventoryDataTable) return;
    inventoryDataTable.clear();

    products.forEach((p, index) => {
        // Category Badge Tech
        let catClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        if (p.category === 'laptops') catClasses = 'bg-indigo-50/50 text-indigo-600 border-indigo-200/50';
        if (p.category === 'smartphones') catClasses = 'bg-sky-50/50 text-sky-600 border-sky-200/50';
        if (p.category === 'tablets') catClasses = 'bg-purple-50/50 text-purple-600 border-purple-200/50';
        if (p.category === 'accesorios') catClasses = 'bg-amber-50/50 text-amber-600 border-amber-200/50';

        // Stock Logic with Premium Badges
        let stockBadge = '';
        if (p.stock <= 5) {
            stockBadge = `<span class="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase tracking-tighter">Crítico: ${p.stock}</span>`;
        } else if (p.stock <= 15) {
            stockBadge = `<span class="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-black uppercase tracking-tighter">Bajo: ${p.stock}</span>`;
        } else {
            stockBadge = `<span class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-tighter">Óptimo: ${p.stock}</span>`;
        }

        const cleanP = JSON.stringify(p).replace(/'/g, "&#39;").replace(/"/g, '&quot;');

        const actionsHtml = `
            <div class="flex items-center justify-center space-x-2">
                <button onclick='viewProductDetail(${cleanP})' class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-brand-500 hover:text-white transition-all shadow-sm">
                    <i class="fas fa-eye text-sm"></i>
                </button>
                <button onclick='editProduct(${cleanP})' class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                    <i class="fas fa-pen-to-square text-sm"></i>
                </button>
                <button onclick="deleteProduct(${p.id})" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    <i class="fas fa-trash-can text-sm"></i>
                </button>
            </div>
        `;

        inventoryDataTable.row.add([
            p.id,
            `<div class="flex items-center space-x-3 py-1">
                <div class="product-img-futuristic w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-brand-400 transition-all">
                    <img src="${p.image_url}" class="w-full h-full object-contain">
                </div>
                <div>
                    <span class="block text-[13px] font-extrabold solid-slate-700 tracking-tight leading-snug">${p.name} <i class="fas fa-arrow-up-right-from-square text-[9px] solid-slate-400 ml-1"></i></span>
                    <span class="text-[9px] font-bold solid-slate-400 uppercase tracking-widest">SKU-${p.id.toString().padStart(5, '0')}</span>
                </div>
            </div>`,
            `<div class="flex items-center justify-start py-1">
                <span class="px-3 py-1.5 text-[9px] font-bold rounded-xl ${catClasses} uppercase tracking-widest border shadow-sm">${p.category}</span>
            </div>`,
            `<div class="flex justify-center py-1">${stockBadge}</div>`,
            `<div class="flex flex-col items-center py-1">
                <div class="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-xl group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                    <span class="text-[14px] font-extrabold solid-slate-700">
                        <span class="solid-brand-500 mr-0.5 font-bold">S/.</span>${parseFloat(p.price).toFixed(2)}
                    </span>
                </div>
            </div>`,
            actionsHtml
        ]);
    });

    inventoryDataTable.order([0, 'desc']).draw();
    updateProductStats(products);
}

// Helper for pagination (now handled by DataTables)
window.goToProductPage = function (page) {
    if (inventoryDataTable) {
        inventoryDataTable.page(page - 1).draw('page');
    }
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

// --- PRODUCT DETAIL MODAL ---
window.viewProductDetail = function (product) {
    window.currentViewingProduct = product;
    document.getElementById('detailProductName').textContent = product.name;
    document.getElementById('detailProductImage').src = product.image_url;
    document.getElementById('detailProductStock').textContent = product.stock;
    document.getElementById('detailProductPrice').textContent = 'S/. ' + parseFloat(product.price).toFixed(2);
    document.getElementById('detailProductDesc').textContent = product.description || 'Sin descripción disponible para este artículo.';
    document.getElementById('detailProductCategory').textContent = product.category;

    // Status Pill Logic
    const statusPill = document.getElementById('detailStatusPill');
    if (product.stock <= 5) {
        statusPill.textContent = 'Stock Crítico';
        statusPill.className = 'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-rose-100 text-rose-600 border border-rose-200';
    } else if (product.stock <= 15) {
        statusPill.textContent = 'Stock Bajo';
        statusPill.className = 'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 border border-amber-200';
    } else {
        statusPill.textContent = 'Stock Disponible';
        statusPill.className = 'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-600 border border-emerald-200';
    }

    const specsContainer = document.getElementById('detailProductSpecs');
    specsContainer.innerHTML = '';

    let specs = product.specifications;
    if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = null; }
    }

    if (specs && Array.isArray(specs) && specs.length > 0) {
        document.getElementById('detailSpecsContainer').classList.remove('hidden');
        specs.forEach(s => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between py-2 border-b border-slate-100/50 hover:bg-white/50 transition-colors px-2 rounded-lg';
            row.innerHTML = `
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">${s.key}</span>
                <span class="text-[11px] font-extrabold text-slate-700">${s.value}</span>
            `;
            specsContainer.appendChild(row);
        });
    } else {
        document.getElementById('detailSpecsContainer').classList.add('hidden');
    }

    document.getElementById('productDetailModal').classList.remove('hidden');
}

window.closeProductDetailModal = function () {
    document.getElementById('productDetailModal').classList.add('hidden');
}

window.printProductDetail = function () {
    const p = window.currentViewingProduct;
    if (!p) return;

    let specsHtml = '';
    let specs = p.specifications;
    if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = null; }
    }
    if (specs && Array.isArray(specs)) {
        specs.forEach(s => {
            specsHtml += `
                <div class="print-spec-item">
                    <span class="spec-key">${s.key}</span>
                    <span class="spec-value">${s.value}</span>
                </div>`;
        });
    }

    const printWin = window.open('', '', 'width=900,height=900');
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Ficha de Producto - ${p.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; line-height: 1.4; }
                    
                    /* Header Elite */
                    .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-logo { height: 50px; }
                    .header-info { text-align: right; }
                    .header-info h2 { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
                    .header-info p { font-size: 10px; color: #cbd5e1; }

                    /* Top Section Grid */
                    .top-grid { display: grid; grid-template-columns: 380px 1fr; gap: 40px; margin-bottom: 30px; align-items: start; }
                    
                    /* Image Container */
                    .product-image-container { 
                        background: #f8fafc; 
                        border-radius: 30px; 
                        padding: 30px; 
                        border: 1px solid #f1f5f9; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        height: 380px;
                        overflow: hidden;
                    }
                    .product-image { max-width: 100%; max-height: 100%; object-fit: contain; }
                    
                    /* Right Info Area */
                    .product-title-area h1 { font-size: 34px; font-weight: 900; color: #0f172a; margin-bottom: 25px; line-height: 1.1; letter-spacing: -0.02em; }
                    
                    .stats-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    
                    .stat-card { 
                        background: #f8fafc; 
                        padding: 25px; 
                        border-radius: 20px; 
                        position: relative; 
                        border: 1px solid #f1f5f9;
                    }
                    /* Card Ribbons like image */
                    .stat-card.price-card { border-left: 5px solid #3b82f6; }
                    .stat-card.stock-card { border-left: 5px solid #f59e0b; }
                    
                    .stat-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; display: block; }
                    .stat-value { font-size: 24px; font-weight: 900; color: #1e293b; display: block; }
                    .stat-value.price-color { color: #0d9488; } /* Premium Teal instead of pure green */

                    /* Full Width Sections (Description & Specs) */
                    .full-width-section { width: 100%; margin-top: 20px; border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; }
                    .section-header { background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #f1f5f9; }
                    .section-header h3 { font-size: 11px; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
                    
                    .section-body { padding: 25px; }
                    .section-body p { font-size: 13px; color: #475569; line-height: 1.6; text-align: justify; }

                    /* Specs Grid in Full Width */
                    .specs-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px 40px; }
                    .spec-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
                    .spec-key { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
                    .spec-value { font-size: 11px; font-weight: 800; color: #1e293b; }

                    .print-footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; }
                    .print-footer p { font-size: 9px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

                    @media print {
                        body { padding: 20px; }
                        .stat-card, .section-header, .product-image-container { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <img src="Imagenes/Logotipo.png" class="company-logo">
                    <div class="header-info">
                        <h2>Ficha Técnica de Inventario</h2>
                        <p>${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="top-grid">
                    <div class="product-image-container">
                        <img src="${p.image_url}" class="product-image">
                    </div>
                    <div class="product-title-area">
                        <h1>${p.name}</h1>
                        <div class="stats-cards">
                            <div class="stat-card price-card">
                                <span class="stat-label">Precio Unitario</span>
                                <span class="stat-value price-color">S/. ${parseFloat(p.price).toFixed(2)}</span>
                            </div>
                            <div class="stat-card stock-card">
                                <span class="stat-label">Stock Neto</span>
                                <span class="stat-value">${p.stock} Unidades</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Description Full Width (As shown in RED box) -->
                <div class="full-width-section">
                    <div class="section-header">
                        <h3>Descripción Técnica</h3>
                    </div>
                    <div class="section-body">
                        <p>${p.description || 'No hay descripción técnica disponible para este artículo.'}</p>
                    </div>
                </div>

                <!-- Specifications Full Width -->
                <div class="full-width-section" id="printSpecsSection">
                    <div class="section-header">
                        <h3>Especificaciones Detalladas</h3>
                    </div>
                    <div class="section-body">
                        <div class="specs-grid">
                            ${specsHtml || '<p style="font-size: 12px; color: #94a3b8;">No se registraron especificaciones.</p>'}
                        </div>
                    </div>
                </div>

                <div class="print-footer">
                    <p>Sistema Solbin-X &copy; ${new Date().getFullYear()} - Documento de Control de Inventario</p>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWin.document.close();
}


// --- PEDIDOS (ORDERS) LOGIC ---




// --- PEDIDOS (ORDERS) LOGIC ---

window.loadOrders = async function () {
    try {
        const client = window.supabaseClient || window.supabase;
        const { data: orders, error } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Save for export
        window.allAdminOrders = orders;

        // Dashboard count update
        const dashCount = document.getElementById('dashOrdersCount');
        if (dashCount) dashCount.textContent = orders.length;

        // Initialize table if not done
        if (!ordersDataTable) {
            ordersDataTable = initOrdersTable();
        }

        renderOrdersToTable(orders);

    } catch (err) {
        console.error('Error cargando ventas:', err);
        Swal.fire('Error', 'No se pudieron cargar las ventas.', 'error');
    }
}

// Render orders using DataTables
// Render orders using DataTables
function renderOrdersToTable(orders) {
    if (!ordersDataTable) return;
    ordersDataTable.clear();

    orders.forEach((order, index) => {
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
                <button onclick='viewOrder(${orderJson})' 
                    class="group flex items-center space-x-2 bg-brand-600 text-white px-5 py-2.5 rounded-2xl hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all font-black text-[10px] uppercase tracking-[0.11em] shadow-xl shadow-brand-500/20 whitespace-nowrap">
                    <i class="fas fa-bolt-lightning text-amber-400 group-hover:text-white transition"></i>
                    <span>VER DETALLE</span>
                </button>
            </div>
        `;

        ordersDataTable.row.add([
            `<div class="flex items-center space-x-3 py-2">
                <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center solid-slate-400 border border-slate-200 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-400 transition-all shadow-sm">
                    <i class="fas fa-fingerprint text-xs"></i>
                </div>
                <span class="font-extrabold solid-slate-600 tracking-tighter text-sm">ID-${order.id}</span>
            </div>`,
            `<div class="flex flex-col py-2">
                <span class="text-[13px] font-extrabold solid-slate-500 tracking-tight whitespace-nowrap">${dateStr}</span>
                <span class="text-[10px] font-bold solid-slate-400 uppercase tracking-widest">${timeStr}</span>
            </div>`,
            `<div class="flex items-center space-x-3 py-2 px-2">
                <div class="relative flex-shrink-0">
                    <div class="w-10 h-10 bg-emerald-50/50 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm transition-all group-hover:rotate-12">
                        <i class="fab fa-whatsapp text-lg"></i>
                    </div>
                </div>
                <div class="min-w-[100px]">
                    <span class="text-[9px] font-bold solid-slate-400 uppercase tracking-tight block">Canal IoT</span>
                    <span class="text-[11px] font-extrabold solid-slate-500 whitespace-nowrap">WhatsApp Business</span>
                </div>
            </div>`,
            `<div class="flex flex-col items-center py-2">
                <span class="text-[9px] font-bold solid-slate-400 uppercase tracking-widest mb-1">Monto Neto</span>
                <div class="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl group-hover:bg-brand-50 group-hover:border-brand-100 transition-all shadow-sm">
                    <span class="text-[15px] font-extrabold solid-slate-600">
                        <span class="solid-brand-500 mr-0.5 font-bold">S/.</span>${parseFloat(order.total).toFixed(2)}
                    </span>
                </div>
            </div>`,
            `<div class="flex justify-center py-2">
                <span class="relative px-5 py-2.5 inline-flex items-center text-[10px] font-extrabold rounded-xl ${statusClasses} uppercase tracking-widest border shadow-sm transition-all overflow-hidden group/badge min-w-[140px] justify-center">
                    <span class="w-1.5 h-1.5 rounded-full ${dotColor} mr-2 animate-pulse"></span>
                    ${statusLabel}
                </span>
            </div>`,
            actionsHtml
        ]);
    });

    ordersDataTable.order([1, 'desc']).draw();
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
    statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full mr-2 animate-pulse bg-current"></span> ${order.status.replace('_', ' ').toUpperCase()}`;

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
        const info = order.customer_info;

        if (info.phone) {
            infoHtml += `
            <div class="flex items-center space-x-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-sm">
                <div class="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><i class="fab fa-whatsapp text-lg"></i></div>
                <div class="flex flex-col">
                    <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">WhatsApp Contact</span>
                    <span class="text-[15px] font-black text-slate-800">${info.phone}</span>
                </div>
            </div> `;
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
            row.className = 'hover:bg-slate-50/50 transition-all';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-[11px] font-black text-slate-700 leading-tight">${item.name}</span>
                        <span class="text-[8px] font-bold text-slate-400 uppercase">SKU-${item.id || 'N/A'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="text-[10px] font-bold text-slate-600">${item.quantity} ud.</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="text-[11px] font-black text-slate-700">S/. ${(item.price * item.quantity).toFixed(2)}</span>
                </td>
            `;
            itemsBody.appendChild(row);
        });
    }

    document.getElementById('orderTotal').innerHTML = `
        <span class="text-brand-500/50 font-black mr-1 text-base">S/.</span>
        ${parseFloat(order.total).toFixed(2)}
    `;

    document.getElementById('orderModal').classList.remove('hidden');
}

window.closeOrderModal = function () {
    document.getElementById('orderModal').classList.add('hidden');
}

window.updateOrderStatus = async function () {
    if (!currentOrderId) return;

    const newStatus = document.getElementById('orderStatusSelect').value;
    const client = window.supabaseClient || window.supabase;

    try {
        // Stock Update Logic: If moving TO 'terminado' FROM something else
        if (newStatus === 'terminado' && window.currentFullOrder && window.currentFullOrder.status !== 'terminado') {
            try {
                let items = window.currentFullOrder.items;
                if (typeof items === 'string') items = JSON.parse(items);

                if (Array.isArray(items) && window.allAdminProducts) {
                    for (const item of items) {
                        // Find product by name (using name as key since ID isn't in cart items yet)
                        const product = window.allAdminProducts.find(p => p.name === item.name);
                        if (product) {
                            const newStock = Math.max(0, product.stock - item.quantity);
                            await client.from('products').update({ stock: newStock }).eq('id', product.id);
                        }
                    }
                    console.log('Stock updated for order', currentOrderId);
                }
            } catch (err) {
                console.error('Error updating stock:', err);
                Swal.fire('Advertencia', 'El estado se actualizó pero hubo un error actualizando el stock.', 'warning');
            }
        }

        const { error } = await client
            .from('orders')
            .update({ status: newStatus })
            .eq('id', currentOrderId);

        if (error) throw error;

        Swal.fire('Actualizado', 'Estado del pedido cambiado.', 'success');

        // Close modal
        closeOrderModal();
        loadOrders(); // Refresh orders
        loadProducts(); // Refresh products (stock)

    } catch (e) {
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
                    color: #1e293b;
                    line-height: 1.5;
                }
                .header { 
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 40px;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 20px;
                }
                .logo-img { height: 60px; width: auto; }
                .receipt-meta { text-align: right; }
                .receipt-meta h1 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin: 0 0 8px 0; }
                .receipt-meta p { margin: 2px 0; font-size: 11px; font-weight: 700; color: #94a3b8; }
                .info { 
                    margin-bottom: 30px; 
                    padding: 20px; 
                    background: #f8fafc; 
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .info p { margin: 5px 0; font-size: 13px; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { 
                    text-align: left; 
                    padding: 12px; 
                    border-bottom: 2px solid #e2e8f0;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #64748b;
                }
                td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 500; }
                .total { 
                    text-align: right; 
                    font-size: 20px; 
                    font-weight: 800; 
                    color: #2563eb;
                    margin-top: 10px;
                    border-top: 2px solid #e2e8f0;
                    padding-top: 15px;
                }
                .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="assets/img/logo-full.png" class="logo-img" alt="Solbin-X Logo">
                <div class="receipt-meta">
                    <h1>ORDEN DE VENTA</h1>
                    <p>Orden ID: #${order.id}</p>
                    <p>Fecha: ${new Date(order.created_at).toLocaleDateString()}</p>
                    <p>Hora: ${new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
            </div>
            <div class="info">
                <p><strong>Cliente (WhatsApp):</strong> ${order.customer_info?.phone || 'N/A'}</p>
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
                <p>Gracias por confiar en Solbin-X • Gestión Elite de Inventarios</p>
                <p>www.solbin-x.com</p>
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
        `);
    printWindow.document.close();
}

// Modal Logica
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

// Image Tab Logic
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
    // Clear preview when switching if needed, or re-eval
    previewImage();
};

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
            // Check if there is an existing image URL from edit mode to show as fallback?
            // For now, if no new file, hide preview unless we want to show current image.
            const currentUrl = document.getElementById('prodImage').value; // fallback to hidden url field? No, logical split.
            if (currentUrl && document.getElementById('prodId').value) {
                // In edit mode with no new file, show existing URL
                img.src = currentUrl;
                preview.classList.remove('hidden');
            } else {
                preview.classList.add('hidden');
            }
        }
    }
}

// Watch for file selection changes
document.getElementById('prodImageFile').addEventListener('change', previewImage);


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


function openModal(product = null) {
    // Resetear formulario
    form.reset();
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('prodId').value = '';
    // Clear specs list
    document.getElementById('specsList').innerHTML = '';

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
        document.getElementById('prodImage').value = product.image_url;

        // Load Specs
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            Object.entries(product.specifications).forEach(([key, val]) => {
                addSpecRow(key, val);
            });
        } else {
            // If old product with no specs, maybe try to parse description lines?
            // Optional enhancement. For now, empty or manual.
            addSpecRow(); // Add one empty row
        }

        // Nuevo Ingreso checkbox
        document.getElementById('prodNewArrival').checked = !!product.is_new_arrival;

        previewImage();
    } else {
        // Modo Creación
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        addSpecRow(); // Start with one row
        document.getElementById('prodNewArrival').checked = true; // Default to true for new products? Or false? Let's default false to be safe, or true since it is "New Product" modal. User said "check to indicate...", usually defaults to false unless explicitly new entry. Let's make it false default.
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
        let imageUrl = document.getElementById('prodImage').value; // Default to existing/URL input

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

        // Handle File Upload if active tab is upload and file selected
        if (activeImageTab === 'upload') {
            const fileInput = document.getElementById('prodImageFile');
            const file = fileInput.files[0];

            if (file) {
                // Upload logic
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error: uploadError } = await client.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) throw new Error('Error al subir imagen: ' + uploadError.message);

                // Get Public URL
                const { data: { publicUrl } } = client.storage
                    .from('products')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            } else if (!id) {
                // New product, upload tab active but no file
                // If there's no URL typed in the other tab (which is hidden but value might exist?), warn?
                // But user might have switched tabs.
                // If active tab is upload and NO file, check if URL input has value?
                // No, strict mode: if upload tab is active, expect file or keep existing (edit).
                if (!imageUrl) throw new Error("Debes seleccionar una imagen o ingresar una URL.");
            }
        } else {
            if (!imageUrl) throw new Error("Debes ingresar una URL de imagen.");
        }

        const productData = {
            name: name,
            price: parseFloat(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value),
            category: document.getElementById('prodCategory').value,
            description: document.getElementById('prodDesc').value,
            image_url: imageUrl,
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
document.addEventListener('DOMContentLoaded', checkAuth);


