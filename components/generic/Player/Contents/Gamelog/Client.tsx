'use client';

/* eslint-disable no-nested-ternary */

import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';
import HelperGame from '@/components/helpers/Game';
import { Profiler, useState } from 'react';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { getNavHeaderHeight } from '../../NavBar';
import { getSubNavHeaderHeight } from '../../SubNavbar';
import RankTable from '@/components/generic/RankTable';
import TableColumns from '@/components/helpers/TableColumns';
import { Dates, Objector } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Chip, LinearProgress, useTheme } from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: 5 }}>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = getNavHeaderHeight() + getSubNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 84;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};

const Client = ({ organization_id, gamelogs }) => {
  const navigation = useNavigation();
  const theme = useTheme();

  // const player = useAppSelector((state) => state.playerReducer.player);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });
  const season = useAppSelector((state) => state.playerReducer.season);
  const subview = useAppSelector((state) => state.playerReducer.subview);

  console.log(gamelogs)

  const player_boxscores = {};

  // grab some defaults for pickers, and since we are already looping, might as well filter it a bit
  const key_x_attempts = {
    passing_attempts: 0,
    rushing_attempts: 0,
    receptions: 0,
  };
  const key_x_chip = {
    passing_attempts: 'passing',
    rushing_attempts: 'rushing',
    receptions: 'receiving',
  };
  for (const player_boxscore_id in gamelogs) {
    const row = gamelogs[player_boxscore_id];

    if (!row.game) {
      continue;
    }

    if (
      (subview && +subview !== +row.season) ||
      (!subview && season !== row.season)
    ) {
      continue;
    }

    for (const key in key_x_attempts) {
      if (key in row) {
        key_x_attempts[key] += row[key] || 0;
      }
    }

    player_boxscores[player_boxscore_id] = row;
  }

  let defaultPosition = null;
  let maxKeyCount = 0;

  for (const key in key_x_attempts) {
    if (key_x_attempts[key] > maxKeyCount) {
      defaultPosition = key_x_chip[key];
      maxKeyCount = key_x_attempts[key];
    }
  }

  const [position, setPosition] = useState<string | null>(defaultPosition);

  let playerColumns: string[] = [];

  const playerBoxscoreHeaderColumns = Objector.deepClone(TableColumns.getColumns({ organization_id, view: 'player_boxscore' }));

  if (Organization.getCBBID() === organization_id || Organization.getNBAID() === organization_id) {
    playerColumns = ['game_details', 'minutes_played', 'points', 'fg', 'two_fg', 'three_fg', 'ft', 'offensive_rebounds', 'defensive_rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'fouls'];
  }

  if (Organization.getCFBID() === organization_id) {
    if (position === 'passing') {
      playerColumns = [
        'game_details',
        'passing_completions_and_attempts',
        'passing_yards',
        'passing_yards_per_attempt',
        'passing_touchdowns',
        'passing_interceptions',
        'passing_rating_college',
        // 'passing_long',
      ];
    }

    if (position === 'rushing') {
      playerColumns = [
        'game_details',
        'rushing_attempts',
        'rushing_yards',
        'rushing_yards_per_attempt',
        'rushing_touchdowns',
        'rushing_long',
      ];
    }

    if (position === 'receiving') {
      playerColumns = [
        'game_details',
        'receptions',
        'receiving_yards',
        'receiving_yards_per_reception',
        'receiving_touchdowns',
        'receiving_long',
      ];
    }
  }


  const handleClick = (player_boxscore_id) => {
    if (!player_boxscore_id) {
      console.warn('Missing player_boxscore_id');
      return;
    }

    let game_id = null;
    if (player_boxscore_id in gamelogs) {
      game_id = gamelogs[player_boxscore_id].game_id;
    }

    navigation.game(`/${path}/games/${game_id}`);
  };

  type PartialPlayerBoxscore = Partial<Basketball.PlayerBoxscore | Football.PlayerBoxscore> & {
    name?: string;
    fg?: string;
    fg_secondary?: string;
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
    game_details?: React.JSX.Element | string;
  }
  const playerRows: PartialPlayerBoxscore[] = [];

  const footerRow: PartialPlayerBoxscore = {
    game_details: 'Total',
  };

  for (const player_boxscore_id in player_boxscores) {
    const row = player_boxscores[player_boxscore_id];

    const formattedRow = Objector.deepClone(row) as PartialPlayerBoxscore;

    const won = (row.game.home_score > row.game.away_score && row.game.home_team_id === row.team_id) || (row.game.home_score < row.game.away_score && row.game.away_team_id === row.team_id);
    const Game = new HelperGame({
      game: row.game,
    });

    let opponent: string | null = null;
    if (row.game.home_team_id !== row.team_id) {
      opponent = Game.getTeamNameShort('home');
    } else {
      opponent = Game.getTeamNameShort('away');
    }

    const spanStyle = {
      color: theme.mode === 'light' ? theme.error.main : theme.error.dark,
    };

    if (won) {
      spanStyle.color = theme.mode === 'light' ? theme.success.main : theme.success.dark;
    }

    formattedRow.game_details = (
      <div style = {{ display: 'flex', flexDirection: 'column' }}>
        <div>
          {Dates.format(`${row.game.start_date.split('T')[0]} 12:00:00`, 'M jS Y')}
        </div>
        <div style = {{ color: theme.grey[500] }}>
          {row.game.home_team_id !== row.team_id ? '@ ' : ''}{opponent} <span style = {spanStyle}>{Game.isFinal() ? (won ? 'W' : 'L') : Game.getTime()}</span> {`${row.game.home_score}-${row.game.away_score}`}
        </div>
      </div>
    );

    if (Organization.getCBBID() === organization_id || Organization.getNBAID() === organization_id) {
      // // # just typescript things
      // row = row as CBBPlayerBoxscore;
      formattedRow.fg = `${row.field_goal || 0}-${row.field_goal_attempts || 0}`;
      formattedRow.fg_secondary = `${row.field_goal_percentage || 0}%`;

      formattedRow.two_fg = `${row.two_point_field_goal || 0}-${row.two_point_field_goal_attempts || 0}`;
      formattedRow.two_fg_secondary = `${row.two_point_field_goal_percentage || 0}%`;

      formattedRow.three_fg = `${row.three_point_field_goal || 0}-${row.three_point_field_goal_attempts || 0}`;
      formattedRow.three_fg_secondary = `${row.three_point_field_goal_percentage || 0}%`;

      formattedRow.ft = `${row.free_throws || 0}-${row.free_throw_attempts || 0}`;
      formattedRow.ft_secondary = `${row.free_throw_percentage || 0}%`;
    }

    if (Organization.getCFBID() === organization_id) {
      // # just typescript things
      // row = row as CFBPlayerBoxscore;
      formattedRow.passing_completions_and_attempts = `${row.passing_completions || 0}/${row.passing_attempts || 0}`;
      formattedRow.passing_completions_and_attempts_secondary = `${row.passing_completion_percentage || 0}%`;
    }

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

  if (Organization.getCBBID() === organization_id || Organization.getNBAID() === organization_id) {
    // # just typescript things
    const footy = footerRow as Basketball.PlayerBoxscore;

    footerRow.fg = `${footy.field_goal || 0}-${footy.field_goal_attempts || 0}`;
    footerRow.fg_secondary = footy.field_goal_attempts !== undefined && footy.field_goal_attempts > 0 ? `${(((footy.field_goal || 0) / footy.field_goal_attempts) * 100).toFixed(2)}%` : '0%';

    footerRow.two_fg = `${footy.two_point_field_goal || 0}-${footy.two_point_field_goal_attempts || 0}`;
    footerRow.two_fg_secondary = footy.two_point_field_goal_attempts !== undefined && footy.two_point_field_goal_attempts > 0 ? `${(((footy.two_point_field_goal || 0) / footy.two_point_field_goal_attempts) * 100).toFixed(2)}%` : '0%';

    footerRow.three_fg = `${footy.three_point_field_goal || 0}-${footy.three_point_field_goal_attempts || 0}`;
    footerRow.three_fg_secondary = footy.three_point_field_goal_attempts !== undefined && footy.three_point_field_goal_attempts > 0 ? `${(((footy.three_point_field_goal || 0) / footy.three_point_field_goal_attempts) * 100).toFixed(2)}%` : '0%';

    footerRow.ft = `${footy.free_throws || 0}-${footy.free_throw_attempts || 0}`;
    footerRow.ft_secondary = footy.free_throw_attempts !== undefined && footy.free_throw_attempts > 0 ? `${(((footy.free_throws || 0) / footy.free_throw_attempts) * 100).toFixed(2)}%` : '0%';
  }

  if (Organization.getCFBID() === organization_id) {
    footerRow.passing_completions_and_attempts = `${footerRow.passing_completions || 0}/${footerRow.passing_attempts || 0}`;
    footerRow.passing_completions_and_attempts_secondary = footerRow.passing_attempts !== undefined && +footerRow.passing_attempts > 0 ? `${(((+(footerRow.passing_completions ?? 0) / +footerRow.passing_attempts) * 100).toFixed(2))}%` : '0%';
  }

  const descendingComparator = (a, b, orderBy, direction_) => {
    if ((orderBy in a) && b[orderBy] === null) {
      return 1;
    }
    if (a[orderBy] === null && (orderBy in b)) {
      return -1;
    }

    let a_value = a[orderBy];
    let b_value = b[orderBy];
    if (orderBy === 'game_details') {
      a_value = +a.game.start_timestamp;
      b_value = +b.game.start_timestamp;
    }

    const direction = direction_ || 'lower';


    if (b_value < a_value) {
      return direction === 'higher' ? 1 : -1;
    }
    if (b_value > a_value) {
      return direction === 'higher' ? -1 : 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy, direction) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy, direction)
      : (a, b) => -descendingComparator(a, b, orderBy, direction);
  };

  let picker: React.JSX.Element = <></>;

  if (organization_id === Organization.getCFBID()) {
    picker = (
      <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Chip style = {{ margin: '0px 10px 0px 10px' }} filled = {position === 'passing'} value = {'passing'} onClick= {() => { setPosition('passing'); }} title = {'Passing'} />
        <Chip style = {{ margin: '0px 10px 0px 10px' }} filled = {position === 'rushing'} value = {'rushing'} onClick= {() => { setPosition('rushing'); }} title = {'Rushing'} />
        <Chip style = {{ margin: '0px 10px 0px 10px' }} filled = {position === 'receiving'} value = {'receiving'} onClick= {() => { setPosition('receiving'); }} title = {'Receiving'} />
      </div>
    );
  }

  return (
    <Profiler id="Player.Contents.Gamelog.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      {picker}
      <RankTable
        rows={playerRows}
        footerRow={footerRow}
        columns={playerBoxscoreHeaderColumns}
        displayColumns={playerColumns}
        rowKey = 'player_boxscore_id'
        defaultSortOrder = 'desc'
        defaultSortOrderBy = 'game_details'
        sessionStorageKey = {`${path}.PLAYER.GAMELOG`}
        secondaryKey = 'secondary'
        handleRowClick={handleClick}
        customSortComparator={getComparator}
        />
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
