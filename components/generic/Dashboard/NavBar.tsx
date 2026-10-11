'use client';

import { useAppSelector } from '@/redux/hooks';
import { Style } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Tab, useTheme } from '@esmalley/react-material-ui';
import BackButton from '@/components/generic/BackButton';

const getNavHeaderHeight = () => {
  return 48;
};

export { getNavHeaderHeight };

/**
 * How much room the back button gets on either end of the row. The right end is empty and only
 * there to balance it, which is what keeps the tabs centered whether or not back is showing.
 */
const backSlotWidth = 40;


const NavBar = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const view = useAppSelector((state) => state.dashboardReducer.view) || 'overview';
  const audit_gui_id = useAppSelector((state) => state.dashboardReducer.audit_gui_id);

  const tabOrder = ['overview', 'errors', 'traffic', 'revenue', 'keys', 'dictionary'];

  const tabOptions = {
    overview: 'Overview',
    errors: 'Errors',
    traffic: 'API traffic',
    revenue: 'Revenue',
    keys: 'API keys',
    dictionary: 'Dictionary',
  };


  const handleTabClick = (e, value) => {
    const newView = value;

    if (newView === view) {
      return;
    }

    if (newView === 'dictionary') {
      navigation.getRouter().push('/dictionary');
      return;
    }

    navigation.dashboardView({ view: newView });
  };

  const tabs: React.JSX.Element[] = [];

  for (let i = 0; i < tabOrder.length; i++) {
    tabs.push(
      <Tab key = {tabOrder[i]} value = {tabOrder[i]} selected = {tabOrder[i] === view} title = {tabOptions[tabOrder[i]]} onClick = {handleTabClick} />,
    );
  }

  /**
   * The error panel is the only one that drills into a row, so it is the only one with somewhere to
   * go back to. Every other panel is already the top of its own view.
   */
  const showBack = !!(view === 'errors' && audit_gui_id);

  /**
   * The scroll moves off the row and onto the tab strip. The tabs are what overflow a narrow screen,
   * and back belongs against the left edge the whole time rather than scrolling away with them.
   */
  const divStyle = Style.getStyleClassName({
    ...Style.getNavBar(),
    justifyContent: 'space-between',
    alignItems: 'center',
    overflowX: 'hidden',
    backgroundColor: theme.background.main,
  });

  const slotStyle: React.CSSProperties = {
    display: 'flex',
    flex: `0 0 ${backSlotWidth}px`,
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    flex: '1 1 auto',
    minWidth: 0,
    justifyContent: 'center',
    overflowX: 'scroll',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
  };

  return (
    <>
      <div className={divStyle}>
        <div style = {slotStyle}>{showBack ? <BackButton /> : ''}</div>
        <div style = {tabsStyle}>{tabs}</div>
        <div style = {slotStyle}></div>
      </div>
    </>
  );
};

export default NavBar;
