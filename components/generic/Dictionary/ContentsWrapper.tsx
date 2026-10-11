'use client';

import { getNavHeaderHeight } from './NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { getHeaderHeight } from './Header/ClientWrapper';
import { LinearProgress, useTheme } from '@esmalley/react-material-ui';
import { useAppSelector } from '@/redux/hooks';

const ContentsWrapper = (
  { children }:
  { children: React.ReactNode },
) => {
  const theme = useTheme();

  const loadingView = useAppSelector((s) => s.dictionaryReducer.loadingView);

  const paddingTop = getHeaderHeight() + getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;

  return (
    <div style={{ flex: 1 }}>
      {
      loadingView ?
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: `calc(100vh - ${heightToRemove}px)`,
        }}>
          <LinearProgress color={theme.secondary.main} containerStyle={{ width: '50%' }} />
        </div>
        : children
      }
    </div>
  );
};

export default ContentsWrapper;
