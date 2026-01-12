/**
 * Fix logo checkerboard and regenerate covers
 * The logo has a baked-in checkerboard pattern that needs to be replaced with teal
 */

import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';

// Step 1: Process logo - replace dark checkerboard with teal
async function processLogo() {
  console.log('Processing logo to remove checkerboard...');

  const { data, info } = await sharp(logoPath).raw().toBuffer({ resolveWithObject: true });

  // Create RGBA buffer
  const newData = Buffer.alloc(info.width * info.height * 4);

  // Teal color to replace checkerboard
  const teal = { r: 30, g: 77, b: 92 }; // #1E4D5C

  for (let i = 0; i < info.width * info.height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];

    // Check if pixel is dark gray (checkerboard background)
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    const avg = (r + g + b) / 3;
    const isDarkGray = maxDiff < 15 && avg >= 30 && avg <= 55;

    if (isDarkGray) {
      // Replace with teal (matching cover background)
      newData[dstIdx] = teal.r;
      newData[dstIdx + 1] = teal.g;
      newData[dstIdx + 2] = teal.b;
      newData[dstIdx + 3] = 255;
    } else {
      // Keep original
      newData[dstIdx] = r;
      newData[dstIdx + 1] = g;
      newData[dstIdx + 2] = b;
      newData[dstIdx + 3] = 255;
    }
  }

  const cleanLogo = await sharp(newData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  await Bun.write('/tmp/images/logo-clean-teal.png', cleanLogo);
  console.log('✓ Clean logo saved: /tmp/images/logo-clean-teal.png');

  return '/tmp/images/logo-clean-teal.png';
}

// Step 2: Regenerate covers with clean logo
async function generateCovers(cleanLogoPath: string) {
  const badgePath = '/tmp/images/bestseller-faux-lenticular.png';

  // Dimensions
  const ebookWidth = 1600, ebookHeight = 2560;
  const printDPI = 300;
  const trimWidth = 6 * printDPI, trimHeight = 9 * printDPI;
  const spineWidth = 150, bleed = 38;
  const fullPrintWidth = trimWidth * 2 + spineWidth + bleed * 2;
  const fullPrintHeight = trimHeight + bleed * 2;

  // ========== EBOOK COVER ==========
  console.log('\nGenerating eBook cover...');

  const ebookSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ebookWidth} ${ebookHeight}" width="${ebookWidth}" height="${ebookHeight}">
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
    <filter id="goldEmboss" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-1" dy="-1" result="light"/>
      <feOffset in="blur" dx="1" dy="1" result="dark"/>
      <feFlood flood-color="#F5E6A8" flood-opacity="0.6" result="lightC"/>
      <feFlood flood-color="#6B5A2F" flood-opacity="0.8" result="darkC"/>
      <feComposite in="lightC" in2="light" operator="in" result="ls"/>
      <feComposite in="darkC" in2="dark" operator="in" result="ds"/>
      <feMerge><feMergeNode in="ds"/><feMergeNode in="ls"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#tealBg)"/>
  <g transform="translate(1350, 180)" fill="url(#goldText)" opacity="0.7">
    <polygon points="0,-20 5,-5 20,-5 8,5 12,20 0,12 -12,20 -8,5 -20,-5 -5,-5"/>
  </g>
  <text x="${ebookWidth/2}" y="750" font-family="Georgia, serif" font-size="145" font-weight="400"
        text-anchor="middle" fill="url(#goldText)" filter="url(#goldEmboss)" letter-spacing="12">CURLS &amp;</text>
  <text x="${ebookWidth/2}" y="900" font-family="Georgia, serif" font-size="125" font-weight="400"
        text-anchor="middle" fill="url(#goldText)" filter="url(#goldEmboss)" letter-spacing="8">CONTEMPLATION</text>
  <text x="${ebookWidth/2}" y="1020" font-family="Georgia, serif" font-size="48" font-style="italic"
        text-anchor="middle" fill="url(#goldText)" letter-spacing="3">A Stylist's Interactive Journey Journal</text>
  <text x="${ebookWidth/2}" y="2350" font-family="Georgia, serif" font-size="72" font-weight="400"
        text-anchor="middle" fill="url(#goldText)" filter="url(#goldEmboss)" letter-spacing="16">MICHAEL DAVID</text>
  <line x1="550" y1="2250" x2="1050" y2="2250" stroke="url(#goldText)" stroke-width="1" opacity="0.5"/>
  <g transform="translate(1150, 2340)" fill="url(#goldText)" opacity="0.8">
    <polygon points="0,-12 3,-3 12,-3 5,3 7,12 0,7 -7,12 -5,3 -12,-3 -3,-3"/>
  </g>
