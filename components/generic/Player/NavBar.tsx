'use client';

import { getHeaderHeight, getMarginTop } from './Header/ClientWrapper';
import { useAppSelector } from '@/redux/hooks';
import SubNavBar from './SubNavbar';
import { Style } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Tab, useTheme } from '@esmalley/react-material-ui';


const getNavHeaderHeight = () => {
  return 42;
};

export { getNavHeaderHeight };

/**
 * `view` is the view the server resolved from the url.
 *
 * The store wins once the visitor has clicked a tab, so the highlight is still instant. It is
 * only the first render that needs the prop: `ReduxWrapper` seeds the view in an effect, so the
 * store is empty while the server renders and the markup marked the wrong tab selected -- which
 * React then had to throw away and regenerate.
 */
const NavBar = ({ view: serverView }: { view?: string }) => {
  const navigation = useNavigation();
  const theme = useTheme();

  const storeView = useAppSelector((state) => state.playerReducer.view);

  // the selector is read first on purpose - putting it after `||` would call a hook conditionally
  const view = serverView || storeView || 'stats';

  const tabOrder = ['stats', 'gamelog', 'trends'];

  const tabOptions = {
    stats: 'Stats',
    gamelog: 'Gamelog',
    trends: 'Trends',
  };

  const backgroundColor = theme.header.main;

  const handleTabClick = (e, value: string) => {
    const newView = value;

    if (newView !== view) {
      navigation.playerView({ view: newView });
    }
  };

  const tabs: React.JSX.Element[] = [];

  for (let i = 0; i < tabOrder.length; i++) {
    tabs.push(
      <Tab key = {tabOrder[i]} value = {tabOrder[i]} selected = {tabOrder[i] === view} title = {tabOptions[tabOrder[i]]} containerStyle={{ backgroundColor }} onClick = {handleTabClick} />,
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
      <SubNavBar view = {view} />
    </>
  );
};

export default NavBar;
