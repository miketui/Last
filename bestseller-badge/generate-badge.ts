/**
 * 3D Metallic Gold Bestseller Badge Generator
 * Creates a premium embossed/debossed metallic gold badge with transparent background
 */

const width = 800;
const height = 800;
const centerX = width / 2;
const centerY = height / 2;

// Generate starburst/seal path with pointed edges
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

// Generate circular path for text
function generateTextPath(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
}

const outerRadius = 350;
const innerRadius = 310;
const starPoints = 20;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- 3D Metallic Gold Gradient - Main -->
    <linearGradient id="goldGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8DC"/>
      <stop offset="15%" stop-color="#FFD700"/>
      <stop offset="30%" stop-color="#DAA520"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="70%" stop-color="#B8860B"/>
      <stop offset="85%" stop-color="#8B6914"/>
      <stop offset="100%" stop-color="#5C4813"/>
    </linearGradient>

    <!-- Highlight Gradient for top edges -->
    <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF0"/>
      <stop offset="50%" stop-color="#FFE55C"/>
      <stop offset="100%" stop-color="#DAA520"/>
    </linearGradient>

    <!-- Shadow Gradient for bottom edges -->
    <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8860B"/>
      <stop offset="50%" stop-color="#7A5C1A"/>
      <stop offset="100%" stop-color="#3D2E0D"/>
    </linearGradient>

    <!-- Radial gold for center -->
    <radialGradient id="centerGold" cx="35%" cy="35%" r="65%" fx="35%" fy="35%">
      <stop offset="0%" stop-color="#FFF8DC"/>
      <stop offset="30%" stop-color="#FFD700"/>
      <stop offset="60%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </radialGradient>

    <!-- Inner bevel gradient -->
    <linearGradient id="innerBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D2E0D"/>
      <stop offset="30%" stop-color="#7A5C1A"/>
      <stop offset="70%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFFEF0"/>
    </linearGradient>

    <!-- Text gradient - embossed look -->
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF8DC"/>
      <stop offset="25%" stop-color="#FFD700"/>
      <stop offset="75%" stop-color="#B8860B"/>
      <stop offset="100%" stop-color="#5C4813"/>
    </linearGradient>

    <!-- Specular highlight -->
    <radialGradient id="specular" cx="30%" cy="25%" r="40%" fx="30%" fy="25%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.8)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.2)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>

    <!-- Metal texture pattern -->
    <filter id="metalTexture" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="#D4AF37" surfaceScale="1.5" result="diffuse">
        <feDistantLight azimuth="135" elevation="60"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic" k1="1" k2="0.3" k3="0.3" k4="0"/>
    </filter>

    <!-- 3D emboss filter -->
    <filter id="emboss3D" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
      <feOffset in="blur" dx="-4" dy="-4" result="offsetBlurLight"/>
      <feOffset in="blur" dx="4" dy="4" result="offsetBlurDark"/>
      <feFlood flood-color="#FFFEF0" flood-opacity="0.7" result="lightColor"/>
      <feFlood flood-color="#2D1F0A" flood-opacity="0.8" result="darkColor"/>
      <feComposite in="lightColor" in2="offsetBlurLight" operator="in" result="lightShadow"/>
      <feComposite in="darkColor" in2="offsetBlurDark" operator="in" result="darkShadow"/>
      <feMerge>
        <feMergeNode in="darkShadow"/>
        <feMergeNode in="lightShadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Sharp drop shadow -->
    <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="6" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>

    <!-- Text path for curved text -->
    <path id="topTextPath" d="${generateTextPath(centerX, centerY, 240)}" fill="none"/>
    <path id="bottomTextPath" d="${generateTextPath(centerX, centerY, 240)}" fill="none"/>

    <!-- Starburst clip path -->
    <clipPath id="starburstClip">
      <path d="${generateStarburstPath(centerX, centerY, outerRadius, innerRadius, starPoints)}"/>
    </clipPath>
  </defs>

  <!-- Main badge group with drop shadow -->
  <g filter="url(#dropShadow)">
    <!-- Outer starburst shape - dark base layer -->
    <path d="${generateStarburstPath(centerX, centerY, outerRadius, innerRadius, starPoints)}"
          fill="url(#shadowGradient)"/>

    <!-- Outer starburst - main gold layer (slightly offset for 3D) -->
    <path d="${generateStarburstPath(centerX, centerY, outerRadius - 3, innerRadius - 3, starPoints)}"
          fill="url(#goldGradient3D)"
          transform="translate(-2, -2)"/>

    <!-- Inner circle - recessed area -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="280"
            fill="url(#innerBevel)"
            stroke="url(#shadowGradient)" stroke-width="4"/>

    <!-- Inner circle - main surface -->
    <circle cx="${centerX - 3}" cy="${centerY - 3}" r="275"
            fill="url(#centerGold)"/>

    <!-- Decorative inner ring -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="250"
            fill="none"
            stroke="url(#goldGradient3D)"
            stroke-width="6"
            filter="url(#emboss3D)"/>

    <!-- Another decorative ring -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="235"
            fill="none"
            stroke="url(#highlightGradient)"
            stroke-width="2"/>

    <!-- Center medallion area -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="160"
            fill="url(#centerGold)"
            stroke="url(#goldGradient3D)"
            stroke-width="8"
            filter="url(#emboss3D)"/>

    <!-- Specular highlight overlay -->
    <ellipse cx="${centerX - 60}" cy="${centerY - 80}" rx="180" ry="140"
             fill="url(#specular)"
             clip-path="url(#starburstClip)"/>
  </g>

  <!-- Text: BESTSELLER (top arc) -->
  <text font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="bold"
        letter-spacing="8" fill="url(#textGradient)" filter="url(#emboss3D)">
    <textPath href="#topTextPath" startOffset="25%" text-anchor="middle">
      BESTSELLER
    </textPath>
  </text>

  <!-- Text: #1 in center -->
  <text x="${centerX - 2}" y="${centerY + 20}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="100" font-weight="bold"
        text-anchor="middle"
        fill="url(#textGradient)"
        filter="url(#emboss3D)">
    #1
  </text>

  <!-- Small stars/decorations -->
  <g fill="url(#textGradient)" filter="url(#emboss3D)">
    <polygon points="${centerX - 120},${centerY - 5} ${centerX - 115},${centerY + 5} ${centerX - 105},${centerY + 5} ${centerX - 113},${centerY + 12} ${centerX - 110},${centerY + 22} ${centerX - 120},${centerY + 15} ${centerX - 130},${centerY + 22} ${centerX - 127},${centerY + 12} ${centerX - 135},${centerY + 5} ${centerX - 125},${centerY + 5}"/>
    <polygon points="${centerX + 120},${centerY - 5} ${centerX + 125},${centerY + 5} ${centerX + 135},${centerY + 5} ${centerX + 127},${centerY + 12} ${centerX + 130},${centerY + 22} ${centerX + 120},${centerY + 15} ${centerX + 110},${centerY + 22} ${centerX + 113},${centerY + 12} ${centerX + 105},${centerY + 5} ${centerX + 115},${centerY + 5}"/>
  </g>

  <!-- Bottom text arc - AWARD WINNER -->
  <text font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="bold"
        letter-spacing="4" fill="url(#textGradient)" filter="url(#emboss3D)">
    <textPath href="#bottomTextPath" startOffset="75%" text-anchor="middle">
      AWARD WINNER
    </textPath>
  </text>
