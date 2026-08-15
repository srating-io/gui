'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getNavHeaderHeight } from './NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { useEffect } from 'react';
import { setDataKey } from '@/redux/features/player-slice';
import { getSubNavHeaderHeight } from './SubNavbar';
import { LinearProgress, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

export const getSeasonOptions = (player_team_seasons: General.PlayerTeamSeasons) => {
  return Object.values(player_team_seasons)
    .sort((a, b) => {
      // Primary sort: season descending
      if (b.season !== a.season) {
        return b.season - a.season;
      }

      // Secondary sort: start_date + end_date (if not both null)
      const aHasDates = a.start_date || a.end_date;
      const bHasDates = b.start_date || b.end_date;

      if (!aHasDates && bHasDates) return 1;
      if (aHasDates && !bHasDates) return -1;

      // Compare start_date first
      if (a.start_date !== b.start_date) {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return a.start_date.localeCompare(b.start_date);
      }

      // Then compare end_date
      if (a.end_date !== b.end_date) {
        if (!a.end_date) return 1;
        if (!b.end_date) return -1;
        return a.end_date.localeCompare(b.end_date);
      }

      return 0;
    });
}


const ContentsWrapper = (
  { children }:
  { children: React.JSX.Element },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const loadingView = useAppSelector((state) => state.playerReducer.loadingView);

  const paddingTop = getNavHeaderHeight() + getSubNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;

  useEffect(() => {
    dispatch(setDataKey({ key: 'loadingView', value: false }));
  }, [children]);


  return (
    <div style = {{ paddingTop }}>
      {
      loadingView ?
        <div style = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: `calc(100vh - ${heightToRemove}px)`,
        }}>
          <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
        </div>
        : children
      }
    </div>
  );
};

export default ContentsWrapper;
