'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_entry-slice';
import { updateDivisionID, updateOrganizationID } from '@/redux/features/organization-slice';
import { AppDispatch } from '@/redux/store';
import { Basketball, General } from '@srating-io/types';

export interface FantasyEntryLoadData {
  fantasy_entry_players: General.FantasyEntryPlayers;
  player_team_seasons: General.PlayerTeamSeasons;
  players: General.Players;
  fantasy_bracket_slots: General.FantasyBracketSlots;
  bracket_teams: General.BracketTeams;
  teams: General.Teams;
  games: General.Games;
  fantasy_entry_player_statistic_rankings: {
    [fantasy_entry_player_statistic_ranking_id: string]: General.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  },
  // player_boxscores: PlayerBoxscores;
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
  dispatch(setDataKey({ key: 'fantasy_entry_players', value: data.fantasy_entry_players }));
  dispatch(setDataKey({ key: 'player_team_seasons', value: data.player_team_seasons }));
  dispatch(setDataKey({ key: 'players', value: data.players }));
  dispatch(setDataKey({ key: 'fantasy_bracket_slots', value: data.fantasy_bracket_slots }));
  dispatch(setDataKey({ key: 'bracket_teams', value: data.bracket_teams }));
  dispatch(setDataKey({ key: 'teams', value: data.teams }));
  dispatch(setDataKey({ key: 'games', value: data.games }));
  dispatch(setDataKey({ key: 'fantasy_entry_player_statistic_rankings', value: data.fantasy_entry_player_statistic_rankings }));
  // dispatch(setDataKey({ key: 'player_boxscores', value: data.player_boxscores }));
};

const ReduxWrapper = (
  {
    children,
    fantasy_entry,
    fantasy_group,
  }:
  {
    children: React.ReactNode;
    fantasy_entry?: General.FantasyEntry;
    fantasy_group?: General.FantasyGroup;
  },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fantasy_group) {
      dispatch(updateOrganizationID(fantasy_group.organization_id));
      dispatch(updateDivisionID(fantasy_group.division_id));
      dispatch(setDataKey({ key: 'fantasy_group', value: fantasy_group }));
    }
    if (fantasy_entry) {
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
