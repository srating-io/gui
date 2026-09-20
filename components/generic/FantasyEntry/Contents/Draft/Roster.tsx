'use client';

import Blank from '@/components/generic/Blank';
import RankTable from '@/components/generic/RankTable';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppSelector } from '@/redux/hooks';
import { Paper, Typography } from '@esmalley/react-material-ui';
import { Objector, Textor } from '@esmalley/ts-utils';
import { Basketball, Fantasy, Football, General } from '@srating-io/types';

import React from 'react';


const Roster = (
  {
    fantasy_entry,
    fantasy_group,
    fantasy_entry_players,
    player_team_seasons,
    players,
    fantasy_entry_player_statistic_rankings,
  }:
  {
    fantasy_entry: Fantasy.FantasyEntry;
    fantasy_group: Fantasy.FantasyGroup;
    fantasy_entry_players: Fantasy.FantasyEntryPlayers;
    player_team_seasons: General.PlayerTeamSeasons;
    players: General.Players;
    fantasy_entry_player_statistic_rankings: {
      [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking;
    };
  },
) => {
  const navigation = useNavigation();
  // const theme = useTheme();
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id: fantasy_group.organization_id });

  const playerBoxscoreHeaderColumns = Objector.deepClone(
    Objector.extender(
      {},
      TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'fantasy_player_boxscore' }),
      TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player_boxscore' }),
    ),
  );
  const defaultPlayerTableSort = 'fantasy_points';

  const handleClick = (player_id: string) => {
    navigation.player(`/${path}/player/${player_id}`);
  };


  const getPlayerBoxscoreContent = (position: string | null): React.JSX.Element => {
    if (Object.keys(fantasy_entry_players).length === 0) {
      return (
        <Paper>
          <Blank text = 'No boxscore data yet!' />
        </Paper>
      );
    }
    let playerColumns: string[] = [];

    if (Organization.getCBBID() === fantasy_group.organization_id) {
      playerColumns = ['name', 'fantasy_points', 'minutes_played', 'points', 'two_fg', 'three_fg', 'ft', 'offensive_rebounds', 'defensive_rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'fouls'];
    }


    if (Organization.getCFBID() === fantasy_group.organization_id) {
      playerColumns = []; // todo some day
    }


    type PartialPlayerBoxscore = Partial<Basketball.PlayerBoxscore | Football.PlayerBoxscore> & {
      name?: string | React.JSX.Element;
      name_secondary?: string;
      // fg?: string;
      // fg_secondary?: string;
      fantasy_points?: number;
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
    }
    const playerRows: PartialPlayerBoxscore[] = [];

    const footerRow: PartialPlayerBoxscore = {
      name: 'Total',
    };

    if (!Object.keys(fantasy_entry_player_statistic_rankings).length) {
      for (const fantasy_entry_player_id in fantasy_entry_players) {
        const fantasy_entry_player = fantasy_entry_players[fantasy_entry_player_id];
        if (fantasy_entry_player.fantasy_entry_id !== fantasy_entry.fantasy_entry_id) {
          continue;
        }
        const player_team_season = player_team_seasons[fantasy_entry_player.player_team_season_id];
        const player = players[player_team_season.player_id];

        const player_name: string = (player.first_name ? `${player.first_name.charAt(0)}. ` : '') + player.last_name;
        const player_number: string = `#${player.number}`;


        const formattedRow = {} as PartialPlayerBoxscore;

        formattedRow.player_id = player.player_id;
        formattedRow.name = player_name;
        formattedRow.name_secondary = player_number;

        playerRows.push(formattedRow);
      }
    }

    for (const fantasy_entry_player_statistic_ranking_id in fantasy_entry_player_statistic_rankings) {
      const row = fantasy_entry_player_statistic_rankings[fantasy_entry_player_statistic_ranking_id];
      if (row.fantasy_entry_id !== fantasy_entry.fantasy_entry_id) {
        continue;
      }
      const fantasy_entry_player = fantasy_entry_players[row.fantasy_entry_player_id];
      const player_team_season = player_team_seasons[fantasy_entry_player.player_team_season_id];
      const player = players[player_team_season.player_id];

      const player_name: string = (player.first_name ? `${player.first_name.charAt(0)}. ` : '') + player.last_name;
      const player_number: string = `#${player.number}`;


      const formattedRow = Objector.deepClone(row) as PartialPlayerBoxscore;

      formattedRow.player_id = player.player_id;
      formattedRow.name = player_name;
      formattedRow.name_secondary = player_number;
      formattedRow.fantasy_points = row.rating;

      if (Organization.getCBBID() === fantasy_group.organization_id) {
        // formattedRow.fg = `${row.field_goal || 0}-${row.field_goal_attempts || 0}`;
        // formattedRow.fg_secondary = `${row.field_goal_percentage || 0}%`;

        formattedRow.two_fg = `${row.two_point_field_goal || 0}-${row.two_point_field_goal_attempts || 0}`;
        formattedRow.two_fg_secondary = `${(row.two_point_field_goal_attempts > 0 ? ((row.two_point_field_goal / row.two_point_field_goal_attempts) * 100).toFixed(2) : 0)}%`;

        formattedRow.three_fg = `${row.three_point_field_goal || 0}-${row.three_point_field_goal_attempts || 0}`;
        formattedRow.three_fg_secondary = `${(row.three_point_field_goal_attempts > 0 ? ((row.three_point_field_goal / row.three_point_field_goal_attempts) * 100).toFixed(2) : 0)}%`;

        formattedRow.ft = `${row.free_throws || 0}-${row.free_throw_attempts || 0}`;
        formattedRow.ft_secondary = `${(row.free_throw_attempts > 0 ? ((row.free_throws / row.free_throw_attempts) * 100).toFixed(2) : 0)}%`;
      }

      // if (Organization.getCFBID() === fantasy_group.organization_id) {
      //   formattedRow.passing_completions_and_attempts = `${row.passing_completions || 0}/${row.passing_attempts || 0}`;
      //   formattedRow.passing_completions_and_attempts_secondary = `${(row.passing_attempts > 0 ? ((row.passing_completions / row.passing_attempts) * 100).toFixed(2) : 0)}}%`;
      // }

      for (const key in row) {
        let value;

        if (row[key] && key === 'minutes_played') {
          const splat = row[key].toString().split('.');
          const seconds = (+splat[1] || 0) + +splat[0] * 60;

          if (!(key in footerRow)) {
            value = seconds / 60;
          } else {
            value = +(+(footerRow[key] || 0) + (seconds / 60)).toFixed(2);
          }
        } else if (!(key in footerRow)) {
          value = row[key];
        } else {
          value = +(+footerRow[key] + +row[key]).toFixed(2);
        }

        footerRow[key] = value;
      }

      playerRows.push(formattedRow);
    }

    if (Organization.getCBBID() === fantasy_group.organization_id) {
      // # just typescript things
      const footy = footerRow as Basketball.PlayerBoxscore & { rating: number; };

      footerRow.fantasy_points = footy.rating;

      // footerRow.fg = `${footy.field_goal || 0}-${footy.field_goal_attempts || 0}`;
      // footerRow.fg_secondary = footy.field_goal_attempts !== undefined && footy.field_goal_attempts > 0 ? `${(((footy.field_goal || 0) / footy.field_goal_attempts) * 100).toFixed(2)}%` : '0%';

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

    let title = <></>;

    if (position) {
      title = <Typography type = 'body1'>{Textor.toSentenceCase(position)}</Typography>;
    }

    if (!playerRows.length) {
      return <></>;
    }

    return (
      <>
        {title}
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
          handleRowClick={handleClick}
          />
      </>
    );
  };

  return (
    <div>
      <Typography type = 'subtitle1'>{fantasy_entry.name}</Typography>
      {getPlayerBoxscoreContent(null)}
    </div>
  );
};

export default Roster;
