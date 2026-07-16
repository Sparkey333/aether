// Converts the ES-module three.js build into a classic-script build that
// assigns `window.THREE = {...}` instead of using `export`. Used only to
// produce the Artifact test-canvas bundle (Artifacts can't fetch external
// scripts, so Three.js has to be inlined as plain, non-module JS).
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../node_modules/three/build/three.module.min.js', import.meta.url), 'utf8');

const start = src.lastIndexOf('export{');
const end = src.lastIndexOf('};');
if (start === -1 || end === -1 || end < start) {
  throw new Error('Could not locate the trailing export{...}; clause — three.js build format changed.');
}

const body = src.slice(0, start);
const clause = src.slice(start + 'export{'.length, end); // "a as B,c,d as E,..."

const entries = clause.split(',').map((raw) => {
  const part = raw.trim();
  const asMatch = part.match(/^(\S+)\s+as\s+(\S+)$/);
  return asMatch ? `${asMatch[2]}:${asMatch[1]}` : `${part}:${part}`;
});

const output = `${body}\nwindow.THREE={${entries.join(',')}};\n`;
writeFileSync(new URL('../node_modules/.three-inline.js', import.meta.url), output);
console.log(`three.js inlined as a classic script: ${(output.length / 1024).toFixed(0)} KB, ${entries.length} exports.`);
