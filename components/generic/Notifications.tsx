'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import React, { SyntheticEvent, useState } from 'react';


import DeleteIcon from '@esmalley/react-material-icons/Delete';
import { useNavigation } from '../hooks/useNavigation';
import { useClientAPI } from '../clientAPI';
import { setDataKey } from '@/redux/features/user-slice';
import Blank from './Blank';
import { Dates, toast } from '@esmalley/ts-utils';
import { Button, IconButton, Modal, Tile, Typography, useTheme } from '@esmalley/react-material-ui';


const Notifications = (
  {
    open,
    closeHandler,
  } :
  {
    open: boolean;
    closeHandler: (e) => void;
  },
) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const theme = useTheme();

  const user = useAppSelector((state) => state.userReducer.user) || {};
  const notifications = useAppSelector((state) => state.userReducer.notifications) || {};

  const [viewCleared, setViewCleared] = useState(false);
  const [requested, setRequested] = useState(false);

  const active = {};
  const inactive = {};

  for (const notification_id in notifications) {
    const row = notifications[notification_id];

    if (row.cleared) {
      inactive[notification_id] = row;
    } else {
      active[notification_id] = row;
    }
  }

  const handleClear = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | SyntheticEvent<Element, Event>,
    notification_ids: string[],
    callback?: () => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (!notification_ids) {
      console.warn('No notification_ids');
      return;
    }

    if (requested) {
      return;
    }


    setRequested(true);

    useClientAPI({
      class: 'notification',
      function: 'clear',
      arguments: {
        notification_id: notification_ids,
      },
    }).then((notifications) => {
      if (!notifications || notifications.error) {
        console.log(notifications.error || 'Something went wrong');
      } else {
        dispatch(setDataKey({ key: 'notifications', value: notifications || {} }));
        setRequested(false);
        if (callback) {
          callback();
        }
      }
    }).catch((err) => {
      setRequested(false);
      if (callback) {
        callback();
      }
    });
  };

  const buttons: React.JSX.Element[] = [];

  if (Object.keys(inactive).length && !viewCleared) {
    buttons.push(
      <Button ink onClick = {() => setViewCleared(true)} title = {'View cleared'} value = 'view-cleared' />,
    );
  }

  if (viewCleared) {
    buttons.push(
      <Button ink onClick = {() => setViewCleared(false)} title = {'View active'} value = 'view-active' />,
    );
  }

  if (Object.keys(active).length) {
    buttons.push(
      <Button
        ink
        onClick = {(e) => {
          handleClear(
            e,
            Object.keys(active),
          );
        }}
        buttonStyle={{ color: theme.error.main }}
        title = {'Clear all'}
        value = 'clear-all'
      />,
    );
  }

  const contents: React.JSX.Element[] = [];

  const rows = viewCleared ? inactive : active;


  for (const notification_id in rows) {
    const row = rows[notification_id];

    const rowButtons: React.JSX.Element[] = [];

    if (row.table && row.id) {
      rowButtons.push(
        <Button
          ink
          onClick = {(e) => {
            handleClear(
              e,
              [row.notification_id],
              () => {
                if (
                  row.table in navigation &&
                  ['fantasy_group', 'fantasy_entry'].includes(row.table)
                ) {
                  // todo programatically get the path somehow
                  navigation[row.table](`/${row.table}/${row.id}`);
                } else if (
                  row.table === 'user' &&
                  row.id === user.user_id
                ) {
                  navigation.user('/account?view=settings');
                } else {
                  // nothing writes a notification for another table today, but a console.log is
                  // not an answer for the reader if something starts to
                  toast.info('There is nothing to open for this notification.');
                }
                closeHandler(e);
              },
            );
          }}
          title = {'View'}
          value = 'view'
        />,
      );
    }

    if (!row.cleared) {
      rowButtons.push(
        <IconButton
          icon={<DeleteIcon style = {{ fontSize: 20, color: theme.error.main }} />}
          value = 'clear'
          onClick={(e) => {
            handleClear(
              e,
              [row.notification_id],
            );
          }}
        />,
      );
    }

    contents.push(
      <div style = {{
        borderBottom: `1px solid ${theme.info.main}`,
        padding: 5,
      }}>
        <Typography type = 'caption' style = {{ color: theme.text.secondary, fontStyle: 'italic' }}>{Dates.format(Dates.parse(row.date_of_entry, true), 'M jS h:i a')}</Typography>
        <Tile
          primary = {row.title}
          secondary = {row.message}
          buttons={rowButtons}
        />
      </div>,
    );
  }

  if (!contents.length) {
    contents.push(
      <Blank text = 'No notifications' />,
    );
  }


  return (
    <Modal
      open={open}
      onClose={closeHandler}
    >
      <Typography type = 'h6'>Notifications</Typography>
      {contents}
      <div style = {{ textAlign: 'right', marginTop: 10 }}>
        {buttons}
      </div>
    </Modal>
  );
};

export default Notifications;

