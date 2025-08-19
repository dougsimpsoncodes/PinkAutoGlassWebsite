# Pink Auto Glass - shadcn/ui Component Kit Specification

This document provides comprehensive specifications for all shadcn/ui components integrated with the Pink Auto Glass design system.

## Design System Foundation

### Brand Colors
- **Primary Red**: `#ef4444` (red-500)
- **Magenta**: `#ec4899` (pink-500) 
- **Brand Gradient**: `linear-gradient(135deg, #ef4444 0%, #ec4899 100%)`
- **Gray Scale**: Using neutral grays from 50-900
- **Semantic Colors**: Success (green), Warning (amber), Error (red), Info (blue)

### Typography
- **Display Font**: Poppins (headings, hero text)
- **UI Font**: Inter (interface text)
- **Mono Font**: Fira Code (code snippets)

### Spacing & Layout
- **Base Radius**: `0.625rem` (10px)
- **Component Padding**: 12px, 16px, 20px, 24px for xs, sm, md, lg
- **Focus Ring**: `ring-2 ring-red-500/20 ring-offset-2`

## Button Components

### Primary Button
```tsx
// Base classes
const primaryButton = cn(
  // Layout & Spacing
  "inline-flex items-center justify-center gap-2 px-6 py-3",
  "rounded-lg font-semibold text-base leading-6",
  
  // Brand Styling  
  "bg-gradient-to-r from-red-500 to-pink-500 text-white",
  "shadow-lg shadow-red-500/20",
  
  // Interactive States
  "hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5",
  "active:translate-y-0 active:shadow-lg active:shadow-red-500/20",
  "focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2",
  
  // Disabled State
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg",
  
  // Loading State
  "data-[loading=true]:cursor-wait",
  
  // Transitions
  "transition-all duration-200 ease-out"
)
```

### Outline Button
```tsx
const outlineButton = cn(
  // Layout & Spacing
  "inline-flex items-center justify-center gap-2 px-6 py-3",
  "rounded-lg font-semibold text-base leading-6",
  
  // Styling
  "bg-transparent border-2 border-red-500 text-red-500",
  
  // Interactive States
  "hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-500/20",
  "active:bg-red-600 active:border-red-600",
  "focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2",
  
  // Disabled State
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-500",
  
  // Transitions
  "transition-all duration-200 ease-out"
)
```

### Ghost Button
```tsx
const ghostButton = cn(
  // Layout & Spacing
  "inline-flex items-center justify-center gap-2 px-4 py-2",
  "rounded-lg font-medium text-sm leading-5",
  
  // Styling
  "bg-transparent text-gray-700 hover:bg-gray-100",
  
  // Interactive States
  "hover:text-red-500 active:bg-gray-200",
  "focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2",
  
  // Disabled State
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-700",
  
  // Transitions
  "transition-all duration-150 ease-out"
)
```

### Button Sizes
```tsx
// Size variants
const buttonSizes = {
  sm: "px-4 py-2 text-sm leading-5 rounded-md",
  md: "px-6 py-3 text-base leading-6 rounded-lg", // default
  lg: "px-8 py-4 text-lg leading-7 rounded-xl",
  xl: "px-10 py-5 text-xl leading-8 rounded-2xl"
}
```

### Accessibility
- **ARIA**: `role="button"`, `aria-disabled` for disabled state
- **Keyboard**: Space/Enter activation, focus management
- **Loading**: `aria-busy="true"` with loading state
- **Screen Reader**: Clear button text, no icon-only buttons without `aria-label`

## Badge/Chip Components

### Primary Badge
```tsx
const primaryBadge = cn(
  // Layout & Spacing
  "inline-flex items-center gap-1.5 px-3 py-1.5",
  "rounded-full text-sm font-medium leading-5",
  
  // Brand Styling
  "bg-gradient-to-r from-red-500 to-pink-500 text-white",
  "shadow-sm shadow-red-500/10",
  
  // Interactive (if clickable)
  "hover:shadow-md hover:shadow-red-500/20 transition-shadow duration-150"
)
```

### Outline Badge
```tsx
const outlineBadge = cn(
  // Layout & Spacing
  "inline-flex items-center gap-1.5 px-3 py-1.5",
  "rounded-full text-sm font-medium leading-5",
  
  // Styling
  "bg-transparent border border-red-500 text-red-500",
  
  // Interactive States
  "hover:bg-red-50 transition-colors duration-150"
)
```

