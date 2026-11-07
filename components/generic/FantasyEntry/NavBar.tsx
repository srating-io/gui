'use client';

import { Objector, Style } from '@esmalley/ts-utils';
import BackButton from '../BackButton';
import { IconButton, Menu, MenuOption, Typography, useTheme } from '@esmalley/react-material-ui';
import MoreVertIcon from '@esmalley/react-material-icons/MoreVert';
import { useAppSelector } from '@/redux/hooks';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useState } from 'react';


const getNavHeaderHeight = () => {
  return 32;
};

export { getNavHeaderHeight };




const NavBar = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleOpen = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const divStyle = Objector.extender(
    Style.getNavBar(),
    {
      justifyContent: 'space-between',
      backgroundColor: theme.background.main,
      padding: '0px 10px',
      height: getNavHeaderHeight(),
      alignItems: 'center',
    },
  );

  const options: MenuOption[] = [];

  // The entry page never linked back to the league it belongs to, so the only way up was the
  // browser back button.
  if (fantasy_group.fantasy_group_id) {
    options.push({
      value: 'league',
      label: 'View league',
      selectable: true,
      onSelect: () => {
        handleClose();
        navigation.fantasy_group(`/fantasy_group/${fantasy_group.fantasy_group_id}`);
      },
    });
  }


  return (
    <>
      <div className={Style.getStyleClassName(divStyle)}>
        <div style = {{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <BackButton />
        </div>
        <div style = {{
          flex: 2,
          minWidth: 0,
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          <Typography type = 'body2'>{fantasy_entry.name || ''}</Typography>
        </div>
        <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
          {options.length ? (
            <IconButton
              value = 'menu'
              onClick = {handleOpen}
              icon = {<MoreVertIcon style = {{ fontSize: 20 }} />}
            />
          ) : null}
        </div>
      </div>
      <Menu
        anchor = {anchor}
        open = {!!anchor}
        onClose = {handleClose}
        options = {options}
      />
    </>
  );
};

export default NavBar;