</svg>`;

// Write SVG file
await Bun.write('/tmp/images/bestseller-badge.svg', svg);
console.log('SVG badge created: /tmp/images/bestseller-badge.svg');

// Now let's also create a version that incorporates the user's logo
const svgWithLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- 3D Metallic Gold Gradient - Main -->
    <linearGradient id="goldGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8DC"/>
      <stop offset="15%" stop-color="#FFD700"/>
      <stop offset="30%" stop-color="#DAA520"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="70%" stop-color="#B8860B"/>
      <stop offset="85%" stop-color="#8B6914"/>
      <stop offset="100%" stop-color="#5C4813"/>
    </linearGradient>

    <!-- Highlight Gradient for top edges -->
    <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFEF0"/>
      <stop offset="50%" stop-color="#FFE55C"/>
      <stop offset="100%" stop-color="#DAA520"/>
    </linearGradient>

    <!-- Shadow Gradient for bottom edges -->
    <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8860B"/>
      <stop offset="50%" stop-color="#7A5C1A"/>
      <stop offset="100%" stop-color="#3D2E0D"/>
    </linearGradient>

    <!-- Radial gold for center -->
    <radialGradient id="centerGold" cx="35%" cy="35%" r="65%" fx="35%" fy="35%">
      <stop offset="0%" stop-color="#FFF8DC"/>
      <stop offset="30%" stop-color="#FFD700"/>
      <stop offset="60%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </radialGradient>

    <!-- Inner bevel gradient -->
    <linearGradient id="innerBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D2E0D"/>
      <stop offset="30%" stop-color="#7A5C1A"/>
      <stop offset="70%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFFEF0"/>
    </linearGradient>

    <!-- Text gradient - embossed look -->
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF8DC"/>
      <stop offset="25%" stop-color="#FFD700"/>
      <stop offset="75%" stop-color="#B8860B"/>
      <stop offset="100%" stop-color="#5C4813"/>
    </linearGradient>

    <!-- Specular highlight -->
    <radialGradient id="specular" cx="30%" cy="25%" r="40%" fx="30%" fy="25%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.15)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>

    <!-- 3D emboss filter -->
    <filter id="emboss3D" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
      <feOffset in="blur" dx="-3" dy="-3" result="offsetBlurLight"/>
      <feOffset in="blur" dx="3" dy="3" result="offsetBlurDark"/>
      <feFlood flood-color="#FFFEF0" flood-opacity="0.6" result="lightColor"/>
      <feFlood flood-color="#2D1F0A" flood-opacity="0.7" result="darkColor"/>
      <feComposite in="lightColor" in2="offsetBlurLight" operator="in" result="lightShadow"/>
      <feComposite in="darkColor" in2="offsetBlurDark" operator="in" result="darkShadow"/>
      <feMerge>
        <feMergeNode in="darkShadow"/>
        <feMergeNode in="lightShadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Sharp drop shadow -->
    <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="5" dy="7" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
    </filter>

    <!-- Text path for curved text -->
    <path id="topTextPath" d="${generateTextPath(centerX, centerY, 250)}" fill="none"/>
    <path id="bottomTextPath" d="${generateTextPath(centerX, centerY, 250)}" fill="none"/>

    <!-- Starburst clip path -->
    <clipPath id="starburstClip">
      <path d="${generateStarburstPath(centerX, centerY, outerRadius, innerRadius, starPoints)}"/>
    </clipPath>
  </defs>

  <!-- Main badge group with drop shadow -->
  <g filter="url(#dropShadow)">
    <!-- Outer starburst shape - dark base layer -->
    <path d="${generateStarburstPath(centerX, centerY, outerRadius, innerRadius, starPoints)}"
          fill="url(#shadowGradient)"/>

    <!-- Outer starburst - main gold layer (slightly offset for 3D) -->
    <path d="${generateStarburstPath(centerX, centerY, outerRadius - 3, innerRadius - 3, starPoints)}"
          fill="url(#goldGradient3D)"
          transform="translate(-2, -2)"/>

    <!-- Inner circle - recessed area -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="285"
            fill="url(#innerBevel)"
            stroke="url(#shadowGradient)" stroke-width="4"/>

    <!-- Inner circle - main surface -->
    <circle cx="${centerX - 3}" cy="${centerY - 3}" r="280"
            fill="url(#centerGold)"/>

    <!-- Decorative inner ring -->
    <circle cx="${centerX - 2}" cy="${centerY - 2}" r="260"
            fill="none"
            stroke="url(#goldGradient3D)"
            stroke-width="5"
            filter="url(#emboss3D)"/>

    <!-- Specular highlight overlay -->
    <ellipse cx="${centerX - 50}" cy="${centerY - 70}" rx="160" ry="120"
             fill="url(#specular)"
             clip-path="url(#starburstClip)"/>
  </g>

  <!-- Text: BESTSELLER (top arc) -->
  <text font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="bold"
        letter-spacing="6" fill="url(#textGradient)" filter="url(#emboss3D)">
    <textPath href="#topTextPath" startOffset="25%" text-anchor="middle">
      BESTSELLER
    </textPath>
  </text>

  <!-- Placeholder for logo - user should embed their logo here -->
  <g transform="translate(${centerX - 100}, ${centerY - 120}) scale(0.25)">
    <!-- Logo placeholder - embed user's logo image here -->
    <image href="/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png" width="800" height="800" filter="url(#emboss3D)"/>
  </g>

  <!-- Bottom text arc -->
  <text font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="bold"
        letter-spacing="3" fill="url(#textGradient)" filter="url(#emboss3D)">
    <textPath href="#bottomTextPath" startOffset="75%" text-anchor="middle">
      AWARD WINNER
    </textPath>
  </text>
</svg>`;

await Bun.write('/tmp/images/bestseller-badge-with-logo.svg', svgWithLogo);
console.log('SVG badge with logo placeholder created: /tmp/images/bestseller-badge-with-logo.svg');

console.log('\n--- Badge Generation Complete ---');
console.log('Files created:');
console.log('1. /tmp/images/bestseller-badge.svg - Clean badge template');
console.log('2. /tmp/images/bestseller-badge-with-logo.svg - Badge with your logo embedded');