### Semantic Badges
```tsx
const semanticBadges = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200", 
  error: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  neutral: "bg-gray-100 text-gray-800 border-gray-200"
}
```

### Chip (Interactive Badge)
```tsx
const chip = cn(
  // Layout & Spacing
  "inline-flex items-center gap-2 px-3 py-1.5",
  "rounded-full text-sm font-medium leading-5 cursor-pointer",
  
  // Styling
  "bg-gray-100 text-gray-700 border border-transparent",
  
  // Interactive States
  "hover:bg-gray-200 hover:scale-105",
  "active:scale-100 active:bg-gray-300",
  "focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-1",
  
  // Selected State
  "data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-red-500 data-[selected=true]:to-pink-500",
  "data-[selected=true]:text-white data-[selected=true]:shadow-sm data-[selected=true]:shadow-red-500/10",
  
  // Transitions
  "transition-all duration-150 ease-out"
)
```

## Card Components

### Base Card
```tsx
const baseCard = cn(
  // Layout & Spacing
  "bg-white rounded-2xl p-6",
  "border border-gray-200 shadow-lg",
  
  // Interactive States (if clickable)
  "hover:shadow-xl hover:-translate-y-1",
  "transition-all duration-200 ease-out",
  
  // Dark Mode
  "dark:bg-gray-900 dark:border-gray-800"
)
```

### Service Card
```tsx
const serviceCard = cn(
  // Layout & Spacing
  "group bg-white rounded-xl p-6",
  "border border-gray-100 shadow-md",
  
  // Interactive States
  "hover:shadow-xl hover:-translate-y-2 hover:border-red-200",
  "cursor-pointer",
  
  // Focus State
  "focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2",
  
  // Transitions
  "transition-all duration-300 ease-out"
)
```

### Quote Card
```tsx
const quoteCard = cn(
  // Layout & Spacing
  "relative bg-white rounded-xl p-8 max-w-lg",
  "border border-gray-100 shadow-lg",
  
  // Quote styling
  "before:content-['\"'] before:absolute before:top-4 before:left-6",
  "before:text-6xl before:text-red-500/20 before:font-serif before:leading-none",
  
  // Content spacing
  "[&>*:first-child]:relative [&>*:first-child]:z-10"
)
```

### Card Header/Content/Footer
```tsx
const cardHeader = "flex flex-col space-y-1.5 pb-6"
const cardTitle = "text-2xl font-bold leading-none tracking-tight text-gray-900"
const cardDescription = "text-sm text-gray-600"
const cardContent = "pt-0"
const cardFooter = "flex items-center pt-6"
```

## Input Components

### Text Input
```tsx
const textInput = cn(
  // Layout & Spacing
  "flex h-12 w-full px-4 py-3",
  "rounded-lg border border-gray-300 bg-white",
  "text-base placeholder:text-gray-500",
  
  // Interactive States
  "focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:ring-offset-0",
  "hover:border-gray-400",
  
  // Disabled State
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
  
  // Error State
  "data-[error=true]:border-red-500 data-[error=true]:ring-2 data-[error=true]:ring-red-500/20",
  
  // Transitions
  "transition-all duration-150 ease-out",
  
  // Dark Mode
  "dark:bg-gray-900 dark:border-gray-700 dark:text-white"
)
```

### Textarea
```tsx
const textarea = cn(
  // Layout & Spacing
  "flex min-h-[120px] w-full px-4 py-3",
  "rounded-lg border border-gray-300 bg-white",
  "text-base placeholder:text-gray-500 resize-none",
  
  // Interactive States
  "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
  "hover:border-gray-400",
  
  // Disabled State
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
  
  // Transitions
  "transition-all duration-150 ease-out"
)
```

### Select/Combobox
```tsx
const selectTrigger = cn(
  // Layout & Spacing
  "flex h-12 w-full items-center justify-between px-4 py-3",
  "rounded-lg border border-gray-300 bg-white",
  "text-base placeholder:text-gray-500",
  
  // Interactive States
  "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
  "hover:border-gray-400",
  "data-[state=open]:border-red-500 data-[state=open]:ring-2 data-[state=open]:ring-red-500/20",
  
  // Disabled State
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
  
  // Transitions
  "transition-all duration-150 ease-out"
)

const selectContent = cn(
  // Layout & Spacing
  "relative z-50 min-w-[8rem] overflow-hidden",
  "rounded-lg border border-gray-200 bg-white p-1 shadow-lg",
  
  // Animations
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
)

const selectItem = cn(
  // Layout & Spacing
  "relative flex cursor-default select-none items-center px-3 py-2",
  "rounded-md text-sm outline-none",
  
  // Interactive States
  "focus:bg-red-50 focus:text-red-600",
  "hover:bg-gray-50",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
)
```

