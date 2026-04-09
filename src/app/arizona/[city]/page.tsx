import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArizonaCityPage from '@/components/ArizonaCityPage';
import { getArizonaCity, getAllArizonaCitySlugs } from '@/data/arizonaCities';

interface ArizonaCityRouteProps {
  params: { city: string };
}

export function generateStaticParams() {
  return getAllArizonaCitySlugs().map((slug) => ({ city: slug }));
}

export async function generateMetadata({ params }: ArizonaCityRouteProps): Promise<Metadata> {
  try {
    const city = getArizonaCity(params.city);
    const newSlug = city.slug.replace(/-az$/, '');
    return {
      title: city.metadata.title,
      description: city.metadata.description,
      keywords: city.metadata.keywords,
      alternates: {
        canonical: `https://pinkautoglass.com/arizona/${newSlug}/`,
      },
      openGraph: {
        title: city.metadata.title,
        description: city.metadata.description,
        url: `https://pinkautoglass.com/arizona/${newSlug}/`,
        type: 'website',
      },
      robots: { index: false }, // Phase 1: noindex during coexistence
    };
  } catch {
    return { title: 'City Not Found' };
  }
}

export default function Page({ params }: ArizonaCityRouteProps) {
  try {
    const city = getArizonaCity(params.city);
    return <ArizonaCityPage city={city} />;
  } catch {
    notFound();
  }
}
