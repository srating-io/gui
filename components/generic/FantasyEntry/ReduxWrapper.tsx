'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { reset, setDataKey } from '@/redux/features/fantasy_entry-slice';
import { updateDivisionID, updateOrganizationID, updateSeason } from '@/redux/features/organization-slice';
import { AppDispatch } from '@/redux/store';
import { getStore } from '@/app/StoreProvider';
import { Basketball, Fantasy, General } from '@srating-io/types';

export interface FantasyEntryLoadData {
  fantasy_entry: Fantasy.FantasyEntry;
  fantasy_group: Fantasy.FantasyGroup;
  fantasy_entry_players: Fantasy.FantasyEntryPlayers;
  player_team_seasons: General.PlayerTeamSeasons;
  players: General.Players;
  fantasy_bracket_slots: Fantasy.FantasyBracketSlots;
  bracket_teams: General.BracketTeams;
  teams: General.Teams;
  games: General.Games;
  fantasy_entry_player_statistic_rankings: {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  },
  // Everything below is optional: the api returns it only once the extended `load` ships, and
  // every section that reads it is gated on it being there, so the page degrades rather than
  // rendering empty furniture.
  player_boxscores?: Basketball.PlayerBoxscores;
  fantasy_rankings?: Fantasy.FantasyRankings;
  fantasy_ranking_history?: Fantasy.FantasyRankings;
  fantasy_entrys?: Fantasy.FantasyEntrys;
  fantasy_draft_orders?: Fantasy.FantasyDraftOrders;
  fantasy_group_user?: Fantasy.FantasyGroupUser;
  league_player_ratings?: { [fantasy_entry_player_id: string]: number };
  error?: string;
}


export const handleLoad = (
  {
    dispatch,
    data,
  }:
  {
    dispatch: AppDispatch;
    data: FantasyEntryLoadData;
  },
) => {
  // Without these the page kept the copy it was server rendered with, so a draft that finished
  // or a bracket that locked never showed until a full page reload.
  dispatch(setDataKey({ key: 'fantasy_entry', value: data.fantasy_entry }));
  dispatch(setDataKey({ key: 'fantasy_group', value: data.fantasy_group }));
  dispatch(setDataKey({ key: 'fantasy_entry_players', value: data.fantasy_entry_players }));
  dispatch(setDataKey({ key: 'player_team_seasons', value: data.player_team_seasons }));
  dispatch(setDataKey({ key: 'players', value: data.players }));
  dispatch(setDataKey({ key: 'fantasy_bracket_slots', value: data.fantasy_bracket_slots }));
  dispatch(setDataKey({ key: 'bracket_teams', value: data.bracket_teams }));
  dispatch(setDataKey({ key: 'teams', value: data.teams }));
  dispatch(setDataKey({ key: 'games', value: data.games }));
  dispatch(setDataKey({ key: 'fantasy_entry_player_statistic_rankings', value: data.fantasy_entry_player_statistic_rankings }));

  // Writing a missing key would blank whatever a previous load put there, so skip it instead.
  if (data.player_boxscores) {
    dispatch(setDataKey({ key: 'player_boxscores', value: data.player_boxscores }));
  }
  if (data.fantasy_rankings) {
    dispatch(setDataKey({ key: 'fantasy_rankings', value: data.fantasy_rankings }));
  }
  if (data.fantasy_ranking_history) {
    dispatch(setDataKey({ key: 'fantasy_ranking_history', value: data.fantasy_ranking_history }));
  }
  if (data.fantasy_entrys) {
    dispatch(setDataKey({ key: 'fantasy_entrys', value: data.fantasy_entrys }));
  }
  if (data.fantasy_draft_orders) {
    dispatch(setDataKey({ key: 'fantasy_draft_orders', value: data.fantasy_draft_orders }));
  }
  if (data.fantasy_group_user) {
    dispatch(setDataKey({ key: 'fantasy_group_user', value: data.fantasy_group_user }));
  }
  if (data.league_player_ratings) {
    dispatch(setDataKey({ key: 'league_player_ratings', value: data.league_player_ratings }));
  }
};

const ReduxWrapper = (
  {
    children,
    fantasy_entry,
    fantasy_group,
  }:
  {
    children: React.ReactNode;
    fantasy_entry?: Fantasy.FantasyEntry;
    fantasy_group?: Fantasy.FantasyGroup;
  },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const current = getStore().getState().fantasyEntryReducer.fantasy_entry;
    const isNewEntry = !!fantasy_entry && current.fantasy_entry_id !== fantasy_entry.fantasy_entry_id;

    if (isNewEntry) {
      // back / forward skips the navigation helper, so nothing else clears the previous entry out
      // of this slice, and its roster would render under this entry's name
      dispatch(reset(false));
    }

    if (fantasy_group) {
      dispatch(updateOrganizationID(fantasy_group.organization_id));
      dispatch(updateDivisionID(fantasy_group.division_id));
      dispatch(updateSeason(fantasy_group.season));
    }

    // Both rows come from an anonymous render, and a private league strips the entry to three
    // fields, so seed them once and let the client load own them from there
    if (isNewEntry) {
      if (fantasy_group) {
        dispatch(setDataKey({ key: 'fantasy_group', value: fantasy_group }));
      }
      dispatch(setDataKey({ key: 'fantasy_entry', value: fantasy_entry }));
    }
  }, [
    dispatch,
    fantasy_group,
    fantasy_entry,
  ]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
