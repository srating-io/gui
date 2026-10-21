import { General } from '@srating-io/types';
import { getAbsoluteUrl } from './Site';

/**
 * Builds the schema.org graphs the entity pages emit.
 *
 * Every url here is absolute, because a crawler reads this out of context and a relative url in
 * JSON-LD resolves against nothing.
 */

type Crumb = { name: string; path: string };

class StructuredData {
  /**
   * The trail back to the sport's landing page. Gives the serp a readable path instead of the bare
   * domain, and tells a crawler how the pages relate.
   */
  public static breadcrumbs(crumbs: Crumb[]): object {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: getAbsoluteUrl(crumb.path),
      })),
    };
  }

  /**
   * Wrap one or more nodes as a graph, which is what lets a page carry both its entity and its
   * breadcrumbs in a single script tag.
   */
  public static graph(nodes: (object | null)[]): object | null {
    const real = nodes.filter((node) => node);

    if (!real.length) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@graph': real,
    };
  }

  public static team(
    { name, sport, path, colors }:
    { name: string; sport: string; path: string; colors?: (string | null)[] },
  ): object {
    return {
      '@type': 'SportsTeam',
      name,
      sport,
      url: getAbsoluteUrl(path),
      ...(colors && colors.filter((c) => c).length ? { color: colors.filter((c) => c) } : {}),
    };
  }

  /**
   * A player or a coach. `Person` rather than `Athlete`, which is not a schema.org type -- the role
   * goes in jobTitle instead.
   */
  public static person(
    { name, path, jobTitle, team, teamPath }:
    { name: string; path: string; jobTitle?: string | null; team?: string | null; teamPath?: string | null },
  ): object {
    return {
      '@type': 'Person',
      name,
      url: getAbsoluteUrl(path),
      ...(jobTitle ? { jobTitle } : {}),
      ...(team ? {
        memberOf: {
          '@type': 'SportsTeam',
          name: team,
          ...(teamPath ? { url: getAbsoluteUrl(teamPath) } : {}),
        },
      } : {}),
    };
  }

  public static conference({ name, sport, path }: { name: string; sport: string; path: string }): object {
    return {
      '@type': 'SportsOrganization',
      name,
      sport,
      url: getAbsoluteUrl(path),
    };
  }

  /**
   * schema.org's EventStatusType for a game's status.
   *
   * A postponed game that still says EventScheduled is a wrong answer in a rich result, which is
   * worse than no rich result -- so the two statuses that contradict "scheduled" are mapped.
   */
  public static eventStatus(status: string | null | undefined): string {
    const value = (status || '').toLowerCase();

    if (value === 'postponed') {
      return 'https://schema.org/EventPostponed';
    }

    if (value === 'cancelled' || value === 'canceled') {
      return 'https://schema.org/EventCancelled';
    }

    return 'https://schema.org/EventScheduled';
  }

  /**
   * A game. The scores go on only once the game is final -- publishing a running score as the
   * result is how a stale number ends up quoted back as the final one.
   */
  public static game(
    { game, awayName, homeName, awayPath, homePath, sport, path }:
    {
      game: General.Game;
      awayName: string;
      homeName: string;
      awayPath?: string | null;
      homePath?: string | null;
      sport: string;
      path: string;
    },
  ): object {
    const final = game.status === 'final';

    const team = (name: string, teamPath?: string | null) => ({
      '@type': 'SportsTeam',
      name,
      ...(teamPath ? { url: getAbsoluteUrl(teamPath) } : {}),
    });

    return {
      '@type': 'SportsEvent',
      name: `${awayName} at ${homeName}`,
      sport,
      url: getAbsoluteUrl(path),
      ...(game.start_datetime ? { startDate: game.start_datetime } : {}),
      eventStatus: StructuredData.eventStatus(game.status),
      awayTeam: team(awayName, awayPath),
      homeTeam: team(homeName, homePath),
      competitor: [team(awayName, awayPath), team(homeName, homePath)],
      ...(final && game.away_score !== null && game.home_score !== null ? {
        // both scores, so the pair reads as a result rather than one loose number
        description: `${awayName} ${game.away_score}, ${homeName} ${game.home_score} (final)`,
      } : {}),
    };
  }
}

export default StructuredData;