### Input Labels & Helpers
```tsx
const label = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
const helperText = "text-sm text-gray-500 mt-1"
const errorText = "text-sm text-red-600 mt-1"
```

## Accordion Component

### Accordion Container
```tsx
const accordionRoot = "w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
```

### Accordion Item
```tsx
const accordionItem = cn(
  "border-b border-gray-100 last:border-b-0"
)
```

### Accordion Trigger
```tsx
const accordionTrigger = cn(
  // Layout & Spacing
  "flex flex-1 items-center justify-between px-6 py-5",
  "text-left text-lg font-semibold leading-7 text-gray-900",
  
  // Interactive States
  "hover:bg-gray-50 focus:bg-gray-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-inset",
  
  // Icon styling
  "[&[data-state=open]>svg]:rotate-180",
  
  // Transitions
  "transition-all duration-200 ease-out",
  "[&>svg]:transition-transform [&>svg]:duration-200"
)
```

### Accordion Content
```tsx
const accordionContent = cn(
  // Layout & Spacing
  "px-6 pb-5 text-gray-600 leading-relaxed",
  
  // Animations
  "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
  "overflow-hidden"
)
```

### Animation Keyframes (add to globals.css)
```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

## Tabs Component

### Tabs Container
```tsx
const tabsList = cn(
  // Layout & Spacing
  "inline-flex h-12 items-center justify-center rounded-lg p-1",
  "bg-gray-100 text-gray-600",
  
  // Grid layout for equal width tabs
  "grid w-full grid-cols-[number-of-tabs]"
)
```

### Tab Trigger
```tsx
const tabsTrigger = cn(
  // Layout & Spacing
  "inline-flex items-center justify-center px-4 py-2",
  "text-sm font-medium leading-5 rounded-md",
  
  // Default State
  "text-gray-600 hover:text-gray-900",
  
  // Active State
  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",
  
  // Focus State
  "focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2",
  
  // Disabled State
  "disabled:pointer-events-none disabled:opacity-50",
  
  // Transitions
  "transition-all duration-150 ease-out"
)
```

### Tab Content
```tsx
const tabsContent = cn(
  // Layout & Spacing
  "mt-6 ring-offset-background",
  
  // Focus State
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2"
)
```

## Toast Component

### Toast Container
```tsx
const toast = cn(
  // Layout & Spacing
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4",
  "overflow-hidden rounded-lg border border-gray-200 p-4 shadow-lg",
  "bg-white",
  
  // Animations
  "data-[swipe=cancel]:translate-x-0",
  "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
  "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
  "data-[swipe=move]:transition-none",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
  "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  
  // Transitions
  "transition-all"
)
```

### Toast Variants
```tsx
const toastVariants = {
  default: "bg-white border-gray-200 text-gray-900",
  destructive: "bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-600",
  success: "bg-green-50 border-green-200 text-green-900 [&>svg]:text-green-600",
  warning: "bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-600"
}
```

### Toast Elements
```tsx
const toastTitle = "text-sm font-semibold text-gray-900"
const toastDescription = "text-sm text-gray-600 mt-1"
const toastAction = cn(
  "inline-flex h-8 shrink-0 items-center justify-center rounded-md",
  "border border-gray-200 bg-transparent px-3 text-sm font-medium",
  "hover:bg-gray-50 focus:ring-2 focus:ring-red-500/20",
  "group-[.destructive]:border-red-300 group-[.destructive]:hover:border-red-400",
  "group-[.destructive]:hover:bg-red-50 group-[.destructive]:focus:ring-red-500/20"
)
```

## Sheet Component (Mobile Navigation)

### Sheet Overlay
```tsx
const sheetOverlay = cn(
  "fixed inset-0 z-50 bg-black/50",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
)
```

### Sheet Content
```tsx
const sheetContent = cn(
  // Layout & Positioning
  "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out",
  "data-[state=closed]:duration-300 data-[state=open]:duration-500",
  
  // Side variants
  "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4",
  "data-[side=right]:border-l data-[side=right]:sm:max-w-sm",
  
  "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4",
  "data-[side=left]:border-r data-[side=left]:sm:max-w-sm",
  
  "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:border-b",
  "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:border-t",
  
  // Animations
  "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
  "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  
  "data-[side=bottom]:slide-in-from-bottom data-[side=left]:slide-in-from-left",
  "data-[side=right]:slide-in-from-right data-[side=top]:slide-in-from-top",
  
  // Safe area for mobile
  "supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]"
)
```

### Sheet Header & Footer
```tsx
const sheetHeader = "flex flex-col space-y-2 text-center sm:text-left pb-4 border-b border-gray-100"
const sheetTitle = "text-lg font-semibold text-gray-900"
const sheetDescription = "text-sm text-gray-600"
const sheetFooter = "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-gray-100"
```

## Carousel Component

### Carousel Container
```tsx
const carousel = "relative w-full"
const carouselContent = cn(
  "flex touch-pan-x",
  // Smooth scrolling
  "scroll-smooth",
  // Hide scrollbar
  "scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
)
```

### Carousel Item
```tsx
const carouselItem = cn(
  "min-w-0 shrink-0 grow-0 basis-full",
  "pl-4" // spacing between items
)
```

### Carousel Controls
```tsx
const carouselPrevious = cn(
  "absolute left-4 top-1/2 -translate-y-1/2 z-10",
  "flex h-10 w-10 items-center justify-center rounded-full",
  "bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm",
  "hover:bg-white hover:shadow-md",
  "focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-150"
)

