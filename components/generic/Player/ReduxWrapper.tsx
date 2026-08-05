'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/player-slice';
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
    dispatch(setDataKey({ key: 'season', value: season }));
    dispatch(setDataKey({ key: 'player', value: player }));
    dispatch(setDataKey({ key: 'player_team_season', value: player_team_season }));
    dispatch(setDataKey({ key: 'player_team_seasons', value: player_team_seasons }));
    dispatch(setDataKey({ key: 'team', value: team }));
    dispatch(setDataKey({ key: 'teams', value: teams }));
  }, [dispatch, player, player_team_season, player_team_seasons, team, teams, season, view]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
