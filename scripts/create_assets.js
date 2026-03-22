const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgU0c9qAAAAAASUVORK5CYII=', 'base64');
fs.writeFileSync(path.join(dir, 'icon.png'), png);
fs.writeFileSync(path.join(dir, 'splash.png'), png);
console.log('created', path.join(dir, 'icon.png'), path.join(dir, 'splash.png'));
