'use client';

import { useAppSelector } from '@/redux/hooks';
import { getNavHeaderHeight } from './NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { LinearProgress, useTheme } from '@esmalley/react-material-ui';

const ContentsWrapper = (
  { children }:
  { children: React.JSX.Element },
) => {
  const theme = useTheme();

  const loadingView = useAppSelector((state) => state.dashboardReducer.loadingView);

  const paddingTop = getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;

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
