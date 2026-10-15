'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import EmojiPeopleIcon from '@esmalley/react-material-icons/EmojiPeople';
import { useEffect, useState } from 'react';
import FantasyGroup from '@/components/helpers/FantasyGroup';
import { setLoading } from '@/redux/features/loading-slice';
import { useClientAPI } from '@/components/clientAPI';
import { handleData } from '../../ReduxWrapper';
import { Dates, toast } from '@esmalley/ts-utils';
import { Button, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';


const DraftZonePick = ({ selectedRow, onPick }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyGroupReducer.fantasy_draft_orders);
  const fantasy_group_users = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group_users);
  const user = useAppSelector((state) => state.userReducer.user);

  const [timeLeft, setTimeLeft] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [autoPicked, setAutoPicked] = useState(false);

  const fantasyHelper = new FantasyGroup({ fantasy_group });

  const current_fantasy_draft_order = fantasyHelper.getCurrentPick({ fantasy_draft_orders });


  const isOpen = (
    current_fantasy_draft_order &&
    current_fantasy_draft_order.eligible &&
    Dates.parse(current_fantasy_draft_order.eligible, true).getTime() < new Date().getTime()
  );


  const isMyPick = (
    user &&
    current_fantasy_draft_order &&
    current_fantasy_draft_order.fantasy_entry_id &&
    current_fantasy_draft_order.fantasy_entry_id in fantasy_entrys &&
    fantasy_entrys[current_fantasy_draft_order.fantasy_entry_id].user_id === user.user_id
  );

  const current_picking_user_id = (
    current_fantasy_draft_order &&
    current_fantasy_draft_order.fantasy_entry_id &&
    current_fantasy_draft_order.fantasy_entry_id in fantasy_entrys &&
    fantasy_entrys[current_fantasy_draft_order.fantasy_entry_id].user_id
  );

  const user_id_x_fantasy_group_user = {};
  for (const fantasy_group_user_id in fantasy_group_users) {
    const row = fantasy_group_users[fantasy_group_user_id];
    user_id_x_fantasy_group_user[row.user_id] = row;
  }

  useEffect(() => {
    setErrorMessage('');
  }, [selectedRow]);

  useEffect(() => {
    if (!current_fantasy_draft_order || !current_fantasy_draft_order.expires) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const difference = Dates.parse(current_fantasy_draft_order.expires as string, true).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft('Times up! Auto-picking a player...');

        // if I have a selected row, but didnt press the button, try to pick it for them
        if (selectedRow && isMyPick && !autoPicked) {
          setAutoPicked(true);
          handlePick();
        }
        return;
      }

      // Formatting logic (assuming Dates util handles duration or manual calc)
      // Example: "0m 45s"
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);


      setTimeLeft(`Time remaining: ${minutes}m ${seconds}s`);
    };

    // Initial call and 1s interval
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    // eslint-disable-next-line consistent-return
    return () => clearInterval(timerId);
  }, [isMyPick, selectedRow, current_fantasy_draft_order?.expires, autoPicked]);


  const handlePick = () => {
    if (sending) {
      return;
    }

    if (
      !selectedRow ||
      !selectedRow.player_team_season ||
      !selectedRow.player_team_season.player_team_season_id
    ) {
      throw new Error('Missing player_team_season_id');
    }
    setErrorMessage('');
    setSending(true);
    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_draft_order',
      function: 'pick',
      arguments: {
        fantasy_draft_order_id: current_fantasy_draft_order?.fantasy_draft_order_id,
        player_team_season_id: selectedRow.player_team_season.player_team_season_id,
      },
    })
      .then((data) => {
        setSending(false);
        dispatch(setLoading(false));

        if (data.error) {
          setErrorMessage(data.error);
          toast.error(data.error);
          return;
        }

        setAutoPicked(false);

        onPick();

        handleData({
          dispatch,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
        setSending(false);
        dispatch(setLoading(false));
      });
  };

  const getContents = () => {
    if (!isMyPick || !isOpen) {
      return (
        <div style = {{ textAlign: 'center' }}>
          {isOpen ? <Typography type = 'subtitle1' style = {{ color: theme.error.main }}>{timeLeft}</Typography> : ''}
          {
            !isMyPick && isOpen &&
            current_picking_user_id &&
            current_picking_user_id in user_id_x_fantasy_group_user ?
              <Typography type = 'body1'>{user_id_x_fantasy_group_user[current_picking_user_id].name || current_picking_user_id} is currently picking!</Typography>
              : ''
          }
          <Typography type = 'body1'>Waiting for your turn...</Typography>
        </div>
      );
    }

    return (
      <>
        <div style = {{ textAlign: 'center' }}>
          <Typography type = 'subtitle1' style = {{ color: theme.error.main }}>{timeLeft}</Typography>
          <Typography type = 'subtitle1'>It is your turn! Select a player to add to your team</Typography>
        </div>
        <div>
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>My pick</Typography>
          <Tile
            icon = {<EmojiPeopleIcon style = {{ fontSize: 24 }} />}
            primary = {selectedRow ? selectedRow.name : 'No selection yet'}
            secondary= {selectedRow ? selectedRow.team_name : 'Select a player from the table below'}
          />
        </div>
        <div style = {{ textAlign: 'center' }}>
          <Button
            value = 'make_pick'
            title = 'Finalize pick'
            onClick={handlePick}
            disabled = {!selectedRow && isMyPick}
          />
        </div>
        {
          errorMessage ?
            <Typography type = 'caption' style = {{ color: theme.error.main }}>{errorMessage}</Typography>
            : ''
        }
      </>
    );
  };


  return (
    <Paper style = {{ padding: 16, marginBottom: 20 }}>
      {getContents()}
    </Paper>
  );
};

export default DraftZonePick;
