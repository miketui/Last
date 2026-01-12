/**
 * Process the logo to replace checkerboard background with gold
 */
import sharp from 'sharp';

// Read the original logo
const logoPath = '/tmp/images/image-7k1q7F37Iu1cYr4TKMzIB.png';

// Create a gold background and composite the logo
const goldColor = { r: 212, g: 160, b: 23 }; // D4A017

// First, let's check the image
const metadata = await sharp(logoPath).metadata();
console.log('Image metadata:', metadata);

// Create a gold background with same dimensions
const goldBg = await sharp({
  create: {
    width: metadata.width!,
    height: metadata.height!,
    channels: 3,
    background: goldColor
  }
}).png().toBuffer();

// Composite logo over gold background
const processedLogo = await sharp(goldBg)
  .composite([{
    input: logoPath,
    blend: 'over'
  }])
  .png()
  .toBuffer();

await Bun.write('/tmp/images/logo-on-gold.png', processedLogo);
console.log('Logo on gold background created: /tmp/images/logo-on-gold.png');

// Now encode as base64 for SVG
const logoBase64 = processedLogo.toString('base64');
console.log('Base64 encoded, length:', logoBase64.length);

// Export for use in badge generator
export const processedLogoBase64 = logoBase64;