</svg>`;

  const ebookBase = new Resvg(ebookSvg, { background: '#1E4D5C' }).render().asPng();

  const logoBuffer = await Bun.file(cleanLogoPath).arrayBuffer();
  const badgeBuffer = await Bun.file(badgePath).arrayBuffer();

  const resizedLogo = await sharp(Buffer.from(logoBuffer))
    .resize(700, 700, { fit: 'contain', background: { r: 30, g: 77, b: 92, alpha: 1 } })
    .png().toBuffer();

  const resizedBadge = await sharp(Buffer.from(badgeBuffer))
    .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  const ebookFinal = await sharp(ebookBase)
    .composite([
      { input: resizedLogo, top: 1150, left: Math.floor((ebookWidth - 700) / 2) },
      { input: resizedBadge, top: 100, left: 100 }
    ]).png().toBuffer();

  await Bun.write('/tmp/images/ebook-cover-final.png', ebookFinal);
  console.log('✓ eBook cover: /tmp/images/ebook-cover-final.png (1600x2560)');

  // Version without badge
  const ebookNoBadge = await sharp(ebookBase)
    .composite([{ input: resizedLogo, top: 1150, left: Math.floor((ebookWidth - 700) / 2) }])
    .png().toBuffer();
  await Bun.write('/tmp/images/ebook-cover-no-badge.png', ebookNoBadge);
  console.log('✓ eBook cover (no badge): /tmp/images/ebook-cover-no-badge.png');

  // ========== PRINT COVER ==========
  console.log('\nGenerating POD print cover...');

  const cream = '#F5F0E1';
  const printSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullPrintWidth} ${fullPrintHeight}" width="${fullPrintWidth}" height="${fullPrintHeight}">
  <defs>
    <linearGradient id="tealBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A5A68"/><stop offset="50%" stop-color="#1E4D5C"/><stop offset="100%" stop-color="#173D4A"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5E6A8"/><stop offset="30%" stop-color="#E6D5A8"/><stop offset="70%" stop-color="#C9A961"/><stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>
    <linearGradient id="goldTextH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A68B4B"/><stop offset="50%" stop-color="#E6D5A8"/><stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>
    <filter id="goldEmboss" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-1" dy="-1" result="light"/><feOffset in="blur" dx="1" dy="1" result="dark"/>
      <feFlood flood-color="#F5E6A8" flood-opacity="0.6" result="lc"/><feFlood flood-color="#6B5A2F" flood-opacity="0.8" result="dc"/>
      <feComposite in="lc" in2="light" operator="in" result="ls"/><feComposite in="dc" in2="dark" operator="in" result="ds"/>
      <feMerge><feMergeNode in="ds"/><feMergeNode in="ls"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#tealBg)"/>

  <!-- BACK COVER -->
  <text x="${bleed + trimWidth/2}" y="${bleed + 200}" font-family="Georgia, serif" font-size="58" text-anchor="middle" fill="url(#goldText)" letter-spacing="2">ARE YOU READY TO BREAK</text>
  <text x="${bleed + trimWidth/2}" y="${bleed + 270}" font-family="Georgia, serif" font-size="58" text-anchor="middle" fill="url(#goldText)" letter-spacing="2">FREE FROM THE CHAIR?</text>
  <text font-family="Georgia, serif" font-size="32" fill="${cream}" opacity="0.95">
    <tspan x="${bleed + 100}" y="${bleed + 400}">You didn't become a hairstylist to work someone else's</tspan>
    <tspan x="${bleed + 100}" dy="50">dream. You became one to create transformations—starting</tspan>
    <tspan x="${bleed + 100}" dy="50">with your own.</tspan>
    <tspan x="${bleed + 100}" dy="80">CURLS &amp; CONTEMPLATION is the permission slip you've</tspan>
    <tspan x="${bleed + 100}" dy="50">been waiting for. Through 16 immersive chapters, quizzes, and</tspan>
    <tspan x="${bleed + 100}" dy="50">interactive worksheets, celebrity-trained stylist Michael David</tspan>
    <tspan x="${bleed + 100}" dy="50">guides you from salon employee to location-independent artist.</tspan>
  </text>
  <g font-family="Georgia, serif" font-size="30" fill="${cream}" opacity="0.9">
    <text x="${bleed + 120}" y="${bleed + 850}">✦  The psychology of conscious hairstyling that</text>
    <text x="${bleed + 160}" y="${bleed + 890}">builds unshakeable client loyalty</text>
    <text x="${bleed + 120}" y="${bleed + 950}">✦  Business strategies from industry icons</text>
    <text x="${bleed + 120}" y="${bleed + 1010}">✦  How to leverage AI and digital platforms</text>
    <text x="${bleed + 120}" y="${bleed + 1070}">✦  Self-care practices that prevent burnout</text>
    <text x="${bleed + 120}" y="${bleed + 1130}">✦  The art of building a legacy</text>
  </g>
  <text font-family="Georgia, serif" font-size="32" fill="${cream}" opacity="0.95">
    <tspan x="${bleed + 100}" y="${bleed + 1280}">This isn't another technique manual. It's a roadmap to</tspan>
    <tspan x="${bleed + 100}" dy="50">professional liberation—designed for the ambitious stylist</tspan>
    <tspan x="${bleed + 100}" dy="50">who knows they were meant for more.</tspan>
    <tspan x="${bleed + 100}" dy="80">Your hands hold the power to transform lives. Now it's time to</tspan>
    <tspan x="${bleed + 100}" dy="50">transform your own.</tspan>
  </text>
  <text font-family="Georgia, serif" font-size="26" fill="${cream}" opacity="0.8">
    <tspan x="${bleed + 100}" y="${bleed + 1650}" font-weight="bold">MICHAEL DAVID WARREN JR.</tspan>
    <tspan x="${bleed + 100}" dy="40">is a celebrity hairstylist and founder of a location-independent</tspan>
    <tspan x="${bleed + 100}" dy="35">practice spanning three continents. Connect:</tspan>
    <tspan x="${bleed + 100}" dy="35">michaeldavidhair.com | @michaeldavidhair</tspan>
  </text>
  <rect x="${bleed + 100}" y="${bleed + 1900}" width="400" height="250" fill="white" rx="5"/>
  <text x="${bleed + 300}" y="${bleed + 2040}" font-family="monospace" font-size="24" text-anchor="middle" fill="#333">ISBN BARCODE</text>

  <!-- SPINE -->
  <text transform="translate(${bleed + trimWidth + spineWidth/2 + 15}, ${fullPrintHeight/2}) rotate(-90)"
        font-family="Georgia, serif" font-size="42" text-anchor="middle" fill="url(#goldTextH)" letter-spacing="4">CURLS &amp; CONTEMPLATION</text>
  <text transform="translate(${bleed + trimWidth + spineWidth/2 + 15}, ${fullPrintHeight - 300}) rotate(-90)"
        font-family="Georgia, serif" font-size="32" text-anchor="middle" fill="url(#goldTextH)" letter-spacing="2">MICHAEL DAVID</text>

  <!-- FRONT COVER -->
  <g transform="translate(${bleed + trimWidth + spineWidth + trimWidth - 200}, ${bleed + 180})" fill="url(#goldText)" opacity="0.7">
    <polygon points="0,-20 5,-5 20,-5 8,5 12,20 0,12 -12,20 -8,5 -20,-5 -5,-5"/>
  </g>
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + 650}" font-family="Georgia, serif" font-size="120"
        text-anchor="middle" fill="url(#goldText)" filter="url(#goldEmboss)" letter-spacing="10">CURLS &amp;</text>
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + 800}" font-family="Georgia, serif" font-size="100"
        text-anchor="middle" fill="url(#goldText)" filter="url(#goldEmboss)" letter-spacing="6">CONTEMPLATION</text>
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + 920}" font-family="Georgia, serif" font-size="40" font-style="italic"
        text-anchor="middle" fill="url(#goldText)" letter-spacing="2">A Stylist's Interactive Journey Journal</text>
  <text x="${bleed + trimWidth + spineWidth + trimWidth/2}" y="${bleed + trimHeight - 180}" font-family="Georgia, serif" font-size="60"
        text-anchor="middle" fill="url(#goldText)" filter="url(#goldEmboss)" letter-spacing="14">MICHAEL DAVID</text>
  <line x1="${bleed + trimWidth + spineWidth + trimWidth/2 - 250}" y1="${bleed + trimHeight - 250}"
        x2="${bleed + trimWidth + spineWidth + trimWidth/2 + 250}" y2="${bleed + trimHeight - 250}"
        stroke="url(#goldText)" stroke-width="1" opacity="0.5"/>
  <g transform="translate(${bleed + trimWidth + spineWidth + trimWidth/2 + 320}, ${bleed + trimHeight - 190})" fill="url(#goldText)" opacity="0.8">
    <polygon points="0,-12 3,-3 12,-3 5,3 7,12 0,7 -7,12 -5,3 -12,-3 -3,-3"/>
  </g>
</svg>`;

  const printBase = new Resvg(printSvg, { background: '#1E4D5C' }).render().asPng();

  const printLogo = await sharp(Buffer.from(logoBuffer))
    .resize(580, 580, { fit: 'contain', background: { r: 30, g: 77, b: 92, alpha: 1 } })
    .png().toBuffer();

  const printBadge = await sharp(Buffer.from(badgeBuffer))
    .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  const frontCenterX = bleed + trimWidth + spineWidth + trimWidth/2;

  const printFinal = await sharp(printBase)
    .composite([
      { input: printLogo, top: bleed + 1050, left: Math.floor(frontCenterX - 290) },
      { input: printBadge, top: bleed + 80, left: bleed + trimWidth + spineWidth + 80 }
    ]).png().toBuffer();

  await Bun.write('/tmp/images/print-cover-final.png', printFinal);
  console.log('✓ Print cover (full wrap): /tmp/images/print-cover-final.png');
  console.log(`  Dimensions: ${fullPrintWidth} x ${fullPrintHeight} px`);

  // Front cover only
  const frontOnly = await sharp(printFinal)
    .extract({
      left: bleed + trimWidth + spineWidth,
      top: bleed,
      width: trimWidth,
      height: trimHeight
    }).png().toBuffer();

  await Bun.write('/tmp/images/print-front-cover.png', frontOnly);
  console.log('✓ Front cover only: /tmp/images/print-front-cover.png (1800x2700)');
}

// Main
console.log('=== FIXING LOGO & REGENERATING COVERS ===\n');
const cleanLogo = await processLogo();
await generateCovers(cleanLogo);
console.log('\n=== COMPLETE ===');
