import { DEFAULT_CBB_ID, DEFAULT_CFB_ID, DEFAULT_NBA_ID } from './Defaults';
import Slug, { SlugType } from './Slug';

/**
 * Every internal entity url is built here.
 *
 * Before this, each of three dozen call sites wrote its own template literal, which is how two of
 * them ended up with a hardcoded `/cbb/` that sent football and nba visitors to the wrong sport.
 * It also means the slug-or-id fallback lives in one place instead of three dozen.
 *
 * Static and store-free on purpose, so the same builder works in a server component (canonical
 * tags, the sitemap) and in the browser. `Organization.getPath` needs the dictionary out of redux
 * and returns 'Loading...' before it arrives, which a canonical tag cannot use.
 */

/**
 * The `[sport]` url segment per organization. This is the organization's `code` lowercased, same as
 * `Organization.getPathCode`, but without needing the dictionary to be loaded first.
 */
const ORGANIZATION_ID_X_SPORT: Record<string, string> = {
  [DEFAULT_CBB_ID]: 'cbb',
  [DEFAULT_CFB_ID]: 'cfb',
  [DEFAULT_NBA_ID]: 'nba',
};

type Target = {
  /**
   * Either is enough. `sport` when the caller already resolved the segment, `organization_id` when
   * it has the id -- which is the case everywhere a row was just fetched.
   */
  sport?: string | null;
  organization_id?: string | null;
  season?: number | string | null;
  /**
   * Only for a game, and only when it is not in the sport's default division. Carried because the
   * page reads it to pick which division's stats to show.
   */
  division_id?: string | null;
  view?: string | null;
};

class Url {
  /**
   * The `[sport]` segment, or '' when the organization is not one the app routes.
   */
  public static getSport({ sport, organization_id }: Target): string {
    if (sport) {
      return sport;
    }

    return (organization_id && ORGANIZATION_ID_X_SPORT[organization_id]) || '';
  }

  public static team(target: Target & { team?: { slug?: string | null; team_id?: string } | null; slug?: string | null }): string {
    return Url.entity('team', target, target.slug || (target.team ? Slug.forRow('team', target.team) : ''));
  }

  public static player(target: Target & { player?: { slug?: string | null; player_id?: string } | null; slug?: string | null }): string {
    return Url.entity('player', target, target.slug || (target.player ? Slug.forRow('player', target.player) : ''));
  }

  public static coach(target: Target & { coach?: { slug?: string | null; coach_id?: string } | null; slug?: string | null }): string {
    return Url.entity('coach', target, target.slug || (target.coach ? Slug.forRow('coach', target.coach) : ''));
  }

  public static conference(target: Target & { conference?: { slug?: string | null; conference_id?: string } | null; slug?: string | null }): string {
    return Url.entity('conference', target, target.slug || (target.conference ? Slug.forRow('conference', target.conference) : ''));
  }

  public static game(target: Target & { game?: { slug?: string | null; game_id?: string } | null; slug?: string | null }): string {
    return Url.entity('game', target, target.slug || (target.game ? Slug.forRow('game', target.game) : ''));
  }

  /**
   * The sport's own pages, which have no entity and so no slug.
   */
  public static ranking(target: Target): string {
    return Url.page('ranking', target);
  }

  public static games(target: Target): string {
    return Url.page('games', target);
  }

  public static projections(target: Target): string {
    return Url.page('projections', target);
  }

  public static compare(target: Target): string {
    return Url.page('compare', target);
  }

  /**
   * The canonical url for a page: the path with nothing but the season on it.
   *
   * Everything else the pages read from the query string -- view, subview, division_id -- is a tab
   * or a filter over the same content, so letting those be indexed separately would split one
   * page's ranking across a dozen near duplicates.
   */
  public static canonical(path: string, season?: number | string | null): string {
    if (!path) {
      return '';
    }

    return season ? `${path}?season=${season}` : path;
  }

  private static entity(type: SlugType, target: Target, slug: string): string {
    const sport = Url.getSport(target);

    if (!sport || !slug) {
      return '';
    }

    return Url.withQuery(`/${sport}/${Slug.getSegment(type)}/${slug}`, target);
  }

  private static page(segment: string, target: Target): string {
    const sport = Url.getSport(target);

    if (!sport) {
      return '';
    }

    return Url.withQuery(`/${sport}/${segment}`, target);
  }

  private static withQuery(path: string, { season, division_id, view }: Target): string {
    const query = new URLSearchParams();

    if (season) {
      query.set('season', String(season));
    }

    if (division_id) {
      query.set('division_id', division_id);
    }

    if (view) {
      query.set('view', view);
    }

    const search = query.toString();

    return search ? `${path}?${search}` : path;
  }
}

export default Url;
