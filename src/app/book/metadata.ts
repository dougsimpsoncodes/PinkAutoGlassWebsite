import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Auto Glass Service | Pink Auto Glass',
  description: 'Schedule mobile windshield repair or replacement in the Denver metro area. Fast quotes, insurance help, and lifetime warranty.',
  alternates: {
    canonical: 'https://pinkautoglass.com/book',
  },
  openGraph: {
    title: 'Book Auto Glass Service | Pink Auto Glass',
    description: 'Mobile windshield service. Fast quotes, insurance assistance, and lifetime warranty.',
    url: 'https://pinkautoglass.com/book',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pink Auto Glass - Book Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Auto Glass Service | Pink Auto Glass',
    description: 'Mobile windshield service in Denver. Fast quotes and insurance help.',
    images: ['/og-image.png'],
  },
};

