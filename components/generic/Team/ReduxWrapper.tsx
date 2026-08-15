'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/team-slice';
import { General } from '@srating-io/types';

const ReduxWrapper = (
  { children, team, team_season_conference, view }:
  { children: React.ReactNode, team: General.Team, team_season_conference: General.TeamSeasonConference, view: string },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDataKey({ key: 'view', value: view }));
    dispatch(setDataKey({ key: 'team_season_conference', value: team_season_conference }));
    dispatch(setDataKey({ key: 'team', value: team }));
  }, [dispatch, team, team_season_conference]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
