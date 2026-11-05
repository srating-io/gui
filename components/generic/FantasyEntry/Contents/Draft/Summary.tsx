'use client';

import { useAppSelector } from '@/redux/hooks';
import { paperStyle } from '@/components/generic/Dashboard/Panel';
import { ChartRankStrip, ChartSequenceStrip } from '@/components/generic/Chart';
import type { SequenceCell } from '@/components/generic/Chart';
import ArrowUpwardIcon from '@esmalley/react-material-icons/ArrowUpward';
import ArrowDownwardIcon from '@esmalley/react-material-icons/ArrowDownward';
import { Divider, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { Dates, Numbers } from '@esmalley/ts-utils';
import { Fantasy } from '@srating-io/types';
import React from 'react';


/** Days of form in the strip. One extra snapshot is read, because each cell is a difference. */
const HISTORY_SHOWN = 14;


/**
 * The entry at a glance: where it stands in its league, the gaps that decide its season, and
 * whether it is actually scoring lately.
 *
 * Deliberately not a leaderboard. The league page already prints those rows, and the entry's own
 * rank means nothing without its denominator - so the standing is a marker on a track, which
 * carries the denominator and the spread in the space a single row would take.
 */
const Summary = () => {
  const theme = useTheme();

  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_rankings);
  const fantasy_ranking_history = useAppSelector((state) => state.fantasyEntryReducer.fantasy_ranking_history);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_players);
  const fantasy_entry_player_statistic_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_player_statistic_rankings);
  const games = useAppSelector((state) => state.fantasyEntryReducer.games);

  const { fantasy_entry_id } = fantasy_entry;

  const standings: Fantasy.FantasyRanking[] = [];

  for (const fantasy_ranking_id in fantasy_rankings) {
    standings.push(fantasy_rankings[fantasy_ranking_id]);
  }

  standings.sort((a, b) => a.rank - b.rank);

  const my_index = standings.findIndex((row) => row.fantasy_entry_id === fantasy_entry_id);
  const my_ranking = my_index > -1 ? standings[my_index] : null;

  let picks_total = 0;

  for (const fantasy_entry_player_id in fantasy_entry_players) {
    if (fantasy_entry_players[fantasy_entry_player_id].fantasy_entry_id === fantasy_entry_id) {
      picks_total++;
    }
  }

  let picks_with_data = 0;
  let scored_total = 0;

  for (const id in fantasy_entry_player_statistic_rankings) {
    const row = fantasy_entry_player_statistic_rankings[id];

    if (row.fantasy_entry_id === fantasy_entry_id) {
      picks_with_data++;
      scored_total += +(row.rating || 0);
    }
  }

  // Points still show before the api returns rankings, by adding up what the roster has scored.
  const points = my_ranking ? my_ranking.points : +scored_total.toFixed(1);

  const now = new Date();

  let games_remaining = 0;

  for (const game_id in games) {
    const row = games[game_id];

    // The schedule tab's own classification, so the count and that list can never disagree.
    if (row.status === 'live' || now <= Dates.parse(row.start_datetime, true) || row.status === 'pre') {
      games_remaining++;
    }
  }


  /** An arrow for a week's movement, or nothing when there is no movement to report. */
  const getMovement = (delta: number, fontSize: number): React.JSX.Element | null => {
    if (!delta) {
      return null;
    }

    // The writer stores `previous rank - current rank`, so a positive delta is a climb.
    const color = delta > 0 ? theme.success.main : theme.error.main;
    const Icon = delta > 0 ? ArrowUpwardIcon : ArrowDownwardIcon;

    return <Icon style = {{ fontSize, color }} />;
  };


  const getHeadline = (): React.JSX.Element => {
    // `rank_delta_seven` is 0 both for a flat week and for an entry with no prior snapshot, so an
    // arrow either way would be reporting a result the data does not contain.
    const delta = my_ranking ? +(my_ranking.rank_delta_seven || 0) : 0;
    const arrow = getMovement(delta, 16);

    return (
      <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style = {{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <Typography type = 'h5'>
            {my_ranking ? `${Numbers.formatOrdinal(my_ranking.rank)} of ${my_ranking.max}` : `${points} pts`}
          </Typography>
          {my_ranking ? (
            <Typography type = 'body2' style = {{ color: theme.text.secondary }}>{`${points} pts`}</Typography>
          ) : null}
        </div>
        {arrow ? (
          <div style = {{ display: 'flex', alignItems: 'center' }}>
            {arrow}
            <Typography type = 'caption' style = {{ color: delta > 0 ? theme.success.main : theme.error.main }}>
              {`${Math.abs(delta)} this week`}
            </Typography>
          </div>
        ) : null}
      </div>
    );
  };


  const getTrack = (): React.JSX.Element | null => {
    if (!my_ranking || !my_ranking.max) {
      return null;
    }

    return (
      <ChartRankStrip
        rows = {[{
          key: 'points',
          label: 'Points',
          value: points,
          rank: my_ranking.rank,
          tooltip: 'Where this entry sits in its league on total points.',
        }]}
        max = {my_ranking.max}
      />
    );
  };


  /** Behind the leader, the place above, and the cushion over the place below. */
  const getGaps = (): string => {
    if (!my_ranking) {
      return '';
    }

    const parts: string[] = [];
    const leader = standings[0];

    if (leader && leader.fantasy_entry_id === fantasy_entry_id) {
      // For the leader there is nothing to be behind, and the cushion over 2nd is the same
      // number a "leading by" would print - so the two collapse into one statement.
      if (standings.length > 1) {
        const second = standings[1];

        parts.push(`leading ${Numbers.formatOrdinal(second.rank)} by ${+(points - second.points).toFixed(1)}`);
      }

      return parts.join('  ·  ');
    }

    if (leader) {
      parts.push(`${+(leader.points - points).toFixed(1)} behind 1st`);
    }

    // Only from 3rd down, because for 2nd the place above is the leader already named.
    if (my_index > 1) {
      const above = standings[my_index - 1];

      parts.push(`${+(above.points - points).toFixed(1)} off ${Numbers.formatOrdinal(above.rank)}`);
    }

    if (my_index > -1 && my_index < standings.length - 1) {
      const below = standings[my_index + 1];

      parts.push(`+${+(points - below.points).toFixed(1)} on ${Numbers.formatOrdinal(below.rank)}`);
    }

    return parts.join('  ·  ');
  };


  /**
   * What is still ahead of this entry, which is what makes the standing mean anything - 4th with
   * 22 games left is a different season from 4th with 2. Read off the base payload, so it survives
   * an api that has not returned the league rows.
   */
  const getStillToPlay = (): string => {
    const parts: string[] = [];
    const idle = picks_total - picks_with_data;

    if (games_remaining) {
      parts.push(`${games_remaining} game${games_remaining === 1 ? '' : 's'} still to play`);
    }

    if (idle > 0) {
      parts.push(`${idle} player${idle === 1 ? '' : 's'} yet to play`);
    }

    return parts.join('  ·  ');
  };


  const getForm = (): React.JSX.Element | null => {
    const history = Object.values(fantasy_ranking_history || {})
      .filter((row) => row.fantasy_entry_id === fantasy_entry_id)
      .sort((a, b) => Dates.parse(a.date_of_rank, true).getTime() - Dates.parse(b.date_of_rank, true).getTime());

    if (history.length < 2) {
      return null;
    }

    // One more row than there are cells, because every cell is a difference against the day before.
    const shown = history.slice(-(HISTORY_SHOWN + 1));

    const days: { row: Fantasy.FantasyRanking; gained: number; move: number }[] = [];

    for (let i = 1; i < shown.length; i++) {
      const row = shown[i];
      const previous = shown[i - 1];

      days.push({
        row,
        gained: +(+(row.points || 0) - +(previous.points || 0)).toFixed(1),
        move: (+previous.rank || 0) - (+row.rank || 0),
      });
    }

    const best = Math.max(...days.map((day) => day.gained));

    const cells: SequenceCell[] = days.map((day): SequenceCell => {
      const getOutcome = (): SequenceCell['outcome'] => {
        if (!day.move) {
          return null;
        }

        return day.move > 0 ? 'good' : 'bad';
      };

      const date = Dates.format(day.row.date_of_rank, 'M jS');

      return {
        key: day.row.fantasy_ranking_id,
        title: date,
        // The history carries a running total, which only ever climbs - so the bar is the day's
        // gain. Painting the total would make every cell taller than the last and say nothing.
        intensity: best > 0 ? Math.min(Math.max(day.gained / best, 0), 1) : 0,
        mark: getMovement(day.move, 12) || '·',
        outcome: getOutcome(),
        tooltip: `${date}: ${day.gained > 0 ? '+' : ''}${day.gained} pts, ${day.row.points} total, ${Numbers.formatOrdinal(day.row.rank)}`,
      };
    });

    return (
      <ChartSequenceStrip
        cells = {cells}
        title = {`Last ${cells.length} days`}
        scaleLow = 'fewer pts'
        scaleHigh = 'more pts'
      />
    );
  };


  // Before a single pick exists there is nothing to summarize, and the roster panel below already
  // says so.
  if (!picks_total) {
    return null;
  }

  const gaps = getGaps();
  const still_to_play = getStillToPlay();
  const form = getForm();

  const bands: React.JSX.Element[] = [
    <div key = 'standing'>
      {getHeadline()}
      {getTrack()}
    </div>,
  ];

  if (gaps || still_to_play) {
    bands.push(
      <div key = 'gaps'>
        {gaps ? <Typography type = 'body2'>{gaps}</Typography> : null}
        {still_to_play ? (
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{still_to_play}</Typography>
        ) : null}
      </div>,
    );
  }

  if (form) {
    bands.push(<div key = 'form'>{form}</div>);
  }


  return (
    <Paper style = {{ ...paperStyle, marginTop: 0 }}>
      {bands.map((band, index) => (
        <React.Fragment key = {band.key}>
          {index ? <Divider style = {{ margin: '12px 0px' }} /> : null}
          {band}
        </React.Fragment>
      ))}
    </Paper>
  );
};

export default Summary;
