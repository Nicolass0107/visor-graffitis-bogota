// Genera las fotos de grafiti de ejemplo (SVG) en public/graffitis/.
// Uso: node scripts/generate-placeholder-photos.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'graffitis');
mkdirSync(outDir, { recursive: true });

const photos = [
  { file: 'grafiti-01.svg', wall: '#8d99ae', ink: '#ef233c', accent: '#ffb703', label: 'CANDELARIA', tag: 'SUR' },
  { file: 'grafiti-02.svg', wall: '#a7c4a0', ink: '#d90429', accent: '#0077b6', label: 'CHAPINERO', tag: 'ROKA' },
  { file: 'grafiti-03.svg', wall: '#b8b8d1', ink: '#ff6d00', accent: '#3a0ca3', label: 'TEUSAQUILLO', tag: '24' },
  { file: 'grafiti-04.svg', wall: '#d9c5b2', ink: '#00b4d8', accent: '#e63946', label: 'USAQUEN', tag: 'NORTE' },
  { file: 'grafiti-05.svg', wall: '#7f8fa6', ink: '#ffd166', accent: '#ef476f', label: 'SANTA FE', tag: 'RITMO' },
  { file: 'grafiti-06.svg', wall: '#c9ada7', ink: '#2a9d8f', accent: '#264653', label: 'BARRIOS UNIDOS', tag: 'TALLER' },
  { file: 'grafiti-07.svg', wall: '#98c1d9', ink: '#e63946', accent: '#ffb703', label: 'KENNEDY', tag: 'VILLA' },
  { file: 'grafiti-08.svg', wall: '#adb5bd', ink: '#80ed99', accent: '#0077b6', label: 'SUBA', tag: 'CERROS' },
  { file: 'grafiti-09.svg', wall: '#b08968', ink: '#e9ecef', accent: '#d00000', label: 'PUENTE ARANDA', tag: 'INDUSTRIA' },
  { file: 'grafiti-10.svg', wall: '#6d9dc5', ink: '#ffba08', accent: '#370617', label: 'FONTIBON', tag: 'AVIACION' },
];

const svg = ({ file, wall, ink, accent, label, tag }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="Grafiti de ejemplo en ${label}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8f9fa"/>
      <stop offset="100%" stop-color="#dee2e6"/>
    </linearGradient>
    <pattern id="bricks" width="80" height="40" patternUnits="userSpaceOnUse">
      <rect width="80" height="40" fill="${wall}"/>
      <rect x="0" y="0" width="78" height="18" fill="rgba(255,255,255,0.10)"/>
      <rect x="40" y="20" width="38" height="18" fill="rgba(0,0,0,0.08)"/>
      <rect x="0" y="19" width="80" height="2" fill="rgba(0,0,0,0.18)"/>
      <rect x="39" y="0" width="2" height="40" fill="rgba(0,0,0,0.12)"/>
    </pattern>
    <g id="splash">
      <circle cx="0" cy="0" r="26" fill="${accent}" opacity="0.85"/>
      <circle cx="34" cy="14" r="9" fill="${accent}" opacity="0.7"/>
      <circle cx="-30" cy="-16" r="6" fill="${accent}" opacity="0.7"/>
    </g>
  </defs>
  <rect width="800" height="600" fill="url(#sky)"/>
  <rect y="70" width="800" height="530" fill="url(#bricks)"/>
  <rect y="560" width="800" height="40" fill="#495057"/>
  <use href="#splash" x="120" y="160"/>
  <use href="#splash" x="660" y="470"/>
  <g transform="rotate(-6 400 320)">
    <text x="400" y="330" text-anchor="middle"
      font-family="Arial Black, Impact, sans-serif" font-size="120" font-weight="900"
      fill="${ink}" stroke="#212529" stroke-width="10" paint-order="stroke"
      style="letter-spacing: 6px">${label}</text>
  </g>
  <g transform="rotate(4 400 430)">
    <text x="400" y="440" text-anchor="middle"
      font-family="Arial Black, Impact, sans-serif" font-size="64" font-weight="900"
      fill="${accent}" stroke="#212529" stroke-width="7" paint-order="stroke"
      style="letter-spacing: 10px">${tag}</text>
  </g>
  <text x="770" y="580" text-anchor="end" font-family="monospace" font-size="18" fill="#adb5bd">${file}</text>
</svg>
`;

for (const photo of photos) {
  writeFileSync(join(outDir, photo.file), svg(photo), 'utf8');
}
console.log(`Generadas ${photos.length} fotos en ${outDir}`);
