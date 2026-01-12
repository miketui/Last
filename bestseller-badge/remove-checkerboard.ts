/**
 * Remove checkerboard background from logo and replace with transparency
 */
import sharp from 'sharp';

const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';

// Read and get raw pixel data
const image = sharp(logoPath);
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

console.log('Image info:', info);

// Create new buffer with alpha channel
const newData = Buffer.alloc(info.width * info.height * 4);

// Checkerboard colors (approximately)
const darkGray = { r: 68, g: 68, b: 68 };   // #444444
const lightGray = { r: 85, g: 85, b: 85 };  // #555555

function isCheckerboard(r: number, g: number, b: number): boolean {
  // Check if pixel is close to checkerboard gray colors
  const tolerance = 25;

  const isDark = Math.abs(r - darkGray.r) < tolerance &&
                 Math.abs(g - darkGray.g) < tolerance &&
                 Math.abs(b - darkGray.b) < tolerance;

  const isLight = Math.abs(r - lightGray.r) < tolerance &&
                  Math.abs(g - lightGray.g) < tolerance &&
                  Math.abs(b - lightGray.b) < tolerance;

  // Also check for near-equal RGB values (gray tones)
  const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
  const inGrayRange = r > 50 && r < 100 && g > 50 && g < 100 && b > 50 && b < 100;

  return (isDark || isLight || (isGray && inGrayRange));
}

for (let i = 0; i < info.width * info.height; i++) {
  const srcIdx = i * 3;  // RGB
  const dstIdx = i * 4;  // RGBA

  const r = data[srcIdx];
  const g = data[srcIdx + 1];
  const b = data[srcIdx + 2];

  if (isCheckerboard(r, g, b)) {
    // Make transparent
    newData[dstIdx] = 0;
    newData[dstIdx + 1] = 0;
    newData[dstIdx + 2] = 0;
    newData[dstIdx + 3] = 0; // Alpha = 0 (transparent)
  } else {
    // Keep original color
    newData[dstIdx] = r;
    newData[dstIdx + 1] = g;
    newData[dstIdx + 2] = b;
    newData[dstIdx + 3] = 255; // Alpha = 255 (opaque)
  }
}

// Create new image with alpha channel
const cleanedLogo = await sharp(newData, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4
  }
}).png().toBuffer();

await Bun.write('/tmp/images/logo-transparent.png', cleanedLogo);
console.log('Cleaned logo saved: /tmp/images/logo-transparent.png');

// Now create version on gold background
const goldBg = await sharp({
  create: {
    width: info.width,
    height: info.height,
    channels: 4,
    background: { r: 212, g: 160, b: 23, alpha: 1 }
  }
}).png().toBuffer();

const logoOnGold = await sharp(goldBg)
  .composite([{
    input: cleanedLogo,
    blend: 'over'
  }])
  .png()
  .toBuffer();

await Bun.write('/tmp/images/logo-clean-gold.png', logoOnGold);
console.log('Logo on gold saved: /tmp/images/logo-clean-gold.png');
