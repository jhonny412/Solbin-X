const fs = require('fs');
const file = 'c:/Users/jhonn/Desktop/CompuVentas/index.html';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã ': 'Á',
    'Ã‰': 'É',
    'Ã ': 'Í',
    'Ã“': 'Ó',
    'Ãš': 'Ú',
    'Ã‘': 'Ñ',
    'Â¡': '¡',
    'Â¿': '¿'
};

let modified = false;
for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
        content = content.split(bad).join(good);
        modified = true;
    }
}

if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed strange characters in index.html');
} else {
    console.log('No strange characters found to fix');
}
