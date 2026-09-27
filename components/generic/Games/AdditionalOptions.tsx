'use client';

import { useState } from 'react';

import SettingsIcon from '@esmalley/react-material-icons/Settings';
import CheckIcon from '@esmalley/react-material-icons/Check';
import VisibilityIcon from '@esmalley/react-material-icons/Visibility';
import ViewModuleIcon from '@esmalley/react-material-icons/ViewModule';
import MilitaryTechIcon from '@esmalley/react-material-icons/MilitaryTech';


import RankPicker from '@/components/generic/RankPicker';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/display-slice';
import CardPicker from './CardPicker';
import { IconButton, Menu, MenuDivider, MenuOption, Tooltip } from '@esmalley/react-material-ui';

const AdditionalOptions = () => {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const [rankPickerOpen, setRankPickerOpen] = useState(false);
  const [cardPickerOpen, setCardPickerOpen] = useState(false);

  const dispatch = useAppDispatch();
  const hideOdds = useAppSelector((state) => state.displayReducer.hideOdds);


  const handleOpen = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };


  const menuOptions: MenuOption[] = [
    {
      value: 'rank_display',
      label: 'Rank display',
      selectable: true,
      onSelect: () => {
        setRankPickerOpen(true);
        handleClose();
      },
      icon: <MilitaryTechIcon style = {{ fontSize: 20 }} />,
    },
    {
      value: 'card_display',
      label: 'Card display',
      selectable: true,
      onSelect: () => {
        setCardPickerOpen(true);
        handleClose();
      },
      icon: <ViewModuleIcon style = {{ fontSize: 20 }} />,
    },
    {
      value: null,
      selectable: false,
      customLabel: <MenuDivider />,
    },
    {
      value: 'odds_display',
      label: 'Hide market lines',
      selectable: true,
      onSelect: () => {
        dispatch(setDataKey({ key: 'hideOdds', value: (hideOdds === 1 ? 0 : 1) }));
      },
      icon: hideOdds ? <CheckIcon style = {{ fontSize: 20 }} /> : <VisibilityIcon style = {{ fontSize: 20 }} />,
    },
  ];


  return (
    <div>
      <Tooltip onClickRemove text = {'Additional options'}>
        <IconButton
          value="additional-options"
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
      <RankPicker open = {rankPickerOpen} openHandler = {() => { setRankPickerOpen(true); }} closeHandler = {() => { setRankPickerOpen(false); }} />
      <CardPicker open = {cardPickerOpen} openHandler = {() => { setCardPickerOpen(true); }} closeHandler = {() => { setCardPickerOpen(false); }} />
    </div>
  );
};

export default AdditionalOptions;
