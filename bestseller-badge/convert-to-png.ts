/**
 * Convert SVG to PNG with transparent background
 */
import { Resvg } from '@resvg/resvg-js';

const svgPath = '/tmp/images/bestseller-badge.svg';
const svgPathWithLogo = '/tmp/images/bestseller-badge-with-logo.svg';

async function convertToPng(inputPath: string, outputPath: string) {
  const svgContent = await Bun.file(inputPath).text();

  const resvg = new Resvg(svgContent, {
    background: 'transparent',
    fitTo: {
      mode: 'width',
      value: 1000,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  await Bun.write(outputPath, pngBuffer);
  console.log(`PNG created: ${outputPath}`);
}

// Convert both SVGs
await convertToPng(svgPath, '/tmp/images/bestseller-badge.png');
console.log('\nPNG badge with transparent background created!');
