# Pink Auto Glass Favicon Implementation Guide

## Generated Assets

The following favicon and app icon assets are generated using the automated script:

### Favicon Files (in `/public/brand/`)
- `favicon-16.png` - 16x16px for browser tabs
- `favicon-32.png` - 32x32px for browser bookmarks  
- `favicon-48.png` - 48x48px for desktop shortcuts
- `apple-touch-icon-180.png` - 180x180px for iOS home screen
- `android-chrome-512.png` - 512x512px for Android app icons

### OG Image (in `/public/og/`)
- `og-default.png` - 1200x630px social media preview with Pink Auto Glass logo on navy background

## Generation Script

Run the automated generation script:

```bash
# Install dependencies first
npm install sharp

# Generate all brand images
node assets/scripts/generate-brand-images.mjs
```

### Script Features
- Reads source logo from `/assets/brand/pink-logo.png`
- Generates all required sizes automatically
- Creates navy background OG image with centered logo + tagline
- Validates output file dimensions and formats
- Provides helpful console output with file details

## HTML Implementation

### Complete Favicon Setup
Add these `<link>` tags to your HTML `<head>` section:

```html
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/public/brand/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/public/brand/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/public/brand/favicon-48.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/public/brand/apple-touch-icon-180.png">

<!-- Android Chrome Icon -->
<link rel="icon" type="image/png" sizes="512x512" href="/public/brand/android-chrome-512.png">

<!-- Web App Manifest (if using) -->
<link rel="manifest" href="/public/site.webmanifest">

<!-- Theme Color for Browser Chrome -->
<meta name="theme-color" content="#E85A8B">
<meta name="msapplication-TileColor" content="#0B1830">
```

### Next.js Implementation
For Next.js projects, place these in your `app/layout.tsx` or `pages/_document.tsx`:

```tsx
// In app/layout.tsx (App Router)
export const metadata = {
  icons: {
    icon: [
      { url: '/public/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/public/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/public/brand/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/public/brand/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/public/site.webmanifest',
  themeColor: '#E85A8B',
};
```

## File Size Requirements

### Favicon Specifications
| File | Size | Max Weight | Purpose |
|------|------|------------|---------|
| `favicon-16.png` | 16x16px | <2KB | Browser tabs |
| `favicon-32.png` | 32x32px | <4KB | Bookmarks, taskbar |
| `favicon-48.png` | 48x48px | <6KB | Desktop shortcuts |
| `apple-touch-icon-180.png` | 180x180px | <15KB | iOS home screen |
| `android-chrome-512.png` | 512x512px | <25KB | Android launchers |

### OG Image Specifications  
| File | Size | Max Weight | Purpose |
|------|------|------------|---------|
| `og-default.png` | 1200x630px | <150KB | Social media previews |

## Brand Compliance

### Color Usage
- **Navy background** (`#0B1830`) - Primary brand color for backgrounds
- **Pink logo** (`#E85A8B`) - Logo maintains brand pink color
- **White backgrounds** - Acceptable for favicon transparency

### Logo Treatment
- Logo maintains original aspect ratio across all sizes
- No distortion or cropping of logo elements
- Sufficient padding/clear space around logo
- Logo remains legible at smallest 16px size

## Testing Checklist

### Browser Testing
- [ ] Chrome: Favicon appears in tab and bookmarks
- [ ] Firefox: Favicon shows in address bar and tabs
- [ ] Safari: Favicon displays in tabs and bookmarks
- [ ] Edge: Favicon visible in browser chrome

### Mobile Testing
- [ ] iOS Safari: Apple touch icon shows when adding to home screen
- [ ] Android Chrome: Icon displays in app drawer when installed as PWA
- [ ] Mobile browsers: Theme color affects browser chrome

### Social Media Testing
- [ ] Facebook: OG image displays correctly in link previews
- [ ] Twitter: Large image card shows properly formatted preview
- [ ] LinkedIn: Professional preview with logo and tagline
- [ ] Slack: Link unfurling shows branded preview

## Performance Considerations

### Optimization
- All images use PNG format for quality and transparency
- File sizes optimized for fast loading
- WebP versions can be generated for modern browsers
- Icons are served with appropriate cache headers

### Preloading (Optional)
For critical favicon loading:
```html
<link rel="preload" as="image" href="/public/brand/favicon-32.png" type="image/png">
```

## Troubleshooting

### Common Issues

**Favicon not updating:**
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check file paths are correct (`/public/brand/...`)
- Verify file permissions and sizes

**Blurry icons on high-DPI displays:**
- Ensure 2x sizes are provided (32px for 16px display, etc.)
- Use vector SVG favicon for infinite scalability
- Test on Retina/high-DPI screens

**OG image not showing:**
- Validate file size is under 8MB (ideally <150KB)
- Ensure 1200x630 aspect ratio (1.91:1)
- Test with Facebook/Twitter debugger tools
- Check absolute URL paths

### Validation Tools
- **Favicon checker**: https://realfavicongenerator.net/favicon_checker
- **OG debugger**: https://developers.facebook.com/tools/debug/
- **Twitter validator**: https://cards-dev.twitter.com/validator

## Maintenance

### Regular Updates
- Regenerate icons when logo changes
- Update OG images for seasonal campaigns
- Test new browser versions for compatibility
- Monitor loading performance in analytics

### File Organization
```
/public/
  /brand/
    favicon-16.png
    favicon-32.png
    favicon-48.png
    apple-touch-icon-180.png
    android-chrome-512.png
  /og/
    og-default.png
    og-services-windshield.png (future)
    og-locations-denver.png (future)
```

This favicon implementation ensures Pink Auto Glass branding appears consistently across all browser environments and social media platforms while maintaining optimal performance and user experience.