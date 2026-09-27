'use client';

import { getHeaderHeight, getMarginTop } from './Header/ClientWrapper';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import HelperGame from '@/components/helpers/Game';
import { setDataKey } from '@/redux/features/game-slice';
import { startTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Style } from '@esmalley/ts-utils';
import { Tab, useTheme } from '@esmalley/react-material-ui';


const getNavHeaderHeight = () => {
  return 48;
};

const getSubNavHeaderHeight = () => 48;

export { getNavHeaderHeight, getSubNavHeaderHeight };

const NavBar = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();
  const pathName = usePathname();

  const game = useAppSelector((state) => state.gameReducer.game);

  const Game = new HelperGame({
    game,
  });

  const view = useAppSelector((state) => state.gameReducer.view) || (Game.isInProgress() || Game.isFinal() ? 'game_details' : 'matchup');
  const subview = useAppSelector((state) => state.gameReducer.subview) || (view === 'game_details' ? 'boxscore' : null) || (view === 'trends' ? 'stat_compare' : null);

  let tabOrder = ['matchup', 'trends'];
  if (Game.isInProgress() || Game.isFinal()) {
    tabOrder = ['game_details', 'matchup', 'trends'];
  }

  const tabOptions = {
    game_details: 'Game details',
    trends: 'Trends',
    matchup: 'Matchup',
  };

  let subTabOptions = {};
  if (view === 'game_details') {
    subTabOptions = {
      charts: 'Charts',
      boxscore: 'Boxscore',
      pbp: 'Play by play',
    };
  } else if (view === 'trends') {
    subTabOptions = {
      stat_compare: 'Stat compare',
      previous_matchups: 'Prev. Matchups',
      odds: 'Lines',
      momentum: 'Momentum',
    };
  }

  let subTabOrder: string[] = [];
  if (view === 'game_details') {
    subTabOrder = ['boxscore', 'charts', 'pbp'];
  } else if (view === 'trends') {
    subTabOrder = ['stat_compare', 'previous_matchups', 'odds', 'momentum'];
  }

  const backgroundColor = theme.header.main;

  const handleTabClick = (e, value) => {
    const newView = value;

    if (newView !== view) {
      dispatch(setDataKey({ key: 'view', value: newView }));
      dispatch(setDataKey({ key: 'subview', value: null }));
      dispatch(setDataKey({ key: 'loadingView', value: true }));

      const current = new URLSearchParams(window.location.search);
      current.set('view', newView);
      current.delete('subview');

      window.history.replaceState(null, '', `?${current.toString()}`);

      // use pushState if we want to add to back button history
      // window.history.pushState(null, '', `?${current.toString()}`);

      const search = current.toString();
      const query = search ? `?${search}` : '';

      startTransition(() => {
        router.replace(`${pathName}${query}`);
      });
    }
  };


  const handleSubTabClick = (e, value) => {
    const newSubView = value;

    if (newSubView !== subview) {
      dispatch(setDataKey({ key: 'subview', value: newSubView }));
      dispatch(setDataKey({ key: 'loadingView', value: true }));

      const current = new URLSearchParams(window.location.search);
      current.set('subview', newSubView);

      window.history.replaceState(null, '', `?${current.toString()}`);

      // use pushState if we want to add to back button history
      // window.history.pushState(null, '', `?${current.toString()}`);

      const search = current.toString();
      const query = search ? `?${search}` : '';

      startTransition(() => {
        router.replace(`${pathName}${query}`);
      });
    }
  };


  const tabs: React.JSX.Element[] = [];

  for (let i = 0; i < tabOrder.length; i++) {
    tabs.push(
      <Tab key = {tabOrder[i]} value = {tabOrder[i]} selected = {tabOrder[i] === view} title = {tabOptions[tabOrder[i]]} containerStyle={{ backgroundColor }} onClick = {handleTabClick} />,
    );
  }

  const subTabs: React.JSX.Element[] = [];

  for (let i = 0; i < subTabOrder.length; i++) {
    subTabs.push(
      <Tab key = {subTabOrder[i]} value = {subTabOrder[i]} selected = {subTabOrder[i] === subview} title = {subTabOptions[subTabOrder[i]]} onClick = {handleSubTabClick} />,
    );
  }

  const divStyle = Style.getStyleClassName({
    ...Style.getNavBar(),
    backgroundColor,
    top: getMarginTop() + getHeaderHeight(),
  });

  return (
    <>
      <div className={divStyle}>
        {tabs}
      </div>
      <div style = {{ marginTop: getNavHeaderHeight(), width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'scroll', overflowY: 'hidden', scrollbarWidth: 'none' }}>
        {subTabs}
      </div>
    </>
  );
};

export default NavBar;
