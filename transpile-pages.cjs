const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/pages');
const destDir = path.join(__dirname, 'app');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function processFile(filePath, destPath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add "use client" at the top if it doesn't have it
  if (!content.includes('"use client"') && !content.includes("'use client'")) {
    content = `"use client";\n\n` + content;
  }

  // Handle react-router-dom imports
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

  // Replace useNavigate with useRouter
  content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\s*\)/g, 'const router = useRouter()');
  
  // Replace navigate('/path') with router.push('/path')
  content = content.replace(/navigate\(([^,)]+)\)/g, 'router.push($1)');
  
  // Replace navigate('/path', { replace: true }) with router.replace('/path')
  content = content.replace(/navigate\(([^,]+),\s*\{\s*replace:\s*true\s*\}\)/g, 'router.replace($1)');

  // Replace react-router-dom's array destructuring for searchParams
  content = content.replace(/const\s+\[\s*searchParams\s*\]\s*=\s*useSearchParams\(\)/g, 'const searchParams = useSearchParams()');

  // Specific custom fixes for pending verify email flow state passing (using sessionStorage)
  content = content.replace(/navigate\(['"]\/verify-email['"]\s*,\s*\{\s*state:\s*\{\s*email:\s*result\.email\s*,\s*password\s*\}\s*\}\)/g, 
    `{ if (typeof window !== 'undefined') { sessionStorage.setItem('verify_email', result.email || email); sessionStorage.setItem('verify_password', password); } router.push('/verify-email'); }`);
  
  content = content.replace(/navigate\(['"]\/verify-email['"]\s*,\s*\{\s*state:\s*\{\s*email:\s*form\.email\s*,\s*password:\s*form\.password\s*\}\s*\}\)/g, 
    `{ if (typeof window !== 'undefined') { sessionStorage.setItem('verify_email', form.email); sessionStorage.setItem('verify_password', form.password); } router.push('/verify-email'); }`);

  // Specific fix for location.state usage in verify-email
  if (filePath.endsWith('verify-email.tsx')) {
    content = content.replace(
      /const\s+\[\s*currentEmail\s*,\s*setCurrentEmail\s*\]\s*=\s*useState\(\s*location\.state\?\.email\s*\|\|\s*['"]{2}\s*\)/g,
      `const [currentEmail, setCurrentEmail] = useState('');\n  const [password, setPassword] = useState('');\n  \n  useEffect(() => {\n    if (typeof window !== 'undefined') {\n      const storedEmail = sessionStorage.getItem('verify_email');\n      const storedPassword = sessionStorage.getItem('verify_password');\n      if (storedEmail) setCurrentEmail(storedEmail);\n      if (storedPassword) setPassword(storedPassword);\n    }\n  }, [])`
    );
    content = content.replace(/location\.state\?\.password/g, 'password');
  }

  // Ensure directories exist
  const dir = path.dirname(destPath);
  ensureDir(dir);

  fs.writeFileSync(destPath, content, 'utf-8');
  console.log(`Transpiled: ${path.relative(__dirname, filePath)} -> ${path.relative(__dirname, destPath)}`);
}

function walk(currentDir, relativePath = '') {
  const files = fs.readdirSync(currentDir);
  files.forEach(file => {
    const filePath = path.join(currentDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walk(filePath, path.join(relativePath, file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let destFile = file;
      let folderName = '';

      if (file === 'index.tsx') {
        destFile = 'page.tsx';
      } else if (file === '_404.tsx') {
        destFile = 'not-found.tsx';
      } else {
        folderName = file.replace(/\.tsx?$/, '');
        destFile = 'page.tsx';
      }

      const destPath = path.join(destDir, relativePath, folderName, destFile);
      processFile(filePath, destPath);
    }
  });
}

ensureDir(destDir);
walk(srcDir);
console.log('Client pages migration completed successfully.');
