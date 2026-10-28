import { Objector } from '@esmalley/ts-utils';
import { TERMINOLOGY_ID } from '@srating-io/common';
import { Fantasy, General } from '@srating-io/types';
import { getCachedDataKey } from '@/components/generic/Ranking/Contents/Loader';
import TableColumns from '@/components/helpers/TableColumns';

/**
 * The player pool the draft zone and the pre-draft list both work from.
 *
 * Shared so the two cannot drift: the drafted-player exclusion and the row flattening below are
 * both load bearing, and a pre-draft list built off different rows would offer players the draft
 * would then refuse.
 */

/**
 * Players that are off the board.
 *
 * A free for all draft lets two entries hold the same player, so there only this user's own
 * roster is off the board. Everywhere else a drafted player is gone for everyone.
 */
export const getDraftedPlayerTeamSeasonIds = (
  {
    fantasy_group,
    fantasy_entrys,
    fantasy_entry_players,
    user_id,
  }:
  {
    fantasy_group: Fantasy.FantasyGroup;
    fantasy_entrys: Fantasy.FantasyEntrys;
    fantasy_entry_players: Fantasy.FantasyEntryPlayers;
    user_id: string | null | undefined;
  },
): Set<string> => {
  const isFreeForAll = fantasy_group.draft_type_terminology_id === TERMINOLOGY_ID.DRAFT_TYPE.FREE_FOR_ALL;

  const my_fantasy_entry_ids = new Set(
    Object.values(fantasy_entrys)
      .filter((row) => row.user_id === user_id)
      .map((row) => row.fantasy_entry_id),
  );

  const drafted_player_team_season_ids = new Set<string>();

  for (const fantasy_entry_player_id in fantasy_entry_players) {
    const row = fantasy_entry_players[fantasy_entry_player_id];

    if (!isFreeForAll || my_fantasy_entry_ids.has(row.fantasy_entry_id)) {
      drafted_player_team_season_ids.add(row.player_team_season_id);
    }
  }

  return drafted_player_team_season_ids;
};

/**
 * The ranking rows for players still available, flattened for the table.
 *
 * Deep clones the whole cached payload, so build it once per pool and narrow it with
 * filterPlayerRows below rather than calling this again per keystroke.
 */
export const getAvailablePlayerRows = (
  {
    rankingData,
    fantasy_group,
    excluded_player_team_season_ids,
  }:
  {
    rankingData: object | null;
    fantasy_group: Fantasy.FantasyGroup;
    excluded_player_team_season_ids: Set<string>;
  },
): object[] => {
  const cached_key = getCachedDataKey({
    organization_id: fantasy_group.organization_id,
    division_id: fantasy_group.division_id,
    season: fantasy_group.season,
    view: 'player',
    career: 0,
    career_active: 0,
  });

  const data: object = (
    rankingData &&
    cached_key in rankingData &&
    rankingData[cached_key].data
  ) ? Objector.deepClone(rankingData[cached_key].data) : {};

  const rows: object[] = [];

  for (const id in data) {
    const row = data[id];

    // the cache holds whatever the ranking load returned, so do not assume every value is a row
    if (!row || typeof row !== 'object') {
      continue;
    }

    // Built purely from the ranking data before, so a player already on someone's roster stayed
    // in the list and the pick came back rejected with the clock running. Keyed on the row's own
    // player_team_season_id column -- the nested object this used to read is no longer returned.
    if (
      row.player_team_season_id &&
      excluded_player_team_season_ids.has(row.player_team_season_id)
    ) {
      continue;
    }

    row.rank_delta_combo = `${row.rank_delta_one || '-'}/${row.rank_delta_seven || '-'}`;
    row.name = row.player ? (`${row.player.first_name} ${row.player.last_name}`) : null;

    row.number = (row.player_team_season && row.player_team_season.number) || (row.player && row.player.number) || null;
    row.position = (row.player_team_season && row.player_team_season.position) || (row.player && row.player.position) || null;
    row.height = (row.player_team_season && row.player_team_season.height) || (row.player && row.player.height) || null;
    row.weight = (row.player_team_season && row.player_team_season.weight) || (row.player && row.player.weight) || null;
    row.class_year = (row.player_team_season && row.player_team_season.class_year) || null;

    rows.push(row);
  }

  return rows;
};

