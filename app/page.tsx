import HomePage from './home-page';
import { Metadata } from 'next';

/**
 * https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
 */
const title = 'sRating | College basketball & football stats, rankings, projections';
const description = 'Free rankings, stats, live scores and win probability for every college basketball and football game. Elo-based projections, open-source, with a live accuracy page. No ads.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: 'sRating.io | College basketball & football rankings and projections',
    description,
    images: ['/logo512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sRating.io | College basketball & football rankings and projections',
    description,
    images: ['/logo512.png'],
  },
};

export default async function Page() {
  return <HomePage />;
}
