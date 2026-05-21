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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(__dirname);
console.log(`Scanning and cleaning ${files.length} files...`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // 1. Convert react-router-dom imports
  if (content.includes('react-router-dom')) {
    content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]react-router-dom['"]/g, (match, importsStr) => {
      const imports = importsStr.split(',').map(s => s.trim());
      const nextImports = [];
      let hasLink = false;

      if (imports.includes('Link')) {
        hasLink = true;
      }

      const navigationHooks = ['useNavigate', 'useSearchParams', 'useLocation', 'useParams'];
      const usedHooks = imports.filter(imp => navigationHooks.includes(imp));

      let replacement = '';
      if (hasLink) {
        replacement += `import Link from 'next/link';\n`;
      }

      if (usedHooks.length > 0) {
        const nextHooks = [];
        usedHooks.forEach(hook => {
          if (hook === 'useNavigate') nextHooks.push('useRouter');
          if (hook === 'useSearchParams') nextHooks.push('useSearchParams');
          if (hook === 'useLocation') nextHooks.push('usePathname');
          if (hook === 'useParams') nextHooks.push('useParams');
        });
        replacement += `import { ${nextHooks.join(', ')} } from 'next/navigation';\n`;
      }

      return replacement.trim();
    });
    
    // Add "use client" if it has hooks
    if ((content.includes('useRouter') || content.includes('usePathname') || content.includes('useSearchParams') || content.includes('useParams')) && !content.includes('"use client"') && !content.includes("'use client'")) {
      content = `"use client";\n\n` + content;
    }
  }

  // 2. Replace useNavigate with useRouter
  content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\s*\)/g, 'const router = useRouter()');
  content = content.replace(/navigate\(([^,)]+)\)/g, 'router.push($1)');
  content = content.replace(/navigate\(([^,]+),\s*\{\s*replace:\s*true\s*\}\)/g, 'router.replace($1)');

  // 3. Replace useLocation with usePathname
  content = content.replace(/const\s+location\s*=\s*useLocation\(\s*\)/g, 'const pathname = usePathname()');
  content = content.replace(/location\.pathname/g, 'pathname');

  // 4. Replace searchParams hook destructuring
  content = content.replace(/const\s+\[\s*searchParams\s*\]\s*=\s*useSearchParams\(\)/g, 'const searchParams = useSearchParams()');

  // 5. Replace to= prop with href=
  content = content.replace(/\bto=/g, 'href=');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Cleaned react-router remnants in: ${path.relative(__dirname, file)}`);
  }
});

console.log('React Router cleanup completed successfully.');
