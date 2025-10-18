import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Book Windshield Repair & Replacement Denver | Pink Auto Glass",
  description: "Book your mobile windshield service in Denver. Same-day appointments available. Free insurance verification. 3-minute online booking.",
  keywords: "book windshield replacement denver, schedule auto glass repair, online booking windshield",
  alternates: {
    canonical: 'https://pinkautoglass.com/book',
  },
  openGraph: {
    title: "Book Windshield Service Denver | Pink Auto Glass",
    description: "Fast online booking for mobile windshield service. Same-day available.",
    url: "https://pinkautoglass.com/book",
    siteName: "Pink Auto Glass",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Windshield Service Denver | Pink Auto Glass",
    description: "Fast online booking for mobile windshield service. Same-day available.",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
