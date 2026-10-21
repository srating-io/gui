import { generateSitemaps } from '../sitemaps/sitemap';
import { getAbsoluteUrl } from '@/components/helpers/Site';

export async function GET() {
  const sitemaps = await generateSitemaps();

  const entries = sitemaps
    .map(({ id }) => `  <sitemap>\n    <loc>${getAbsoluteUrl(`/sitemaps/sitemap/${id}.xml`)}</loc>\n  </sitemap>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
