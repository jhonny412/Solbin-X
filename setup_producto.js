const fs = require('fs');

try {
    const content = fs.readFileSync('c:/Users/jhonn/Desktop/CompuVentas/producto.html', 'utf8');

    const navEndIndex = content.indexOf('</nav>') + 6;
    const footerStartIndex = content.indexOf('<footer');

    let preNav = content.substring(0, navEndIndex);
    let postFooter = content.substring(footerStartIndex);

    const mainContent = `
    <!-- Main Product Container (Vaciado via JS) -->
    <main id="product-container" class="pt-32 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div class="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
            <div id="product-loading" class="text-center py-20 flex flex-col items-center justify-center">
                <i class="fas fa-circle-notch fa-spin text-5xl text-sky-600 mb-6 drop-shadow-md"></i>
                <p class="text-gray-500 dark:text-gray-400 font-medium text-lg tracking-wide uppercase">Cargando detalles del producto...</p>
            </div>
            
            <div id="product-detail-area" class="hidden opacity-0 transition-all duration-700 ease-in-out transform translate-y-4">
                <!-- Breadcrumbs -->
                <nav class="flex mb-8 text-sm text-gray-500 dark:text-gray-400 items-center overflow-x-auto whitespace-nowrap custom-scrollbar pb-2">
                    <a href="index.html" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-2"><i class="fas fa-home"></i> Inicio</a>
                    <i class="fas fa-chevron-right text-xs mx-3 text-gray-300 dark:text-gray-600"></i>
                    <a href="index.html#catalogo" class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors" id="bread-category">Catálogo</a>
                    <i class="fas fa-chevron-right text-xs mx-3 text-gray-300 dark:text-gray-600"></i>
                    <span class="text-gray-800 dark:text-gray-200 font-bold truncate max-w-xs" id="bread-name">...</span>
                </nav>

                <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl p-6 lg:p-12 mb-12 border border-white/20 dark:border-gray-700/50 backdrop-blur-xl relative overflow-hidden group/main">
                    <!-- Deco elements -->
                    <div class="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 group-hover/main:bg-sky-500/20"></div>
                    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 group-hover/main:bg-blue-500/20"></div>

                    <div class="flex flex-col xl:flex-row gap-12 relative z-10">
                        <!-- Galería de Imágenes -->
                        <div class="xl:w-1/2 flex flex-col">
                            <div class="relative bg-gradient-to-br from-gray-50 to-gray-200/50 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] p-8 mb-6 h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner group">
                                <!-- Badges y Etiquetas -->
                                <div id="product-badges" class="absolute top-4 left-4 z-20 flex flex-col gap-2"></div>
                                <button onclick="toggleWishlistBtn(this)" class="absolute top-4 right-4 z-20 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 border border-gray-200 dark:border-gray-600">
                                    <i class="fas fa-heart text-xl"></i>
                                </button>
                                <img id="main-product-image" src="" alt="Producto" class="max-w-full max-h-full object-contain cursor-zoom-in transition-all duration-700 ease-out group-hover:scale-110 drop-shadow-2xl z-10">
                            </div>
                            
                            <!-- Miniaturas -->
                            <div id="thumbnail-gallery" class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                <!-- Rellenado dinámicamente -->
                            </div>
                        </div>

                        <!-- Detalles del Producto -->
                        <div class="xl:w-1/2 flex flex-col justify-center">
                            <div class="mb-4">
                                <span id="product-brand-badge" class="inline-block bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-4 border border-sky-200 dark:border-sky-800 shadow-sm">Marca</span>
                                <h1 id="product-title" class="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 leading-tight mb-6 tracking-tight">Cargando Título...</h1>
                            </div>

                            <!-- Rating & Stock Line -->
                            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                                <div class="flex items-center text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-100 dark:border-yellow-800/50">
                                    <i class="fas fa-star mr-1"></i>
                                    <span class="text-gray-700 dark:text-gray-300 font-bold ml-1">4.9 <span class="text-xs text-gray-500 font-normal ml-1">(150 reviews)</span></span>
                                </div>
                                <div class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                                <div class="flex items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                                    <i class="fas fa-check-circle mr-2"></i> Stock Inmediato
                                </div>
                                <div class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                                <div class="flex items-center text-sky-600 dark:text-sky-400 font-bold">
                                    <i class="fas fa-shield-check mr-2"></i> Garantía Premium
                                </div>
                            </div>
                            
                            <!-- Precio Box -->
                            <div class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-3xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                <!-- Deco -->
                                <div class="absolute top-0 right-0 w-32 h-32 bg-[url('Imagenes/Logo_Solo.svg')] bg-no-repeat bg-contain opacity-5 transform translate-x-8 -translate-y-8"></div>
                                
                                <div class="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-3 relative z-10">
                                    <p id="product-price" class="text-5xl lg:text-6xl font-black text-sky-600 dark:text-sky-400 tracking-tighter drop-shadow-sm">S/. 0.00</p>
                                    <div class="flex items-center gap-3">
                                        <p id="product-old-price" class="text-xl lg:text-2xl text-gray-400 dark:text-gray-500 line-through font-medium hidden">S/. 0.00</p>
                                        <span id="product-discount-badge" class="hidden bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-md animate-pulse">-0%</span>
                                    </div>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center relative z-10"><i class="fas fa-file-invoice-dollar text-green-500 mr-2 text-lg"></i> <span class="font-medium">Precio final incluye IGV. Se emite Boleta o Factura.</span></p>
                            </div>

                            <!-- Description -->
                            <div class="mb-10">
                                <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center"><i class="fas fa-align-left text-sky-600 mr-2"></i> Descripción General</h4>
                                <p id="product-description" class="text-gray-600 dark:text-gray-300 text-base leading-relaxed p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800">Cargando descripción...</p>
                            </div>
                            
                            <!-- Features Grid -->
                            <div class="grid grid-cols-2 gap-4 mb-10">
                                <div class="flex flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
                                    <div class="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform"><i class="fas fa-shipping-fast text-lg"></i></div>
                                    <span class="text-gray-800 dark:text-white font-bold text-sm">Delivery Express</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Envíos seguros y rápidos a nivel nacional</span>
                                </div>
                                <div class="flex flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
                                    <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><i class="fas fa-shield-alt text-lg"></i></div>
                                    <span class="text-gray-800 dark:text-white font-bold text-sm">Compra Segura</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Pagos protegidos y confianza total</span>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex flex-col sm:flex-row gap-4 mt-auto">
                                <button id="add-to-cart-big-btn" class="flex-1 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-[#0F766E] hover:to-[#115E59] transition-all duration-300 shadow-lg shadow-[#0D9488]/40 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] border border-transparent overflow-hidden relative group">
                                    <span class="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                                    <i class="fas fa-cart-shopping text-2xl relative z-10 transition-transform group-hover:-rotate-12"></i> 
                                    <span class="relative z-10 tracking-wide">Añadir al Carrito</span>
                                </button>
                                <a id="buy-whatsapp-btn" href="#" target="_blank" class="flex-1 bg-[#25D366] text-white py-5 px-8 rounded-2xl font-bold text-lg hover:bg-[#128C7E] transition-all duration-300 shadow-lg shadow-[#25D366]/40 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] border border-transparent">
                                    <i class="fab fa-whatsapp text-3xl"></i>
                                    <div class="flex flex-col text-left leading-tight">
                                        <span class="text-[10px] uppercase font-bold text-white/80">Atención Personalizada</span>
                                        <span class="tracking-wide">Comprar por WhatsApp</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Especificaciones Técnicas Detalladas Container -->
                <div id="product-specs-container" class="mt-16 hidden">
                    <div class="text-center mb-10">
                        <span class="text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase text-sm">Descubre a fondo</span>
                        <h2 class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-2">Especificaciones Técnicas</h2>
                        <div class="w-20 h-1.5 bg-sky-600 mx-auto mt-6 rounded-full"></div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-6 sm:p-10 lg:p-14 border border-gray-100 dark:border-gray-700">
                        <div id="product-specs-grid" class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                            <!-- Cargado dinámicamente -->
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </main>
    `;

    let newContent = preNav + mainContent + postFooter;

    newContent = newContent.replace('<title>Solbin-X | Venta de Laptops', '<title>Detalles de Producto - Solbin-X');
    newContent = newContent.replace(/<script src="loader.js"[^>]*><\/script>/, '<script src="producto.js"></script>');
    newContent = newContent.replace('href="dist/styles.css"', 'href="dist/styles.css">\n    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.3/dist/sweetalert2.min.css">');

    fs.writeFileSync('c:/Users/jhonn/Desktop/CompuVentas/producto.html', newContent, 'utf8');
    console.log('Successfully created producto.html');
} catch(e) {
    console.error('Error generating file: ', e);
}
