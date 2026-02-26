import { Metadata } from 'next';
import ArizonaCityPage from '@/components/ArizonaCityPage';
import { getArizonaCity } from '@/data/arizonaCities';

const city = getArizonaCity('gilbert-az');

export const metadata: Metadata = {
  title: city.metadata.title,
  description: city.metadata.description,
  keywords: city.metadata.keywords,
  alternates: {
    canonical: `https://pinkautoglass.com/locations/${city.slug}`,
  },
  openGraph: {
    title: city.metadata.title,
    description: city.metadata.description,
    url: `https://pinkautoglass.com/locations/${city.slug}`,
    type: 'website',
  },
};

export default function Page() {
  return <ArizonaCityPage city={city} />;
}
