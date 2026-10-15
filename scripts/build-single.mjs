// Build satu file HTML mandiri (offline, bisa dibuka dengan klik dua kali).
// Pemakaian: node scripts/build-single.mjs [esbuildPath]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let esbuild;
try { esbuild = require('esbuild'); } catch { esbuild = require(process.argv[2] || '/opt/npm-tools/node_modules/esbuild'); }
const out = path.join(root, 'dist-single');
mkdirSync(out, { recursive: true });
const r = await esbuild.build({
  entryPoints: [path.join(root, 'src/main.js')], bundle: true, minify: true, format: 'iife', target: 'es2020',
  outdir: out, write: false, loader: { '.css': 'css' }, legalComments: 'none', logLevel: 'warning',
  nodePaths: [path.join(root, 'node_modules')],
});
let js = '', css = '';
for (const f of r.outputFiles) { if (f.path.endsWith('.js')) js = f.text; else if (f.path.endsWith('.css')) css = f.text; }
let html = readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<!-- @@STYLE@@ -->', `<style>\n${css}</style>`);
html = html.replace(/<script type="module" src="\/src\/main.js"><\/script>/, () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}</script>`);
writeFileSync(path.join(out, 'index.html'), html);
console.log('OK', (html.length / 1024).toFixed(0) + ' KB →', path.join(out, 'index.html'));