const carouselNext = cn(
  "absolute right-4 top-1/2 -translate-y-1/2 z-10",
  "flex h-10 w-10 items-center justify-center rounded-full",
  "bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm",
  "hover:bg-white hover:shadow-md",
  "focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-150"
)
```

### Carousel Indicators
```tsx
const carouselIndicators = "flex justify-center space-x-2 mt-4"
const carouselIndicator = cn(
  "h-2 w-2 rounded-full cursor-pointer transition-all duration-150",
  "bg-gray-300 hover:bg-gray-400",
  "data-[active=true]:bg-red-500 data-[active=true]:w-6"
)
```

## Accessibility Guidelines

### General Rules
1. **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
2. **Focus Management**: Visible focus indicators on all interactive elements
3. **Keyboard Navigation**: All components fully keyboard accessible
4. **Screen Readers**: Proper ARIA labels, roles, and states
5. **Motion**: Respect `prefers-reduced-motion` settings

### Component-Specific ARIA
```tsx
// Button
<button 
  aria-label="Primary action"
  aria-disabled={disabled}
  aria-busy={loading}
/>

// Badge
<span role="status" aria-label="Badge content">

// Card (if clickable)
<div role="button" tabIndex={0} aria-label="Card title">

// Input
<input 
  aria-describedby="helper-text error-text"
  aria-invalid={hasError}
  aria-required={required}
/>

// Accordion
<button 
  aria-expanded={isOpen}
  aria-controls="content-id"
  id="trigger-id"
/>
<div 
  id="content-id" 
  aria-labelledby="trigger-id"
  role="region"
/>

// Tabs
<div role="tablist">
  <button role="tab" aria-selected={isActive} aria-controls="panel-id">
  <div role="tabpanel" id="panel-id" aria-labelledby="tab-id">
</div>

// Toast
<div role="status" aria-live="polite" aria-atomic="true">
```

## Mobile Considerations

### Touch Targets
- Minimum 44px touch target size
- Adequate spacing between interactive elements (8px minimum)
- Larger padding on mobile for easier tapping

### Responsive Breakpoints
```tsx
const mobileFirst = {
  // Mobile: default styles
  sm: "sm:class", // 640px+
  md: "md:class", // 768px+
  lg: "lg:class", // 1024px+
  xl: "xl:class"  // 1280px+
}
```

### Mobile-Specific Classes
```tsx
// Safe area support
"supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]"

// Touch optimization  
"touch-manipulation"

// Scroll behavior
"overscroll-contain scroll-smooth"

