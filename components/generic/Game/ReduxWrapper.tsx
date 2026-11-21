'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { seed } from '@/redux/features/game-slice';
import { General, Game } from '@srating-io/types';

const ReduxWrapper = (
  { children, game, coach_team_seasons, coaches, view, subview = null }:
  { children: React.ReactNode, game: Game.GameWithOddsAndTeams, coach_team_seasons: General.CoachTeamSeasons, coaches: General.Coaches, view: string, subview: string | undefined | null },
) => {
  const dispatch = useAppDispatch();

  // every server render (including the live refresh) sends new prop objects, so this re-seeds each time
  useEffect(() => {
    dispatch(seed({ view, subview, game, coach_team_seasons, coaches }));
  }, [dispatch, game, coach_team_seasons, coaches, view, subview]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
