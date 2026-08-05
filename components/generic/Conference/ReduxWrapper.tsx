'use client';

import { useEffect } from 'react';
import { setDataKey } from '@/redux/features/conference-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Basketball, Football, General } from '@srating-io/types';

const ReduxWrapper = (
  { children, team_season_conferences, teams, statistic_rankings, elos, view, subview = null }:
  { children: React.ReactNode, team_season_conferences: General.TeamSeasonConferences, teams: General.Teams, statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings, elos: General.Elos, view: string, subview: string | null | undefined },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDataKey({ key: 'view', value: view }));
    dispatch(setDataKey({ key: 'subview', value: subview }));
    dispatch(setDataKey({ key: 'team_season_conferences', value: team_season_conferences }));
    dispatch(setDataKey({ key: 'teams', value: teams }));
    dispatch(setDataKey({ key: 'statistic_rankings', value: statistic_rankings }));
    dispatch(setDataKey({ key: 'elos', value: elos }));
  }, [dispatch, team_season_conferences, teams, statistic_rankings, elos]);

  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
