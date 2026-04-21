import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('next/')) {
    // 1. Link replacement
    content = content.replace(/import Link from ["']next\/link["'];?/g, "import { Link } from 'wouter';");
    
    // 2. Navigation replacement
    content = content.replace(/import \{([^}]+)\} from ["']next\/navigation["'];?/g, (match, imports) => {
        let newImports = imports.replace(/useRouter/g, 'useLocation').replace(/usePathname/g, 'useLocation').split(',').map(i=>i.trim());
        // Deduplicate
        newImports = [...new Set(newImports)];
        return `import { ${newImports.join(', ')} } from 'wouter';`;
    });

    // 3. Image replacement
    content = content.replace(/import Image from ["']next\/image["'];?/g, "");
    content = content.replace(/<Image([^>]+)>/g, "<img$1>");
    
    // 4. Server Route / Auth replacement
    if (content.includes('next/server')) {
        content = content.replace(/import \{ NextResponse \} from ['"]next\/server['"];?/g, "");
    }
    
    changed = true;
  }
  
  // Custom replacements for router patterns
  if (content.includes('const router = useRouter()') || content.includes('const router=useRouter()')) {
      content = content.replace(/const\s+router\s*=\s*useRouter\(\)/g, "const [, setLocation] = useLocation()");
      content = content.replace(/router\.push/g, "setLocation");
      changed = true;
  }
  
  // Custom replacement for usePathname pattern
  if (content.includes('usePathname()')) {
      content = content.replace(/const\s+pathname\s*=\s*usePathname\(\)/g, "const [pathname] = useLocation()");
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Refactored:', file);
  }
}
console.log('Refactoring complete!');
