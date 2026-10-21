import type { MetadataRoute } from 'next';
import { useServerAPI } from '@/components/serverAPI';
import Slug, { SlugType } from '@/components/helpers/Slug';
import { getAbsoluteUrl } from '@/components/helpers/Site';
import {
  DEFAULT_CBB_ID,
  DEFAULT_CBB_SEASON,
  DEFAULT_CFB_ID,
  DEFAULT_CFB_SEASON,
  DEFAULT_D1_DIVISION_ID,
  DEFAULT_FBS_DIVISION_ID,
  DEFAULT_NBA_DIVISION_ID,
  DEFAULT_NBA_ID,
  DEFAULT_NBA_SEASON,
} from '@/components/helpers/Defaults';
import type { Sitemap } from '@srating-io/types';

/**
 * The sitemap, sharded.
 *
 * This is the only discovery path most of the site has. The ranking and scores pages load their
 * rows in the browser, so a crawler reading the server html finds no links to the team, player,
 * coach or game pages behind them -- without this file those pages are unreachable, however good
 * their urls are.
 *
 * Shards are named rather than numbered (`/sitemaps/sitemap/cbb-player-0.xml`) so that each shard is
 * self-describing: `generateSitemaps` needs the row counts to know how many shards exist, but the
 * shard itself does not, so a count that moves between the two calls cannot leave a shard pointing
 * at the wrong slice.
 */

/** Google's cap is 50,000 urls per file; leave headroom for a season's worth of growth. */
const PAGE_SIZE = 45000;

/** Only the division each sport's routes actually resolve to -- the url carries no division. */
const SPORTS = [
  {
    sport: 'cbb',
    organization_id: DEFAULT_CBB_ID,
    division_id: DEFAULT_D1_DIVISION_ID,
    season: DEFAULT_CBB_SEASON,
  },
  {
    sport: 'cfb',
    organization_id: DEFAULT_CFB_ID,
    division_id: DEFAULT_FBS_DIVISION_ID,
    season: DEFAULT_CFB_SEASON,
  },
  {
    sport: 'nba',
    organization_id: DEFAULT_NBA_ID,
    division_id: DEFAULT_NBA_DIVISION_ID,
    season: DEFAULT_NBA_SEASON,
  },
];

/**
 * Entity kinds, and whether a shard of them can overflow one file.
 *
 * Teams, conferences and coaches are in the hundreds, so one shard each. Players and games are in
 * the tens of thousands and are paged.
 */
const KINDS: { type: SlugType; paged: boolean }[] = [
  { type: 'team', paged: false },
  { type: 'conference', paged: false },
  { type: 'coach', paged: false },
  { type: 'player', paged: true },
  { type: 'game', paged: true },
];

/**
 * How far back the game shards reach.
 *
 * Every season ever played would be mostly pages nobody searches for, and crawl budget spent on
 * them is budget not spent on this season's.
 */
const GAME_SEASONS_BACK = 2;

const gameSeasons = (season: number): number[] => {
  const seasons: number[] = [];

  for (let i = 0; i <= GAME_SEASONS_BACK; i++) {
    seasons.push(season - i);
  }

  return seasons;
};

const getCount = async (
  type: SlugType,
  organization_id: string,
  division_id: string,
  seasons: number[] | undefined,
): Promise<number> => {
  const args: Sitemap.getCountsArguments = { type, organization_id, division_id };

  if (seasons) {
    (args as Sitemap.getSlugsArguments).seasons = seasons;
  }

  const result = await useServerAPI({
    class: 'sitemap',
    function: 'getCounts',
    arguments: args,
    // the shard list changes about as often as the schedule does
    cache: 60 * 60 * 6,
  });

  return (result && typeof result.count === 'number' && result.count) || 0;
};

export async function generateSitemaps() {
  const ids: { id: string }[] = [];

  // the paged kinds, each with the count request it needs. gathered first so the counts for all
  // three sports go out together rather than one round trip at a time
  const counting: { sport: string; type: SlugType; count: Promise<number> }[] = [];

  for (const { sport, organization_id, division_id, season } of SPORTS) {
    ids.push({ id: `${sport}-pages` });

    for (const { type, paged } of KINDS) {
      if (!paged) {
        ids.push({ id: `${sport}-${type}` });
        continue;
      }

      const seasons = type === 'game' ? gameSeasons(season) : undefined;

      counting.push({
        sport,
        type,
        count: getCount(type, organization_id, division_id, seasons),
      });
    }
  }

  const counts = await Promise.all(counting.map((row) => row.count));

  counting.forEach(({ sport, type }, i) => {
    const shards = Math.max(Math.ceil(counts[i] / PAGE_SIZE), 1);

    for (let page = 0; page < shards; page++) {
      ids.push({ id: `${sport}-${type}-${page}` });
    }
  });

  return ids;
}

export default async function sitemap(
  { id }: { id: Promise<string> | string },
): Promise<MetadataRoute.Sitemap> {
  const shard = String(await id);
  const [sport, kind, page] = shard.split('-');

  const target = SPORTS.find((row) => row.sport === sport);

  if (!target) {
    return [];
  }

  if (kind === 'pages') {
    // the sport's own pages. priority is relative within the site, which is all a crawler reads it
    // as -- the ranking page is the one that changes daily and earns the most traffic
    return [
      { url: getAbsoluteUrl(`/${sport}/ranking`), changeFrequency: 'daily', priority: 1 },
      { url: getAbsoluteUrl(`/${sport}/games`), changeFrequency: 'daily', priority: 0.9 },
      { url: getAbsoluteUrl(`/${sport}/projections`), changeFrequency: 'daily', priority: 0.8 },
      { url: getAbsoluteUrl(`/${sport}/compare`), changeFrequency: 'weekly', priority: 0.5 },
    ];
  }

  const type = kind as SlugType;

  if (!KINDS.some((row) => row.type === type)) {
    return [];
  }

  const seasons = type === 'game' ? gameSeasons(target.season) : undefined;

  const args: Sitemap.getSlugsArguments = {
    type,
    organization_id: target.organization_id,
    division_id: target.division_id,
    limit: PAGE_SIZE,
    offset: (+page || 0) * PAGE_SIZE,
  };

  if (seasons) {
    args.seasons = seasons;
  }

  const rows: Sitemap.getSlugsResults = await useServerAPI({
    class: 'sitemap',
    function: 'getSlugs',
    arguments: args,
    cache: 60 * 60 * 6,
  });

  if (!Array.isArray(rows)) {
    return [];
  }

  const segment = Slug.getSegment(type);

  return rows
    .filter((row) => row.slug)
    .map((row) => ({
      url: getAbsoluteUrl(`/${sport}/${segment}/${row.slug}`),
      // omitted rather than guessed when the table has no updated_at: a lastmod that is always
      // today teaches a crawler to stop trusting lastmod on this site
      ...(row.updated_at ? { lastModified: new Date(row.updated_at) } : {}),
      changeFrequency: type === 'game' ? ('weekly' as const) : ('daily' as const),
      priority: type === 'team' ? 0.8 : 0.6,
    }));
}
