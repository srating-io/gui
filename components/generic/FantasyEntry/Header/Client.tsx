'use client';

import { useAppSelector } from '@/redux/hooks';
import { paperStyle } from '@/components/generic/Dashboard/Panel';
import { Paper, Slab, Columns, Typography, Tooltip, useTheme } from '@esmalley/react-material-ui';
import { Numbers } from '@esmalley/ts-utils';
import { Fantasy } from '@srating-io/types';
import { getScoringMetric } from '@/components/helpers/FantasyScoring';
import React from 'react';


const Header = () => {
  const theme = useTheme();

  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entrys);
  const fantasy_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_rankings);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_players);
  const fantasy_group_user = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group_user);
  const fantasy_entry_player_statistic_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_player_statistic_rankings);

  const { fantasy_entry_id } = fantasy_entry;

  let picks_total = 0;

  for (const fantasy_entry_player_id in fantasy_entry_players) {
    if (fantasy_entry_players[fantasy_entry_player_id].fantasy_entry_id === fantasy_entry_id) {
      picks_total++;
    }
  }

  // The count the roster table used to hide: a pick with no stat row was simply not drawn.
  let picks_with_data = 0;
  let scored_total = 0;

  for (const id in fantasy_entry_player_statistic_rankings) {
    const row = fantasy_entry_player_statistic_rankings[id];

    if (row.fantasy_entry_id === fantasy_entry_id) {
      picks_with_data++;
      scored_total += +(row.rating || 0);
    }
  }

  const standings: Fantasy.FantasyRanking[] = [];

  for (const fantasy_ranking_id in fantasy_rankings) {
    standings.push(fantasy_rankings[fantasy_ranking_id]);
  }

  standings.sort((a, b) => a.rank - b.rank);

  const my_index = standings.findIndex((row) => row.fantasy_entry_id === fantasy_entry_id);
  const my_ranking = my_index > -1 ? standings[my_index] : null;

  const getEntryName = (row: Fantasy.FantasyRanking): string => {
    if (row.fantasy_entry_id === fantasy_entry_id) {
      return 'You';
    }

    return (fantasy_entrys[row.fantasy_entry_id] || {}).name || 'Unknown entry';
  };

  // Points still show before the api returns rankings, by adding up what the roster has scored.
  const points = my_ranking ? my_ranking.points : +scored_total.toFixed(1);

  const scoring = getScoringMetric(fantasy_group.draft_scoring_terminology_id);

  const tiles: React.JSX.Element[] = [
    <Slab key = 'points' label = 'Points' primary = {points} />,
  ];

  if (my_ranking) {
    tiles.push(
      <Slab
        key = 'rank'
        label = 'Rank'
        primary = {Numbers.formatOrdinal(my_ranking.rank)}
        info = {my_ranking.max ? `of ${my_ranking.max}` : undefined}
      />,
    );
    // Uncolored, matching the league leaderboard: a rank improving means the number falls, and
    // reading a sign onto that here would be guessing.
    tiles.push(
      <Slab
        key = 'movement'
        label = 'Move 1d / 7d'
        primary = {`${my_ranking.rank_delta_one || '-'} / ${my_ranking.rank_delta_seven || '-'}`}
      />,
    );
  }

  tiles.push(
    <Slab
      key = 'picks'
      label = 'Players scoring'
      primary = {`${picks_with_data} / ${picks_total}`}
      info = {picks_with_data < picks_total ? 'The rest have not played yet' : undefined}
    />,
  );

  const neighbors: Fantasy.FantasyRanking[] = [];

  if (my_ranking && standings.length > 1) {
    // The leader is the useful anchor, then whoever is immediately either side of this entry.
    if (my_index > 1) {
      neighbors.push(standings[0]);
    }
    if (my_index > 0) {
      neighbors.push(standings[my_index - 1]);
    }
    neighbors.push(my_ranking);
    if (my_index < standings.length - 1) {
      neighbors.push(standings[my_index + 1]);
    }
  }


  return (
    <Paper style = {{ ...paperStyle, marginTop: 0 }}>
      <div style = {{ marginBottom: 12 }}>
        <Typography type = 'h5'>{fantasy_entry.name || 'Entry'}</Typography>
        {fantasy_group_user.name ? (
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
            {`Drafted by ${fantasy_group_user.name}`}
          </Typography>
        ) : null}
      </div>

      <Columns numberOfColumns = {tiles.length} breakPoint = {600} style = {{ gap: 10 }}>
        {tiles}
      </Columns>

      {neighbors.length > 1 ? (
        <div style = {{ marginTop: 16 }}>
          <Columns numberOfColumns = {neighbors.length} breakPoint = {600} style = {{ gap: 10 }}>
            {neighbors.map((row) => {
              const isMe = row.fantasy_entry_id === fantasy_entry_id;
              const difference = row.points - (my_ranking ? my_ranking.points : 0);

              return (
                <Slab
                  key = {row.fantasy_ranking_id}
                  label = {`${Numbers.formatOrdinal(row.rank)} ${getEntryName(row)}`}
                  primary = {row.points}
                  info = {isMe ? undefined : `${difference > 0 ? '+' : ''}${+difference.toFixed(1)}`}
                  primaryStyle = {isMe ? { color: theme.info.main } : undefined}
                />
              );
            })}
          </Columns>
        </div>
      ) : null}

      {scoring ? (
        <div style = {{ marginTop: 12 }}>
          <Tooltip text = {scoring.formula}>
            <span style = {{ cursor: 'help' }}>
              <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
                {`Scoring: ${scoring.name}`}
              </Typography>
            </span>
          </Tooltip>
        </div>
      ) : null}
    </Paper>
  );
};

export default Header;
