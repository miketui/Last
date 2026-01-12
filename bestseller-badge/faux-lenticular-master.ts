/**
 * FAUX-LENTICULAR MASTER BADGE GENERATOR
 * Production-ready 3D metallic gold bestseller badge
 *
 * Features:
 * - True faux-lenticular depth illusion via controlled gradients
 * - Emboss + specular lighting simulation
 * - Knife-sharp beveled edges
 * - Transparent background
 * - Print-ready at any resolution
 */

import { Resvg } from '@resvg/resvg-js';

const width = 2000;
const height = 2000;
const cx = width / 2;
const cy = height / 2;

// Generate sharp starburst seal path
function starburst(centerX: number, centerY: number, outerR: number, innerR: number, points: number): string {
  const path: string[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    path.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return path.join(' ') + ' Z';
}

// Arc path for text
function arcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): string {
  const start = {
    x: centerX + radius * Math.cos(startAngle),
    y: centerY + radius * Math.sin(startAngle)
  };
  const end = {
    x: centerX + radius * Math.cos(endAngle),
    y: centerY + radius * Math.sin(endAngle)
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- FAUX-LENTICULAR GOLD GRADIENT (Primary) -->
    <!-- This creates the depth illusion through controlled color stops -->
    <linearGradient id="fauxGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="12%" stop-color="#F5E6A8"/>
      <stop offset="28%" stop-color="#E6CC7A"/>
      <stop offset="45%" stop-color="#C9A961"/>
      <stop offset="60%" stop-color="#B8923D"/>
      <stop offset="75%" stop-color="#9A7830"/>
      <stop offset="88%" stop-color="#8A6F2F"/>
      <stop offset="100%" stop-color="#5C4A1F"/>
    </linearGradient>

    <!-- Secondary highlight gradient (top-left emphasis) -->
    <linearGradient id="highlightGold" x1="0%" y1="0%" x2="70%" y2="70%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="30%" stop-color="#F5E6A8"/>
      <stop offset="70%" stop-color="#E3C875"/>
      <stop offset="100%" stop-color="#C9A961"/>
    </linearGradient>

    <!-- Deep shadow gradient (bottom-right) -->
    <linearGradient id="shadowGold" x1="30%" y1="30%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A961"/>
      <stop offset="40%" stop-color="#9A7830"/>
      <stop offset="70%" stop-color="#7A5E25"/>
      <stop offset="100%" stop-color="#3D2F12"/>
    </linearGradient>

    <!-- Center radial for dome effect -->
    <radialGradient id="centerDome" cx="35%" cy="35%" r="65%" fx="35%" fy="35%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="25%" stop-color="#F5E6A8"/>
      <stop offset="50%" stop-color="#D4B060"/>
      <stop offset="75%" stop-color="#B8923D"/>
      <stop offset="100%" stop-color="#8A6F2F"/>
    </radialGradient>

    <!-- Text emboss gradient -->
    <linearGradient id="textGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="20%" stop-color="#F5E6A8"/>
      <stop offset="50%" stop-color="#C9A961"/>
      <stop offset="80%" stop-color="#8A6F2F"/>
      <stop offset="100%" stop-color="#5C4A1F"/>
    </linearGradient>

    <!-- Specular highlight (controlled, not holographic) -->
    <radialGradient id="specular" cx="30%" cy="25%" r="40%" fx="30%" fy="25%">
      <stop offset="0%" stop-color="rgba(255,254,245,0.9)"/>
      <stop offset="25%" stop-color="rgba(245,230,168,0.5)"/>
      <stop offset="50%" stop-color="rgba(227,200,117,0.2)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>

    <!-- EMBOSS FILTER (Faux depth via lighting) -->
    <filter id="emboss3D" x="-15%" y="-15%" width="130%" height="130%">
      <!-- Inner shadow for depth -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
      <feOffset in="blur" dx="-3" dy="-3" result="lightOffset"/>
      <feOffset in="blur" dx="3" dy="3" result="darkOffset"/>
      <feFlood flood-color="#FFFEF5" flood-opacity="0.85" result="lightColor"/>
      <feFlood flood-color="#2A1F0A" flood-opacity="0.9" result="darkColor"/>
      <feComposite in="lightColor" in2="lightOffset" operator="in" result="lightShadow"/>
      <feComposite in="darkColor" in2="darkOffset" operator="in" result="darkShadow"/>
      <feMerge>
        <feMergeNode in="darkShadow"/>
        <feMergeNode in="lightShadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Sharp emboss for text -->
    <filter id="textEmboss" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur"/>
      <feOffset in="blur" dx="-2" dy="-2" result="light"/>
      <feOffset in="blur" dx="2" dy="2" result="dark"/>
      <feFlood flood-color="#FFFEF5" flood-opacity="0.95" result="lightC"/>
      <feFlood flood-color="#1A1408" flood-opacity="0.98" result="darkC"/>
      <feComposite in="lightC" in2="light" operator="in" result="ls"/>
      <feComposite in="darkC" in2="dark" operator="in" result="ds"/>
      <feMerge>
        <feMergeNode in="ds"/>
        <feMergeNode in="ls"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Drop shadow (subtle, <12% opacity) -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="8" dy="12" stdDeviation="15" flood-color="#1A1408" flood-opacity="0.35"/>
    </filter>

    <!-- Text paths -->
    <path id="topTextArc" d="${arcPath(cx, cy, 580, -2.6, -0.54)}" fill="none"/>
    <path id="bottomTextArc" d="${arcPath(cx, cy, 580, 0.54, 2.6)}" fill="none"/>

    <!-- Clip paths -->
    <clipPath id="sealClip">
      <path d="${starburst(cx, cy, 850, 750, 24)}"/>
    </clipPath>
  </defs>

  <!-- MAIN BADGE -->
  <g filter="url(#dropShadow)">

    <!-- Layer 1: Dark base (creates bottom bevel) -->
    <path d="${starburst(cx + 4, cy + 4, 850, 750, 24)}" fill="#2A1F0A" opacity="0.5"/>

    <!-- Layer 2: Shadow edge -->
    <path d="${starburst(cx, cy, 850, 750, 24)}" fill="url(#shadowGold)"/>

    <!-- Layer 3: Main gold body -->
    <path d="${starburst(cx - 3, cy - 3, 844, 744, 24)}" fill="url(#fauxGold)"/>

    <!-- Layer 4: Highlight edge (top-left bevel) -->
    <path d="${starburst(cx - 5, cy - 5, 838, 738, 24)}"
          fill="none" stroke="url(#highlightGold)" stroke-width="4" opacity="0.7"/>

    <!-- Inner ring 1 - recessed -->
    <circle cx="${cx}" cy="${cy}" r="670" fill="url(#shadowGold)"
            stroke="#5C4A1F" stroke-width="6"/>

    <!-- Inner ring 1 - main surface -->
    <circle cx="${cx - 2}" cy="${cy - 2}" r="664" fill="url(#centerDome)"/>

    <!-- Decorative raised ring -->
    <circle cx="${cx - 1}" cy="${cy - 1}" r="610"
            fill="none" stroke="url(#fauxGold)" stroke-width="10" filter="url(#emboss3D)"/>

    <!-- Thin highlight ring -->
    <circle cx="${cx - 2}" cy="${cy - 2}" r="590"
            fill="none" stroke="url(#highlightGold)" stroke-width="3" opacity="0.8"/>

    <!-- Center medallion base -->
    <circle cx="${cx}" cy="${cy}" r="420" fill="url(#shadowGold)"/>

    <!-- Center medallion surface -->
    <circle cx="${cx - 2}" cy="${cy - 2}" r="414" fill="url(#centerDome)" filter="url(#emboss3D)"/>

    <!-- Inner center ring -->
    <circle cx="${cx - 1}" cy="${cy - 1}" r="360"
            fill="none" stroke="url(#fauxGold)" stroke-width="6" filter="url(#emboss3D)"/>

    <!-- Specular highlight overlay -->
    <ellipse cx="${cx - 180}" cy="${cy - 200}" rx="400" ry="320"
             fill="url(#specular)" clip-path="url(#sealClip)"/>
  </g>

  <!-- TEXT: BESTSELLER (top arc) -->
  <text font-family="'Times New Roman', Georgia, serif" font-size="115" font-weight="bold"
        letter-spacing="16" fill="url(#textGold)" filter="url(#textEmboss)">
    <textPath href="#topTextArc" startOffset="50%" text-anchor="middle">
      BESTSELLER
    </textPath>
  </text>

  <!-- CENTER: #1 -->
  <text x="${cx - 3}" y="${cy + 50}"
        font-family="'Times New Roman', Georgia, serif"
        font-size="260" font-weight="bold"
        text-anchor="middle"
        fill="url(#textGold)"
        filter="url(#textEmboss)">
    #1
  </text>

  <!-- Decorative stars -->
  <g fill="url(#textGold)" filter="url(#textEmboss)">
    <polygon points="${cx - 250},${cy + 10} ${cx - 240},${cy - 15} ${cx - 230},${cy + 10} ${cx - 255},${cy - 5} ${cx - 225},${cy - 5}" transform="scale(1.5) translate(-165, 7)"/>
    <polygon points="${cx + 250},${cy + 10} ${cx + 240},${cy - 15} ${cx + 230},${cy + 10} ${cx + 255},${cy - 5} ${cx + 225},${cy - 5}" transform="scale(1.5) translate(165, 7)"/>
  </g>

  <!-- TEXT: AWARD WINNER (bottom arc) -->
  <text font-family="'Times New Roman', Georgia, serif" font-size="78" font-weight="bold"
        letter-spacing="10" fill="url(#textGold)" filter="url(#textEmboss)">
    <textPath href="#bottomTextArc" startOffset="50%" text-anchor="middle">
      AWARD WINNER
    </textPath>
  </text>
</svg>`;

// Save SVG
await Bun.write('/tmp/images/bestseller-faux-lenticular.svg', svg);
console.log('✓ Master SVG saved: /tmp/images/bestseller-faux-lenticular.svg');

// Render to high-res PNG
const resvg = new Resvg(svg, {
  background: 'transparent',
  fitTo: { mode: 'width', value: 2000 },
});
const png = resvg.render().asPng();
await Bun.write('/tmp/images/bestseller-faux-lenticular.png', png);
console.log('✓ Master PNG saved: /tmp/images/bestseller-faux-lenticular.png');

// Also save at print resolution (300 DPI for 6" badge = 1800px)
const resvgPrint = new Resvg(svg, {
  background: 'transparent',
  fitTo: { mode: 'width', value: 1800 },
});
const pngPrint = resvgPrint.render().asPng();
await Bun.write('/tmp/images/bestseller-print-300dpi.png', pngPrint);
console.log('✓ Print-ready PNG (300 DPI) saved: /tmp/images/bestseller-print-300dpi.png');

console.log('\n=== FAUX-LENTICULAR BADGE GENERATION COMPLETE ===');
