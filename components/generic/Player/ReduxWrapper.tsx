'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { seed } from '@/redux/features/player-slice';
import { General } from '@srating-io/types';

const ReduxWrapper = (
  {
    children, player, player_team_season, player_team_seasons, team, teams, season, view,
  }:
  { children: React.ReactNode, player: General.Player, player_team_season: General.PlayerTeamSeason | null, player_team_seasons: General.PlayerTeamSeasons, team: General.Team | null, teams: General.Teams, season: number, view: string },
) => {
  const dispatch = useAppDispatch();


  useEffect(() => {
    // this should not be needed, the player navigation will reset back to the default view
    // dispatch(setDataKey({ key: 'view', value: view }));
    dispatch(seed({ season, player, player_team_season, player_team_seasons, team, teams }));
  }, [dispatch, player, player_team_season, player_team_seasons, team, teams, season, view]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
