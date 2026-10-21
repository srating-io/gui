import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Slug, { SlugType } from '@/components/helpers/Slug';

/**
 * Turn a legacy id url into its slug url with a real 308.
 *
 * Every entity page used to be addressed by its char(36) id. Those urls are bookmarked, indexed
 * and linked from outside, so they keep working -- but they must not keep *rendering*, or the same
 * page sits at two urls and the ranking it earns is split between them.
 *
 * This runs here rather than in the page for one reason: a server component can only redirect by
 * inserting a meta refresh once the response has started streaming, and a meta refresh is not a
 * 308. Proxy answers before the app is reached, so the status code is real.
 *
 * Cost on the normal path is a regex and nothing else. The api is only called when the segment
 * actually is an id, which is a visitor arriving on an old link, never a visitor clicking inside
 * the site.
 */

/** The url segment each route sits under, mapped to the api class behind it. */
const SEGMENT_X_TYPE: Record<string, SlugType> = {
  team: 'team',
  player: 'player',
  coach: 'coach',
  conference: 'conference',
  games: 'game',
};

const protocol = process.env.SERVER_PROTOCAL;
const hostname = process.env.SERVER_HOST;
const port = process.env.SERVER_PORT;
const secret = process.env.SERVER_SECRET;

/**
 * The row's slug, or '' when it has none yet.
 *
 * Deliberately its own fetch rather than `useServerAPI`: that module is `'use server'`, so
 * importing it here would make its exports server actions reachable from the browser, and its
 * failure reporting calls back into itself in a way an edge-of-the-app redirect should not own.
 */
const getSlug = async (type: SlugType, id: string): Promise<string> => {
  if (!protocol || !hostname || !port) {
    return '';
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (secret) {
    headers['X-SECRET-ID'] = secret;
  }

  try {
    const response = await fetch(`${protocol}://${hostname}:${port}`, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        class: type,
        function: 'get',
        arguments: { [`${type}_id`]: id },
      }),
    });

    const row = await response.json();

    return (row && typeof row.slug === 'string' && row.slug) || '';
  } catch (e) {
    // a failed lookup falls through to the page, which still renders off the id -- worse for seo
    // than a redirect, and much better than a 500 on a url someone has bookmarked
    console.log(e);
    return '';
  }
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // /[sport]/[segment]/[value]
  const parts = pathname.split('/').filter((part) => part);

  if (parts.length !== 3) {
    return NextResponse.next();
  }

  const [sport, segment, value] = parts;
  const type = SEGMENT_X_TYPE[segment];

  if (!type || !Slug.isId(value)) {
    return NextResponse.next();
  }

  const slug = await getSlug(type, value);

  if (!slug) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${sport}/${segment}/${slug}`;
  url.search = search;

  return NextResponse.redirect(url, 308);
}

export const config = {
  /**
   * Only the five entity routes, and only their third segment. Everything else -- the sport pages,
   * the static routes, _next, the public files -- never enters this function.
   */
  matcher: [
    '/:sport/team/:value',
    '/:sport/player/:value',
    '/:sport/coach/:value',
    '/:sport/conference/:value',
    '/:sport/games/:value',
  ],
};
