/**
 * Premium 3D Metallic Gold Bestseller Badge - FIXED
 * Logo properly composited with gold background
 */
import { Resvg } from '@resvg/resvg-js';

const width = 1000;
const height = 1000;
const centerX = width / 2;
const centerY = height / 2;

// Generate starburst/seal path with sharp pointed edges
function generateStarburstPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const path: string[] = [];
  const angleStep = Math.PI / points;

  for (let i = 0; i < points * 2; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  path.push('Z');
  return path.join(' ');
}

// Read the logo and encode as base64
const logoBuffer = await Bun.file('/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png').arrayBuffer();
const logoBase64 = Buffer.from(logoBuffer).toString('base64');

const outerRadius = 420;
const innerRadius = 370;
const starPoints = 22;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Premium Metallic Gold - Sharp Gradient -->
    <linearGradient id="goldSharp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="8%" stop-color="#FFE878"/>
      <stop offset="20%" stop-color="#FFD700"/>
      <stop offset="35%" stop-color="#E6B800"/>
      <stop offset="50%" stop-color="#D4A017"/>
      <stop offset="65%" stop-color="#C49000"/>
      <stop offset="80%" stop-color="#996515"/>
      <stop offset="92%" stop-color="#704214"/>
      <stop offset="100%" stop-color="#4A2C0A"/>
    </linearGradient>

    <!-- Bright highlight edge -->
    <linearGradient id="brightEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="20%" stop-color="#FFFDE8"/>
      <stop offset="60%" stop-color="#FFE55C"/>
      <stop offset="100%" stop-color="#D4A017"/>
    </linearGradient>

    <!-- Dark shadow edge -->
    <linearGradient id="darkEdge" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#2A1A05"/>
      <stop offset="30%" stop-color="#4A2C0A"/>
      <stop offset="60%" stop-color="#704214"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>

    <!-- Center radial gold -->
    <radialGradient id="centerRadial" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="20%" stop-color="#FFE55C"/>
      <stop offset="45%" stop-color="#D4A017"/>
      <stop offset="70%" stop-color="#B8860B"/>
      <stop offset="100%" stop-color="#8B6508"/>
    </radialGradient>

    <!-- Warm gold for logo background -->
    <radialGradient id="logoGoldBg" cx="40%" cy="40%" r="60%" fx="40%" fy="40%">
      <stop offset="0%" stop-color="#FFE878"/>
      <stop offset="50%" stop-color="#D4A017"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </radialGradient>

    <!-- Inner depression gradient -->
    <linearGradient id="innerDepression" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="25%" stop-color="#FFD700"/>
      <stop offset="75%" stop-color="#704214"/>
      <stop offset="100%" stop-color="#3D2508"/>
    </linearGradient>

    <!-- Text 3D gradient -->
    <linearGradient id="text3D" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF5"/>
      <stop offset="15%" stop-color="#FFE878"/>
      <stop offset="50%" stop-color="#C49000"/>
      <stop offset="85%" stop-color="#704214"/>
      <stop offset="100%" stop-color="#3D2508"/>
    </linearGradient>

    <!-- Specular highlight -->
    <radialGradient id="specularIntense" cx="28%" cy="22%" r="35%" fx="28%" fy="22%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.85)"/>
      <stop offset="30%" stop-color="rgba(255,255,240,0.35)"/>
      <stop offset="60%" stop-color="rgba(255,248,200,0.1)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>

    <!-- Sharp 3D bevel filter -->
    <filter id="sharpBevel" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-4" dy="-4" result="lightOffset"/>
      <feOffset in="blur" dx="4" dy="4" result="darkOffset"/>
      <feFlood flood-color="#FFFFFF" flood-opacity="0.8" result="lightFlood"/>
      <feFlood flood-color="#1A0F00" flood-opacity="0.9" result="darkFlood"/>
      <feComposite in="lightFlood" in2="lightOffset" operator="in" result="lightBevel"/>
      <feComposite in="darkFlood" in2="darkOffset" operator="in" result="darkBevel"/>
      <feMerge>
        <feMergeNode in="darkBevel"/>
        <feMergeNode in="lightBevel"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Ultra sharp emboss -->
    <filter id="ultraEmboss" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur1"/>
      <feOffset in="blur1" dx="-2" dy="-2" result="lightOff"/>
      <feOffset in="blur1" dx="2" dy="2" result="darkOff"/>
      <feFlood flood-color="#FFFEF5" flood-opacity="0.9" result="light"/>
      <feFlood flood-color="#1A0F00" flood-opacity="0.95" result="dark"/>
      <feComposite in="light" in2="lightOff" operator="in" result="lightComp"/>
      <feComposite in="dark" in2="darkOff" operator="in" result="darkComp"/>
      <feMerge>
        <feMergeNode in="darkComp"/>
        <feMergeNode in="lightComp"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Drop shadow -->
    <filter id="medalShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="8" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.55"/>
    </filter>

    <!-- Inner shadow for depth -->
    <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feComponentTransfer in="SourceAlpha">
        <feFuncA type="table" tableValues="1 0"/>
      </feComponentTransfer>
      <feGaussianBlur stdDeviation="4"/>
      <feOffset dx="3" dy="3" result="offsetblur"/>
      <feFlood flood-color="#1A0F00" flood-opacity="0.6"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feComposite in2="SourceAlpha" operator="in"/>
      <feMerge>
        <feMergeNode in="SourceGraphic"/>
        <feMergeNode/>
      </feMerge>
    </filter>

    <!-- Text paths -->
    <path id="topArc" d="M ${centerX - 295} ${centerY} A 295 295 0 0 1 ${centerX + 295} ${centerY}" fill="none"/>
    <path id="bottomArc" d="M ${centerX + 295} ${centerY} A 295 295 0 0 1 ${centerX - 295} ${centerY}" fill="none"/>

    <!-- Starburst clip -->
    <clipPath id="starClip">
      <path d="${generateStarburstPath(centerX, centerY, outerRadius, innerRadius, starPoints)}"/>
    </clipPath>

    <!-- Circular clip for center area -->
    <clipPath id="centerClip">
      <circle cx="${centerX - 2}" cy="${centerY - 2}" r="180"/>
    </clipPath>
  </defs>

  <!-- Main medal group -->
  <g filter="url(#medalShadow)">
    <!-- Base shadow layer -->
    <path d="${generateStarburstPath(centerX + 5, centerY + 5, outerRadius, innerRadius, starPoints)}"
          fill="#1A0F00" opacity="0.4"/>

    <!-- Outer starburst - dark edge -->
    <path d="${generateStarburstPath(centerX, centerY, outerRadius, innerRadius, starPoints)}"
          fill="url(#darkEdge)"/>

    <!-- Outer starburst - main gold body -->
    <path d="${generateStarburstPath(centerX - 2, centerY - 2, outerRadius - 4, innerRadius - 4, starPoints)}"
          fill="url(#goldSharp)"/>

    <!-- Outer starburst - bright edge highlight -->
    <path d="${generateStarburstPath(centerX - 4, centerY - 4, outerRadius - 8, innerRadius - 8, starPoints)}"
          fill="none"
          stroke="url(#brightEdge)"
          stroke-width="3"
          opacity="0.7"/>

    <!-- Inner recessed ring -->
    <circle cx="${centerX}" cy="${centerY}" r="330"
            fill="url(#darkEdge)"
            stroke="url(#innerDepression)"
            stroke-width="6"/>

    <!-- Main inner gold surface -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="322"
            fill="url(#centerRadial)"
            filter="url(#innerShadow)"/>

    <!-- Decorative raised ring -->
    <circle cx="${centerX - 1}" cy="${centerY - 1}" r="300"
            fill="none"
            stroke="url(#goldSharp)"
            stroke-width="6"
            filter="url(#sharpBevel)"/>

    <!-- Center medallion - raised platform -->
    <circle cx="${centerX}" cy="${centerY}" r="210"
            fill="url(#darkEdge)"/>

    <!-- Gold background for center area -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="205"
            fill="url(#logoGoldBg)"
            filter="url(#sharpBevel)"/>

    <!-- Inner decorative ring -->
    <circle cx="${centerX - 1}" cy="${centerY - 1}" r="185"
            fill="none"
            stroke="url(#goldSharp)"
            stroke-width="4"
            filter="url(#ultraEmboss)"/>

    <!-- Solid gold background for logo - THIS goes INSIDE the clip area -->
    <g clip-path="url(#centerClip)">
      <!-- Gold background to fill the transparent PNG areas -->
      <circle cx="${centerX - 2}" cy="${centerY - 2}" r="180"
              fill="url(#logoGoldBg)"/>
      <!-- Logo on top -->
      <image href="data:image/png;base64,${logoBase64}"
             x="${centerX - 150}" y="${centerY - 150}"
             width="300" height="300"
             preserveAspectRatio="xMidYMid meet"/>
    </g>

    <!-- Specular highlight -->
    <ellipse cx="${centerX - 100}" cy="${centerY - 100}" rx="200" ry="160"
             fill="url(#specularIntense)"
             clip-path="url(#starClip)"/>
  </g>

  <!-- Text: BESTSELLER arced on top -->
  <text font-family="'Times New Roman', Georgia, serif" font-size="56" font-weight="bold"
        letter-spacing="8" fill="url(#text3D)" filter="url(#ultraEmboss)">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">
      BESTSELLER
    </textPath>
  </text>

  <!-- Text: AWARD WINNER arced on bottom -->
  <text font-family="'Times New Roman', Georgia, serif" font-size="38" font-weight="bold"
        letter-spacing="5" fill="url(#text3D)" filter="url(#ultraEmboss)">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
      AWARD WINNER
    </textPath>
  </text>
</svg>`;

await Bun.write('/tmp/images/bestseller-fixed.svg', svg);
console.log('Fixed SVG created: /tmp/images/bestseller-fixed.svg');

// Convert to PNG
const resvg = new Resvg(svg, {
  background: 'transparent',
  fitTo: {
    mode: 'width',
    value: 1500,
  },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

await Bun.write('/tmp/images/bestseller-fixed.png', pngBuffer);
console.log('Fixed PNG created: /tmp/images/bestseller-fixed.png');
