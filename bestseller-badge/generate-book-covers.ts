/**
 * BOOK COVER GENERATOR
 * Creates production-ready eBook and POD print covers
 *
 * Book: "CURLS & CONTEMPLATION - A Stylist's Interactive Journey Journal"
 * Author: MICHAEL DAVID
 */

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

// Read the logo
const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';

// Color palette from mockup
const colors = {
  teal: '#1E4D5C',
  tealDark: '#173D4A',
  tealLight: '#2A5A68',
  gold: '#C9A961',
  goldLight: '#E6D5A8',
  goldHighlight: '#F5E6A8',
  cream: '#F5F0E1'
};

// ============================================
// EBOOK COVER SPECIFICATIONS
// ============================================
// Amazon KDP recommended: 2560 x 1600 (height x width) = 1.6:1 ratio
// We'll use 1600 x 2560 (width x height)

const ebookWidth = 1600;
const ebookHeight = 2560;

// ============================================
// POD PRINT COVER SPECIFICATIONS (6x9 trim)
// ============================================
// Front cover: 6" x 9" at 300 DPI = 1800 x 2700 px
// Spine: depends on page count (assume ~200 pages = 0.5" spine = 150px)
// Back cover: 6" x 9" = 1800 x 2700 px
// Bleed: 0.125" = 38px on all sides
// Total width: 1800 + 150 + 1800 + (38*2) = 3826px
// Total height: 2700 + (38*2) = 2776px

const printDPI = 300;
const trimWidth = 6 * printDPI;  // 1800px
const trimHeight = 9 * printDPI; // 2700px
const spineWidth = 150;          // ~0.5" for ~200 pages
const bleed = 38;                // 0.125"

const fullPrintWidth = trimWidth * 2 + spineWidth + bleed * 2;  // 3826px
const fullPrintHeight = trimHeight + bleed * 2;                  // 2776px

// Generate the gold logo SVG path (simplified representation)
// We'll embed the actual PNG logo

