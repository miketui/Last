/**
 * LIGHTING VARIANTS GENERATOR
 * Creates three distinct lighting styles for the faux-lenticular badge
 *
 * Variant A: "Authority" - Strong upper-left, deep shadows
 * Variant B: "Motion" - Dual light, rolling highlights
 * Variant C: "Gallery" - Soft diffused, editorial calm
 */

import { Resvg } from '@resvg/resvg-js';

const width = 2000;
const height = 2000;
const cx = width / 2;
const cy = height / 2;

function starburst(centerX: number, centerY: number, outerR: number, innerR: number, points: number): string {
  const path: string[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    path.push(i === 0 ? `M ${centerX + r * Math.cos(angle)} ${centerY + r * Math.sin(angle)}` : `L ${centerX + r * Math.cos(angle)} ${centerY + r * Math.sin(angle)}`);
  }
  return path.join(' ') + ' Z';
}

function arcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): string {
  const start = { x: centerX + radius * Math.cos(startAngle), y: centerY + radius * Math.sin(startAngle) };
  const end = { x: centerX + radius * Math.cos(endAngle), y: centerY + radius * Math.sin(endAngle) };
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
}

interface LightingConfig {
  name: string;
  description: string;
  gradientAngle: string;
  highlightPosition: { cx: string; cy: string };
  shadowIntensity: number;
  highlightIntensity: number;
  specularSize: { rx: number; ry: number };
}

const variants: LightingConfig[] = [
  {
    name: 'authority',
    description: 'Strong upper-left light, deep shadows - for business/leadership',
    gradientAngle: 'x1="0%" y1="0%" x2="100%" y2="100%"',
    highlightPosition: { cx: '25%', cy: '20%' },
    shadowIntensity: 0.95,
    highlightIntensity: 0.95,
    specularSize: { rx: 350, ry: 280 }
  },
  {
    name: 'motion',
    description: 'Dual lighting, rolling highlights - for creative/dynamic',
    gradientAngle: 'x1="20%" y1="0%" x2="80%" y2="100%"',
    highlightPosition: { cx: '35%', cy: '30%' },
    shadowIntensity: 0.8,
    highlightIntensity: 0.85,
    specularSize: { rx: 450, ry: 350 }
  },
  {
    name: 'gallery',
    description: 'Soft diffused overhead - for memoirs/editorial',
    gradientAngle: 'x1="50%" y1="0%" x2="50%" y2="100%"',
    highlightPosition: { cx: '50%', cy: '25%' },
    shadowIntensity: 0.6,
    highlightIntensity: 0.7,
    specularSize: { rx: 500, ry: 400 }
  }
];

