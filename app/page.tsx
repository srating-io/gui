import HomePage from './home-page';
import { Metadata } from 'next';

/**
 * https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
 */
const title = 'sRating | College basketball & football stats, rankings, picks';
const description = 'Free rankings, stats, live scores and live odds for college basketball and college football. Model-backed picks and a public API. No ads, open-source.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: 'sRating.io | College basketball & football rankings and picks',
    description,
    images: ['/logo512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sRating.io | College basketball & football rankings and picks',
    description,
    images: ['/logo512.png'],
  },
};

export default async function Page() {
  return <HomePage />;
}
