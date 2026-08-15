'use client';

/* eslint-disable no-nested-ternary */

import { useAppSelector } from '@/redux/hooks';
import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import AddIcon from '@esmalley/react-material-icons/Add';
import { useState } from 'react';
import CreateEntry from './CreateEntry';
import StadiumIcon from '@esmalley/react-material-icons/Stadium';
import FantasyGroup from '@/components/helpers/FantasyGroup';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, IconButton, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

const MyEntries = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const user = useAppSelector((state) => state.userReducer.user);

  const fantasyHelper = new FantasyGroup({ fantasy_group });

  const [joining, setJoining] = useState(false);

  const my_fantasy_entrys: General.FantasyEntry[] = [];

  for (const fantasy_entry_id in fantasy_entrys) {
    const row = fantasy_entrys[fantasy_entry_id];

    if (row.user_id === user.user_id) {
      my_fantasy_entrys.push(row);
    }
  }

  const handleTileClick = (e, fantasy_entry_id) => {
    navigation.fantasy_entry(`/fantasy_entry/${fantasy_entry_id}`);
  };


  const rows = my_fantasy_entrys.map((row, index) => {
    return (
      <Tile
        key = {row.fantasy_entry_id}
        icon={<StadiumIcon style = {{ fontSize: 24, color: theme.deepOrange[500] }} />}
        primary={row.name}
        secondary={`${fantasy_group.entry_fee ? (row.paid ? 'Paid' : 'Pending payment') : 'Free'} ${fantasyHelper.isDraft() ? 'draft entry' : 'bracket entry'}`}
        buttons = {[
          <Button key = {row.fantasy_entry_id} title = 'View' value = {row.fantasy_entry_id} ink onClick={handleTileClick} />,
        ]}
      />
    );
  }).filter((r) => r !== null);

  // todo check start date too? I guess this assumes i will lock the group after it starts
  const canJoin = (
    fantasy_group.locked === 0 &&
    fantasy_group.entries_per_user > my_fantasy_entrys.length
  );

  const handleJoin = () => {
    if (joining) {
      return;
    }

    setJoining(true);
  };

  const paperButtons: React.JSX.Element[] = [];

  if (canJoin && my_fantasy_entrys.length > 0) {
    paperButtons.push(
      <IconButton type = 'circle' value = 'join' onClick = {handleJoin} icon={<AddIcon style = {{ fontSize: 24 }} />} />,
    );
  }

  const getContents = () => {
    if (rows.length) {
      return (
        <div>{rows}</div>
      );
    }

    if (canJoin && my_fantasy_entrys.length === 0) {
      return (
        <div style = {{ textAlign: 'center' }}>
          <Button title = 'Create entry' value = 'join' onClick = {handleJoin} />
        </div>
      );
    }

    return (
      <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
        <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No entries yet!</Typography>
      </div>
    );
  };



  return (
    <div>
      <CreateEntry
        open = {joining}
        closeHandler = {(fantasy_entry_id) => {
          setJoining(false);

          if (fantasyHelper.isNCAABracket() && fantasy_entry_id) {
            handleTileClick(null, fantasy_entry_id);
          }
        }}
      />
      <Typography type = 'h6'>My Entries</Typography>
      <Paper style={{ padding: 16 }} buttons={paperButtons}>
        {getContents()}
      </Paper>
    </div>
  );
};

export default MyEntries;
