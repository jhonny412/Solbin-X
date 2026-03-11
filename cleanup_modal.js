const fs = require('fs');

let content = fs.readFileSync('c:/Users/jhonn/Desktop/CompuVentas/index.html', 'utf8');

const startModal = content.indexOf('<!-- Product Details Modal -->');
const modalEndTag = '</div>\n        </div>';

if (startModal !== -1) {
    const afterModal = content.indexOf('<!-- JavaScript', startModal);
    if(afterModal !== -1) {
       content = content.substring(0, startModal) + "\n        " + content.substring(afterModal);
    }
}

const oldStr = `// Redirigir a producto o abrir modal
                        if (typeof openProductModal === 'function') {
                            openProductModal(product);
                        }`;
const newStr = `// Redirigir a producto
                        window.location.href = \`producto.html?id=\${product.id}\`;`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('c:/Users/jhonn/Desktop/CompuVentas/index.html', content, 'utf8');
console.log('Removed modal correctly for index.html');
