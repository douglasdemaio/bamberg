import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const dist = new URL('../dist/', import.meta.url).pathname;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const assets = walk(dist).map(f => '/' + relative(dist, f));
const preload = assets.filter(f =>
  f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.json')
);

// Update sw.js with precache manifest
const swPath = join(dist, 'sw.js');
let sw = readFileSync(swPath, 'utf-8');
sw = sw.replace('self.__PRECACHE || []', JSON.stringify(preload));
writeFileSync(swPath, sw);

// Inject registration into every HTML page
const htmlFiles = assets.filter(f => f.endsWith('.html'));
for (const html of htmlFiles) {
  const path = join(dist, html.replace(/^\//, ''));
  let content = readFileSync(path, 'utf-8');
  const script = '<script>if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js",{scope:"/"})})}</script>';
  if (!content.includes('serviceWorker.register')) {
    content = content.replace('</body>', script + '</body>');
    writeFileSync(path, content);
  }
}

console.log(`SW generated: ${swPath} (${preload.length} assets)`);
console.log(`Registration injected into ${htmlFiles.length} pages`);
