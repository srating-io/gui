'use client';

import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import { useState } from 'react';
import StadiumIcon from '@esmalley/react-material-icons/Stadium';
import Payment from '@/components/helpers/Payment';
import AccountHandler from '@/components/generic/AccountHandler';
import { useAppSelector } from '@/redux/hooks';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';

const PublicBracketsGroups = (
  {
    fantasy_groups,
    fantasy_group_id_x_fantasy_entrys,
  }:
  {
    fantasy_groups: Fantasy.FantasyGroups;
    fantasy_group_id_x_fantasy_entrys: {[fantasy_group_id: string]: Fantasy.FantasyEntrys};
  },
) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const initialLimit = 10;
  const [freeLimit, setFreeLimit] = useState(initialLimit);
  const [paidLimit, setPaidLimit] = useState(initialLimit);
  const session_id = useAppSelector((state) => state.userReducer.session_id);
  const [showModal, setShowModal] = useState(false);
  const [selectedFantasyGroupID, setSelectedFantasyGroupID] = useState(null);

  const free_fantasy_groups: Fantasy.FantasyGroup[] = [];
  const paid_fantasy_groups: Fantasy.FantasyGroup[] = [];

  for (const fantasy_group_id in fantasy_groups) {
    const row = fantasy_groups[fantasy_group_id];

    if (row.entry_fee) {
      paid_fantasy_groups.push(row);
    } else {
      free_fantasy_groups.push(row);
    }
  }


  const handleTileClick = (e, fantasy_group_id, force = false) => {
    setSelectedFantasyGroupID(null);
    if (!session_id && !force) {
      setSelectedFantasyGroupID(fantasy_group_id);
      setShowModal(true);
      return;
    }
    navigation.fantasy_group(`/fantasy_group/${fantasy_group_id}`);
  };

  const free_rows = free_fantasy_groups.map((row, index) => {
    // `>` rendered one row more than the limit
    if (index >= freeLimit) {
      return null;
    }
    return (
      <Tile
        key = {row.fantasy_group_id}
        icon={<StadiumIcon style = {{ color: theme.blue[500], fontSize: 24 }} />}
        primary={row.name}
        secondary={`Free entry; Limit ${row.entries_per_user} entries per user`}
        buttons = {[
          <Button key = {`join-${row.fantasy_group_id}`} title = 'Join' value = {row.fantasy_group_id} ink onClick={handleTileClick} />,
        ]}
      />
    );
  }).filter((r) => r !== null);

  const free_rows_buttons: React.JSX.Element[] = [];

  if (free_fantasy_groups.length > freeLimit) {
    free_rows_buttons.push(
      <Button
        key = {'view-all'}
        value = 'view-all'
        title = {`View all (${free_fantasy_groups.length})`}
        ink
        onClick={() => setFreeLimit(Infinity)}
      />,
    );
  } else if (freeLimit === Infinity) {
    free_rows_buttons.push(
      <Button
        key = {'hide-extra'}
        value = 'hide-extra'
        title = {'Show less'}
        ink
        onClick={() => setFreeLimit(initialLimit)}
      />,
    );
  }

  const paid_rows = paid_fantasy_groups.map((row, index) => {
    // was `index > freeLimit`: the paid list was cut by the free list's limit, so its own
    // "View all" button toggled paidLimit and did nothing
    if (index >= paidLimit) {
      return null;
    }
    const fantasy_entrys = fantasy_group_id_x_fantasy_entrys[row.fantasy_group_id] || {};
    // Only a paid entry is in the pool, and the flat processing fee comes off each one. Running the
    // whole pool through get_amount_after_fees took it off once and advertised more than was there.
    const paid_entries = Object.values(fantasy_entrys).filter((entry) => +entry.paid === 1).length;
    const current_pool = Payment.get_pool_after_fees(row.entry_fee, paid_entries);
    return (
      <Tile
        key = {row.fantasy_group_id}
        icon={<StadiumIcon style = {{ color: theme.purple[500], fontSize: 24 }} />}
        primary={row.name}
        secondary={`${row.entry_fee} entry fee; Current pool ${current_pool.toFixed(2)}; ${paid_entries} paid ${paid_entries === 1 ? 'entry' : 'entries'}; Limit ${row.entries_per_user} entries per user`}
        buttons = {[
          <Button key = {`join-${row.fantasy_group_id}`} title = 'Join' value = {row.fantasy_group_id} ink onClick={handleTileClick} />,
        ]}
      />
    );
  }).filter((r) => r !== null);

  const paid_rows_buttons: React.JSX.Element[] = [];

  if (paid_fantasy_groups.length > paidLimit) {
    paid_rows_buttons.push(
      <Button
        key = {'view-all'}
        value = 'view-all'
        title = {`View all (${paid_fantasy_groups.length})`}
        ink
        onClick={() => setPaidLimit(Infinity)}
      />,
    );
  } else if (paidLimit === Infinity) {
    paid_rows_buttons.push(
      <Button
        key = {'hide-extra'}
        value = 'hide-extra'
        title = {'Show less'}
        ink
        onClick={() => setPaidLimit(initialLimit)}
      />,
    );
  }


  return (
    <div>
      <Typography type = 'h6'>Open public bracket groups</Typography>
      <Paper style={{ padding: 16 }}>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>Join one of these groups to compete in the NCAA tournament bracket!</Typography>
        {
          free_rows.length ?
            <>
              <Typography type = 'body1'>Free groups</Typography>
              {free_rows}
              <div style = {{ textAlign: 'right' }}>{free_rows_buttons}</div>
            </>
            : ''
        }
        {
          paid_rows.length ?
            <>
              <Typography type = 'body1'>Paid groups</Typography>
              {paid_rows}
              <div style = {{ textAlign: 'right' }}>{paid_rows_buttons}</div>
            </>
            : ''
        }
        {
          !paid_rows.length && !free_rows.length ?
            <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
              <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
              <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No public bracket groups!</Typography>
            </div>
            : ''
        }
      </Paper>
      <AccountHandler open = {showModal} closeHandler={() => setShowModal(false)} loginCallback={(e) => {
        handleTileClick(e, selectedFantasyGroupID, true);
      }} title='Account required to join a fantasy group' />
    </div>
  );
};

export default PublicBracketsGroups;