/**
 * The columns that describe who a player is rather than how they have played.
 *
 * Carried over from the season row when career stats are laid on top, because a career row has a
 * null team_id and a null player_team_season_id (schema.sql, player_statistic_ranking) and the
 * api drops team_name and the attached player_team_season with them. Without this the team filter
 * matches nothing and a pick cannot be submitted at all.
 */
const IDENTITY_COLUMNS = [
  'player_statistic_ranking_id',
  'player_id',
  'player_team_season_id',
  'player_team_season',
  'player',
  'team_id',
  'team_name',
  'team_slug',
  'conference_id',
  'slug',
  'name',
  'number',
  'position',
  'height',
  'weight',
  'class_year',
];

/**
 * The active career ranking rows, keyed by player.
 *
 * Its own cache entry, loaded alongside the season one -- see the two Loaders in Draft/Client.
 */
export const getCareerActiveRowsByPlayerID = (
  {
    rankingData,
    fantasy_group,
  }:
  {
    rankingData: object | null;
    fantasy_group: Fantasy.FantasyGroup;
  },
): Record<string, object> => {
  const cached_key = getCachedDataKey({
    organization_id: fantasy_group.organization_id,
    division_id: fantasy_group.division_id,
    season: fantasy_group.season,
    view: 'player',
    career: 0,
    career_active: 1,
  });

  const data: object = (
    rankingData &&
    cached_key in rankingData &&
    rankingData[cached_key].data
  ) || {};

  const player_id_x_row: Record<string, object> = {};

  for (const id in data) {
    const row = data[id];

    // the cache holds whatever the ranking load returned, so do not assume every value is a row
    if (!row || typeof row !== 'object' || !row.player_id) {
      continue;
    }

    player_id_x_row[row.player_id] = row;
  }

  return player_id_x_row;
};

/**
 * The pool with career stats in place of season stats, matched on player.
 *
 * The season row stays the row -- only the numbers change. Shallow copies the career row rather
 * than cloning it: everything kept off it is a scalar stat, and every nested value is overwritten
 * by the season row's already-cloned one below.
 */
export const applyCareerActiveStats = (
  {
    rows,
    player_id_x_career_row,
  }:
  {
    rows: object[];
    player_id_x_career_row: Record<string, object>;
  },
): object[] => {
  // A blank of the same shape, for the players below that have no career row.
  //
  // Every column has to be present and null rather than simply absent: the cell renderer tests
  // `!== null` to choose between the value and a dash, so an undefined column prints the string
  // "undefined". A null also sorts to the bottom instead of the top, which is where a player with
  // no career to show belongs.
  const blank: object = {};
  const [template] = Object.values(player_id_x_career_row);

  for (const column in (template || {})) {
    blank[column] = null;
  }

  return rows.map((row) => {
    const player_id = 'player_id' in row ? (row.player_id as string) : '';

    // A rookie with no games anywhere has no career row at all -- the career writer drops players
    // with zero games. They stay in the pool because they are still draftable, but with the stats
    // blank rather than their season numbers sitting under a career heading.
    const career_row = (player_id && player_id in player_id_x_career_row) ? player_id_x_career_row[player_id] : null;

    const next: object = { ...(career_row || blank) };

    for (const column of IDENTITY_COLUMNS) {
      if (column in row) {
        next[column] = row[column];
      } else {
        delete next[column];
      }
    }

    return next;
  });
};

/**
 * Has nothing been played yet?
 *
 * The preseason ranking run still writes a row per player, it just leaves every stat at zero and
 * ranks on elo alone, so an empty pool is not the signal -- a pool of zeroes is. Short circuits on
 * the first game played.
 */
export const isPreSeasonPool = (rows: object[]): boolean => {
  return rows.length > 0 && rows.every((row) => !+(('games' in row && row.games) || 0));
};

/**
 * The team and name filters the table inputs drive.
 *
 * Split out from the pool so the draft zone can hold one flattened copy and still answer which
 * player the pre-draft list points at, which the filtered view cannot be asked.
 */
