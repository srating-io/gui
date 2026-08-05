'use client';

import BackButton from '../BackButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import SettingsIcon from '@esmalley/react-material-icons/Settings';
import { useState } from 'react';
import { setLoading } from '@/redux/features/loading-slice';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { useClientAPI } from '@/components/clientAPI';
import LockIcon from '@esmalley/react-material-icons/Lock';
import LogoutIcon from '@esmalley/react-material-icons/Logout';
import DeleteIcon from '@esmalley/react-material-icons/Delete';
import { FantasyGroupLoadData, handleLoad } from './ReduxWrapper';
import FantasyGroupHelper from '@/components/helpers/FantasyGroup';
import Organization from '@/components/helpers/Organization';
import { Objector, Style } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, IconButton, Menu, MenuOption, Modal, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


const getNavHeaderHeight = () => {
  return 32;
};

export { getNavHeaderHeight };

type ModalData = {
  title: string;
  message: string;
  button: string;
  action: () => void;
}

type LockResponse = {
  fantasy_group: General.FantasyGroup;
  fantasy_draft_orders: General.FantasyDraftOrders;
  error?: string;
}


const NavBar = () => {
  const naviation = useNavigation();
  const theme = useTheme();

  const [anchor, setAnchor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({} as ModalData);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const isOwner = useAppSelector((state) => state.fantasyGroupReducer.isOwner);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const path = Organization.getPath({ organizations, organization_id });
  const open = Boolean(anchor);

  const fantasyHelper = new FantasyGroupHelper({ fantasy_group });


  const divStyle = Objector.extender(
    Style.getNavBar(),
    {
      justifyContent: 'space-between',
      backgroundColor: theme.background.main,
      padding: '0px 10px',
    },
  );

  const handleOpen = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleLock = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_group',
      function: 'lock',
      arguments: {
        fantasy_group_id: fantasy_group.fantasy_group_id,
      },
    }).then((data: LockResponse) => {
      setIsLoading(false);
      dispatch(setLoading(false));

      if (data && data.error) {
        setModalData({
          title: 'Could not lock group',
          message: data.error,
          button: 'Ok',
          action: () => setModalOpen(false),
        });
      } else {
        dispatch(setDataKey({ key: 'fantasy_group', value: data.fantasy_group }));
        dispatch(setDataKey({ key: 'fantasy_draft_orders', value: data.fantasy_draft_orders }));
        setModalOpen(false);
      }
    }).catch((err) => {
      // nothing for now
    });
  };


  const handleLeaveGroup = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_group',
      function: 'leave',
      arguments: {
        fantasy_group_id: fantasy_group.fantasy_group_id,
      },
    }).then((data: FantasyGroupLoadData) => {
      setIsLoading(false);
      dispatch(setLoading(false));
      if (data && data.error) {
        setModalData({
          title: 'Could not leave group',
          message: data.error,
          button: 'Ok',
          action: () => setModalOpen(false),
        });
      } else {
        handleLoad({
          dispatch,
          data,
        });
        setModalOpen(false);
      }
    }).catch((err) => {
      // nothing for now
    });
  };

  const handleDeleteGroup = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_group',
      function: 'remove',
      arguments: {
        fantasy_group_id: fantasy_group.fantasy_group_id,
      },
    }).then((response) => {
      setIsLoading(false);
      dispatch(setLoading(false));

      if (response && response.error) {
        setModalData({
          title: 'Could not delete group',
          message: response.error,
          button: 'Ok',
          action: () => setModalOpen(false),
        });
      }

      if (response === true) {
        setModalOpen(false);
        naviation.fantasy(`/${path}/fantasy`, null, false);
      }
    }).catch((err) => {
      // nothing for now
    });
  };

  const options: MenuOption[] = [];

  if (isOwner && !fantasy_group.locked && fantasyHelper.isDraft()) {
    options.push({
      value: 'lock',
      label: 'Lock group',
      selectable: true,
      onSelect: () => {
        setModalOpen(true);
        setModalData({
          title: 'Lock league?',
          message: 'After locking the league, you can not change it. People can not join a locked league. This action can not be undone. The draft will be generated and will begin at the configured time.',
          button: 'Confirm',
          action: handleLock,
        });
        handleClose();
      },
      icon: <LockIcon style = {{ fontSize: 20 }} />,
    });
  }

  if (isOwner) {
    options.push({
      value: 'del',
      label: 'Delete group',
      selectable: true,
      onSelect: () => {
        setModalOpen(true);
        setModalData({
          title: 'Delete group?',
          message: 'Group and all related data will be deleted. This action can not be undone. Are you sure?',
          button: 'Confirm',
          action: handleDeleteGroup,
        });
        handleClose();
      },
      icon: <DeleteIcon style = {{ color: theme.error.main, fontSize: 20 }} />,
    });
  }

  if (!isOwner) {
    options.push({
      value: 'leave',
      label: 'Leave group',
      selectable: true,
      onSelect: () => {
        setModalOpen(true);
        setModalData({
          title: 'Leave group?',
          message: 'After leaving the group, all your entries will be deleted. Any entry fees will not be refunded. You can rejoin the group if it is public or you are invited again. Are you sure?',
          button: 'Confirm',
          action: handleLeaveGroup,
        });
        handleClose();
      },
      icon: <LogoutIcon style = {{ color: theme.error.main, fontSize: 20 }} />,
    });
  }


  return (
    <>
      <div className={Style.getStyleClassName(divStyle)}>
        <div><BackButton /></div>
        <div>
          {
            options.length ?
            <>
              <IconButton
                value = 'settings'
                onClick={handleOpen}
                icon = {<SettingsIcon style = {{ fontSize: 24 }} />}
              />
              <Menu
                anchor={anchor}
                open={open}
                onClose={handleClose}
                options = {options}
              />
            </>
              : ''
          }
        </div>
      </div>
      <Modal
        open = {modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Typography type = 'h6'>{modalData.title}</Typography>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{modalData.message}</Typography>
        <div style = {{ display: 'flex', justifyContent: 'space-between' }}>
          <Button value = 'cancel' title = 'Cancel' ink onClick={() => setModalOpen(false)} />
          <Button value = 'handleit' title = {modalData.button} onClick={modalData.action} />
        </div>
      </Modal>
    </>
  );
};

export default NavBar;
