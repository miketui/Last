/**
 * FINAL FIX - Aggressively replace ALL gray pixels in logo with teal
 */

import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';
const teal = { r: 30, g: 77, b: 92 }; // #1E4D5C

async function fixLogo() {
  console.log('Aggressively fixing logo...');

  const { data, info } = await sharp(logoPath).raw().toBuffer({ resolveWithObject: true });
  const newData = Buffer.alloc(info.width * info.height * 4);

  let replaced = 0;
  for (let i = 0; i < info.width * info.height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];

    // Check if this is a "gray" pixel (not gold)
    // Gold pixels have: high R, medium G, lower B
    // Gray/checkerboard: R ≈ G ≈ B and all relatively dark

    const isGold = (r > 100 && g > 70 && r > b * 1.2); // Gold has warm bias
    const isGray = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
    const isDark = (r + g + b) / 3 < 120;

    if (isGray && isDark && !isGold) {
      // Replace with teal
      newData[dstIdx] = teal.r;
      newData[dstIdx + 1] = teal.g;
      newData[dstIdx + 2] = teal.b;
      newData[dstIdx + 3] = 255;
      replaced++;
    } else {
      newData[dstIdx] = r;
      newData[dstIdx + 1] = g;
      newData[dstIdx + 2] = b;
      newData[dstIdx + 3] = 255;
    }
  }

  console.log(`Replaced ${replaced} pixels with teal`);

  const fixed = await sharp(newData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  await Bun.write('/tmp/images/logo-fixed.png', fixed);
  return '/tmp/images/logo-fixed.png';
}

async function generateCovers(logoPath: string) {
  const badgePath = '/tmp/images/bestseller-faux-lenticular.png';

  // Load assets
  const logoBuffer = await Bun.file(logoPath).arrayBuffer();
  const badgeBuffer = await Bun.file(badgePath).arrayBuffer();

  // ============ EBOOK COVER (1600 x 2560) ============
  console.log('\nGenerating eBook cover...');

  const ebookW = 1600, ebookH = 2560;

  const ebookSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ebookW} ${ebookH}" width="${ebookW}" height="${ebookH}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A5A68"/><stop offset="50%" stop-color="#1E4D5C"/><stop offset="100%" stop-color="#173D4A"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5E6A8"/><stop offset="30%" stop-color="#E6D5A8"/><stop offset="70%" stop-color="#C9A961"/><stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>
    <filter id="emb"><feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b"/>
      <feOffset in="b" dx="-1" dy="-1" result="l"/><feOffset in="b" dx="1" dy="1" result="d"/>
      <feFlood flood-color="#F5E6A8" flood-opacity="0.5" result="lc"/><feFlood flood-color="#6B5A2F" flood-opacity="0.7" result="dc"/>
      <feComposite in="lc" in2="l" operator="in" result="ls"/><feComposite in="dc" in2="d" operator="in" result="ds"/>
      <feMerge><feMergeNode in="ds"/><feMergeNode in="ls"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g transform="translate(1380,180)" fill="url(#gold)" opacity="0.6"><polygon points="0,-18 4,-4 18,-4 7,4 11,18 0,11 -11,18 -7,4 -18,-4 -4,-4"/></g>
  <text x="${ebookW/2}" y="720" font-family="Georgia,serif" font-size="150" text-anchor="middle" fill="url(#gold)" filter="url(#emb)" letter-spacing="14">CURLS &amp;</text>
  <text x="${ebookW/2}" y="880" font-family="Georgia,serif" font-size="128" text-anchor="middle" fill="url(#gold)" filter="url(#emb)" letter-spacing="10">CONTEMPLATION</text>
  <text x="${ebookW/2}" y="1000" font-family="Georgia,serif" font-size="46" font-style="italic" text-anchor="middle" fill="url(#gold)" letter-spacing="2">A Stylist's Interactive Journey Journal</text>
  <text x="${ebookW/2}" y="2380" font-family="Georgia,serif" font-size="70" text-anchor="middle" fill="url(#gold)" filter="url(#emb)" letter-spacing="18">MICHAEL DAVID</text>
  <line x1="560" y1="2280" x2="1040" y2="2280" stroke="url(#gold)" stroke-width="1" opacity="0.4"/>
  <g transform="translate(1130,2370)" fill="url(#gold)" opacity="0.7"><polygon points="0,-10 3,-3 10,-3 4,3 6,10 0,6 -6,10 -4,3 -10,-3 -3,-3"/></g>
