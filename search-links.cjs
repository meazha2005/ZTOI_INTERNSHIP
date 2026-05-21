const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(__dirname);
console.log(`Found ${files.length} TSX files. Scanning for 'to=' inside Link...`);

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('to=')) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('to=')) {
        console.log(`${path.relative(__dirname, file)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
});
