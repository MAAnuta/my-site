const fs = require('fs');

// Читаем файл
let content = fs.readFileSync('js/levelManager.js', 'utf8');

// Удаляем все строки с console.log, console.warn, console.error
content = content.split('\n')
  .filter(line => !line.trim().match(/^(\s*)console\.(log|warn|error)\(/))
  .join('\n');

// Удаляем пустые строки после удаления console
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Записываем обратно
fs.writeFileSync('js/levelManager.js', content);

console.log('Console statements removed');


