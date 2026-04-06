const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirToRefactor = 'c:\\Users\\lucassouza\\Documents\\sistema construtora\\constructora-repo\\frontend\\src';

walk(dirToRefactor, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // First handle exact standalone strings 'http://localhost:3000'
    content = content.replace(/'http:\/\/localhost:3000'/g, "import.meta.env.VITE_API_URL");
    
    // Then handle single quoted strings that start with 'http://localhost:3000/...' converting them to `...`
    content = content.replace(/'http:\/\/localhost:3000([^']+)'/g, "`\\${import.meta.env.VITE_API_URL}$1`");

    // Finally handle occurrences inside backticks or other double quotes.
    // Example: `http://localhost:3000/api/${id}` -> `${import.meta.env.VITE_API_URL}/api/${id}`
    // Or inside JSX: href={`http://localhost:3000${url}`} -> href={`${import.meta.env.VITE_API_URL}${url}`}
    content = content.replace(/http:\/\/localhost:3000/g, "${import.meta.env.VITE_API_URL}");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
