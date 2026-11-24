import { Metadata } from 'next';

import Contents from '@/components/generic/Ai/Contents';
import Footer from '@/components/generic/Footer';

export const dynamic = 'force-dynamic';

const title = 'sRating | College sports data in Claude, ChatGPT and Codex';
const description = 'Ask Claude, ChatGPT, Codex or Cursor about college basketball and football, answered from srating.io data. ' +
  'Free MCP server, no account or API key.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: 'sRating.io in your AI assistant',
    description,
    images: ['/logo512.png'],
  },
  twitter: {
    card: 'summary',
    title: 'sRating.io in your AI assistant',
    description,
    images: ['/logo512.png'],
  },
};

const Page = () => {
  return (
    <div>
      <Contents />
      <Footer />
    </div>
  );
};

export default Page;