export const filterPlayerRows = (
  {
    rows,
    team_id,
    search,
  }:
  {
    rows: object[];
    team_id?: string | null;
    search?: string;
  },
): object[] => {
  let filtered = rows;

  if (team_id) {
    filtered = filtered.filter((row) => 'team_id' in row && row.team_id === team_id);
  }

  if (search) {
    // a plain substring match: this was a RegExp built from raw input, so typing "(" threw and
    // blanked the whole draft zone
    const value = search.toLowerCase();
    filtered = filtered.filter((row) => {
      return 'name' in row && typeof row.name === 'string' && row.name.toLowerCase().includes(value);
    });
  }

  return filtered;
};

/**
 * The columns both draft tables show.
 *
 * The career list leaves out team_name because the api nulls it on a career row. Here the season
 * row is still underneath, so the team is known -- and it is half of what the drafter is judging.
 */
export const getDraftDisplayColumns = (
  {
    organization_id,
    career,
  }:
  {
    organization_id: string;
    career: boolean;
  },
): string[] => {
  const columns = TableColumns.getViewableColumns({
    organization_id,
    view: 'player',
    columnView: 'composite',
    customColumns: [],
    positions: [],
    career,
  });

  // An empty set is left alone: cfb resolves to one today, because every football branch is
  // gated on a position and the draft tables pass none. Injecting into it would put a lone team
  // column on a table that is meant to be showing nothing.
  const name_at = columns.indexOf('name');

  if (!career || name_at < 0 || columns.includes('team_name')) {
    return columns;
  }

  const next = [...columns];

  next.splice(name_at + 1, 0, 'team_name');

  return next;
};

/**
 * Per entry the user owns, the player its pre-draft list points at right now.
 *
 * Matched against the available pool rather than the stored list alone, so a name a rival already
 * took is skipped here exactly as the scraper skips it, and a player missing from the rankings
 * entirely does not stall the list.
 */
export const getNextAvailablePrePickRows = (
  {
    rows,
    fantasy_entry_pre_picks,
    fantasy_entrys,
    user_id,
  }:
  {
    rows: object[];
    fantasy_entry_pre_picks: Fantasy.FantasyEntryPrePicks;
    fantasy_entrys: Fantasy.FantasyEntrys;
    user_id: string | null | undefined;
  },
): Record<string, object> => {
  if (!user_id) {
    return {};
  }

  const player_team_season_id_x_row: Record<string, object> = {};

  for (const row of rows) {
    if ('player_team_season_id' in row && typeof row.player_team_season_id === 'string') {
      player_team_season_id_x_row[row.player_team_season_id] = row;
    }
  }

  const fantasy_entry_id_x_pre_picks: Record<string, Fantasy.FantasyEntryPrePick[]> = {};

  for (const fantasy_entry_pre_pick_id in fantasy_entry_pre_picks) {
    const row = fantasy_entry_pre_picks[fantasy_entry_pre_pick_id];
    const fantasy_entry = fantasy_entrys[row.fantasy_entry_id];

    if (!fantasy_entry || fantasy_entry.user_id !== user_id) {
      continue;
    }

    if (!(row.fantasy_entry_id in fantasy_entry_id_x_pre_picks)) {
      fantasy_entry_id_x_pre_picks[row.fantasy_entry_id] = [];
    }

    fantasy_entry_id_x_pre_picks[row.fantasy_entry_id].push(row);
  }

  const fantasy_entry_id_x_row: Record<string, object> = {};

  for (const fantasy_entry_id in fantasy_entry_id_x_pre_picks) {
    const ordered = fantasy_entry_id_x_pre_picks[fantasy_entry_id].sort((a, b) => a.ordinal - b.ordinal);

    for (const pre_pick of ordered) {
      if (pre_pick.player_team_season_id in player_team_season_id_x_row) {
        fantasy_entry_id_x_row[fantasy_entry_id] = player_team_season_id_x_row[pre_pick.player_team_season_id];
        break;
      }
    }
  }

  return fantasy_entry_id_x_row;
};

/**
 * A player's display name, from the lookup dicts the group load returns.
 */
export const getPlayerName = (
  player_team_season_id: string,
  player_team_seasons: General.PlayerTeamSeasons,
  players: General.Players,
): string => {
  const player_team_season = player_team_seasons[player_team_season_id];

  if (!player_team_season) {
    return 'Unknown player';
  }

  const player = players[player_team_season.player_id];

  if (!player) {
    return 'Unknown player';
  }

  return `${player.first_name} ${player.last_name}`;
};
