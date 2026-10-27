'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import EmojiPeopleIcon from '@esmalley/react-material-icons/EmojiPeople';
import { useEffect, useRef, useState } from 'react';
import FantasyGroup from '@/components/helpers/FantasyGroup';
import { setLoading } from '@/redux/features/loading-slice';
import { useClientAPI } from '@/components/clientAPI';
import { handleData } from '../../ReduxWrapper';
import { getStore } from '@/app/StoreProvider';
import { Dates, toast } from '@esmalley/ts-utils';
import { Button, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';


const DraftZonePick = ({ selectedRow, onPick, fantasy_entry_id_x_pre_pick_row, onSelect }) => {
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

  // what the pre-draft list points at for whoever is on the clock; the load only carries this
  // user's own lists, so another entry's turn resolves to nothing
  const pre_pick_row = (
    current_fantasy_draft_order &&
    current_fantasy_draft_order.fantasy_entry_id &&
    fantasy_entry_id_x_pre_pick_row &&
    fantasy_entry_id_x_pre_pick_row[current_fantasy_draft_order.fantasy_entry_id]
  ) || null;

  const isPrePicked = (
    pre_pick_row &&
    selectedRow &&
    selectedRow.player_team_season_id === pre_pick_row.player_team_season_id
  );

  const prefilledRef = useRef<string | null>(null);

  /**
   * Arrive at your turn with the card already holding the top name off your pre-draft list, so
   * honoring it is one click instead of finding the player again with the clock running.
   *
   * Once per slot only: a click in the table has to win, and this re-runs every time a broadcast
   * changes the pool.
   */
  useEffect(() => {
    if (!isMyPick || !isOpen || !current_fantasy_draft_order || !pre_pick_row) {
      return;
    }

    const { fantasy_draft_order_id } = current_fantasy_draft_order;

    if (!fantasy_draft_order_id || prefilledRef.current === fantasy_draft_order_id) {
      return;
    }

    prefilledRef.current = fantasy_draft_order_id;
    onSelect(pre_pick_row);
  }, [isMyPick, isOpen, current_fantasy_draft_order?.fantasy_draft_order_id, pre_pick_row]);

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
        // The scraper's autoPick handler makes the pick. The client used to try as well, but only
        // when this tab happened to be open with a player already selected, and it disabled itself
        // after a single failure while still saying it had acted. It also called handlePick from
        // inside the interval, where the throw below was unhandled.
        setTimeLeft('Time is up, a player will be picked for you.');
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
  }, [current_fantasy_draft_order?.expires]);


  const handlePick = () => {
    if (sending) {
      return;
    }

    // the id is a column on the ranking row; the nested player_team_season object is not sent
    if (
      !selectedRow ||
      !selectedRow.player_team_season_id
    ) {
      setErrorMessage('Pick a player first.');
      return;
    }

    // Read the pick that is open right now rather than the one this render closed over. A socket
    // broadcast landing between render and click used to submit against the previous slot.
    const store = getStore();
    const live_fantasy_draft_order = fantasyHelper.getCurrentPick({
      fantasy_draft_orders: store.getState().fantasyGroupReducer.fantasy_draft_orders,
    });

    if (!live_fantasy_draft_order || !live_fantasy_draft_order.fantasy_draft_order_id) {
      setErrorMessage('The draft has already moved on.');
      return;
    }

    setErrorMessage('');
    setSending(true);
    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_draft_order',
      function: 'pick',
      arguments: {
        fantasy_draft_order_id: live_fantasy_draft_order.fantasy_draft_order_id,
        player_team_season_id: selectedRow.player_team_season_id,
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
          {
            isPrePicked ?
              <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
                From your pre-draft selections. Choose anyone in the table to change it.
              </Typography>
              : ''
          }
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
