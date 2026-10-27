'use client';

import BackButton from '../BackButton';
import SeasonPicker from './SeasonPicker';
import { useAppSelector } from '@/redux/hooks';
import { Typography, useTheme } from '@esmalley/react-material-ui';
import { Objector, Style } from '@esmalley/ts-utils';


const getNavHeaderHeight = () => {
  return 42;
};

export { getNavHeaderHeight };

const NavBar = () => {
  const theme = useTheme();
  const view = useAppSelector((state) => state.fantasyReducer.view);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization) || {};


  const divStyle = Objector.extender(
    Style.getNavBar(),
    {
      justifyContent: 'space-between',
      backgroundColor: theme.background.main,
      padding: 5,
    },
  );


  const getHeaderText = () => {
    if (view === 'home') {
      return `${organizations[organization_id].name} fantasy leagues`;
    }

    if (view === 'create') {
      return 'Create a fantasy league';
    }

    return null;
  };

  const show_back = (view !== 'home' && view !== 'create');


  return (
    <>
      <div className={Style.getStyleClassName(divStyle)}>
        <div style = {{ display: 'flex' }}>{show_back ? <BackButton /> : ''}</div>
        <div>{getHeaderText() ? <Typography type = 'h6'>{getHeaderText()}</Typography> : ''}</div>
        <div>{view === 'home' ? <SeasonPicker /> : ''}</div>
      </div>
    </>
  );
};

export default NavBar;
