import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNeighborhood, getNeighborhoodsByCity } from '@/data/neighborhoods';
import NeighborhoodPage from '@/components/NeighborhoodPage';

const CITY_SLUG = 'colorado-springs';
const CITY_NAME = 'Colorado Springs';
const CITY_FOLDER = 'colorado-springs-co';

interface Props {
  params: Promise<{ neighborhood: string }>;
}

export async function generateStaticParams() {
  return getNeighborhoodsByCity(CITY_SLUG).map((n) => ({
    neighborhood: n.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighborhood: slug } = await params;
  const n = getNeighborhood(CITY_SLUG, slug);
  if (!n) return {};

  const title = `Auto Glass Repair ${n.name}, ${CITY_NAME} CO | Mobile Windshield Service | (720) 918-7465`;
  const description = `Auto glass repair & windshield replacement in ${n.name}, ${CITY_NAME} CO. Free mobile service to your location. Same-day appointments. Call (720) 918-7465.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://pinkautoglass.com/locations/${CITY_FOLDER}/${slug}`,
    },
    openGraph: {
      title: `Auto Glass Repair ${n.name}, ${CITY_NAME} CO | Mobile Windshield Service`,
      description,
      url: `https://pinkautoglass.com/locations/${CITY_FOLDER}/${slug}`,
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { neighborhood: slug } = await params;
  const n = getNeighborhood(CITY_SLUG, slug);
  if (!n) notFound();

  return <NeighborhoodPage neighborhood={n} />;
}
