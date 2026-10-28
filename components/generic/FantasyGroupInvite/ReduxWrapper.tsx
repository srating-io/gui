'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { updateDivisionID, updateOrganizationID, updateSeason } from '@/redux/features/organization-slice';
import { Fantasy } from '@srating-io/types';

const ReduxWrapper = (
  {
    children,
    fantasy_group,
  }:
  {
    children: React.ReactNode;
    fantasy_group: Fantasy.FantasyGroup;
  },
) => {
  const dispatch = useAppDispatch();

  // The invite url has no sport segment, so Initializer falls back to CFB and MutationHandler has
  // nothing to match - without this the header, the footer tabs and the sport slab all render a
  // basketball league as football. Organization first: it resets the division and season.
  useEffect(() => {
    dispatch(updateOrganizationID(fantasy_group.organization_id));
    dispatch(updateDivisionID(fantasy_group.division_id));
    dispatch(updateSeason(fantasy_group.season));
  }, [dispatch, fantasy_group]);

  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
