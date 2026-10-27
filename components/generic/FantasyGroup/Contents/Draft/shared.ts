import { Objector } from '@esmalley/ts-utils';
import { TERMINOLOGY_ID } from '@srating-io/common';
import { Fantasy, General } from '@srating-io/types';
import { getCachedDataKey } from '@/components/generic/Ranking/Contents/Loader';

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
