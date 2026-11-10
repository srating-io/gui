'use client';

import { Button, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { useAppSelector } from '@/redux/hooks';
import { getOwnEntries } from '@/components/helpers/FantasyGroup';
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
  const own = getOwnEntries(fantasy_entrys, user_id);
  const alive = all.filter((row) => +row.eliminated === 0).length;

  // Across all of this user's entries, not just the first one. Holding several is ordinary, and
  // "your entry is out" on the strength of one of three was simply wrong.
  const own_alive = own.filter((row) => +row.eliminated === 0).length;
  const mine = own.length ? own[0] : null;
  const out = own.length > 0 && own_alive === 0;

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
              {
                out
                  ? `${own.length === 1 ? 'Your entry is' : 'All of your entries are'} out. You can still follow the rest of the field.`
                  : `${own.length === 1 ? 'Your entry is' : `${own_alive} of your ${own.length} entries are`} still alive.`
              }
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
