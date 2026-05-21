const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/server/api');
const destDir = path.join(__dirname, 'app/api');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Keep track of routes and their methods
// Key: relative Next.js API route directory path (e.g. "admin/domains/[id]")
// Value: Set of methods (e.g., ["PUT", "DELETE"])
const routesMap = new Map();

function transpileFile(filePath, relativePath, fileName) {
  const method = fileName.replace(/\.ts$/, ''); // e.g. "GET", "POST", "PUT", "DELETE"
  
  // Map folder segment "id" to "[id]"
  const parts = relativePath.split(path.sep).map(part => part === 'id' ? '[id]' : part);
  const nextRelativePath = parts.join(path.sep);
  const targetDir = path.join(destDir, nextRelativePath);
  
  ensureDir(targetDir);
  
  // Read and transform content
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update relative imports to path aliases
  // Replace relative imports to db client
  content = content.replace(/(from\s+['"])([^'"]*?\/db\/client)(['"])/g, "$1@/lib/db/client$3");
  // Replace relative imports to auth utils
  content = content.replace(/(from\s+['"])([^'"]*?\/utils\/auth)(['"])/g, "$1@/lib/utils/auth$3");
  
  const handlerFileName = `${method}_handler.ts`;
  fs.writeFileSync(path.join(targetDir, handlerFileName), content, 'utf-8');
  console.log(`Transpiled Handler: ${relativePath}/${fileName} -> ${nextRelativePath}/${handlerFileName}`);
  
  if (!routesMap.has(nextRelativePath)) {
    routesMap.set(nextRelativePath, new Set());
  }
  routesMap.get(nextRelativePath).add(method);
}

function walk(currentDir, relativePath = '') {
  const files = fs.readdirSync(currentDir);
  files.forEach(file => {
    const filePath = path.join(currentDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walk(filePath, path.join(relativePath, file));
    } else if (file.endsWith('.ts') && ['GET', 'POST', 'PUT', 'DELETE'].includes(file.replace(/\.ts$/, ''))) {
      transpileFile(filePath, relativePath, file);
    }
  });
}

ensureDir(destDir);

// 1. Walk and transpile individual method handlers
walk(srcDir);

// 2. Generate route.ts for each unique API route directory
for (const [routePath, methods] of routesMap.entries()) {
  const targetDir = path.join(destDir, routePath);
  let routeContent = `import { handleRoute } from '@/lib/utils/api-adapter';\n`;
  
  methods.forEach(method => {
    routeContent += `import ${method}_handler from './${method}_handler';\n`;
  });
  
  routeContent += `\n`;
  
  methods.forEach(method => {
    routeContent += `export const ${method} = handleRoute(${method}_handler);\n`;
  });
  
  fs.writeFileSync(path.join(targetDir, 'route.ts'), routeContent, 'utf-8');
  console.log(`Generated Route: app/api/${routePath}/route.ts`);
}

console.log('Server APIs migration completed successfully.');
