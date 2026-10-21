/**
 * Where this instance lives, for the urls that have to be absolute.
 *
 * Canonical tags, open graph images and sitemap entries all need a full url; a relative one either
 * resolves against the wrong host or is ignored. This is the one place that answers it, read from
 * the environment so a preview deploy does not advertise production urls as its canonical.
 */

const PRODUCTION = 'https://srating.io';

/**
 * The site's own origin, with no trailing slash.
 */
export const getSiteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    return 'http://localhost:3000';
  }

  return PRODUCTION;
};

/**
 * An absolute url for a path this app owns.
 */
export const getAbsoluteUrl = (path: string): string => {
  if (!path) {
    return getSiteUrl();
  }

  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
};
