const fs = require('node:fs');
fs.mkdirSync('gen/srv/app', { recursive: true });
for (const name of ['index.html', 'style.css', 'app.js']) {
  fs.copyFileSync(`app/${name}`, `gen/srv/app/${name}`);
}
console.log('Browser interface copied to the production server.');
