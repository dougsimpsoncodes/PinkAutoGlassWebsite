import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StickyCallBar from "@/components/StickyCallBar";
import StickyCallbackBar from "@/components/StickyCallbackBar";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import TrackingProvider from "@/components/TrackingProvider";
import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pinkautoglass.com'),
  title: "Mobile Windshield Replacement Denver | Pink Auto Glass | Same Day Service",
  description: "Denver's #1 mobile auto glass service. We come to you! Windshield repair from professional service, replacement from professional service. Insurance handled. Same-day service. Call (720) 918-7465",
  keywords: "windshield replacement Denver, mobile auto glass Denver, windshield repair Denver, auto glass repair Denver, same day windshield replacement, insurance windshield replacement",
  alternates: {
    canonical: 'https://pinkautoglass.com',
  },
  openGraph: {
    title: "Mobile Windshield Replacement Denver | Pink Auto Glass",
    description: "Denver's #1 mobile auto glass service. Same-day repair & replacement. We handle your insurance.",
    url: "https://pinkautoglass.com",
    siteName: "Pink Auto Glass",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pink Auto Glass - Mobile Windshield Repair & Replacement Denver'
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Windshield Replacement Denver | Pink Auto Glass",
    description: "Denver's #1 mobile auto glass service. Same-day repair & replacement.",
    images: ['/og-image.png'],
  },
  verification: {
    // Get verification code from Google Search Console → Settings → Ownership verification
    // Set NEXT_PUBLIC_GSC_VERIFICATION in your environment variables (Vercel/hosting)
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
  },
  other: {
    // Technical SEO improvements
    'viewport': 'width=device-width, initial-scale=1, maximum-scale=5',
    'theme-color': '#ec4899',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <head>
          {/* Favicons */}
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

          {/* Google Analytics */}
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}
        </head>
        <body
          className={`${inter.variable} ${poppins.variable} antialiased`}
        >
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <StickyCallBar />
          <StickyCallbackBar />
          <AnalyticsTracker />
          <Suspense fallback={null}>
            <TrackingProvider />
          </Suspense>
          <Analytics />
        </body>
      </html>
  );
}
