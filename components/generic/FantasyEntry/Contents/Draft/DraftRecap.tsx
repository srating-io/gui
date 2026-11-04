'use client';

import { useAppSelector } from '@/redux/hooks';
import Blank from '@/components/generic/Blank';
import Url from '@/components/helpers/Url';
import Organization from '@/components/helpers/Organization';
import Team from '@/components/helpers/Team';
import { isRotoScoring } from '@/components/helpers/FantasyScoring';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Columns, Slab, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { Numbers } from '@esmalley/ts-utils';
import React from 'react';


type RecapPick = {
  fantasy_entry_player_id: string;
  player_id: string;
  name: string;
  team_name: string;
  round: number | null;
  pick: number | null;
  score: number | null;
  /** Where this player's production sits among every player drafted in the league. */
  production_rank: number | null;
};


const DraftRecap = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_players);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyEntryReducer.fantasy_draft_orders);
  const player_team_seasons = useAppSelector((state) => state.fantasyEntryReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyEntryReducer.players);
  const teams = useAppSelector((state) => state.fantasyEntryReducer.teams);
  const league_player_ratings = useAppSelector((state) => state.fantasyEntryReducer.league_player_ratings);
  const fantasy_entry_player_statistic_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_player_statistic_rankings);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);

  const { fantasy_entry_id } = fantasy_entry;
  const path = Organization.getPath({ organizations, organization_id: fantasy_group.organization_id });
  const isRoto = isRotoScoring(fantasy_group.draft_scoring_terminology_id);

  const draft_order_x_entry_player_id = {};

  for (const fantasy_draft_order_id in fantasy_draft_orders) {
    const row = fantasy_draft_orders[fantasy_draft_order_id];

    if (row.fantasy_entry_id === fantasy_entry_id && row.fantasy_entry_player_id) {
      draft_order_x_entry_player_id[row.fantasy_entry_player_id] = row;
    }
  }

  const score_x_entry_player_id: { [fantasy_entry_player_id: string]: number } = {};

  for (const id in fantasy_entry_player_statistic_rankings) {
    const row = fantasy_entry_player_statistic_rankings[id];

    if (row.fantasy_entry_id === fantasy_entry_id) {
      score_x_entry_player_id[row.fantasy_entry_player_id] = +(row.rating || 0);
    }
  }

  // Every drafted player in the league, best first, so a pick can be judged against the pool it
  // came out of rather than just against this one roster.
  const league_ranked_entry_player_ids = Object.keys(league_player_ratings || {})
    .sort((a, b) => (league_player_ratings[b] || 0) - (league_player_ratings[a] || 0));

  const production_rank_x_entry_player_id: { [fantasy_entry_player_id: string]: number } = {};

  league_ranked_entry_player_ids.forEach((id, index) => {
    production_rank_x_entry_player_id[id] = index + 1;
  });

  const picks: RecapPick[] = [];

  for (const fantasy_entry_player_id in fantasy_entry_players) {
    const fantasy_entry_player = fantasy_entry_players[fantasy_entry_player_id];

    if (fantasy_entry_player.fantasy_entry_id !== fantasy_entry_id) {
      continue;
    }

    const player_team_season = player_team_seasons[fantasy_entry_player.player_team_season_id];
    const player = player_team_season && players[player_team_season.player_id];

    if (!player) {
      continue;
    }

    const fantasy_draft_order = draft_order_x_entry_player_id[fantasy_entry_player_id];
    const team = player_team_season && teams[player_team_season.team_id];

    picks.push({
      fantasy_entry_player_id,
      player_id: player.player_id,
      name: `${player.first_name || ''} ${player.last_name}`.trim(),
      team_name: team ? new Team({ team }).getName() : '',
      round: fantasy_draft_order ? fantasy_draft_order.round : null,
      pick: fantasy_draft_order ? fantasy_draft_order.pick : null,
      score: fantasy_entry_player_id in score_x_entry_player_id ? score_x_entry_player_id[fantasy_entry_player_id] : null,
      production_rank: production_rank_x_entry_player_id[fantasy_entry_player_id] ?? null,
    });
  }

  if (!picks.length) {
    return <Blank text = 'No players drafted yet!' />;
  }

  // Unpicked rows sort last; otherwise read in draft order.
  picks.sort((a, b) => {
    if (a.pick === null || b.pick === null) {
      return a.pick === null ? 1 : -1;
    }

    return a.pick - b.pick;
  });

  const hasDraftOrder = picks.some((row) => row.pick !== null);

  // A pick beat its slot when the player produces better than they were taken. Needs both the
  // draft slot and the league-wide production order, so it is skipped when either is missing.
  const comparable = picks.filter((row) => row.pick !== null && row.production_rank !== null);

  let best: RecapPick | null = null;
  let worst: RecapPick | null = null;

  if (!isRoto && comparable.length > 1) {
    for (const row of comparable) {
      const gap = (row.pick as number) - (row.production_rank as number);
      const bestGap = best ? (best.pick as number) - (best.production_rank as number) : null;
      const worstGap = worst ? (worst.pick as number) - (worst.production_rank as number) : null;

      if (bestGap === null || gap > bestGap) {
        best = row;
      }
      if (worstGap === null || gap < worstGap) {
        worst = row;
      }
    }
  }

  const callouts: React.JSX.Element[] = [];

  if (best) {
    callouts.push(
      <Slab
        key = 'best'
        label = 'Best value'
        primary = {best.name}
        info = {`Taken ${Numbers.formatOrdinal(best.pick as number)}, ${Numbers.formatOrdinal(best.production_rank as number)} best drafted player`}
        primaryStyle = {{ color: theme.success.main }}
      />,
    );
  }

  if (worst && worst.fantasy_entry_player_id !== (best || {} as RecapPick).fantasy_entry_player_id) {
    callouts.push(
      <Slab
        key = 'worst'
        label = 'Worst value'
        primary = {worst.name}
        info = {`Taken ${Numbers.formatOrdinal(worst.pick as number)}, ${Numbers.formatOrdinal(worst.production_rank as number)} best drafted player`}
        primaryStyle = {{ color: theme.error.main }}
      />,
    );
  }

  const handleClick = (player_id: string) => {
    navigation.player(Url.player({ sport: path, slug: player_id }));
  };

  // An entry gets one pick per round, so a heading per round was a heading per tile. The round
  // rides along on the tile instead, and the picks go in a grid rather than one tall column.
  const rendered: React.JSX.Element[] = picks.map((row) => {
    const secondary = [
      row.round === null ? '' : `R${row.round}`,
      row.team_name,
      row.score === null ? 'Has not played' : `${row.score} ${isRoto ? 'rating' : 'points'}`,
    ].filter((part) => !!part).join(' · ');

    return (
      <Tile
        key = {row.fantasy_entry_player_id}
        primary = {row.pick === null ? row.name : `${row.pick}. ${row.name}`}
        secondary = {secondary}
        onClick = {() => handleClick(row.player_id)}
        style = {{ cursor: 'pointer' }}
      />
    );
  });


  return (
    <div>
      {callouts.length ? (
        <Columns numberOfColumns = {callouts.length} breakPoint = {600} style = {{ gap: 10, marginBottom: 10 }}>
          {callouts}
        </Columns>
      ) : null}
      {!hasDraftOrder ? (
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
          Pick order is not available for this entry yet.
        </Typography>
      ) : null}
      <Columns numberOfColumns = {2} breakPoint = {600} style = {{ gap: 10 }}>
        {rendered}
      </Columns>
    </div>
  );
};

export default DraftRecap;
