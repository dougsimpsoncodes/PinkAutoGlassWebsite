# OG Image Setup

## Current Status

The site is configured to use `/og-image.png` (1200x630) as the default Open Graph image for social media sharing.

## Quick Start

### Option 1: Convert the Template SVG

We've included `og-image-default.svg` as a starting template:

**Using online converter** (easiest):
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `og-image-default.svg`
3. Set width to 1200px (height will auto-scale to 630px)
4. Download as `og-image.png`
5. Place in `/public/og-image.png`

**Using ImageMagick** (if installed):
```bash
convert -background none -resize 1200x630 og-image-default.svg og-image.png
```

**Using Inkscape** (if installed):
```bash
inkscape og-image-default.svg --export-png=og-image.png --export-width=1200 --export-height=630
```

### Option 2: Design Custom Image

For a more professional look, design a custom 1200x630 image using:
- **Canva**: Use "Facebook Post" template (1200x630)
- **Figma**: Create frame 1200x630px
- **Photoshop**: New document 1200x630px

**Design Guidelines**:
- Dimensions: 1200px × 630px (required)
- Format: PNG or JPG
- File size: <200KB (recommended)
- Safe zone: Keep important content within center 1200x600 area
- Text should be readable at small sizes
- Use high contrast
- Include:
  - Pink Auto Glass branding
  - Main service offering
  - Location (Denver)
  - Website URL

**Brand Colors**:
- Pink: #ec4899
- Navy: #1e293b
- Gray: #64748b
- Background: #f9fafb

## Verification

After adding `/public/og-image.png`, test with:

**Facebook Debugger**:
https://developers.facebook.com/tools/debug/
- Enter: https://pinkautoglass.com
- Click "Scrape Again"

**Twitter Card Validator**:
https://cards-dev.twitter.com/validator
- Enter: https://pinkautoglass.com
- Preview should show your image

**LinkedIn Inspector**:
https://www.linkedin.com/post-inspector/
- Enter: https://pinkautoglass.com

## Per-Page Images

To add custom OG images for specific pages (recommended for blog posts):

```typescript
// In any page's layout.tsx or page.tsx
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: '/og-images/specific-page.png',
        width: 1200,
        height: 630,
        alt: 'Page specific description'
      }
    ],
  },
};
```

## Todo

- [ ] Convert SVG template to PNG or create custom design
- [ ] Place final image at `/public/og-image.png`
- [ ] Test with Facebook Debugger
- [ ] Create per-post OG images for blog posts (optional but recommended)

## Resources

- [OG Image Best Practices](https://developers.facebook.com/docs/sharing/webmasters/images/)
- [Twitter Card Guidelines](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup)
- [Canva Template](https://www.canva.com/create/facebook-posts/) - 1200x630
