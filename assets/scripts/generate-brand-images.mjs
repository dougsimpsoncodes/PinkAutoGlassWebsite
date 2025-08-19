#!/usr/bin/env node

/**
 * Pink Auto Glass Brand Image Generator
 * 
 * Generates favicons, app icons, and OG images from the source logo
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Brand colors from design tokens
const BRAND_COLORS = {
  pink: '#E85A8B',
  navy: '#0B1830',
  white: '#FFFFFF'
};

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  try {
    mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Generate favicon sizes from logo
 */
async function generateFavicons() {
  console.log('\n🎨 Generating favicons...');
  
  const logoPath = join(projectRoot, 'brand/pink-logo.png');
  const outputDir = join(projectRoot, '../public/brand');
  
  ensureDir(outputDir);
  
  try {
    // Read the source logo
    const logoBuffer = readFileSync(logoPath);
    console.log(`✓ Loaded source logo: ${logoPath}`);
    
    // Favicon sizes
    const faviconSizes = [
      { size: 16, name: 'favicon-16.png' },
      { size: 32, name: 'favicon-32.png' },
      { size: 48, name: 'favicon-48.png' }
    ];
    
    for (const { size, name } of faviconSizes) {
      await sharp(logoBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(join(outputDir, name));
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    // Apple Touch Icon
    await sharp(logoBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(join(outputDir, 'apple-touch-icon-180.png'));
    
    console.log('✓ Generated apple-touch-icon-180.png (180x180)');
    
    // Android Chrome Icon
    await sharp(logoBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(join(outputDir, 'android-chrome-512.png'));
    
    console.log('✓ Generated android-chrome-512.png (512x512)');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    throw error;
  }
}

/**
 * Generate OG image with logo and caption
 */
async function generateOGImage() {
  console.log('\n🖼️  Generating OG image...');
  
  const logoPath = join(projectRoot, 'brand/pink-logo.png');
  const outputDir = join(projectRoot, '../public/og');
  
  ensureDir(outputDir);
  
  try {
    // Read the source logo
    const logoBuffer = readFileSync(logoPath);
    
    // Create navy background (1200x630)
    const background = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: BRAND_COLORS.navy
      }
    })
    .png()
    .toBuffer();
    
    // Resize logo to fit (max 400px wide, maintain aspect)
    const resizedLogo = await sharp(logoBuffer)
      .resize(400, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();
    
    // Get logo dimensions for centering
    const logoMeta = await sharp(resizedLogo).metadata();
    const logoX = Math.round((1200 - logoMeta.width) / 2);
    const logoY = Math.round((630 - logoMeta.height) / 2) - 50; // Offset up for text
    
    // Create text overlay SVG
    const textSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <text x="600" y="500" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
              font-size="36" font-weight="600" fill="${BRAND_COLORS.white}" 
              text-anchor="middle" letter-spacing="0.5px">
          Next-day Mobile Windshield Service in Denver
        </text>
      </svg>
    `;
    
    // Composite background + logo + text
    const finalImage = await sharp(background)
      .composite([
        {
          input: resizedLogo,
          left: logoX,
          top: logoY
        },
        {
          input: Buffer.from(textSvg),
          left: 0,
          top: 0
        }
      ])
      .png({ quality: 90 })
      .toFile(join(outputDir, 'og-default.png'));
    
    console.log('✓ Generated og-default.png (1200x630)');
    console.log(`  Logo positioned at: ${logoX}, ${logoY}`);
    console.log(`  Logo size: ${logoMeta.width}x${logoMeta.height}`);
    
  } catch (error) {
    console.error('❌ Error generating OG image:', error.message);
    throw error;
  }
}

/**
 * Validate generated files
 */
async function validateGeneratedFiles() {
  console.log('\n🔍 Validating generated files...');
  
  const publicDir = join(projectRoot, '../public');
  const requiredFiles = [
    'brand/favicon-16.png',
    'brand/favicon-32.png', 
    'brand/favicon-48.png',
    'brand/apple-touch-icon-180.png',
    'brand/android-chrome-512.png',
    'og/og-default.png'
  ];
  
  let allValid = true;
  
  for (const file of requiredFiles) {
    try {
      const filePath = join(publicDir, file);
      const metadata = await sharp(filePath).metadata();
      
      console.log(`✓ ${file}: ${metadata.width}x${metadata.height} (${metadata.format})`);
      
      // Size validations
      if (file.includes('favicon-16') && (metadata.width !== 16 || metadata.height !== 16)) {
        console.error(`❌ ${file}: Wrong size, expected 16x16`);
        allValid = false;
      }
      if (file.includes('og-default') && (metadata.width !== 1200 || metadata.height !== 630)) {
        console.error(`❌ ${file}: Wrong size, expected 1200x630`);
        allValid = false;
      }
      
    } catch (error) {
      console.error(`❌ ${file}: Missing or invalid`);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log('\n✅ All brand images generated successfully!');
  } else {
    console.log('\n❌ Some files failed validation');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Pink Auto Glass Brand Image Generator');
  console.log('=====================================');
  
  try {
    await generateFavicons();
    await generateOGImage();
    await validateGeneratedFiles();
    
    console.log('\n📋 Next steps:');
    console.log('1. Add favicon links to <head> (see /design/brand/favicons.md)');
    console.log('2. Update OG image references in meta templates');
    console.log('3. Test favicon loading in multiple browsers');
    console.log('4. Validate OG image in social media debuggers');
    
  } catch (error) {
    console.error('\n💥 Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateFavicons, generateOGImage, validateGeneratedFiles };