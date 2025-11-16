const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'og-image-default.svg');
const pngPath = path.join(publicDir, 'og-image.png');

async function generateOGImage() {
  try {
    console.log('🎨 Generating OG image from SVG...\n');

    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Convert SVG to PNG at exactly 1200x630px
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png({
        quality: 100,
        compressionLevel: 9,
      })
      .toFile(pngPath);

    // Get file size
    const stats = fs.statSync(pngPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ OG image generated successfully!');
    console.log(`   File: ${pngPath}`);
    console.log(`   Size: ${fileSizeKB} KB`);
    console.log(`   Dimensions: 1200x630px\n`);

    // Also create WebP version for better performance
    const webpPath = path.join(publicDir, 'og-image.webp');
    await sharp(svgBuffer)
      .resize(1200, 630)
      .webp({ quality: 85 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const webpSizeKB = (webpStats.size / 1024).toFixed(2);

    console.log('✅ WebP version also created!');
    console.log(`   File: ${webpPath}`);
    console.log(`   Size: ${webpSizeKB} KB\n`);

    console.log('🎉 Done! Test your OG image at:');
    console.log('   https://www.opengraph.xyz/');
    console.log('   https://cards-dev.twitter.com/validator');
    console.log('   https://developers.facebook.com/tools/debug/');
  } catch (error) {
    console.error('❌ Error generating OG image:', error.message);
    process.exit(1);
  }
}

generateOGImage();
