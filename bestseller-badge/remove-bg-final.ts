/**
 * Remove dark gray background from logo
 * Background is ~40-43 RGB (very dark gray)
 */
import sharp from 'sharp';

const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';

const { data, info } = await sharp(logoPath).raw().toBuffer({ resolveWithObject: true });
console.log('Processing:', info.width, 'x', info.height);

const newData = Buffer.alloc(info.width * info.height * 4);

function isDarkBackground(r: number, g: number, b: number): boolean {
  // Check if gray (similar R,G,B)
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 15) return false;

  // Check if dark (in the ~35-50 range)
  const avg = (r + g + b) / 3;
  return avg >= 30 && avg <= 55;
}

let removed = 0;
for (let i = 0; i < info.width * info.height; i++) {
  const srcIdx = i * 3;
  const dstIdx = i * 4;
  const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];

  if (isDarkBackground(r, g, b)) {
    newData[dstIdx] = newData[dstIdx + 1] = newData[dstIdx + 2] = newData[dstIdx + 3] = 0;
    removed++;
  } else {
    newData[dstIdx] = r;
    newData[dstIdx + 1] = g;
    newData[dstIdx + 2] = b;
    newData[dstIdx + 3] = 255;
  }
}

console.log(`Removed ${removed} background pixels`);

// Save transparent version
await sharp(newData, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile('/tmp/images/logo-final-transparent.png');

// Create on gold radial gradient background
const goldBg = await sharp({
  create: {
    width: info.width,
    height: info.height,
    channels: 4,
    background: { r: 200, g: 145, b: 30, alpha: 1 }
  }
}).png().toBuffer();

await sharp(goldBg)
  .composite([{
    input: '/tmp/images/logo-final-transparent.png',
    blend: 'over'
  }])
  .png()
  .toFile('/tmp/images/logo-final-gold.png');

console.log('Done! Files saved:');
console.log('- /tmp/images/logo-final-transparent.png');
console.log('- /tmp/images/logo-final-gold.png');