async function generateVariant(config: LightingConfig) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="fauxGold" ${config.gradientAngle}>
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="12%" stop-color="#F5E6A8"/>
      <stop offset="28%" stop-color="#E6CC7A"/>
      <stop offset="45%" stop-color="#C9A961"/>
      <stop offset="60%" stop-color="#B8923D"/>
      <stop offset="75%" stop-color="#9A7830"/>
      <stop offset="88%" stop-color="#8A6F2F"/>
      <stop offset="100%" stop-color="#5C4A1F"/>
    </linearGradient>

    <linearGradient id="highlightGold" x1="0%" y1="0%" x2="70%" y2="70%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="30%" stop-color="#F5E6A8"/>
      <stop offset="70%" stop-color="#E3C875"/>
      <stop offset="100%" stop-color="#C9A961"/>
    </linearGradient>

    <linearGradient id="shadowGold" x1="30%" y1="30%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A961"/>
      <stop offset="40%" stop-color="#9A7830"/>
      <stop offset="70%" stop-color="#7A5E25"/>
      <stop offset="100%" stop-color="#3D2F12"/>
    </linearGradient>

    <radialGradient id="centerDome" cx="${config.highlightPosition.cx}" cy="${config.highlightPosition.cy}" r="65%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="25%" stop-color="#F5E6A8"/>
      <stop offset="50%" stop-color="#D4B060"/>
      <stop offset="75%" stop-color="#B8923D"/>
      <stop offset="100%" stop-color="#8A6F2F"/>
    </radialGradient>

    <linearGradient id="textGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="20%" stop-color="#F5E6A8"/>
      <stop offset="50%" stop-color="#C9A961"/>
      <stop offset="80%" stop-color="#8A6F2F"/>
      <stop offset="100%" stop-color="#5C4A1F"/>
    </linearGradient>

    <radialGradient id="specular" cx="${config.highlightPosition.cx}" cy="${config.highlightPosition.cy}" r="40%">
      <stop offset="0%" stop-color="rgba(255,254,245,${config.highlightIntensity})"/>
      <stop offset="25%" stop-color="rgba(245,230,168,${config.highlightIntensity * 0.5})"/>
      <stop offset="50%" stop-color="rgba(227,200,117,${config.highlightIntensity * 0.2})"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>

    <filter id="emboss3D" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
      <feOffset in="blur" dx="-3" dy="-3" result="lightOffset"/>
      <feOffset in="blur" dx="3" dy="3" result="darkOffset"/>
      <feFlood flood-color="#FFFEF5" flood-opacity="${config.highlightIntensity}" result="lightColor"/>
      <feFlood flood-color="#2A1F0A" flood-opacity="${config.shadowIntensity}" result="darkColor"/>
      <feComposite in="lightColor" in2="lightOffset" operator="in" result="lightShadow"/>
      <feComposite in="darkColor" in2="darkOffset" operator="in" result="darkShadow"/>
      <feMerge>
        <feMergeNode in="darkShadow"/>
        <feMergeNode in="lightShadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="textEmboss" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur"/>
      <feOffset in="blur" dx="-2" dy="-2" result="light"/>
      <feOffset in="blur" dx="2" dy="2" result="dark"/>
      <feFlood flood-color="#FFFEF5" flood-opacity="${config.highlightIntensity}" result="lightC"/>
      <feFlood flood-color="#1A1408" flood-opacity="${config.shadowIntensity}" result="darkC"/>
      <feComposite in="lightC" in2="light" operator="in" result="ls"/>
      <feComposite in="darkC" in2="dark" operator="in" result="ds"/>
      <feMerge>
        <feMergeNode in="ds"/>
        <feMergeNode in="ls"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="8" dy="12" stdDeviation="15" flood-color="#1A1408" flood-opacity="0.35"/>
    </filter>

    <path id="topTextArc" d="${arcPath(cx, cy, 580, -2.6, -0.54)}" fill="none"/>
    <path id="bottomTextArc" d="${arcPath(cx, cy, 580, 0.54, 2.6)}" fill="none"/>

    <clipPath id="sealClip">
      <path d="${starburst(cx, cy, 850, 750, 24)}"/>
    </clipPath>
  </defs>

  <g filter="url(#dropShadow)">
    <path d="${starburst(cx + 4, cy + 4, 850, 750, 24)}" fill="#2A1F0A" opacity="0.5"/>
    <path d="${starburst(cx, cy, 850, 750, 24)}" fill="url(#shadowGold)"/>
    <path d="${starburst(cx - 3, cy - 3, 844, 744, 24)}" fill="url(#fauxGold)"/>
    <path d="${starburst(cx - 5, cy - 5, 838, 738, 24)}" fill="none" stroke="url(#highlightGold)" stroke-width="4" opacity="0.7"/>

    <circle cx="${cx}" cy="${cy}" r="670" fill="url(#shadowGold)" stroke="#5C4A1F" stroke-width="6"/>
    <circle cx="${cx - 2}" cy="${cy - 2}" r="664" fill="url(#centerDome)"/>
    <circle cx="${cx - 1}" cy="${cy - 1}" r="610" fill="none" stroke="url(#fauxGold)" stroke-width="10" filter="url(#emboss3D)"/>
    <circle cx="${cx - 2}" cy="${cy - 2}" r="590" fill="none" stroke="url(#highlightGold)" stroke-width="3" opacity="0.8"/>

    <circle cx="${cx}" cy="${cy}" r="420" fill="url(#shadowGold)"/>
    <circle cx="${cx - 2}" cy="${cy - 2}" r="414" fill="url(#centerDome)" filter="url(#emboss3D)"/>
    <circle cx="${cx - 1}" cy="${cy - 1}" r="360" fill="none" stroke="url(#fauxGold)" stroke-width="6" filter="url(#emboss3D)"/>

    <ellipse cx="${cx - 180}" cy="${cy - 200}" rx="${config.specularSize.rx}" ry="${config.specularSize.ry}"
             fill="url(#specular)" clip-path="url(#sealClip)"/>
  </g>

  <text font-family="'Times New Roman', Georgia, serif" font-size="115" font-weight="bold"
        letter-spacing="16" fill="url(#textGold)" filter="url(#textEmboss)">
    <textPath href="#topTextArc" startOffset="50%" text-anchor="middle">BESTSELLER</textPath>
  </text>

  <text x="${cx - 3}" y="${cy + 50}" font-family="'Times New Roman', Georgia, serif"
        font-size="260" font-weight="bold" text-anchor="middle"
        fill="url(#textGold)" filter="url(#textEmboss)">#1</text>

  <g fill="url(#textGold)" filter="url(#textEmboss)">
    <polygon points="${cx - 250},${cy + 10} ${cx - 240},${cy - 15} ${cx - 230},${cy + 10} ${cx - 255},${cy - 5} ${cx - 225},${cy - 5}" transform="scale(1.5) translate(-165, 7)"/>
    <polygon points="${cx + 250},${cy + 10} ${cx + 240},${cy - 15} ${cx + 230},${cy + 10} ${cx + 255},${cy - 5} ${cx + 225},${cy - 5}" transform="scale(1.5) translate(165, 7)"/>
  </g>

  <text font-family="'Times New Roman', Georgia, serif" font-size="78" font-weight="bold"
        letter-spacing="10" fill="url(#textGold)" filter="url(#textEmboss)">
    <textPath href="#bottomTextArc" startOffset="50%" text-anchor="middle">AWARD WINNER</textPath>
  </text>
</svg>`;

  // Save SVG
  await Bun.write(`/tmp/images/bestseller-${config.name}.svg`, svg);

  // Render PNG
  const resvg = new Resvg(svg, { background: 'transparent', fitTo: { mode: 'width', value: 1500 } });
  await Bun.write(`/tmp/images/bestseller-${config.name}.png`, resvg.render().asPng());

  console.log(`✓ ${config.name.toUpperCase()}: ${config.description}`);
}

console.log('\n=== GENERATING LIGHTING VARIANTS ===\n');

for (const variant of variants) {
  await generateVariant(variant);
}

console.log('\n=== ALL VARIANTS COMPLETE ===');
console.log('\nFiles created:');
variants.forEach(v => {
  console.log(`  /tmp/images/bestseller-${v.name}.svg`);
  console.log(`  /tmp/images/bestseller-${v.name}.png`);
});
