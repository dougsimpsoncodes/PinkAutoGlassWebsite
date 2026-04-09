import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StickyCallbackBar from "@/components/StickyCallbackBar";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import GlobalPhoneTracker from "@/components/GlobalPhoneTracker";
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
  title: "Mobile Windshield Replacement CO & AZ | Pink Auto Glass",
  description: "Mobile windshield replacement across Colorado & Phoenix AZ. Same-day service, $0 deductible often, we come to you. Call (720) 918-7465.",
  keywords: "windshield replacement Denver, mobile auto glass Denver, windshield repair Denver, auto glass repair Denver, same day windshield replacement, insurance windshield replacement",
  alternates: {
    canonical: 'https://pinkautoglass.com',
  },
  openGraph: {
    title: "Mobile Windshield Replacement CO & AZ | Pink Auto Glass",
    description: "Mobile windshield replacement across Colorado & Phoenix AZ. Same-day service, $0 deductible often, we come to you.",
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
    title: "Mobile Windshield Replacement CO & AZ | Pink Auto Glass",
    description: "Mobile windshield replacement across Colorado & Phoenix AZ. Same-day service, $0 deductible often.",
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

        </head>
        <body
          className={`${inter.variable} ${poppins.variable} antialiased`}
        >
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
          {/* StickyCallBar removed — one bar only to reduce mobile friction */}
          <StickyCallbackBar />
          <AnalyticsTracker />
          <GlobalPhoneTracker />
          <Suspense fallback={null}>
            <TrackingProvider />
          </Suspense>
          <Analytics />

          {/* Microsoft Ads: Consent Mode + UET (combined to guarantee ordering) */}
          <Script
            id="ms-ads-uet"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.uetq=window.uetq||[];
                (function(w,d,t,r,u)
                {
                  var f,n,i;
                  w[u]=w[u]||[],f=function()
                  {
                    var o={ti:"343218744", enableAutoSpaTracking: true};
                    o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")
                  },
                  n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function()
                  {
                    var s=this.readyState;
                    s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)
                  },
                  i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)
                })
                (window,document,"script","//bat.bing.com/bat.js","uetq");
              `,
            }}
          />

          {/* Google Ads Conversion Tracking */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17667607828"
            strategy="afterInteractive"
          />
          <Script
            id="google-ads-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                var path = (window.location.pathname || '').toLowerCase();
                var isArizona = path.includes('/phoenix') || path.includes('-az') || path.includes('/arizona');
                var phoneConversionNumber = isArizona ? '(480) 712-7465' : '(720) 918-7465';
                gtag('config', 'AW-17667607828', {
                  'phone_conversion_number': phoneConversionNumber,
                  'phone_conversion_css_class': 'phone-tracking',
                  'allow_enhanced_conversions': true
                });
                gtag('config', 'G-F7WMMDK4H4', { page_path: window.location.pathname });
              `,
            }}
          />
        </body>
      </html>
  );
}
