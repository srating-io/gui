import { General } from '@srating-io/types';

/**
 * The entity kinds addressed by a slug in the url.
 *
 * The value is the url segment, which is also the api class and the table -- /cbb/team/purdue is
 * `team`, /cbb/games/purdue-vs-michigan-2026-01-15 is `game`. The two differ for games only
 * because the route segment was plural before slugs existed and renaming it would be a url change.
 */
export const SLUG_TYPE = {
  team: 'team',
  player: 'player',
  coach: 'coach',
  conference: 'conference',
  game: 'game',
} as const;

export type SlugType = typeof SLUG_TYPE[keyof typeof SLUG_TYPE];

/**
 * The url segment each kind sits under, which is not always the table name.
 */
export const SLUG_SEGMENT: Record<SlugType, string> = {
  team: 'team',
  player: 'player',
  coach: 'coach',
  conference: 'conference',
  game: 'games',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Slug logic. Static, no state, no store -- safe on the server and in the browser.
 */
class Slug {
  /**
   * Is this url segment one of the old char(36) ids rather than a slug?
   *
   * This is what lets one route param accept either form. A slug can never look like this: slugify
   * collapses every run of non-alphanumerics to a single dash, so no slug carries the four dashes
   * in the right places, and `isReservedSlug` on the api side refuses a bare number too.
   */
  public static isId(value: string | null | undefined): boolean {
    return !!value && UUID.test(value);
  }

  /**
   * The url segment for a kind -- `games` for a game, the kind itself otherwise.
   */
  public static getSegment(type: SlugType): string {
    return SLUG_SEGMENT[type];
  }

  /**
   * The slug to address a row by, falling back to its id.
   *
   * The fallback is what keeps a link working for a row the backfill has not reached yet. It is a
   * url that will 301 once the slug lands, which is worse than a direct link and much better than
   * a dead one.
   */
  public static forRow(
    type: SlugType,
    row: { slug?: string | null } | null | undefined,
  ): string {
    if (!row) {
      return '';
    }

    if (row.slug) {
      return row.slug;
    }

    // the id column is not on the declared shape, which is the point -- this is the fallback
    return (row as Record<string, string>)[`${type}_id`] || '';
  }

  /**
   * The slug for a team row, or its id. The common case, so it gets a name.
   */
  public static forTeam(team: General.Team | null | undefined): string {
    return team ? Slug.forRow('team', team) : '';
  }
}

export default Slug;
