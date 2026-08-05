'use client';

import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import { useState } from 'react';
import StadiumIcon from '@esmalley/react-material-icons/Stadium';
import Payment from '@/components/helpers/Payment';
import AccountHandler from '@/components/generic/AccountHandler';
import { useAppSelector } from '@/redux/hooks';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

const PublicBracketsGroups = (
  {
    fantasy_groups,
    fantasy_group_id_x_fantasy_entrys,
  }:
  {
    fantasy_groups: General.FantasyGroups;
    fantasy_group_id_x_fantasy_entrys: {[fantasy_group_id: string]: General.FantasyEntrys};
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

  const free_fantasy_groups: General.FantasyGroup[] = [];
  const paid_fantasy_groups: General.FantasyGroup[] = [];

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
    if (index > freeLimit) {
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

  if (free_rows.length > freeLimit) {
    free_rows_buttons.push(
      <Button
        key = {'view-all'}
        value = 'view-all'
        title = {`View all (${free_rows.length})`}
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
    if (index > freeLimit) {
      return null;
    }
    const fantasy_entrys = fantasy_group_id_x_fantasy_entrys[row.fantasy_group_id] || {};
    return (
      <Tile
        key = {row.fantasy_group_id}
        icon={<StadiumIcon style = {{ color: theme.purple[500], fontSize: 24 }} />}
        primary={row.name}
        secondary={`$${row.entry_fee} entry fee; Current pool $${Payment.get_amount_after_fees(Object.keys(fantasy_entrys).length * (row.entry_fee || 0))}; ${Object.keys(fantasy_entrys).length} entries; Limit ${row.entries_per_user} entries per user`}
        buttons = {[
          <Button key = {`join-${row.fantasy_group_id}`} title = 'Join' value = {row.fantasy_group_id} ink onClick={handleTileClick} />,
        ]}
      />
    );
  }).filter((r) => r !== null);

  const paid_rows_buttons: React.JSX.Element[] = [];

  if (paid_rows.length > paidLimit) {
    paid_rows_buttons.push(
      <Button
        key = {'view-all'}
        value = 'view-all'
        title = {`View all (${paid_rows.length})`}
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
