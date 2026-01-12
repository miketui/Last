/**
 * Remove checkerboard background using color range detection
 * The checkerboard alternates between dark gray (~68,68,68) and lighter gray (~85,85,85)
 */
import sharp from 'sharp';

const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';

// Read and get raw pixel data
const image = sharp(logoPath);
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

console.log('Processing image:', info.width, 'x', info.height);

// Create new buffer with alpha channel
const newData = Buffer.alloc(info.width * info.height * 4);

// Sample some pixels from corners to understand the checkerboard pattern
console.log('Corner samples:');
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    const idx = (y * info.width + x) * 3;
    console.log(`(${x},${y}): rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }
}

// The checkerboard is made of two specific gray colors
// We need to detect pixels that are gray (R≈G≈B) within a certain range
function isBackgroundGray(r: number, g: number, b: number): boolean {
  // Check if it's a gray color (R, G, B are similar)
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 20) return false; // Not gray enough

  // Check if in the checkerboard gray range (roughly 60-90)
  const avg = (r + g + b) / 3;
  return avg >= 55 && avg <= 95;
}

let transparentCount = 0;
let opaqueCount = 0;

for (let i = 0; i < info.width * info.height; i++) {
  const srcIdx = i * 3;
  const dstIdx = i * 4;

  const r = data[srcIdx];
  const g = data[srcIdx + 1];
  const b = data[srcIdx + 2];

  if (isBackgroundGray(r, g, b)) {
    // Make transparent
    newData[dstIdx] = 0;
    newData[dstIdx + 1] = 0;
    newData[dstIdx + 2] = 0;
    newData[dstIdx + 3] = 0;
    transparentCount++;
  } else {
    // Keep original
    newData[dstIdx] = r;
    newData[dstIdx + 1] = g;
    newData[dstIdx + 2] = b;
    newData[dstIdx + 3] = 255;
    opaqueCount++;
  }
}

console.log(`Transparent pixels: ${transparentCount}, Opaque: ${opaqueCount}`);

// Save with transparency
const cleanedLogo = await sharp(newData, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4
  }
}).png().toBuffer();

await Bun.write('/tmp/images/logo-transparent-v2.png', cleanedLogo);
console.log('Saved: /tmp/images/logo-transparent-v2.png');

// Create on gold background
const logoOnGold = await sharp({
  create: {
    width: info.width,
    height: info.height,
    channels: 4,
    background: { r: 200, g: 150, b: 30, alpha: 1 }
  }
})
.composite([{
  input: cleanedLogo,
  blend: 'over'
}])
.png()
.toBuffer();

await Bun.write('/tmp/images/logo-gold-v2.png', logoOnGold);
console.log('Saved: /tmp/images/logo-gold-v2.png');
