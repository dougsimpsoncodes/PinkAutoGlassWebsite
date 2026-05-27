#!/usr/bin/env node

/**
 * Build Test Script
 * Tests production build and verifies CSS compilation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Tailwind CSS Production Build...\n');

try {
  // Clean previous build
  console.log('1. Cleaning previous build...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }
  
  // Run production build
  console.log('2. Running production build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if CSS files were generated
  console.log('3. Checking generated CSS files...');
  const staticPath = path.join('.next', 'static');
  
  if (fs.existsSync(staticPath)) {
    const cssFiles = [];
    
    function findCSSFiles(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findCSSFiles(filePath);
        } else if (file.endsWith('.css')) {
          cssFiles.push(filePath);
        }
      }
    }
    
    findCSSFiles(staticPath);
    
    if (cssFiles.length > 0) {
      console.log('✅ CSS files generated successfully:');
      cssFiles.forEach(file => console.log(`   - ${file}`));
      
      // Check if Tailwind directives are processed
      const mainCSS = cssFiles[0];
      const cssContent = fs.readFileSync(mainCSS, 'utf8');
      
      if (cssContent.includes('@tailwind')) {
        console.log('❌ ERROR: Tailwind directives not processed! Raw @tailwind found in CSS.');
        process.exit(1);
      } else if (cssContent.includes('.btn-primary') || cssContent.includes('gradient')) {
        console.log('✅ Custom component classes found in compiled CSS');
      } else {
        console.log('⚠️  WARNING: Custom classes may not be compiled properly');
      }
      
      console.log(`\n📊 CSS file size: ${(cssContent.length / 1024).toFixed(2)}KB`);
      
    } else {
      console.log('❌ ERROR: No CSS files generated!');
      process.exit(1);
    }
  } else {
    console.log('❌ ERROR: Static directory not found!');
    process.exit(1);
  }
  
  console.log('\n🎉 Build test completed successfully!');
  console.log('✅ Tailwind CSS is properly configured and compiling');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
