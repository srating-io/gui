'use client';

import { useState } from 'react';

// import TripleDotsIcon from '@esmalley/react-material-icons/MoreVert';
import SettingsIcon from '@esmalley/react-material-icons/Settings';
import CheckIcon from '@esmalley/react-material-icons/Check';
import VisibilityIcon from '@esmalley/react-material-icons/Visibility';
import GridIcon from '@esmalley/react-material-icons/GridView';
import TimelineIcon from '@esmalley/react-material-icons/ShowChart';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/team-slice';
import { IconButton, Menu, MenuOption, Tooltip } from '@esmalley/react-material-ui';

const AdditionalOptions = () => {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const dispatch = useAppDispatch();
  const trendsBoxscoreLine = useAppSelector((state) => state.teamReducer.trendsBoxscoreLine);
  const trendsSmallMultiples = useAppSelector((state) => state.teamReducer.trendsSmallMultiples);


  const handleOpen = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleTrendsBoxscore = () => {
    const newValue: boolean = !trendsBoxscoreLine;
    dispatch(setDataKey({ key: 'trendsBoxscoreLine', value: newValue }));
    handleClose();
  };

  const handleSmallMultiples = () => {
    dispatch(setDataKey({ key: 'trendsSmallMultiples', value: !trendsSmallMultiples }));
    handleClose();
  };

  const menuOptions: MenuOption[] = [
    {
      value: 'show-small-multiples',
      label: trendsSmallMultiples ? 'Show one stat' : 'Show all stats',
      selectable: true,
      onSelect: handleSmallMultiples,
      icon: trendsSmallMultiples ? <TimelineIcon style = {{ fontSize: 20 }} /> : <GridIcon style = {{ fontSize: 20 }} />,
    },
  ];

  // the grid gives every stat its own panel, and there is no room in one for four lines, so the
  // option that adds a fifth is not offered against it
  if (!trendsSmallMultiples) {
    menuOptions.push({
      value: 'show-boxscore-line',
      label: 'Show boxscore data',
      selectable: true,
      onSelect: handleTrendsBoxscore,
      icon: trendsBoxscoreLine ? <CheckIcon style = {{ fontSize: 20 }} /> : <VisibilityIcon style = {{ fontSize: 20 }} />,
    });
  }


  return (
    <div style = {{ lineHeight: 'initial' }}>
      <Tooltip onClickRemove text = {'Additional filters'}>
        <IconButton
          value="additional-filters"
          onClick={handleOpen}
          icon = {<SettingsIcon style = {{ fontSize: 24 }} />}
        />
      </Tooltip>
      <Menu
        anchor={anchor}
        open={open}
        onClose={handleClose}
        options = {menuOptions}
      />
    </div>
  );
};

export default AdditionalOptions;
