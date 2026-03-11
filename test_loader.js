const fs = require('fs');
let code = fs.readFileSync('c:/Users/jhonn/Desktop/CompuVentas/loader.js', 'utf8');

// Mock browser objects
global.window = {
    filterBrand: () => {}, filterSpec: () => {}, filterPrice: () => {},
    filterPriceRange: () => {}, filterSort: () => {}, resetCatalogFilters: () => {},
    switchProductTab: () => {}, switchMainTab: () => {}, closeProductModal: () => {},
    supabaseClient: {
        from: () => ({
            select: () => ({
                order: () => ({
                    order: async () => ({
                        data: [
                            { name: 'Laptop ASUS ROG', description: 'Intel Core i7 16gb ram 1tb', category: 'laptops', price: 5000 },
                            { name: 'Mouse Logitech', description: null, category: 'accesorios', price: 200 }
                        ],
                        error: null
                    })
                })
            })
        })
    }
};
global.document = {
    getElementById: () => ({ innerHTML: '', update: () => {}, querySelectorAll: () => [], classList: { remove: () => {}, add: () => {} }, value: 'default', textContent: '' }),
    querySelectorAll: () => []
};
global.Image = class { constructor() {} }; 
global.HTMLElement = class {};

setTimeout(async () => {
    try {
        eval(code);    // evaluates loader.js
        console.log('Loader evaluated successfully');
        
        await loadAndRenderProducts(); // Should run applyFilters
        console.log('Filtered length:', catalogState.filteredProducts.length);
    } catch (e) {
        console.log('ERROR:', e.message);
        console.log(e.stack);
    }
}, 100);
