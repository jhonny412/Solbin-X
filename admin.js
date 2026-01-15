
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

    // Cargar productos
    loadProducts();
}

// Tabs Logic
window.switchAdminTab = function (tab) {
    const productsSection = document.getElementById('productsSection');
    const ordersSection = document.getElementById('ordersSection');
    const btnProducts = document.getElementById('tabBtnProducts');
    const btnOrders = document.getElementById('tabBtnOrders');

    if (tab === 'products') {
        productsSection.classList.remove('hidden');
        ordersSection.classList.add('hidden');

        btnProducts.className = "px-6 py-2 rounded-lg text-sm font-bold transition shadow bg-white text-sky-600";
        btnOrders.className = "px-6 py-2 rounded-lg text-sm font-bold transition text-gray-600 hover:bg-white hover:text-sky-600";
    } else {
        productsSection.classList.add('hidden');
        ordersSection.classList.remove('hidden');

        btnProducts.className = "px-6 py-2 rounded-lg text-sm font-bold transition text-gray-600 hover:bg-white hover:text-sky-600";
        btnOrders.className = "px-6 py-2 rounded-lg text-sm font-bold transition shadow bg-white text-sky-600";

        // Load orders if empty? or always refresh?
        loadOrders();
    }
}



// Pagination state
let currentProductPage = 1;
const productsPerPage = 10;

// Cargar productos
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    // Spinner
    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i> Cargando...</td></tr>`;

    try {
        const client = window.supabaseClient || window.supabase;
        const { data: products, error } = await client
            .from('products')
            .select('*')
            .order('id', { ascending: false }); // Más recientes primero

        if (error) throw error;

        // Save for later lookup
        window.allAdminProducts = products;

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500">No hay productos registrados.</td></tr>`;
            document.getElementById('productsPagination').innerHTML = '';
            return;
        }

        // Render with pagination
        renderProductsPage(products, currentProductPage);

    } catch (err) {
        console.error('Error cargando productos:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error al cargar datos. <button onclick="loadProducts()" class="underline ml-2">Reintentar</button></td></tr>`;
    }
}

// Render products for a specific page
function renderProductsPage(products, page) {
    const tbody = document.getElementById('productsTableBody');
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Ensure valid page
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentProductPage = page;

    // Calculate slice
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = products.slice(startIndex, endIndex);

    tbody.innerHTML = '';
    pageProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                        <img class="h-10 w-10 rounded-full object-cover" src="${p.image_url}" alt="${p.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${p.name}</div>
                        <div class="text-xs text-gray-500 truncate max-w-xs">${p.description || ''}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800 uppercase">
                    ${p.category}
                </span>
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 font-bold">
                ${p.stock !== undefined ? p.stock : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                S/. ${parseFloat(p.price).toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-center">
                <button onclick='editProduct(${JSON.stringify(p).replace(/'/g, "&#39;")})' class="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 transition" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${p.id})" class="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Render pagination
    renderProductsPagination(products.length, totalPages, page);
}

