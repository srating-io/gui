'use client';

import { getHeaderHeight, getMarginTop } from './Header/ClientWrapper';
import { useTheme } from '@esmalley/react-material-ui';
import { Style } from '@esmalley/ts-utils';

const getNavHeaderHeight = () => {
  return 0; // No tabs for Dictionary
};

export { getNavHeaderHeight };

const NavBar = () => {
  const theme = useTheme();
  const backgroundColor = theme.header.main;

  const divStyle = Style.getStyleClassName({
    ...Style.getNavBar(),
    backgroundColor,
    top: getMarginTop() + getHeaderHeight(),
    display: 'none', // Hide since no tabs
  });

  return (
    <div className={divStyle}>
    </div>
  );
};

export default NavBar;
