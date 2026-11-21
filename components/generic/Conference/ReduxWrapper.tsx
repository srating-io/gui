'use client';

import { useEffect } from 'react';
import { seed } from '@/redux/features/conference-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Basketball, Football, General } from '@srating-io/types';

const ReduxWrapper = (
  { children, team_season_conferences, teams, statistic_rankings, elos, view, subview = null }:
  { children: React.ReactNode, team_season_conferences: General.TeamSeasonConferences, teams: General.Teams, statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings, elos: General.Elos, view: string, subview: string | null | undefined },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(seed({ view, subview, team_season_conferences, teams, statistic_rankings, elos }));
  }, [dispatch, team_season_conferences, teams, statistic_rankings, elos]);

  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
