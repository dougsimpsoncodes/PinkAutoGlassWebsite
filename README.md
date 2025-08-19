# Pink Auto Glass Website

Professional auto glass repair and replacement website for Denver Metro area. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized for speed and SEO
- **Testing**: Comprehensive Playwright test suite
- **CI/CD**: Automated testing and deployment pipeline

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pinkautoglasswebsite
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Playwright tests
- `npm run generate-brand` - Generate brand assets

## Testing

Run the complete test suite:
```bash
npm run test
```

Run tests in headed mode for debugging:
```bash
npx playwright test --headed
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `.next` folder to your hosting provider

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SITE_URL` - Site base URL
- `NEXT_PUBLIC_PHONE` - Business phone number
- `NEXT_PUBLIC_EMAIL` - Business email

## Architecture

```
src/
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
└── lib/          # Utility functions

public/           # Static assets
tests/           # Playwright test files
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Create pull request

## License

Private - Pink Auto Glass