// Render pagination buttons
function renderProductsPagination(totalProducts, totalPages, currentPage) {
    const container = document.getElementById('productsPagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button onclick="goToProductPage(${currentPage - 1})" 
        class="px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600 border border-gray-300'} transition text-sm font-medium"
        ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="px-3 py-1 rounded-lg bg-sky-600 text-white font-bold text-sm">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button onclick="goToProductPage(${i})" 
                class="px-3 py-1 rounded-lg bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600 border border-gray-300 transition text-sm font-medium">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
    }

    // Next button
    html += `<button onclick="goToProductPage(${currentPage + 1})" 
        class="px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600 border border-gray-300'} transition text-sm font-medium"
        ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;

    // Info text
    html += `<span class="ml-4 text-sm text-gray-500">Mostrando ${((currentPage - 1) * productsPerPage) + 1}-${Math.min(currentPage * productsPerPage, totalProducts)} de ${totalProducts}</span>`;

    container.innerHTML = html;
}

// Navigate to page
window.goToProductPage = function (page) {
    if (window.allAdminProducts) {
        renderProductsPage(window.allAdminProducts, page);
    }
}




// --- PEDIDOS (ORDERS) LOGIC ---

window.loadOrders = async function () {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i> Cargando ventas...</td></tr>`;

    try {
        const client = window.supabaseClient || window.supabase;
        const { data: orders, error } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Save for export
        window.allAdminOrders = orders;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500">No hay ventas registradas.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition';

            // Status Badge
            let statusColor = 'gray';
            if (order.status === 'iniciado') statusColor = 'blue';
            if (order.status === 'en_proceso') statusColor = 'yellow';
            if (order.status === 'terminado') statusColor = 'green';
            if (order.status === 'cancelado') statusColor = 'red';

            const badgeClass = `bg-${statusColor}-100 text-${statusColor}-800`;

            const date = new Date(order.created_at).toLocaleString();

            // Clean JSON string pass
            const orderJson = JSON.stringify(order).replace(/'/g, "&#39;").replace(/"/g, '&quot;');

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex flex-col">
                        <span class="text-xs text-gray-400">WhatsApp / Web</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800">
                    S/. ${parseFloat(order.total).toFixed(2)}
                </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass} uppercase">
                        ${order.status === 'terminado' ? 'Finalizado' : order.status.replace('_', ' ')}
                    </span>
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onclick='viewOrder(${orderJson})' class="bg-sky-50 text-sky-600 hover:bg-sky-100 px-3 py-1 rounded-lg transition font-bold text-xs border border-sky-200">
                        <i class="fas fa-eye mr-1"></i> Ver
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error('Error cargando ventas:', err);
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error al cargar ventas.</td></tr>`;
    }
}

// Order Modal Vars
let currentOrderId = null;

window.viewOrder = function (order) {
    currentOrderId = order.id;
    window.currentFullOrder = order; // Save full object
    document.getElementById('orderModalId').textContent = '#' + order.id;
    document.getElementById('orderDate').textContent = new Date(order.created_at).toLocaleString();

    // Status
    const statusEl = document.getElementById('orderStatusDisplay');
    statusEl.textContent = order.status.toUpperCase();
    statusEl.className = 'font-bold px-2 py-1 rounded text-xs bg-gray-100 text-gray-800'; // Default
    if (order.status === 'iniciado') statusEl.className += ' bg-blue-100 text-blue-800';
    if (order.status === 'terminado') statusEl.className += ' bg-green-100 text-green-800';

    // Select init
    document.getElementById('orderStatusSelect').value = order.status;

    // Customer Info
    // Customer Info
    const infoEl = document.getElementById('orderCustomerInfo');
    if (order.customer_info) {
        let infoHtml = '';
        const info = order.customer_info;

        // Hide technical fields like user_agent unless needed, or format nicely
        if (info.phone) infoHtml += `<div class="mb-2 text-lg text-sky-700 font-bold"><i class="fab fa-whatsapp text-green-500 mr-2"></i> ${info.phone}</div>`;

        infoEl.innerHTML = infoHtml || 'Información básica disponible.';
    } else {
        infoEl.textContent = 'Sin información adicional.';
    }

    // Items
    const itemsBody = document.getElementById('orderItemsTable');
    itemsBody.innerHTML = '';

    let items = order.items;
    // Check if items is array or object string? Supabase returns jsonb mainly effectively.
    if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { }
    }

    if (Array.isArray(items)) {
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-2">${item.name}</td>
                <td class="px-4 py-2 text-center">${item.quantity}</td>
                <td class="px-4 py-2 text-right">S/. ${item.price}</td>
                <td class="px-4 py-2 text-right font-bold">S/. ${item.price * item.quantity}</td>
            `;
            itemsBody.appendChild(row);
        });
    }

    document.getElementById('orderTotal').textContent = 'S/. ' + parseFloat(order.total).toFixed(2);

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
            </tr>`;
        });
    }

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Recibo de Venta #${order.id}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .logo-container { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px; }
                .logo-icon { font-size: 24px; color: #667eea; }
                .logo-text { font-size: 24px; font-weight: bold; }
                .info { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { text-align: left; border-bottom: 1px solid #000; }
                .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 10px;}
                .footer { margin-top: 30px; text-align: center; font-size: 0.8em; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    <i class="fas fa-laptop-code logo-icon"></i>
                    <span class="logo-text">Solbin-X</span>
                </div>
                <p>Comprobante de Pedido #${order.id}</p>
                <p>Fecha: ${new Date(order.created_at).toLocaleString()}</p>
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
                <p>Gracias por su preferencia.</p>
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


