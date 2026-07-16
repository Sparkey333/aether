// Produces a single self-contained HTML file playable with no server and no
// build step — the whole game (three.js + game code + styled HUD) inlined
// into one <title>/<style>/<body> fragment. Used to publish the Claude
// Artifact test canvas and to hand the prototype to anyone as one file.
//
// Run: node scripts/build-artifact.mjs [output-path]  (defaults to dist-artifact/hollowmark.html)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const inlineThreePath = path.join(root, 'node_modules/.three-inline.js');

if (!existsSync(inlineThreePath))
  execFileSync(process.execPath, [path.join(root, 'scripts/inline-three.mjs')], { stdio: 'inherit' });

const threeSrc = readFileSync(inlineThreePath, 'utf8');

const mainSrc = readFileSync(path.join(root, 'src/main.js'), 'utf8')
  .split('\n')
  .filter((line) => line.trim() !== "import * as THREE from 'three';")
  .join('\n');
// Three.js's de-moduled internals declare top-level single-letter const/let
// bindings (e.g. `$`, `P`) that now share the page's global lexical scope —
// an IIFE keeps the game's own top-level declarations from colliding with them.
const gameSrc = `(function(){\n'use strict';\n${mainSrc}\n})();\n`;

const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const styleBlock = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));
const bodyBlock = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script'));

const out = `<title>HOLLOWMARK — Test Canvas</title>\n<style>\n${styleBlock}\n</style>\n${bodyBlock}\n` +
  `<script>\n${threeSrc}\n</script>\n<script>\n${gameSrc}\n</script>\n`;

const outPath = process.argv[2] || path.join(root, 'dist-artifact/hollowmark.html');
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, out);
console.log(`Built ${outPath} (${(out.length / 1024).toFixed(0)} KB) — open it directly in a browser, no server needed.`);
