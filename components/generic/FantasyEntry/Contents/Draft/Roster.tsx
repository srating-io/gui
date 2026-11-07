'use client';

import Blank from '@/components/generic/Blank';
import RankTable from '@/components/generic/RankTable';
import Organization from '@/components/helpers/Organization';
import Url from '@/components/helpers/Url';
import TableColumns from '@/components/helpers/TableColumns';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppSelector } from '@/redux/hooks';
import { Paper, Typography } from '@esmalley/react-material-ui';
import { Objector, Sorter } from '@esmalley/ts-utils';
import { TERMINOLOGY_ID } from '@srating-io/common';
import { Basketball, Fantasy, Football, General } from '@srating-io/types';

import React from 'react';


/** What a stat cell shows for a drafted player who has not played yet. */
const NO_DATA = '—';

type FantasyPlayerStatisticRankings = {
  [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking;
};

type PartialPlayerBoxscore = Partial<Basketball.PlayerBoxscore | Football.PlayerBoxscore> & {
  name?: string | React.JSX.Element;
  name_secondary?: string;
  fantasy_points?: number | string;
  draft_pick?: number | string;
  draft_pick_secondary?: string;
  point_share?: number | string;
  point_share_secondary?: string;
  two_fg?: string;
  two_fg_secondary?: string;
  three_fg?: string;
  three_fg_secondary?: string;
  ft?: string;
  ft_secondary?: string;
  passing_completions?: string;
  passing_attempts?: string;
  passing_completions_and_attempts?: string;
  passing_completions_and_attempts_secondary?: string;
  passing_yards?: string;
  passing_yards_per_attempt?: string;
  passing_touchdowns?: string;
  passing_interceptions?: string;
  passing_rating_college?: string;
  // Not a column. The sort reads it to keep players with no games underneath ones with games.
  has_data?: boolean;
};

/**
 * A player with no games sorts below every player who has one, in both directions. Without this
 * they ride to the top the moment the table is sorted descending, pushing down the roster the
 * user actually came to read.
 */
const sinkEmptyRows = (order: string, orderBy: string, direction?: string) => {
  const comparator = Sorter.getComparator(order, orderBy, direction);

  return (a: PartialPlayerBoxscore, b: PartialPlayerBoxscore) => {
    if (a.has_data !== b.has_data) {
      return a.has_data ? -1 : 1;
    }

    return comparator(a as never, b as never);
  };
};


const Roster = (
  {
    fantasy_entry,
    fantasy_group,
    fantasy_entry_players,
    player_team_seasons,
    players,
    fantasy_entry_player_statistic_rankings,
    fantasy_draft_orders,
    showName = true,
  }:
  {
    fantasy_entry: Fantasy.FantasyEntry;
    fantasy_group: Fantasy.FantasyGroup;
    fantasy_entry_players: Fantasy.FantasyEntryPlayers;
    player_team_seasons: General.PlayerTeamSeasons;
    players: General.Players;
    fantasy_entry_player_statistic_rankings: FantasyPlayerStatisticRankings;
    // Absent on the league page, and absent everywhere until the api returns them.
    fantasy_draft_orders?: Fantasy.FantasyDraftOrders;
    showName?: boolean;
  },
) => {
  const navigation = useNavigation();
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id: fantasy_group.organization_id });

  const playerBoxscoreHeaderColumns = Objector.deepClone(
    Objector.extender(
      {},
      TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'fantasy_player_boxscore' }),
      TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player_boxscore' }),
    ),
  );

  // Roto never writes a per-player rating, so an FP column would be blank down the whole table.
  const isRoto = fantasy_group.draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.ROTO;
  const defaultPlayerTableSort = isRoto ? 'points' : 'fantasy_points';

  const handleClick = (player_id: string) => {
    navigation.player(Url.player({ sport: path, slug: player_id }));
  };


  const getPlayerBoxscoreContent = (): React.JSX.Element => {
    // The picks are the roster, so they decide which rows exist. Both of these maps arrive
    // league-wide on the league page, so everything below filters to this entry first.
    const entry_picks: Fantasy.FantasyEntryPlayer[] = [];

    for (const fantasy_entry_player_id in fantasy_entry_players) {
      const fantasy_entry_player = fantasy_entry_players[fantasy_entry_player_id];

      if (fantasy_entry_player.fantasy_entry_id === fantasy_entry.fantasy_entry_id) {
        entry_picks.push(fantasy_entry_player);
      }
    }

    if (!entry_picks.length) {
      return (
        <Paper>
          <Blank text = 'No players drafted yet!' />
        </Paper>
      );
    }

    const ranking_x_entry_player_id: FantasyPlayerStatisticRankings = {};

    for (const fantasy_entry_player_statistic_ranking_id in fantasy_entry_player_statistic_rankings) {
      const row = fantasy_entry_player_statistic_rankings[fantasy_entry_player_statistic_ranking_id];

      if (row.fantasy_entry_id === fantasy_entry.fantasy_entry_id) {
        ranking_x_entry_player_id[row.fantasy_entry_player_id] = row;
      }
    }

    const draft_order_x_entry_player_id: { [fantasy_entry_player_id: string]: Fantasy.FantasyDraftOrder } = {};

    for (const fantasy_draft_order_id in (fantasy_draft_orders || {})) {
      const row = (fantasy_draft_orders || {})[fantasy_draft_order_id];

      if (row.fantasy_entry_id === fantasy_entry.fantasy_entry_id && row.fantasy_entry_player_id) {
        draft_order_x_entry_player_id[row.fantasy_entry_player_id] = row;
      }
    }

    const hasDraftOrder = !!Object.keys(draft_order_x_entry_player_id).length;

    // The denominator for each player's share of what this entry has scored.
    let total_rating = 0;

    for (const fantasy_entry_player_id in ranking_x_entry_player_id) {
      total_rating += +(ranking_x_entry_player_id[fantasy_entry_player_id].rating || 0);
    }

    let playerColumns: string[] = [];

    if (Organization.getCBBID() === fantasy_group.organization_id) {
      playerColumns = ['name'];

      if (hasDraftOrder) {
        playerColumns.push('draft_pick');
      }

      if (!isRoto) {
        playerColumns.push('fantasy_points', 'point_share');
      }

      playerColumns.push('minutes_played', 'points', 'two_fg', 'three_fg', 'ft', 'offensive_rebounds', 'defensive_rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'fouls');
    }

    if (Organization.getCFBID() === fantasy_group.organization_id) {
      playerColumns = []; // todo some day
    }

    // A table with no columns renders a header and rows of nothing, which reads as broken.
    if (!playerColumns.length) {
      return (
        <Paper>
          <Blank text = 'Stats are not available for this sport yet!' />
        </Paper>
      );
    }

    const playerRows: PartialPlayerBoxscore[] = [];

    const footerRow: PartialPlayerBoxscore = {
      name: 'Total',
      has_data: true,
    };

    for (const fantasy_entry_player of entry_picks) {
      // a drafted player can go missing from the payload after roster churn, and the chain
      // through player_team_season to player threw on the whole page when it did
      const player_team_season = player_team_seasons[fantasy_entry_player.player_team_season_id];
      const player = player_team_season && players[player_team_season.player_id];

      if (!player) {
        continue;
      }

      const row = ranking_x_entry_player_id[fantasy_entry_player.fantasy_entry_player_id];
      const player_name: string = (player.first_name ? `${player.first_name.charAt(0)}. ` : '') + player.last_name;
      const player_number: string = `#${player.number}`;

      // A stat row is an overlay on the pick, not what decides the pick is shown. Before this,
      // a drafted player who had not played yet was dropped from the table entirely.
      const formattedRow = (row ? Objector.deepClone(row) : {}) as PartialPlayerBoxscore;

      formattedRow.player_id = player.player_id;
      formattedRow.name = player_name;
      formattedRow.name_secondary = player_number;
      formattedRow.has_data = !!row;

      const fantasy_draft_order = draft_order_x_entry_player_id[fantasy_entry_player.fantasy_entry_player_id];

      if (fantasy_draft_order) {
        formattedRow.draft_pick = fantasy_draft_order.pick;
        formattedRow.draft_pick_secondary = `R${fantasy_draft_order.round}`;
      }

      if (!row) {
        // `RankTable` swaps in `defaultEmpty` on any falsy cell, so a real zero would become it
        // too. Writing the dash per cell keeps a scored 0 reading as 0.
        for (const column of playerColumns) {
          if (column !== 'name' && column !== 'draft_pick') {
            formattedRow[column] = NO_DATA;
          }
        }

        playerRows.push(formattedRow);
        continue;
      }

      formattedRow.fantasy_points = row.rating;
      formattedRow.point_share = total_rating > 0 ? +(((+(row.rating || 0)) / total_rating) * 100).toFixed(1) : 0;
      formattedRow.point_share_secondary = '%';

      if (Organization.getCBBID() === fantasy_group.organization_id) {
        formattedRow.two_fg = `${row.two_point_field_goal || 0}-${row.two_point_field_goal_attempts || 0}`;
        formattedRow.two_fg_secondary = `${(row.two_point_field_goal_attempts > 0 ? ((row.two_point_field_goal / row.two_point_field_goal_attempts) * 100).toFixed(2) : 0)}%`;

        formattedRow.three_fg = `${row.three_point_field_goal || 0}-${row.three_point_field_goal_attempts || 0}`;
        formattedRow.three_fg_secondary = `${(row.three_point_field_goal_attempts > 0 ? ((row.three_point_field_goal / row.three_point_field_goal_attempts) * 100).toFixed(2) : 0)}%`;

        formattedRow.ft = `${row.free_throws || 0}-${row.free_throw_attempts || 0}`;
        formattedRow.ft_secondary = `${(row.free_throw_attempts > 0 ? ((row.free_throws / row.free_throw_attempts) * 100).toFixed(2) : 0)}%`;
      }

      for (const key in row) {
        if (row[key] && key === 'minutes_played') {
          const splat = row[key].toString().split('.');
          const seconds = (+splat[1] || 0) + +splat[0] * 60;

          footerRow[key] = +(+(footerRow[key] || 0) + (seconds / 60)).toFixed(2);
          continue;
        }

        // Every key used to be carried into the footer: the first row's ids and strings landed
        // there verbatim, and the second row turned them into NaN. Only numbers are totals, and
        // an id or a rank is not one even when it is a number.
        if (
          typeof row[key] !== 'number' ||
          key.endsWith('_id') ||
          key === 'rank' ||
          key === 'season'
        ) {
          continue;
        }

        footerRow[key] = +(+(footerRow[key] || 0) + row[key]).toFixed(2);
      }

      playerRows.push(formattedRow);
    }

    if (Organization.getCBBID() === fantasy_group.organization_id) {
      // # just typescript things
      const footy = footerRow as Basketball.PlayerBoxscore & { rating: number; };

      footerRow.fantasy_points = footy.rating;

      footerRow.two_fg = `${footy.two_point_field_goal || 0}-${footy.two_point_field_goal_attempts || 0}`;
      footerRow.two_fg_secondary = footy.two_point_field_goal_attempts !== undefined && footy.two_point_field_goal_attempts > 0 ? `${(((footy.two_point_field_goal || 0) / footy.two_point_field_goal_attempts) * 100).toFixed(2)}%` : '0%';

      footerRow.three_fg = `${footy.three_point_field_goal || 0}-${footy.three_point_field_goal_attempts || 0}`;
      footerRow.three_fg_secondary = footy.three_point_field_goal_attempts !== undefined && footy.three_point_field_goal_attempts > 0 ? `${(((footy.three_point_field_goal || 0) / footy.three_point_field_goal_attempts) * 100).toFixed(2)}%` : '0%';

      footerRow.ft = `${footy.free_throws || 0}-${footy.free_throw_attempts || 0}`;
      footerRow.ft_secondary = footy.free_throw_attempts !== undefined && footy.free_throw_attempts > 0 ? `${(((footy.free_throws || 0) / footy.free_throw_attempts) * 100).toFixed(2)}%` : '0%';
    }

    if (Organization.getCFBID() === fantasy_group.organization_id) {
      footerRow.passing_completions_and_attempts = `${footerRow.passing_completions || 0}/${footerRow.passing_attempts || 0}`;
      footerRow.passing_completions_and_attempts_secondary = footerRow.passing_attempts !== undefined && +footerRow.passing_attempts > 0 ? `${(((+(footerRow.passing_completions ?? 0) / +footerRow.passing_attempts) * 100).toFixed(2))}%` : '0%';
    }

    if (total_rating > 0) {
      footerRow.point_share = 100;
      footerRow.point_share_secondary = '%';
    }

    return (
      <RankTable
        key = {fantasy_entry.fantasy_entry_id}
        rows={playerRows}
        footerRow={footerRow}
        columns={playerBoxscoreHeaderColumns}
        displayColumns={playerColumns}
        rowKey = 'player_id'
        defaultSortOrder = 'asc'
        defaultSortOrderBy = {defaultPlayerTableSort}
        sessionStorageKey = {`${path}.DRAFT.BOXSCORE`}
        secondaryKey = 'secondary'
        customSortComparator = {sinkEmptyRows as never}
        handleRowClick={handleClick}
        />
    );
  };

  return (
    <div>
      {showName ? <Typography type = 'subtitle1'>{fantasy_entry.name}</Typography> : null}
      {getPlayerBoxscoreContent()}
    </div>
  );
};

export default Roster;
