const fs = require('fs');

let content = fs.readFileSync('c:/Users/jhonn/Desktop/CompuVentas/loader.js', 'utf8');

const regex = /\/\/ --- MODAL LOGIC[\s\S]*?window\.closeProductModal\s*=\s*function\s*\(\)\s*\{[\s\S]*?\};\n/m;

if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync('c:/Users/jhonn/Desktop/CompuVentas/loader.js', content, 'utf8');
    console.log('Removed modal logic from loader.js');
} else {
    console.log('Modal logic block not found in loader.js');
}