</svg>`;

  const ebookBase = new Resvg(ebookSvg, { background: '#1E4D5C' }).render().asPng();

  const logo600 = await sharp(Buffer.from(logoBuffer)).resize(650, 650, { fit: 'contain', background: { r: 30, g: 77, b: 92, alpha: 1 } }).png().toBuffer();
  const badge280 = await sharp(Buffer.from(badgeBuffer)).resize(280, 280).png().toBuffer();

  const ebook = await sharp(ebookBase).composite([
    { input: logo600, top: 1120, left: Math.floor((ebookW - 650) / 2) },
    { input: badge280, top: 90, left: 90 }
  ]).png().toBuffer();

  await Bun.write('/tmp/images/EBOOK-COVER-FINAL.png', ebook);
  console.log('✓ /tmp/images/EBOOK-COVER-FINAL.png (1600x2560)');

  // No badge version
  const ebookNoBadge = await sharp(ebookBase).composite([
    { input: logo600, top: 1120, left: Math.floor((ebookW - 650) / 2) }
  ]).png().toBuffer();
  await Bun.write('/tmp/images/EBOOK-COVER-NO-BADGE.png', ebookNoBadge);
  console.log('✓ /tmp/images/EBOOK-COVER-NO-BADGE.png');

  // ============ PRINT COVER (Full Wrap with Bleed) ============
  console.log('\nGenerating POD print cover...');

  const dpi = 300;
  const trimW = 6 * dpi, trimH = 9 * dpi; // 1800 x 2700
  const spine = 150, bleed = 38;
  const fullW = trimW * 2 + spine + bleed * 2; // 3826
  const fullH = trimH + bleed * 2; // 2776

  const cream = '#F5F0E1';

  const printSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullW} ${fullH}" width="${fullW}" height="${fullH}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A5A68"/><stop offset="50%" stop-color="#1E4D5C"/><stop offset="100%" stop-color="#173D4A"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5E6A8"/><stop offset="30%" stop-color="#E6D5A8"/><stop offset="70%" stop-color="#C9A961"/><stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>
    <linearGradient id="goldH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A68B4B"/><stop offset="50%" stop-color="#E6D5A8"/><stop offset="100%" stop-color="#A68B4B"/>
    </linearGradient>
    <filter id="emb"><feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b"/>
      <feOffset in="b" dx="-1" dy="-1" result="l"/><feOffset in="b" dx="1" dy="1" result="d"/>
      <feFlood flood-color="#F5E6A8" flood-opacity="0.5" result="lc"/><feFlood flood-color="#6B5A2F" flood-opacity="0.7" result="dc"/>
      <feComposite in="lc" in2="l" operator="in" result="ls"/><feComposite in="dc" in2="d" operator="in" result="ds"/>
      <feMerge><feMergeNode in="ds"/><feMergeNode in="ls"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>

  <!-- BACK COVER -->
  <text x="${bleed + trimW/2}" y="${bleed + 190}" font-family="Georgia,serif" font-size="56" text-anchor="middle" fill="url(#gold)" letter-spacing="2">ARE YOU READY TO BREAK</text>
  <text x="${bleed + trimW/2}" y="${bleed + 260}" font-family="Georgia,serif" font-size="56" text-anchor="middle" fill="url(#gold)" letter-spacing="2">FREE FROM THE CHAIR?</text>
  <text font-family="Georgia,serif" font-size="30" fill="${cream}" opacity="0.95">
    <tspan x="${bleed + 90}" y="${bleed + 380}">You didn't become a hairstylist to work someone else's</tspan>
    <tspan x="${bleed + 90}" dy="46">dream. You became one to create transformations—starting</tspan>
    <tspan x="${bleed + 90}" dy="46">with your own.</tspan>
    <tspan x="${bleed + 90}" dy="70">CURLS &amp; CONTEMPLATION is the permission slip you've</tspan>
    <tspan x="${bleed + 90}" dy="46">been waiting for. Through 16 immersive chapters, quizzes, and</tspan>
    <tspan x="${bleed + 90}" dy="46">interactive worksheets, celebrity-trained stylist Michael David</tspan>
    <tspan x="${bleed + 90}" dy="46">guides you from salon employee to location-independent artist.</tspan>
  </text>
  <g font-family="Georgia,serif" font-size="28" fill="${cream}" opacity="0.9">
    <text x="${bleed + 110}" y="${bleed + 820}">✦  The psychology of conscious hairstyling that</text>
    <text x="${bleed + 150}" y="${bleed + 856}">builds unshakeable client loyalty</text>
    <text x="${bleed + 110}" y="${bleed + 910}">✦  Business strategies from industry icons</text>
    <text x="${bleed + 110}" y="${bleed + 964}">✦  How to leverage AI and digital platforms</text>
    <text x="${bleed + 110}" y="${bleed + 1018}">✦  Self-care practices that prevent burnout</text>
    <text x="${bleed + 110}" y="${bleed + 1072}">✦  The art of building a legacy</text>
  </g>
  <text font-family="Georgia,serif" font-size="30" fill="${cream}" opacity="0.95">
    <tspan x="${bleed + 90}" y="${bleed + 1200}">This isn't another technique manual. It's a roadmap to</tspan>
    <tspan x="${bleed + 90}" dy="46">professional liberation—designed for the ambitious stylist</tspan>
    <tspan x="${bleed + 90}" dy="46">who knows they were meant for more.</tspan>
    <tspan x="${bleed + 90}" dy="70">Your hands hold the power to transform lives.</tspan>
    <tspan x="${bleed + 90}" dy="46">Now it's time to transform your own.</tspan>
  </text>
  <text font-family="Georgia,serif" font-size="24" fill="${cream}" opacity="0.8">
    <tspan x="${bleed + 90}" y="${bleed + 1580}" font-weight="bold">MICHAEL DAVID WARREN JR.</tspan>
    <tspan x="${bleed + 90}" dy="36">is a celebrity hairstylist and founder of a location-independent</tspan>
    <tspan x="${bleed + 90}" dy="32">practice spanning three continents. Connect:</tspan>
    <tspan x="${bleed + 90}" dy="32">michaeldavidhair.com | @michaeldavidhair</tspan>
  </text>
  <rect x="${bleed + 90}" y="${bleed + 1820}" width="380" height="230" fill="white" rx="4"/>
  <text x="${bleed + 280}" y="${bleed + 1950}" font-family="monospace" font-size="22" text-anchor="middle" fill="#333">ISBN BARCODE</text>

  <!-- SPINE -->
  <text transform="translate(${bleed + trimW + spine/2 + 12}, ${fullH/2}) rotate(-90)" font-family="Georgia,serif" font-size="40" text-anchor="middle" fill="url(#goldH)" letter-spacing="3">CURLS &amp; CONTEMPLATION</text>
  <text transform="translate(${bleed + trimW + spine/2 + 12}, ${fullH - 280}) rotate(-90)" font-family="Georgia,serif" font-size="30" text-anchor="middle" fill="url(#goldH)" letter-spacing="2">MICHAEL DAVID</text>

  <!-- FRONT COVER -->
  <g transform="translate(${bleed + trimW + spine + trimW - 180}, ${bleed + 160})" fill="url(#gold)" opacity="0.6"><polygon points="0,-18 4,-4 18,-4 7,4 11,18 0,11 -11,18 -7,4 -18,-4 -4,-4"/></g>
  <text x="${bleed + trimW + spine + trimW/2}" y="${bleed + 620}" font-family="Georgia,serif" font-size="115" text-anchor="middle" fill="url(#gold)" filter="url(#emb)" letter-spacing="10">CURLS &amp;</text>
  <text x="${bleed + trimW + spine + trimW/2}" y="${bleed + 760}" font-family="Georgia,serif" font-size="98" text-anchor="middle" fill="url(#gold)" filter="url(#emb)" letter-spacing="6">CONTEMPLATION</text>
  <text x="${bleed + trimW + spine + trimW/2}" y="${bleed + 870}" font-family="Georgia,serif" font-size="38" font-style="italic" text-anchor="middle" fill="url(#gold)" letter-spacing="2">A Stylist's Interactive Journey Journal</text>
  <text x="${bleed + trimW + spine + trimW/2}" y="${bleed + trimH - 160}" font-family="Georgia,serif" font-size="58" text-anchor="middle" fill="url(#gold)" filter="url(#emb)" letter-spacing="14">MICHAEL DAVID</text>
  <line x1="${bleed + trimW + spine + trimW/2 - 230}" y1="${bleed + trimH - 230}" x2="${bleed + trimW + spine + trimW/2 + 230}" y2="${bleed + trimH - 230}" stroke="url(#gold)" stroke-width="1" opacity="0.4"/>
  <g transform="translate(${bleed + trimW + spine + trimW/2 + 300}, ${bleed + trimH - 170})" fill="url(#gold)" opacity="0.7"><polygon points="0,-10 3,-3 10,-3 4,3 6,10 0,6 -6,10 -4,3 -10,-3 -3,-3"/></g>
</svg>`;

  const printBase = new Resvg(printSvg, { background: '#1E4D5C' }).render().asPng();

  const logoSmall = await sharp(Buffer.from(logoBuffer)).resize(540, 540, { fit: 'contain', background: { r: 30, g: 77, b: 92, alpha: 1 } }).png().toBuffer();
  const badgeSmall = await sharp(Buffer.from(badgeBuffer)).resize(220, 220).png().toBuffer();

  const fcx = bleed + trimW + spine + trimW / 2;

  const printFinal = await sharp(printBase).composite([
    { input: logoSmall, top: bleed + 1000, left: Math.floor(fcx - 270) },
    { input: badgeSmall, top: bleed + 70, left: bleed + trimW + spine + 70 }
  ]).png().toBuffer();

  await Bun.write('/tmp/images/PRINT-COVER-FULL.png', printFinal);
  console.log(`✓ /tmp/images/PRINT-COVER-FULL.png (${fullW}x${fullH})`);

  // Front only
  const frontOnly = await sharp(printFinal).extract({
    left: bleed + trimW + spine, top: bleed, width: trimW, height: trimH
  }).png().toBuffer();
  await Bun.write('/tmp/images/PRINT-FRONT-ONLY.png', frontOnly);
  console.log('✓ /tmp/images/PRINT-FRONT-ONLY.png (1800x2700)');
}

// RUN
console.log('=== FINAL COVER GENERATION ===\n');
const fixedLogo = await fixLogo();
await generateCovers(fixedLogo);

console.log('\n=== ALL COVERS COMPLETE ===');
console.log('\nFINAL FILES:');
console.log('  EBOOK:  /tmp/images/EBOOK-COVER-FINAL.png (1600x2560 - KDP ready)');
console.log('  EBOOK:  /tmp/images/EBOOK-COVER-NO-BADGE.png');
console.log('  PRINT:  /tmp/images/PRINT-COVER-FULL.png (3826x2776 - POD ready with bleed)');
console.log('  PRINT:  /tmp/images/PRINT-FRONT-ONLY.png (1800x2700)');
