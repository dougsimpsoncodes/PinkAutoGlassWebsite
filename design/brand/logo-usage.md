# Pink Auto Glass Logo Usage Guidelines

## Logo File Location
- Primary logo: `/assets/brand/pink-logo.png`
- Public assets: `/public/brand/pink-logo.png`

## Brand Colors (Extracted from Logo)
- **Brand Pink**: `#E85A8B` - The vibrant pink used in the "Pink" script and underline
- **Brand Navy**: `#0B1830` - The deep navy blue background
- **Primary Gradient**: `linear-gradient(135deg, #f0536d 0%, #ee6aa3 60%, #d946ef 100%)` - Softened gradient for CTAs

## Clear Space Requirements
The minimum clear space around the logo must be equal to the height of the "k" bowl in "Pink" (approximately 20% of total logo height).

```
┌─────────────────────────────────┐
│         [clear space]           │
│  ┌───────────────────────┐      │
│  │    Pink Auto Glass    │      │
│  └───────────────────────┘      │
│         [clear space]           │
└─────────────────────────────────┘
```

## Size Specifications

### Header Logo
- **Desktop**: Height 32px (max 36px)
- **Mobile**: Height 28px (max 32px)
- **Minimum height**: 24px (below this, legibility is compromised)

### Footer Logo
- **Desktop**: Height 28px
- **Mobile**: Height 24px

### Favicon
- 16x16px, 32x32px, 48x48px versions
- Use simplified "P" mark for smaller sizes

### Open Graph (Social Media)
- Logo on navy background: 1200x630px
- Logo height: 120px centered

### Email Header
- Height: 48px
- Background: White or Brand Navy
- Padding: 24px vertical, 32px horizontal

## Background Rules

### Approved Backgrounds
✅ **Brand Navy** (`#0B1830`) - Primary usage
✅ **White** (`#FFFFFF`) - Secondary usage
✅ **Light gray** (`#F9FAFB`) - Acceptable for cards/sections

### Prohibited Backgrounds
❌ **Never place on pink/red backgrounds** - Poor contrast with pink text
❌ **Never place on gradients** - Reduces logo clarity
❌ **Never place on busy images** - Use overlay or solid background
❌ **Never place on medium grays** - Insufficient contrast

## Aspect Ratio & Integrity

### Maintain Proportions
- **Always maintain original aspect ratio** (approximately 3.5:1)
- **Never stretch or compress** the logo
- **Never rotate** the logo
- **Never separate** the script "Pink" from "AUTO GLASS"
- **Never alter colors** - Use as-is from source file

### Correct Implementation
```html
<!-- Correct: Maintains aspect ratio -->
<img src="/public/brand/pink-logo.png" 
     alt="Pink Auto Glass" 
     height="32" 
     style="width: auto;">

<!-- Incorrect: Forces wrong dimensions -->
<img src="/public/brand/pink-logo.png" 
     alt="Pink Auto Glass" 
     width="200" 
     height="50">  <!-- Wrong aspect ratio -->
```

## Placement Map

### Header
- **Position**: Top left, aligned with container edge
- **Alignment**: Middle vertical alignment with navigation
- **Link**: Always links to homepage "/"
- **Accessibility**: Include proper alt text

```html
<header class="bg-white border-b">
  <div class="container mx-auto px-4 h-16 flex items-center">
    <a href="/" class="flex-shrink-0">
      <img src="/public/brand/pink-logo.png" 
           alt="Pink Auto Glass - Mobile Windshield Service Denver" 
           height="32" 
           class="h-8 w-auto">
    </a>
    <!-- Navigation here -->
  </div>
</header>
```

### Footer
- **Position**: Left aligned or centered (mobile)
- **Size**: Smaller than header (24-28px height)
- **Context**: Include company info nearby

```html
<footer class="bg-navy-900">
  <div class="container mx-auto px-4 py-8">
    <img src="/public/brand/pink-logo.png" 
         alt="Pink Auto Glass" 
         height="24" 
         class="h-6 w-auto mb-4">
    <p class="text-white">© 2024 Pink Auto Glass. All rights reserved.</p>
  </div>
</footer>
```

### Mobile Navigation
- **Collapsed state**: Logo only, centered or left-aligned
- **Height**: 28px maximum
- **Touch target**: Minimum 44x44px clickable area

### Invoice/Documents
- **Position**: Top left of document
- **Height**: 48-60px
- **Background**: Always white

### Vehicle Wraps
- **Maintain clear space**: 2x normal clear space
- **Background**: Solid white or navy panel behind logo
- **Size**: Minimum 12 inches wide

## Contrast Requirements

### WCAG AA Compliance
- Pink on Navy: **Contrast ratio 4.6:1** ✅ (Passes AA)
- Pink on White: **Contrast ratio 3.2:1** ⚠️ (Use for decorative only)
- Navy text on White: **Contrast ratio 15.8:1** ✅ (Passes AAA)

### Focus States
When logo is interactive (linked), ensure focus indicator:
```css
.logo-link:focus-visible {
  outline: 2px solid #E85A8B;
  outline-offset: 4px;
  border-radius: 4px;
}
```

## File Formats & Optimization

### Web Usage
- **Format**: PNG with transparency
- **Optimization**: Use TinyPNG or similar
- **Lazy loading**: Not recommended for header logo
- **Preload**: Recommended for critical rendering

```html
<link rel="preload" as="image" href="/public/brand/pink-logo.png">
```

### Print Usage
- **Format**: Vector (SVG) when available
- **Resolution**: 300 DPI minimum
- **Color space**: CMYK for professional printing

## Implementation Checklist

- [ ] Logo height within specified range
- [ ] Clear space maintained
- [ ] Correct background color used
- [ ] Aspect ratio preserved
- [ ] Alt text included
- [ ] Focus state implemented (if interactive)
- [ ] File optimized for web
- [ ] Contrast requirements met
- [ ] Mobile size adjusted appropriately
- [ ] Proper semantic HTML used

## Common Mistakes to Avoid

1. **Don't recreate the logo** with CSS/fonts - always use image file
2. **Don't apply filters** or effects (shadows, glows, etc.)
3. **Don't outline or add borders** around the logo
4. **Don't use as a pattern** or repeated background
5. **Don't animate the logo** except for subtle page load effects
6. **Don't crop** any part of the logo
7. **Don't change opacity** below 100%

## Questions?

For brand usage questions or to request additional logo formats, contact the Pink Auto Glass brand team.