// Text size adjustment
"text-size-adjust-none"
```

### Sheet/Dialog Mobile Behavior
- Full-screen on mobile (sm:max-w-sm for larger screens)
- Swipe-to-close gesture support
- Bottom sheet variant for mobile-first design
- Backdrop blur for iOS safari compatibility

## Integration Examples

### Complete Button Implementation
```tsx
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 focus-visible:ring-red-500/20",
        outline: "border-2 border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white focus-visible:ring-red-500/20",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-red-500 focus-visible:ring-gray-300"
      },
      size: {
        sm: "px-4 py-2 text-sm rounded-md",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg rounded-xl",
        xl: "px-10 py-5 text-xl rounded-2xl"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg" | "xl"
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        data-loading={loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <LoadingSpinner className="h-4 w-4" />}
        {children}
      </Comp>
    )
  }
)
```

## Header Component

The header serves as the primary navigation and incorporates the Pink Auto Glass logo with responsive behavior.

### Component Structure
```tsx
interface HeaderProps {
  className?: string;
  sticky?: boolean;
  transparent?: boolean;
}
```

### Tailwind Classes
```css
/* Base Header Container */
.header-base: "fixed top-0 left-0 right-0 z-50 transition-all duration-300"

/* Header States */
.header-default: "bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
.header-transparent: "bg-transparent"
.header-scrolled: "bg-white shadow-md"

/* Inner Container */
.header-container: "container mx-auto px-4 sm:px-6 lg:px-8"

/* Navigation Layout */
.header-nav: "flex items-center justify-between h-16 md:h-20"

/* Logo Wrapper */
.header-logo: "flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"

/* Logo Image */
.header-logo-img: "h-7 sm:h-8 md:h-9 w-auto"

/* Desktop Navigation */
.header-nav-desktop: "hidden md:flex items-center space-x-6 lg:space-x-8"

/* Nav Links */
.header-nav-link: "text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"

/* CTA Button */
.header-cta: "bg-gradient-to-r from-[#f0536d] via-[#ee6aa3] to-[#d946ef] text-white px-4 sm:px-6 py-2 rounded-md font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"

/* Mobile Menu Button */
.header-mobile-menu: "md:hidden p-2 text-gray-700 hover:text-pink-500 transition-colors"
```

### Implementation Example
```tsx
<header className={cn(
  "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
  scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
)}>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <nav className="flex items-center justify-between h-16 md:h-20">
      {/* Logo */}
      <Link 
        href="/" 
        className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
      >
        <img 
          src="/public/brand/pink-logo.png" 
          alt="Pink Auto Glass - Mobile Windshield Service Denver" 
          className="h-7 sm:h-8 md:h-9 w-auto"
          width={140}
          height={36}
        />
      </Link>
      
      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center space-x-6 lg:space-x-8">
        <li>
          <Link 
            href="/services" 
            className="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
          >
            Services
          </Link>
        </li>
        <li>
          <Link 
            href="/locations" 
            className="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
          >
            Locations
          </Link>
        </li>
        <li>
          <Link 
            href="/vehicles" 
            className="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
          >
            Vehicles
          </Link>
        </li>
        <li>
          <Link 
            href="/about" 
            className="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
          >
            About
          </Link>
        </li>
      </ul>
      
      {/* CTA Button */}
      <Link 
        href="/book?utm_source=header&utm_medium=cta&utm_campaign=header_primary"
        className="hidden sm:inline-flex bg-gradient-to-r from-[#f0536d] via-[#ee6aa3] to-[#d946ef] text-white px-4 sm:px-6 py-2 rounded-md font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
      >
        Schedule Now
      </Link>
      
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2 text-gray-700 hover:text-pink-500 transition-colors"
        aria-label="Open menu"
        onClick={() => setMobileMenuOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  </div>
</header>
```

### Mobile Considerations
- Logo height adjusts: 28px (mobile) → 32px (tablet) → 36px (desktop)
- Navigation hidden on mobile, replaced with hamburger menu
- CTA button hidden on smallest screens (< 640px)
- Touch targets minimum 44px height
- Sticky header with reduced height on scroll

### Accessibility
- Logo includes descriptive alt text
- Keyboard navigation support with visible focus states
- ARIA labels for interactive elements
- Skip navigation link support
- Semantic HTML structure

### States
- **Default**: White background with subtle transparency
- **Scrolled**: Solid white with shadow
- **Transparent**: For hero overlay usage
- **Mobile Open**: Full-screen navigation overlay

This specification provides production-ready component definitions that integrate seamlessly with the Pink Auto Glass brand identity while maintaining accessibility and mobile responsiveness standards.