async function generateEbookCover() {
  console.log('Generating eBook cover...');

  // Read the bestseller badge
  const badgePath = '/tmp/images/bestseller-faux-lenticular.png';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${ebookWidth} ${ebookHeight}" width="${ebookWidth}" height="${ebookHeight}">
  <defs>
    <!-- Teal gradient background -->
    <linearGradient id="tealBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A5A68"/>
      <stop offset="50%" stop-color="#1E4D5C"/>
      <stop offset="100%" stop-color="#173D4A"/>
    </linearGradient>

    <!-- Gold text gradient -->
    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5E6A8"/>
      <stop offset="30%" stop-color="#E6D5A8"/>
      <stop offset="70%" stop-color="#C9A961"/>
      <stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>

    <!-- Subtle texture overlay -->
    <filter id="noise" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="multiply" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>

    <!-- Gold emboss for text -->
    <filter id="goldEmboss" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-1" dy="-1" result="light"/>
      <feOffset in="blur" dx="1" dy="1" result="dark"/>
      <feFlood flood-color="#F5E6A8" flood-opacity="0.6" result="lightC"/>
      <feFlood flood-color="#6B5A2F" flood-opacity="0.8" result="darkC"/>
      <feComposite in="lightC" in2="light" operator="in" result="ls"/>
      <feComposite in="darkC" in2="dark" operator="in" result="ds"/>
      <feMerge>
        <feMergeNode in="ds"/>
        <feMergeNode in="ls"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#tealBg)"/>

  <!-- Subtle vignette -->
  <rect width="100%" height="100%" fill="url(#tealBg)" opacity="0.3"/>

  <!-- Small decorative star (top right area) -->
  <g transform="translate(1350, 180)" fill="url(#goldText)" opacity="0.7">
    <polygon points="0,-20 5,-5 20,-5 8,5 12,20 0,12 -12,20 -8,5 -20,-5 -5,-5"/>
  </g>

  <!-- Title: CURLS & -->
  <text x="${ebookWidth/2}" y="750"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="145" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        filter="url(#goldEmboss)"
        letter-spacing="12">CURLS &amp;</text>

  <!-- Title: CONTEMPLATION -->
  <text x="${ebookWidth/2}" y="900"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="125" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        filter="url(#goldEmboss)"
        letter-spacing="8">CONTEMPLATION</text>

  <!-- Subtitle -->
  <text x="${ebookWidth/2}" y="1020"
        font-family="'Cormorant Garamond', Georgia, serif"
        font-size="48" font-weight="300" font-style="italic"
        text-anchor="middle"
        fill="url(#goldText)"
        letter-spacing="3">A Stylist's Interactive Journey Journal</text>

  <!-- Author name -->
  <text x="${ebookWidth/2}" y="2350"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="72" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        filter="url(#goldEmboss)"
        letter-spacing="16">MICHAEL DAVID</text>

  <!-- Decorative line above author -->
  <line x1="550" y1="2250" x2="1050" y2="2250"
        stroke="url(#goldText)" stroke-width="1" opacity="0.5"/>

  <!-- Small star next to author -->
  <g transform="translate(1150, 2340)" fill="url(#goldText)" opacity="0.8">
    <polygon points="0,-15 4,-4 15,-4 6,4 9,15 0,9 -9,15 -6,4 -15,-4 -4,-4" transform="scale(0.8)"/>
  </g>
</svg>`;

  // First render the base SVG
  const resvg = new Resvg(svg, {
    background: '#1E4D5C',
    fitTo: { mode: 'original' }
  });
  const basePng = resvg.render().asPng();

  // Now composite with the logo and badge using sharp
  const logoBuffer = await Bun.file(logoPath).arrayBuffer();
  const badgeBuffer = await Bun.file(badgePath).arrayBuffer();

  // Resize logo to fit
  const resizedLogo = await sharp(Buffer.from(logoBuffer))
    .resize(700, 700, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Resize badge
  const resizedBadge = await sharp(Buffer.from(badgeBuffer))
    .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Composite everything
  const finalCover = await sharp(basePng)
    .composite([
      {
        input: resizedLogo,
        top: 1150,
        left: Math.floor((ebookWidth - 700) / 2)
      },
      {
        input: resizedBadge,
        top: 100,
        left: 100
      }
    ])
    .png()
    .toBuffer();

  await Bun.write('/tmp/images/ebook-cover-curls-contemplation.png', finalCover);
  console.log('✓ eBook cover saved: /tmp/images/ebook-cover-curls-contemplation.png');
  console.log(`  Dimensions: ${ebookWidth} x ${ebookHeight} px`);

  // Also create a version without badge
  const coverNoBadge = await sharp(basePng)
    .composite([
      {
        input: resizedLogo,
        top: 1150,
        left: Math.floor((ebookWidth - 700) / 2)
      }
    ])
    .png()
    .toBuffer();

  await Bun.write('/tmp/images/ebook-cover-no-badge.png', coverNoBadge);
  console.log('✓ eBook cover (no badge) saved: /tmp/images/ebook-cover-no-badge.png');
}

async function generatePrintCover() {
  console.log('\nGenerating POD print cover...');

  const badgePath = '/tmp/images/bestseller-faux-lenticular.png';

  // Full wrap cover SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${fullPrintWidth} ${fullPrintHeight}" width="${fullPrintWidth}" height="${fullPrintHeight}">
  <defs>
    <linearGradient id="tealBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A5A68"/>
      <stop offset="50%" stop-color="#1E4D5C"/>
      <stop offset="100%" stop-color="#173D4A"/>
    </linearGradient>

    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5E6A8"/>
      <stop offset="30%" stop-color="#E6D5A8"/>
      <stop offset="70%" stop-color="#C9A961"/>
      <stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>

    <linearGradient id="goldTextHoriz" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A68B4B"/>
      <stop offset="30%" stop-color="#C9A961"/>
      <stop offset="70%" stop-color="#E6D5A8"/>
      <stop offset="100%" stop-color="#C9A961"/>
    </linearGradient>

    <filter id="goldEmboss" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-1" dy="-1" result="light"/>
      <feOffset in="blur" dx="1" dy="1" result="dark"/>
      <feFlood flood-color="#F5E6A8" flood-opacity="0.6" result="lightC"/>
      <feFlood flood-color="#6B5A2F" flood-opacity="0.8" result="darkC"/>
      <feComposite in="lightC" in2="light" operator="in" result="ls"/>
      <feComposite in="darkC" in2="dark" operator="in" result="ds"/>
      <feMerge>
        <feMergeNode in="ds"/>
        <feMergeNode in="ls"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Full background with bleed -->
  <rect width="100%" height="100%" fill="url(#tealBg)"/>

  <!-- ==================== BACK COVER (Left side) ==================== -->
  <!-- Back cover area: x=bleed to x=bleed+trimWidth -->

  <!-- Back cover headline -->
  <text x="${bleed + trimWidth/2}" y="${bleed + 200}"
        font-family="'Playfair Display', Georgia, serif"
        font-size="58" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        letter-spacing="2">ARE YOU READY TO BREAK</text>
  <text x="${bleed + trimWidth/2}" y="${bleed + 270}"
        font-family="'Playfair Display', Georgia, serif"
        font-size="58" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        letter-spacing="2">FREE FROM THE CHAIR?</text>

  <!-- Back cover body text -->
  <text x="${bleed + 100}" y="${bleed + 400}"
        font-family="Georgia, serif" font-size="32" fill="${colors.cream}" opacity="0.95">
    <tspan x="${bleed + 100}" dy="0">You didn't become a hairstylist to work someone else's</tspan>
    <tspan x="${bleed + 100}" dy="50">dream. You became one to create transformations—starting</tspan>
    <tspan x="${bleed + 100}" dy="50">with your own.</tspan>
    <tspan x="${bleed + 100}" dy="80">CURLS &amp; CONTEMPLATION is the permission slip you've</tspan>
    <tspan x="${bleed + 100}" dy="50">been waiting for. Through 16 immersive chapters, quizzes, and</tspan>
    <tspan x="${bleed + 100}" dy="50">interactive worksheets, celebrity-trained stylist Michael David</tspan>
    <tspan x="${bleed + 100}" dy="50">guides you from salon employee to location-independent artist.</tspan>
  </text>

  <!-- Bullet points -->
  <g font-family="Georgia, serif" font-size="30" fill="${colors.cream}" opacity="0.9">
    <text x="${bleed + 120}" y="${bleed + 850}">✦  The psychology of conscious hairstyling that</text>
    <text x="${bleed + 160}" y="${bleed + 890}">builds unshakeable client loyalty</text>
    <text x="${bleed + 120}" y="${bleed + 950}">✦  Business strategies from industry icons</text>
    <text x="${bleed + 120}" y="${bleed + 1010}">✦  How to leverage AI and digital platforms</text>
    <text x="${bleed + 120}" y="${bleed + 1070}">✦  Self-care practices that prevent burnout</text>
    <text x="${bleed + 120}" y="${bleed + 1130}">✦  The art of building a legacy</text>
  </g>

  <!-- Back cover closing text -->
  <text x="${bleed + 100}" y="${bleed + 1280}"
        font-family="Georgia, serif" font-size="32" fill="${colors.cream}" opacity="0.95">
    <tspan x="${bleed + 100}" dy="0">This isn't another technique manual. It's a roadmap to</tspan>
    <tspan x="${bleed + 100}" dy="50">professional liberation—designed for the ambitious stylist</tspan>
    <tspan x="${bleed + 100}" dy="50">who knows they were meant for more.</tspan>
    <tspan x="${bleed + 100}" dy="80">Your hands hold the power to transform lives. Now it's time to</tspan>
    <tspan x="${bleed + 100}" dy="50">transform your own.</tspan>
  </text>

  <!-- Author bio -->
  <text x="${bleed + 100}" y="${bleed + 1650}"
        font-family="Georgia, serif" font-size="26" fill="${colors.cream}" opacity="0.8">
    <tspan x="${bleed + 100}" dy="0" font-weight="bold">MICHAEL DAVID WARREN JR.</tspan>
    <tspan x="${bleed + 100}" dy="40">is a celebrity hairstylist and founder of a location-independent</tspan>
    <tspan x="${bleed + 100}" dy="35">practice spanning three continents. Connect:</tspan>
    <tspan x="${bleed + 100}" dy="35">michaeldavidhair.com | @michaeldavidhair</tspan>
  </text>

  <!-- Barcode placeholder area -->
  <rect x="${bleed + 100}" y="${bleed + 1900}" width="400" height="250"
        fill="white" rx="5"/>
  <text x="${bleed + 300}" y="${bleed + 2040}"
        font-family="monospace" font-size="24" text-anchor="middle" fill="#333">
    ISBN BARCODE
  </text>

  <!-- ==================== SPINE ==================== -->
  <!-- Spine area: x=bleed+trimWidth to x=bleed+trimWidth+spineWidth -->

  <!-- Spine title (rotated) -->
  <text transform="translate(${bleed + trimWidth + spineWidth/2 + 15}, ${fullPrintHeight/2}) rotate(-90)"
        font-family="'Playfair Display', Georgia, serif"
        font-size="42" font-weight="400"
        text-anchor="middle"
        fill="url(#goldTextHoriz)"
        letter-spacing="4">CURLS &amp; CONTEMPLATION</text>

  <!-- Spine author -->
  <text transform="translate(${bleed + trimWidth + spineWidth/2 + 15}, ${fullPrintHeight - 300}) rotate(-90)"
        font-family="'Playfair Display', Georgia, serif"
        font-size="32" font-weight="400"
        text-anchor="middle"
        fill="url(#goldTextHoriz)"
        letter-spacing="2">MICHAEL DAVID</text>

  <!-- ==================== FRONT COVER (Right side) ==================== -->
  <!-- Front cover area: x=bleed+trimWidth+spineWidth to end-bleed -->

  <!-- Front cover X offset -->
  <!-- Small decorative star -->
  <g transform="translate(${bleed + trimWidth + spineWidth + trimWidth - 200}, ${bleed + 180})"
     fill="url(#goldText)" opacity="0.7">
    <polygon points="0,-20 5,-5 20,-5 8,5 12,20 0,12 -12,20 -8,5 -20,-5 -5,-5"/>
  </g>

  <!-- Title: CURLS & -->
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + 650}"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="120" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        filter="url(#goldEmboss)"
        letter-spacing="10">CURLS &amp;</text>

  <!-- Title: CONTEMPLATION -->
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + 800}"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="100" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        filter="url(#goldEmboss)"
        letter-spacing="6">CONTEMPLATION</text>

  <!-- Subtitle -->
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + 920}"
        font-family="'Cormorant Garamond', Georgia, serif"
        font-size="40" font-weight="300" font-style="italic"
        text-anchor="middle"
        fill="url(#goldText)"
        letter-spacing="2">A Stylist's Interactive Journey Journal</text>

  <!-- Author name -->
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + trimHeight - 180}"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="60" font-weight="400"
        text-anchor="middle"
        fill="url(#goldText)"
        filter="url(#goldEmboss)"
        letter-spacing="14">MICHAEL DAVID</text>

  <!-- Decorative line above author -->
  <line x1="${bleed + trimWidth + spineWidth + trimWidth/2 - 250}"
        y1="${bleed + trimHeight - 250}"
        x2="${bleed + trimWidth + spineWidth + trimWidth/2 + 250}"
        y2="${bleed + trimHeight - 250}"
        stroke="url(#goldText)" stroke-width="1" opacity="0.5"/>

  <!-- Small star next to author -->
  <g transform="translate(${bleed + trimWidth + spineWidth + trimWidth/2 + 320}, ${bleed + trimHeight - 190})"
     fill="url(#goldText)" opacity="0.8">
    <polygon points="0,-15 4,-4 15,-4 6,4 9,15 0,9 -9,15 -6,4 -15,-4 -4,-4" transform="scale(0.8)"/>
  </g>

  <!-- Safety/trim guides (for reference - remove for final) -->
  <!-- Front cover trim box -->
  <rect x="${bleed + trimWidth + spineWidth}" y="${bleed}"
        width="${trimWidth}" height="${trimHeight}"
        fill="none" stroke="magenta" stroke-width="1" stroke-dasharray="10,5" opacity="0.3"/>
  <!-- Spine box -->
  <rect x="${bleed + trimWidth}" y="${bleed}"
        width="${spineWidth}" height="${trimHeight}"
        fill="none" stroke="cyan" stroke-width="1" stroke-dasharray="10,5" opacity="0.3"/>
  <!-- Back cover trim box -->
  <rect x="${bleed}" y="${bleed}"
        width="${trimWidth}" height="${trimHeight}"
        fill="none" stroke="magenta" stroke-width="1" stroke-dasharray="10,5" opacity="0.3"/>
</svg>`;

  // Render base
  const resvg = new Resvg(svg, {
    background: '#1E4D5C',
    fitTo: { mode: 'original' }
  });
  const basePng = resvg.render().asPng();

  // Load and resize assets
  const logoBuffer = await Bun.file(logoPath).arrayBuffer();
  const badgeBuffer = await Bun.file(badgePath).arrayBuffer();

  const resizedLogo = await sharp(Buffer.from(logoBuffer))
    .resize(580, 580, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const resizedBadge = await sharp(Buffer.from(badgeBuffer))
    .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Calculate front cover center for logo
  const frontCoverCenterX = bleed + trimWidth + spineWidth + trimWidth/2;
  const logoX = Math.floor(frontCoverCenterX - 290);
  const logoY = bleed + 1050;

  // Badge position (top left of front cover)
  const badgeX = bleed + trimWidth + spineWidth + 80;
  const badgeY = bleed + 80;

  // Composite
  const finalCover = await sharp(basePng)
    .composite([
      {
        input: resizedLogo,
        top: logoY,
        left: logoX
      },
      {
        input: resizedBadge,
        top: badgeY,
        left: badgeX
      }
    ])
    .png()
    .toBuffer();

  await Bun.write('/tmp/images/print-cover-full-wrap.png', finalCover);
  console.log('✓ Full wrap print cover saved: /tmp/images/print-cover-full-wrap.png');
  console.log(`  Dimensions: ${fullPrintWidth} x ${fullPrintHeight} px`);
  console.log(`  Trim size: 6" x 9" (front), ~0.5" spine`);
  console.log(`  Bleed: 0.125" all sides`);

  // Also create front cover only (for preview)
  const frontCoverOnly = await sharp(basePng)
    .extract({
      left: bleed + trimWidth + spineWidth,
      top: bleed,
      width: trimWidth,
      height: trimHeight
    })
    .composite([
      {
        input: resizedLogo,
        top: logoY - bleed,
        left: logoX - (bleed + trimWidth + spineWidth)
      },
      {
        input: resizedBadge,
        top: badgeY - bleed,
        left: badgeX - (bleed + trimWidth + spineWidth)
      }
    ])
    .png()
    .toBuffer();

  await Bun.write('/tmp/images/print-cover-front-only.png', frontCoverOnly);
  console.log('✓ Front cover only saved: /tmp/images/print-cover-front-only.png');
}

// Run both
console.log('=== BOOK COVER GENERATION ===\n');
console.log('Book: CURLS & CONTEMPLATION');
console.log('Author: MICHAEL DAVID\n');

await generateEbookCover();
await generatePrintCover();

console.log('\n=== ALL COVERS COMPLETE ===');
console.log('\nFiles created:');
console.log('  /tmp/images/ebook-cover-curls-contemplation.png (1600x2560)');
console.log('  /tmp/images/ebook-cover-no-badge.png');
console.log('  /tmp/images/print-cover-full-wrap.png (3826x2776, with bleed)');
console.log('  /tmp/images/print-cover-front-only.png (1800x2700)');
