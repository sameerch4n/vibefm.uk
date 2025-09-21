#!/usr/bin/env node
// Tiny build: copy ESM to dist index.js and also emit CJS index.cjs by trivial transform
// Avoid bundlers to keep this lightweight.

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

function copyFile(file) {
  const src = path.join(srcDir, file);
  const dest = path.join(distDir, file);
  fs.copyFileSync(src, dest);
}

// Copy ESM files 1:1
const files = ['index.js', 'itunes.js', 'spotify.js', 'youtube.js'];
for (const f of files) copyFile(f);

// Write types passthrough if present
const typesSrc = path.join(srcDir, 'types.d.ts');
if (fs.existsSync(typesSrc)) {
  fs.copyFileSync(typesSrc, path.join(distDir, 'types.d.ts'));
}

// Create CommonJS facade index.cjs that re-exports ESM via dynamic import for Node>=18
const cjs = `
'use strict';
module.exports = (function(){
  const m = {};
  const load = async () => await import('./index.js');
  const names = ['searchSongs','getTrackDetails','findOnYouTube','playTrack','debouncePromise','createDebouncedSearchSongs','searchTrack'];
  for (const n of names) {
    Object.defineProperty(m, n, { enumerable: true, get(){ throw new Error('Use ESM import or call require("music-search-playback").load()'); } });
  }
  m.load = load;
  return m;
})();
`;
fs.writeFileSync(path.join(distDir, 'index.cjs'), cjs);

console.log('Built to dist/');
