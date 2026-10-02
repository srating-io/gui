'use client';

import { useTransition } from 'react';
import { getHeaderHeight, getMarginTop } from './Header/ClientWrapper';
import { getNavHeaderHeight } from './NavBar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import LegendToggleIcon from '@esmalley/react-material-icons/LegendToggle';
import HistoryIcon from '@esmalley/react-material-icons/History';
import { usePathname, useRouter } from 'next/navigation';
import { setDataKey } from '@/redux/features/team-slice';
import AdditionalOptions from './Contents/Schedule/AdditionalOptions';
import { Style } from '@esmalley/ts-utils';
import { IconButton, Tab, Tooltip, useTheme } from '@esmalley/react-material-ui';

const getSubNavHeaderHeight = () => 42;

export { getSubNavHeaderHeight };

const SubNavBar = ({ view }) => {
  const theme = useTheme();
  const router = useRouter();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();


  const dispatch = useAppDispatch();
  const scheduleView = useAppSelector((state) => state.teamReducer.scheduleView);
  const showScheduleDifferentials = useAppSelector((state) => state.teamReducer.showScheduleDifferentials);
  const showScheduleHistoricalRankRecord = useAppSelector((state) => state.teamReducer.showScheduleHistoricalRankRecord);
  const statsCharts = useAppSelector((state) => state.teamReducer.statsCharts);
  const subview = useAppSelector((state) => state.teamReducer.subview) || (view === 'stats' ? 'team' : 'stats');


  let tabOrder: string[] = [];
  let tabOptions = {};

  if (view === 'stats') {
    tabOrder = ['team', 'player'];
    tabOptions = {
      team: 'Team',
      player: 'Players',
    };
  } else if (view === 'trends') {
    tabOrder = ['stats', 'accuracy', 'ranking'];
    tabOptions = {
      ranking: 'Ranking',
      stats: 'Stats',
      accuracy: 'Accuracy',
    };
  }


  const subHeaderHeight = getSubNavHeaderHeight();

  const minSubBarWidth = 75;

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

  if (view === 'schedule') {
    if (scheduleView === 'default') {
      leftButtons.push(
        <Tooltip key = {'toggle-all-historical-charts-tooltip'} text = {'Toggle all historical charts'}>
          <IconButton
            value = 'differential-button'
            onClick = {() => dispatch(setDataKey({ key: 'showScheduleDifferentials', value: !showScheduleDifferentials }))}
            icon = {<LegendToggleIcon style = {{ fontSize: 24, color: theme[(showScheduleDifferentials ? 'success' : 'primary')].main }} />}
          />
        </Tooltip>,
      );

      leftButtons.push(
        <Tooltip key = {'toggle-all-historical-ranking-tooltip'} text = {showScheduleHistoricalRankRecord ? 'Show current record / rank' : 'Show historical record / rank at time of game'}>
          <IconButton
            containerStyle={{ marginLeft: 5 }}
            value = 'historical-button'
            onClick = {() => dispatch(setDataKey({ key: 'showScheduleHistoricalRankRecord', value: !showScheduleHistoricalRankRecord }))}
            icon = {<HistoryIcon style = {{ fontSize: 24, color: theme[(showScheduleHistoricalRankRecord ? 'success' : 'primary')].main }} />}
          />
        </Tooltip>,
      );
    }

    rightButtons.push(<AdditionalOptions key = {'additional-options'} />);
  } else if (tabOrder.length) {
    const tabs: React.JSX.Element[] = [];

    const handleTabClick = (e, value) => {
      const newSubview = value;

      if (newSubview !== subview) {
        dispatch(setDataKey({ key: 'subview', value: newSubview }));
        dispatch(setDataKey({ key: 'loadingView', value: true }));

        const current = new URLSearchParams(window.location.search);
        current.set('subview', newSubview);

        window.history.replaceState(null, '', `?${current.toString()}`);

        // use pushState if we want to add to back button history
        // window.history.pushState(null, '', `?${current.toString()}`);

        const search = current.toString();
        const query = search ? `?${search}` : '';

        startTransition(() => {
          router.replace(`${pathName}${query}`);
        });
        // const current = new URLSearchParams(Array.from(searchParams.entries()));
        // current.set('subview', subView);
        // const search = current.toString();
        // const query = search ? `?${search}` : '';

        // dispatch(setLoading(true));
        // startTransition(() => {
        //   router.replace(`${pathName}${query}`);
        // });
      }
    };


    for (let i = 0; i < tabOrder.length; i++) {
      const selected = tabOrder[i] === subview;
      tabs.push(<Tab key = {tabOrder[i]} title = {tabOptions[tabOrder[i]]} value = {tabOrder[i]} selected = {selected} onClick={handleTabClick}/>);
    }


    middleButtons.push(
      <div key = {subview} style = {{ width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'scroll', overflowY: 'hidden', scrollbarWidth: 'none' }}>
        {tabs}
      </div>,
    );
  }

  // the team stats page leads with three charts, which summarise the grid below rather than saying
  // anything it does not. They are a thing to reach for, so they stay off until asked for.
  if (view === 'stats' && subview === 'team') {
    leftButtons.push(
      <Tooltip key = {'toggle-stats-charts-tooltip'} text = {statsCharts ? 'Hide charts' : 'Show charts'}>
        <IconButton
          value = 'stats-charts-button'
          onClick = {() => dispatch(setDataKey({ key: 'statsCharts', value: !statsCharts }))}
          icon = {<LegendToggleIcon style = {{ fontSize: 24, color: theme[(statsCharts ? 'success' : 'primary')].main }} />}
        />
      </Tooltip>,
    );
  }

  return (
    <div style = {subHeaderStyle}>
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
