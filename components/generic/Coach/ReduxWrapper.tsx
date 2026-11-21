'use client';

import React, { useEffect } from 'react';
import { seed } from '@/redux/features/coach-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Basketball, Football, General } from '@srating-io/types';

const ReduxWrapper = (
  { children, coach, coach_team_seasons, teams, statistic_rankings, view }:
  { children: React.ReactNode, coach: General.Coach, coach_team_seasons: General.CoachTeamSeasons, teams: General.Teams, statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings, view: string },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(seed({ view, coach, coach_team_seasons, teams, statistic_rankings }));
  }, [dispatch, coach, coach_team_seasons, teams, statistic_rankings]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
