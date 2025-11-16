const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Images to convert (excluding small favicons and temp files)
const imagesToConvert = [
  'pink-logo-original.png',
  'pink-logo-horizontal-original.png',
  'pink-logo.png',
  'pink-logo-horizontal.png',
  'pink-logo-horizontal-1200x300.png',
  'android-chrome-512x512.png',
  'android-chrome-192x192.png',
  'apple-touch-icon.png',
  'breast-cancer-awareness-logo.png',
];

async function convertToWebP() {
  console.log('🔄 Starting WebP conversion...\n');

  for (const imageName of imagesToConvert) {
    const inputPath = path.join(publicDir, imageName);
    const outputPath = inputPath.replace(/\.png$/, '.webp');

    // Skip if input doesn't exist
    if (!fs.existsSync(inputPath)) {
      console.log(`⏭️  Skipped ${imageName} (not found)`);
      continue;
    }

    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSizeKB = (originalStats.size / 1024).toFixed(2);

      // Convert to WebP
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);

      // Get new file size
      const newStats = fs.statSync(outputPath);
      const newSizeKB = (newStats.size / 1024).toFixed(2);
      const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);

      console.log(`✅ ${imageName}`);
      console.log(`   Original: ${originalSizeKB} KB → WebP: ${newSizeKB} KB (${savings}% smaller)\n`);
    } catch (error) {
      console.error(`❌ Error converting ${imageName}:`, error.message);
    }
  }

  console.log('🎉 WebP conversion complete!');
}

convertToWebP().catch(console.error);
