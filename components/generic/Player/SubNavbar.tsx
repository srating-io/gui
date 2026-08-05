'use client';

import { RefObject, useLayoutEffect, useRef } from 'react';
import { getHeaderHeight, getMarginTop } from './Header/ClientWrapper';
import { getNavHeaderHeight } from './NavBar';
import { useAppSelector } from '@/redux/hooks';
import { Style } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Tab, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

const getSubNavHeaderHeight = () => {
  const view = useAppSelector((state) => state.playerReducer.view);
  if (view === 'gamelog') {
    return 48;
  }
  return 0;
};

export { getSubNavHeaderHeight };

const SubNavBar = ({ view }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const scrollRefTab = useRef<HTMLDivElement>(null);

  const season = useAppSelector((state) => state.playerReducer.season);
  const player_team_seasons = useAppSelector((state) => state.playerReducer.player_team_seasons);

  const subview = useAppSelector((state) => state.playerReducer.subview) || season;
  const seasons = [...new Set(
    Object.values(player_team_seasons).map((r) => r.season),
  )];

  const scrollToElement = () => {
    scrollRefTab.current?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  };

  // console.log('todo add scroll to all subnavbars / normalize component')

  useLayoutEffect(() => {
    scrollToElement();
  }, [subview, scrollRefTab.current]);


  let tabOrder: number[] = [];

  if (view === 'gamelog') {
    tabOrder = seasons.sort((a, b) => b - a);
  }

  const subHeaderHeight = getSubNavHeaderHeight();

  const minSubBarWidth = 10;

  const subHeaderStyle: React.CSSProperties = {
    height: subHeaderHeight,
    position: 'fixed',
    backgroundColor: theme.background.main,
    zIndex: Style.getStyle().zIndex.appBar,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: getHeaderHeight() + getMarginTop() + getNavHeaderHeight(),
    left: 0,
    right: 0,
    padding: '0px 20px',
  };

  const leftButtons: React.JSX.Element[] = [];
  const middleButtons: React.JSX.Element[] = [];
  const rightButtons: React.JSX.Element[] = [];

  if (tabOrder.length) {
    const tabs: React.JSX.Element[] = [];

    const handleTabClick = (e, value) => {
      const newSubview = value;

      if (newSubview !== subview) {
        navigation.playerView({ subview: newSubview });
      }
    };

    const buttonStyle: React.CSSProperties = {};

    if (width <= 425) {
      buttonStyle.minWidth = 50;
    }


    for (let i = 0; i < tabOrder.length; i++) {
      const selected = tabOrder[i] === (subview ? +subview : season);

      let tabRef: RefObject<HTMLDivElement> | null = null;
      if (selected) {
        tabRef = scrollRefTab as RefObject<HTMLDivElement>;
      }

      const tab =
        <Tab
          ref = {tabRef}
          key = {tabOrder[i]}
          title = {tabOrder[i].toString()}
          value = {tabOrder[i]}
          selected = {selected}
          onClick={handleTabClick}
          buttonStyle = {buttonStyle}
        />;

      tabs.push(tab);
    }


    middleButtons.push(
      <div style = {{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ display: 'flex', margin: 'auto' }}>
          {tabs}
        </div>
      </div>,
    );
  }

  return (
    <div className={Style.getStyleClassName(subHeaderStyle)}>
      <div style = {{ minWidth: minSubBarWidth, display: 'flex' }}>
        {leftButtons}
      </div>

      <div style = {{ minWidth: minSubBarWidth, display: 'flex' }}>
        {middleButtons}
      </div>

      <div style = {{ minWidth: minSubBarWidth, display: 'flex', justifyContent: 'end' }}>
        {rightButtons}
      </div>
    </div>
  );
};

export default SubNavBar;
