'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { seed } from '@/redux/features/compare-slice';
import { updateOrganizationID, updateDivisionID } from '@/redux/features/organization-slice';
import { Team } from '@srating-io/types';

const ReduxWrapper = (
  {
    children,
    organization_id,
    division_id,
    home_team_id = null,
    away_team_id = null,
    season,
    neutral_site,
    teams,
    view,
    subview = null,
  }:
  {
    children: React.ReactNode;
    organization_id: string;
    division_id: string;
    home_team_id?: string | null;
    away_team_id?: string | null;
    season: number;
    neutral_site: boolean;
    teams: {[team_id: string]: Team.loadTeamResults};
    view: string;
    subview?: string | null;
  },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updateOrganizationID(organization_id));
    dispatch(updateDivisionID(division_id));
    dispatch(seed({ home_team_id, away_team_id, season, neutral_site, teams, view, subview }));
  }, [
    dispatch,
    organization_id,
    division_id,
    home_team_id,
    away_team_id,
    season,
    neutral_site,
    teams,
    view,
    subview,
    neutral_site,
  ]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
