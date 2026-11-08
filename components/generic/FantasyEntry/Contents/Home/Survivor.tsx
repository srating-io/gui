'use client';

import { useEffect, useRef, useState } from 'react';
import { LinearProgress, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';
import { useClientAPI } from '@/components/clientAPI';
import { useAppSelector } from '@/redux/hooks';

/** How one settled selection went, in a word. `correct` is null until the round settles. */
const describeOutcome = (row: Fantasy.FantasySelection): string => {
  if (+row.resolved !== 1) {
    return 'waiting';
  }

  if (+(row.correct ?? 0) === 1) {
    return 'through';
  }

  return +row.revived === 1 ? 'lost, second chance used' : 'out';
};

/**
 * One entry's run: what it chose each round, how that went, and what it has spent.
 *
 * Read only, and the same component whoever is looking -- the api already withholds a rival's
 * current selection until the round closes, so there is nothing to hide in here.
 */
const Survivor = () => {
  const theme = useTheme();

  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const session_id = useAppSelector((state) => state.userReducer.session_id);

  const [data, setData] = useState<{
    fantasy_selections: Fantasy.FantasySelections;
    used_team_ids: string[];
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const requesting = useRef(false);

  useEffect(() => {
    if (!fantasy_entry || !fantasy_entry.fantasy_entry_id || requesting.current) {
      return;
    }

    requesting.current = true;

    useClientAPI({
      class: 'fantasy_selection',
      function: 'loadEntry',
      arguments: { fantasy_entry_id: fantasy_entry.fantasy_entry_id },
    }).then((result) => {
      requesting.current = false;
      setLoaded(true);

      if (!result || result.error) {
        return;
      }

      setData(result);
    }).catch(() => {
      requesting.current = false;
      setLoaded(true);
    });
  }, [fantasy_entry, session_id]);

  if (!loaded) {
    return <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%', margin: 'auto' }} />;
  }

  const selections = data ? Object.values(data.fantasy_selections) : [];

  // correct is null until the round settles, so it cannot be coerced without a default
  const survived = selections.filter((row) => +(row.correct ?? 0) === 1).length;

  return (
    <div>
      <Typography type = 'h6'>This run</Typography>
      <Paper style = {{ padding: 16 }}>
        {
          fantasy_entry && +fantasy_entry.eliminated === 1
            ? <Typography type = 'body1'>Out after {survived} rounds.</Typography>
            : <Typography type = 'body1'>Still alive after {survived} rounds.</Typography>
        }
        {
          selections.length
            ? selections.map((row) => {
              const outcome = describeOutcome(row);

              const detail = [
                outcome,
                +row.auto === 1 ? 'chosen for you' : '',
                row.win_probability !== null && row.win_probability !== undefined ? `${Math.round(+row.win_probability * 100)}% projected` : '',
              ].filter((value) => !!value).join(' · ');

              return (
                <Tile
                  key = {row.fantasy_selection_id}
                  primary = {row.team_id ? row.team_id : 'No selection'}
                  secondary = {detail}
                />
              );
            })
            : <Typography type = 'body1' style = {{ color: theme.text.secondary, fontStyle: 'italic' }}>Nothing chosen yet.</Typography>
        }
      </Paper>
    </div>
  );
};

export default Survivor;
