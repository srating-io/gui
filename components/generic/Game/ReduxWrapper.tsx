'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/game-slice';
import { General, Game } from '@srating-io/types';

const ReduxWrapper = (
  { children, game, coach_team_seasons, coaches, view, subview = null }:
  { children: React.ReactNode, game: Game.GameWithOddsAndTeams, coach_team_seasons: General.CoachTeamSeasons, coaches: General.Coaches, view: string, subview: string | undefined | null },
) => {
  const dispatch = useAppDispatch();

  // im not sure if game is the same reference if it gets updated from nextjs
  // might need to deepClone, but gemini says it is fine
  // they say the reference from nextjs will not be the same object reference, so the useEffect should trigger
  // ... todo investigate later?

  useEffect(() => {
    dispatch(setDataKey({ key: 'view', value: view }));
    dispatch(setDataKey({ key: 'subview', value: subview }));
    dispatch(setDataKey({ key: 'game', value: game }));
    dispatch(setDataKey({ key: 'coach_team_seasons', value: coach_team_seasons }));
    dispatch(setDataKey({ key: 'coaches', value: coaches }));
  }, [dispatch, game, coach_team_seasons, coaches, view, subview]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
