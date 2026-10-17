'use client';

import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import PersonIcon from '@esmalley/react-material-icons/Person';
import { useAppSelector } from '@/redux/hooks';
import { useState } from 'react';
import { Button, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';

const Members = () => {
  const theme = useTheme();
  const fantasy_group_users = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group_users);

  const initialLimit = 5;
  const [limit, setLimit] = useState(initialLimit);

  const members = Object.values(fantasy_group_users || {});

  const memberRows = members.map((row, index) => {
    // `>` rendered one row more than the limit
    if (index >= limit) {
      return null;
    }
    return (
      <Tile
        key = {row.fantasy_group_user_id}
        icon={<PersonIcon style = {{ fontSize: 24 }} />}
        primary={row.name || row.user_id}
        secondary={row.email}
      />
    );
  }).filter((r) => r !== null);


  const buttons: React.JSX.Element[] = [];

  if (members.length > limit) {
    buttons.push(
      <Button
        key = 'view-all'
        value = 'view-all'
        title = {`View all (${members.length})`}
        ink
        onClick={() => setLimit(Infinity)}
      />,
    );
  } else if (limit === Infinity) {
    buttons.push(
      <Button
        key = 'hide-extra'
        value = 'hide-extra'
        title = {'Show less'}
        ink
        onClick={() => setLimit(initialLimit)}
      />,
    );
  }

  const getContents = () => {
    if (memberRows.length) {
      return memberRows;
    }


    return (
      <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
        <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No members yet!</Typography>
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Members</Typography>
      <Paper style={{ padding: 20 }}>
        {getContents()}
        <div style = {{ textAlign: 'right' }}>{buttons}</div>
      </Paper>
    </div>
  );
};

export default Members;
