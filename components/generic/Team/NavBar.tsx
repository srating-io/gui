'use client';

import { useTransition } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { getHeaderHeight, getMarginTop } from './Header/ClientWrapper';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/team-slice';
import SubNavBar from './SubNavbar';
import { Style } from '@esmalley/ts-utils';
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
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();

  const storeView = useAppSelector((state) => state.teamReducer.view);

  // the selector is read first on purpose - putting it after `||` would call a hook conditionally
  const view = serverView || storeView || 'schedule';

  const tabOrder = ['schedule', 'stats', 'trends'];

  const tabOptions = {
    schedule: 'Schedule',
    stats: 'Stats / Roster',
    trends: 'Trends',
  };

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
