'use client';

import { Button, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { useAppSelector } from '@/redux/hooks';
import { useNavigation } from '@/components/hooks/useNavigation';

/**
 * The way into the survivor room, and where this entry stands.
 *
 * It exists because the only other route in is an action inside the How it works card, and that
 * card can be dismissed -- which would leave the game itself reachable by typed url only.
 */
const SurvivorStatus = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const user_id = useAppSelector((state) => state.userReducer.user.user_id);

  const all = Object.values(fantasy_entrys || {});
  const own = all.filter((row) => row.user_id === user_id);
  const alive = all.filter((row) => +row.eliminated === 0).length;

  const mine = own.length ? own[0] : null;
  const out = mine ? +mine.eliminated === 1 : false;

  return (
    <Paper style = {{ padding: 16 }}>
      <Typography type = 'h6'>Survivor</Typography>
      <Typography type = 'body1'>
        {all.length ? `${alive} of ${all.length} entries still alive` : 'No entries yet'}
      </Typography>
      {
        mine
          ? (
            <Typography type = 'caption' style = {{ color: out ? theme.text.secondary : undefined }}>
              {out ? 'Your entry is out. You can still follow the rest of the field.' : 'Your entry is still alive.'}
            </Typography>
          )
          : <Typography type = 'caption' style = {{ color: theme.text.secondary }}>Create an entry to play.</Typography>
      }
      <div style = {{ textAlign: 'right', marginTop: 10 }}>
        <Button
          ink
          value = 'survivor'
          title = {out || !mine ? 'View rounds' : 'Make a selection'}
          onClick = {() => navigation.fantasyGroupView({ view: 'survivor' })}
        />
      </div>
    </Paper>
  );
};

export default SurvivorStatus;
