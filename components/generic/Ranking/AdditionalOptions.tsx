import { useState } from 'react';

// import TripleDotsIcon from '@esmalley/react-material-icons/MoreVert';
import SettingsIcon from '@esmalley/react-material-icons/Settings';
import CheckIcon from '@esmalley/react-material-icons/Check';
import VisibilityIcon from '@esmalley/react-material-icons/Visibility';
import FilterAltIcon from '@esmalley/react-material-icons/FilterAlt';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/ranking-slice';
import ConferenceFilterOptions from './ConferenceFilterOptions';
import { ClassYearPickerDialog } from './ClassYearPicker';
import { IconButton, Menu, MenuDivider, MenuOption, Tooltip, useWindowDimensions } from '@esmalley/react-material-ui';
import Organization from '@/components/helpers/Organization';

const AdditionalOptions = ({ view }: {view: string}) => {
  const { width } = useWindowDimensions();
  const [anchor, setAnchor] = useState(null);
  const [classPickerDialogOpen, setClassPickerDialogOpen] = useState(false);
  const [confOptionsOpen, setConfOptionsOpen] = useState(false);
  const open = Boolean(anchor);

  const dispatch = useAppDispatch();
  const hideCommitted = useAppSelector((state) => state.rankingReducer.hideCommitted);
  const hideUnderTwoMPG = useAppSelector((state) => state.rankingReducer.hideUnderTwoMPG);
  const class_years = useAppSelector((state) => state.rankingReducer.class_years);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);


  const handleOpen = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleCommitted = () => {
    const newValue: boolean = !hideCommitted;
    handleClose();
    if (newValue !== hideCommitted) {
      dispatch(setDataKey({ key: 'hideCommitted', value: newValue }));
    }
  };

  const handleUnderTwo = () => {
    const newValue: boolean = !hideUnderTwoMPG;
    handleClose();
    if (newValue !== hideUnderTwoMPG) {
      dispatch(setDataKey({ key: 'hideUnderTwoMPG', value: newValue }));
    }
  };

  const handleConferenceFilter = () => {
    handleClose();
    setConfOptionsOpen(true);
  };

  const handleClassYearFilter = () => {
    handleClose();
    setClassPickerDialogOpen(true);
  };

  const getMenuOptions = () => {
    const menuOptions: MenuOption[] = [];

    if (view === 'transfer') {
      menuOptions.push({
        value: 'hide-committed-display',
        label: 'Hide committed',
        selectable: true,
        onSelect: handleCommitted,
        icon: hideCommitted ? <CheckIcon style = {{ fontSize: 20 }} /> : <VisibilityIcon style = {{ fontSize: 20 }} />,
      });
    }

    if (
      (
        organization_id === Organization.getCBBID() ||
        organization_id === Organization.getCFBID()
      ) &&
      (view === 'transfer' || view === 'player')
    ) {
      if (width < 700) {
        menuOptions.push({
          value: 'class-year-display',
          label: 'Class filter',
          selectable: true,
          onSelect: handleClassYearFilter,
          icon: <FilterAltIcon style = {{ fontSize: 20 }} />,
        });
      }
    }

    if (view === 'player' || view === 'transfer') {
      menuOptions.push({
        value: 'hide-small-mins-display',
        label: 'Hide under 2 MPG',
        selectable: true,
        onSelect: handleUnderTwo,
        icon: hideUnderTwoMPG ? <CheckIcon style = {{ fontSize: 20 }} /> : <VisibilityIcon style = {{ fontSize: 20 }} />,
      });
    }

    if (view === 'transfer') {
      menuOptions.push({
        value: null,
        selectable: false,
        customLabel: <MenuDivider />,
      });

      menuOptions.push({
        value: 'conf-picker-options',
        label: 'Conference filter',
        selectable: true,
        onSelect: handleConferenceFilter,
        icon: <SettingsIcon style = {{ fontSize: 20 }} />,
      });
    }

    return menuOptions;
  };


  return (
    <div style={{ display: 'flex' }}>
      {getMenuOptions().length ?
      <>
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
        options = {getMenuOptions()}
      />
      <ConferenceFilterOptions open={confOptionsOpen} onClose = {() => setConfOptionsOpen(false)} />
      <ClassYearPickerDialog open = {classPickerDialogOpen} selected={class_years} openHandler={handleClassYearFilter} closeHandler={() => setClassPickerDialogOpen(false)} />
      </>
        : ''
      }
    </div>
  );
};

export default AdditionalOptions;
