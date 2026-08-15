/* eslint-disable no-nested-ternary */

import { TableColumnsType } from '@esmalley/react-material-ui';
import { CompareStatisticRow } from '../generic/CompareStatistic';
import Organization from './Organization';


class TableColumns {
  public static getColumns(
    { organization_id, view, graphable, disabled, career }:
    { organization_id: string; view: string; graphable?: boolean; disabled?: boolean; career?: boolean },
  ): TableColumnsType {
    const rankingViews = [
      'team',
      'conference',
      'coach',
      'player',
      'transfer',
    ];

    const boxscoreViews = [
      'boxscore',
      'player_boxscore',
    ];

    const otherViews = [
      'matchup',
      'roster',
      'fantasy',
    ];

    const allViews = [...rankingViews, ...boxscoreViews, ...otherViews];

    const columns: TableColumnsType = {
      rank: {
        id: 'rank',
        numeric: true,
        sticky: true,
        disabled: true,
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        graphable: true,
        widths: {
          default: 50,
          425: 40,
        },
        getViews: () => allViews,
        getLabel: () => 'Rk',
        getDisplayValue: (row: object) => {
          return 'rank' in row ? row.rank : '-';
        },
        getValue: (row: object) => {
          return 'rank' in row ? row.rank : Infinity;
        },
        getTooltip: () => {
          if (
            view === 'fantasy'
          ) {
            return 'Rank';
          }

          return 'srating.io Rank';
        },
        showDifference: true,
        precision: 0,
      },
      name: {
        id: 'name',
        numeric: false,
        sticky: true,
        disabled: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews,
        graphable: false,
        widths: {
          default: (view === 'player' || view === 'transfer' ? 150 : 125),
          425: (view === 'player' || view === 'transfer' || view === 'roster' ? 100 : 85),
        },
        getLabel: () => {
          if (view === 'fantasy') {
            return 'Entry';
          }
          if (
            view === 'player_boxscore' ||
            view === 'player' ||
            view === 'roster' ||
            view === 'transfer'
          ) {
            return 'Player';
          }
          if (view === 'conference') {
            return 'Conference';
          }
          if (view === 'coach') {
            return 'Coach';
          }

          return 'Team';
        },
        getTooltip: () => {
          if (view === 'fantasy') {
            return 'Entry name';
          }
          if (
            view === 'player_boxscore' ||
            view === 'player' ||
            view === 'roster' ||
            view === 'transfer'
          ) {
            return 'Player name';
          }
          if (view === 'conference') {
            return 'Conference name';
          }
          if (view === 'coach') {
            return 'Coach name';
          }

          return 'Team name';
        },
      },
      game_details: {
        id: 'game_details',
        numeric: false,
        getLabel: () => 'Game',
        getTooltip: () => 'Game',
        sticky: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['player_boxscore'],
        graphable: false,
      },
      team_name: {
        id: 'team_name',
        numeric: false,
        getLabel: () => (view === 'transfer' ? 'Prev. team' : 'Team'),
        getTooltip: () => (view === 'transfer' ? 'Previous team name' : 'Team name'),
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => {
          if (career) {
            return ['coach'];
          }

          return ['player', 'transfer', 'coach'];
        },
        graphable: false,
        widths: {
          default: 85,
        },
      },
      is_transfer: {
        id: 'is_transfer',
        numeric: false,
        sticky: true,
        organization_ids: [Organization.getCBBID(), Organization.getCFBID()],
        getViews: () => ['roster'],
        graphable: false,
        widths: {
          default: 20,
        },
        style: {
        },
        getLabel: () => {
          return 'T';
        },
        getTooltip: () => {
          return 'Player is a transfer';
        },
      },
      last_game_on_team_date: {
        id: 'last_game_on_team_date',
        numeric: false,
        sticky: true,
        organization_ids: [Organization.getNBAID()],
        getViews: () => ['roster'],
        graphable: false,
        // widths: {
        //   default: 20,
        // },
        style: {
        },
        getLabel: () => {
          return 'Traded';
        },
        getTooltip: () => {
          return 'Last game on team date before trade';
        },
      },
      conference_code: {
        id: 'conference_code',
        numeric: false,
        getLabel: () => 'Conf.',
        getTooltip: () => 'Conference',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => {
          if (career) {
            return [];
          }

          return ['team', 'player', 'transfer'];
        },
        graphable: false,
        widths: {
          default: 100,
        },
      },
      elo: {
        id: 'elo',
        numeric: true,
        getLabel: () => 'SR',
        getTooltip: () => 'srating.io elo rating',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      max_elo: {
        id: 'max_elo',
        numeric: true,
        getLabel: () => 'mSR',
        getTooltip: () => 'srating.io highest elo rating during career',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => {
          if (career) {
            return ['player'];
          }

          return [];
        },
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      fantasy_points: {
        id: 'fantasy_points',
        numeric: true,
        getLabel: () => 'FP',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['fantasy_player_boxscore'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getTooltip: () => {
          return 'Fantasy points';
        },
      },
      points: {
        id: 'points',
        numeric: true,
        getLabel: () => 'PTS',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getTooltip: () => {
          if (view === 'fantasy') {
            return 'Points';
          }

          if (boxscoreViews.includes(view)) {
            return 'Points';
          }

          if (view === 'player' || view === 'transfer') {
            return `Total points in ${career ? 'career' : 'season'}`;
          }

          return 'Average points per game';
        },
      },
      offensive_rating: {
        id: 'offensive_rating',
        numeric: true,
        getLabel: () => 'ORT',
        getTooltip: () => 'srating.io Offensive rating',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'player', 'conference', 'transfer', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      defensive_rating: {
        id: 'defensive_rating',
        numeric: true,
        getLabel: () => 'DRT',
        getTooltip: () => 'srating.io Defensive rating',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'player', 'conference', 'transfer', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      efficiency_rating: {
        id: 'efficiency_rating',
        numeric: true,
        getLabel: () => (view === 'team' ? 'EM' : 'ERT'),
        getTooltip: () => `srating.io ${(view === 'team' ? 'Efficiency margin (Offensive rating - Defensive rating)' : 'Efficiency rating')}`,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'player', 'conference', 'transfer'],
        graphable: true,
      },
      adjusted_efficiency_rating: {
        id: 'adjusted_efficiency_rating',
        numeric: true,
        getLabel: () => 'aEM',
        getTooltip: () => ' srating.io Adjusted Efficiency margin (Offensive rating - Defensive rating) + aSOS',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      adjusted_passing_rating: {
        id: 'adjusted_passing_rating',
        numeric: true,
        getLabel: () => 'aQBR',
        getTooltip: () => 'srating.io Adjusted Quarter back rating',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      passing_rating_pro: {
        id: 'passing_rating_pro',
        numeric: true,
        getLabel: () => 'QBR(p)',
        getTooltip: () => 'srating.io Quarter back rating (pro)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'player', 'conference', 'transfer'],
        graphable: true,
      },
      passing_rating_college: {
        id: 'passing_rating_college',
        numeric: true,
        getLabel: () => 'QBR(c)',
        getTooltip: () => 'srating.io Quarter back rating (college)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
      },
      field_goal: {
        id: 'field_goal',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'FG-T';
          }
          return 'FG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Field goals';
          }
          return (view === 'player' || view === 'transfer' ? `Total field goals made in ${career ? 'career' : 'season'}` : 'Average field goals per game');
        },
      },
      field_goal_attempts: {
        id: 'field_goal_attempts',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'FGA-T';
          }
          return 'FGA';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Field goal attempts';
          }
          return (view === 'player' || view === 'transfer' ? `Total field goal attempts in ${career ? 'career' : 'season'}` : 'Average field goal attempts per game');
        },
      },
      field_goal_percentage: {
        id: 'field_goal_percentage',
        numeric: true,
        getLabel: () => 'FG%',
        getTooltip: () => 'Field goal percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 2,
        showDifference: true,
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'field_goal_percentage' in row && row.field_goal_percentage !== null ? row.field_goal_percentage : 0}%`;
        },
      },
      two_point_field_goal: {
        id: 'two_point_field_goal',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return '2FG-T';
          }
          return '2FG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Two point field goals';
          }
          return (view === 'player' || view === 'transfer' ? `Total two point field goals made in ${career ? 'career' : 'season'}` : 'Average two point field goals per game');
        },
      },
      two_point_field_goal_attempts: {
        id: 'two_point_field_goal_attempts',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return '2FGA-T';
          }
          return '2FGA';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Two point field goal attempts';
          }
          return (view === 'player' || view === 'transfer' ? `Total two point field goal attempts in ${career ? 'career' : 'season'}` : 'Average two point field goal attempts per game');
        },
      },
      two_point_field_goal_percentage: {
        id: 'two_point_field_goal_percentage',
        numeric: true,
        getLabel: () => '2FG%',
        getTooltip: () => 'Two point field goal percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 2,
        showDifference: true,
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'two_point_field_goal_percentage' in row && row.two_point_field_goal_percentage !== null ? row.two_point_field_goal_percentage : 0}%`;
        },
      },
      three_point_field_goal: {
        id: 'three_point_field_goal',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return '3FG-T';
          }
          return '3FG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Three point field goals';
          }
          return (view === 'player' || view === 'transfer' ? `Total three point field goals made in ${career ? 'career' : 'season'}` : 'Average three point field goals per game');
        },
      },
      three_point_field_goal_attempts: {
        id: 'three_point_field_goal_attempts',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return '3FGA-T';
          }
          return '3FGA';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Three point field goal attempts';
          }
          return (view === 'player' || view === 'transfer' ? `Total three field goal attempts in ${career ? 'career' : 'season'}` : 'Average three field goal attempts per game');
        },
      },
      three_point_field_goal_percentage: {
        id: 'three_point_field_goal_percentage',
        numeric: true,
        getLabel: () => '3FG%',
        getTooltip: () => 'Three field goal percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 2,
        showDifference: true,
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'three_point_field_goal_percentage' in row && row.three_point_field_goal_percentage !== null ? row.three_point_field_goal_percentage : 0}%`;
        },
      },
      free_throws: {
        id: 'free_throws',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'FT-T';
          }
          return 'FT';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Free throws';
          }
          return (view === 'player' || view === 'transfer' ? `Total free throws made in ${career ? 'career' : 'season'}` : 'Average free throws per game');
        },
      },
      free_throw_attempts: {
        id: 'free_throw_attempts',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'FTA-T';
          }
          return 'FTA';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Free throw attempts';
          }
          return (view === 'player' || view === 'transfer' ? `Total free throw attempts in ${career ? 'career' : 'season'}` : 'Average free throw attempts per game');
        },
      },
      free_throw_percentage: {
        id: 'free_throw_percentage',
        numeric: true,
        getLabel: () => 'FT%',
        getTooltip: () => 'Free throw percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 2,
        showDifference: true,
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'free_throw_percentage' in row && row.free_throw_percentage !== null ? row.free_throw_percentage : 0}%`;
        },
      },
      fg: {
        id: 'fg',
        getLabel: () => 'FG',
        getTooltip: () => 'Field goals',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player_boxscore'],
        graphable: false,
      },
      two_fg: {
        id: 'two_fg',
        getLabel: () => '2P',
        getTooltip: () => '2 point field goals',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player_boxscore'],
        graphable: false,
      },
      three_fg: {
        id: 'three_fg',
        getLabel: () => '3P',
        getTooltip: () => '3 point field goals',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player_boxscore'],
        graphable: false,
      },
      ft: {
        id: 'ft',
        getLabel: () => 'FT',
        getTooltip: () => 'Free throws',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player_boxscore'],
        precision: 0,
        showDifference: true,
        graphable: false,
      },
      offensive_rebounds: {
        id: 'offensive_rebounds',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'ORB-T';
          }
          return 'ORB';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Offensive rebounds';
          }
          return (view === 'player' || view === 'transfer' ? `Total offensive rebounds in ${career ? 'career' : 'season'}` : 'Average offensive rebounds per game');
        },
      },
      defensive_rebounds: {
        id: 'defensive_rebounds',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'DRB-T';
          }
          return 'DRB';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Defensive rebounds';
          }
          return (view === 'player' || view === 'transfer' ? `Total defensive rebounds in ${career ? 'career' : 'season'}` : 'Average defensive rebounds per game');
        },
      },
      total_rebounds: {
        id: 'total_rebounds',
        numeric: true,
        getLabel: () => (view === 'player' || view === 'transfer' ? 'TRB-T' : 'TRB'),
        getTooltip: () => (view === 'player' || view === 'transfer' ? `Total rebounds in ${career ? 'career' : 'season'}` : 'Average total rebounds per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'player', 'conference', 'transfer'],
        graphable: true,
      },
      assists: {
        id: 'assists',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'AST-T';
          }
          return 'AST';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Assists';
          }
          return (view === 'player' || view === 'transfer' ? `Total assists in ${career ? 'career' : 'season'}` : 'Average assists per game');
        },
      },
      steals: {
        id: 'steals',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'STL-T';
          }
          return 'STL';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Steals';
          }
          return (view === 'player' || view === 'transfer' ? `Total steals in ${career ? 'career' : 'season'}` : 'Average steals per game');
        },
      },
      blocks: {
        id: 'blocks',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'BLK-T';
          }
          return 'BLK';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Blocks';
          }
          return (view === 'player' || view === 'transfer' ? `Total blocks in ${career ? 'career' : 'season'}` : 'Average blocks per game');
        },
      },
      turnovers: {
        id: 'turnovers',
        numeric: true,
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'TOV-T';
          }
          return 'TOV';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Turnovers';
          }
          return (view === 'player' || view === 'transfer' ? `Total turnovers in ${career ? 'career' : 'season'}` : 'Average turnovers per game');
        },
      },
      fouls: {
        id: 'fouls',
        numeric: true,
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => allViews,
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'player' || view === 'transfer') {
            return 'PF-T';
          }
          return 'PF';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Personal fouls';
          }
          return (view === 'player' || view === 'transfer' ? `Total fouls in ${career ? 'career' : 'season'}` : 'Average fouls per game');
        },
      },
      plus_minus: {
        id: 'plus_minus',
        numeric: true,
        getLabel: () => 'P/M',
        getTooltip: () => 'Plus / minus (The change in score while the player was in game, postiive is better)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => [],
        graphable: true,
        precision: 0,
        showDifference: true,
      },
      record: {
        id: 'record',
        numeric: false,
        getLabel: () => 'W/L',
        getTooltip: () => 'Win/Loss',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: false,
        showDifference: true,
        precision: 0,
        getDisplayValue: (row) => {
          return `${('wins' in row ? row.wins : 0)}-${('losses' in row ? row.losses : 0)}`;
        },
        getValue: (row) => {
          return ('wins' in row ? row.wins : 0);
        },
      },
      conf_record: {
        id: 'conf_record',
        numeric: false,
        getLabel: () => 'CR',
        getTooltip: () => 'Conference Record Win/Loss',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'matchup'],
        graphable: false,
        showDifference: true,
        precision: 0,
        getDisplayValue: (row) => {
          return `${('confwins' in row ? row.confwins : 0)}-${('conflosses' in row ? row.conflosses : 0)}`;
        },
        getValue: (row) => {
          return ('confwins' in row ? row.confwins : 0);
        },
      },
      away_record_home_record: {
        id: 'away_record_home_record',
        getLabel: () => 'A/H Rec.',
        getTooltip: () => 'Away record / Home record',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['matchup'],
        graphable: false,
        showDifference: true,
        precision: 0,
        getDisplayValue: (row, side) => {
          if (side === 'left') {
            return `${'roadwins' in row ? row.roadwins : 0}-${'roadlosses' in row ? row.roadlosses : 0}`;
          }
          if (side === 'right') {
            return `${'homewins' in row ? row.homewins : 0}-${'homelosses' in row ? row.homelosses : 0}`;
          }
          return 'unknown';
        },
        getValue: (row, side) => {
          if (side === 'left') {
            return 'roadlosses' in row ? row.roadlosses : 0;
          }
          if (side === 'right') {
            return 'homelosses' in row ? row.homelosses : 0;
          }
          return 'unknown';
        },
      },
      games: {
        id: 'games',
        numeric: true,
        getLabel: () => 'G',
        getTooltip: () => 'Games played',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
      },
      wins: {
        id: 'wins',
        numeric: true,
        getLabel: () => 'Wins',
        getTooltip: () => 'Wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach', 'player'],
        graphable: true,
        showDifference: true,
      },
      losses: {
        id: 'losses',
        numeric: true,
        getLabel: () => 'Losses',
        getTooltip: () => 'Losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach', 'player'],
        graphable: true,
        showDifference: true,
      },
      neutralwins: {
        id: 'neutralwins',
        numeric: true,
        getLabel: () => 'Neut. wins',
        getTooltip: () => 'Neutral wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      neutrallosses: {
        id: 'neutrallosses',
        numeric: true,
        getLabel: () => 'Neut. losses',
        getTooltip: () => 'Neutral losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      homewins: {
        id: 'homewins',
        numeric: true,
        getLabel: () => 'Home wins',
        getTooltip: () => 'Home wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      homelosses: {
        id: 'homelosses',
        numeric: true,
        getLabel: () => 'Home losses',
        getTooltip: () => 'Home losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      roadwins: {
        id: 'roadwins',
        numeric: true,
        getLabel: () => 'Road wins',
        getTooltip: () => 'Road wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      roadlosses: {
        id: 'roadlosses',
        numeric: true,
        getLabel: () => 'Road losses',
        getTooltip: () => 'Road losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      confwins: {
        id: 'confwins',
        numeric: false,
        getLabel: () => 'CONF W',
        getTooltip: () => 'Conference Total Wins',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'coach'],
        graphable: true,
        showDifference: true,
      },
      conflosses: {
        id: 'conflosses',
        numeric: false,
        getLabel: () => 'CONF L',
        getTooltip: () => 'Conference Total Losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'coach'],
        graphable: true,
        showDifference: true,
      },
      nonconfwins: {
        id: 'nonconfwins',
        numeric: false,
        getLabel: () => 'NONC W',
        getTooltip: () => 'Non-Conference Total Wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'coach', 'conference'],
        graphable: true,
        showDifference: true,
      },
      nonconflosses: {
        id: 'nonconflosses',
        numeric: false,
        getLabel: () => 'NONC L',
        getTooltip: () => 'Non-Conference Total Losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'coach', 'conference'],
        graphable: true,
        showDifference: true,
      },
      win_percentage: {
        id: 'win_percentage',
        numeric: true,
        getLabel: () => 'W%',
        getTooltip: () => 'Win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['coach'],
        graphable: true,
        showDifference: true,
      },
      conf_win_percentage: {
        id: 'conf_win_percentage',
        numeric: true,
        getLabel: () => 'C%',
        getTooltip: () => 'Conference win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['coach'],
        graphable: true,
        showDifference: true,
      },
      nonconf_win_percentage: {
        id: 'nonconf_win_percentage',
        numeric: true,
        getLabel: () => 'NON C%',
        getTooltip: () => 'Non-Conference win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['coach'],
        graphable: true,
        showDifference: true,
      },
      home_win_percentage: {
        id: 'home_win_percentage',
        numeric: true,
        getLabel: () => 'H%',
        getTooltip: () => 'Home win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['coach'],
        graphable: true,
        showDifference: true,
      },
      road_win_percentage: {
        id: 'road_win_percentage',
        numeric: true,
        getLabel: () => 'R%',
        getTooltip: () => 'Road win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['coach'],
        graphable: true,
        showDifference: true,
      },
      neutral_win_percentage: {
        id: 'neutral_win_percentage',
        numeric: true,
        getLabel: () => 'N%',
        getTooltip: () => 'Neutral win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['coach'],
        graphable: true,
        showDifference: true,
      },
      streak: {
        id: 'streak',
        numeric: true,
        getLabel: () => 'Streak',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Number of wins or losses in a row';
          }

          return 'Number of wins or losses in a row (negative for loss)';
        },
        getDisplayValue: (row) => {
          return 'streak' in row ? ((Number(row.streak) < 0 ? 'L' : 'W') + Math.abs(Number(row.streak))) : '0';
        },
      },
      win_margin: {
        id: 'win_margin',
        numeric: true,
        getLabel: () => 'Win margin',
        getTooltip: () => 'Win margin',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      loss_margin: {
        id: 'loss_margin',
        numeric: true,
        getLabel: () => 'Loss margin',
        getTooltip: () => 'Loss margin',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      confwin_margin: {
        id: 'confwin_margin',
        numeric: true,
        getLabel: () => 'C Win margin',
        getTooltip: () => 'Conference Win margin',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      confloss_margin: {
        id: 'confloss_margin',
        numeric: true,
        getLabel: () => 'C Loss margin',
        getTooltip: () => 'Conference Loss margin',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      nonconfwin_margin: {
        id: 'nonconfwin_margin',
        numeric: false,
        getLabel: () => 'NONC W Margin',
        getTooltip: () => 'Non-Conference Avg. # of Win Margin',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['conference'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      nonconfloss_margin: {
        id: 'nonconfloss_margin',
        numeric: false,
        getLabel: () => 'NONC L Margin',
        getTooltip: () => 'Non-Conference Avg. # of Loss Margin',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['conference'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      possessions: {
        id: 'possessions',
        numeric: true,
        getLabel: () => 'Poss.',
        getTooltip: () => 'Average possessions per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      pace: {
        id: 'pace',
        numeric: true,
        getLabel: () => 'Pace',
        getTooltip: () => 'Average pace per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      minutes_played: {
        id: 'minutes_played',
        numeric: true,
        getLabel: () => 'MP',
        getTooltip: () => (view === 'team' ? 'Average minutes played per game' : 'Total minutes played'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'player', 'transfer', 'player_boxscore'],
        graphable: true,
      },
      opponent_offensive_rating: {
        id: 'opponent_offensive_rating',
        numeric: true,
        getLabel: () => 'oORT',
        getTooltip: () => 'Opponent average Offensive rating',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_defensive_rating: {
        id: 'opponent_defensive_rating',
        numeric: true,
        getLabel: () => 'oDRT',
        getTooltip: () => 'Opponent average Defensive rating ',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_efficiency_rating: {
        id: 'opponent_efficiency_rating',
        numeric: true,
        getLabel: () => 'aSOS',
        getTooltip: () => 'Strength of schedule (Opponent Efficiency margin (oORT - oDRT))',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      elo_sos: {
        id: 'elo_sos',
        numeric: true,
        getLabel: () => 'eSOS',
        getTooltip: () => 'Strength of schedule (opponent elo)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'coach', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      weighted_height_average: {
        id: 'weighted_height_average',
        numeric: true,
        getLabel: () => 'WHA',
        getTooltip: () => 'Weighted height average (inches)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team'],
        graphable: true,
        showDifference: false,
        compareType: 'rank',
      },
      elite_length_z_score: {
        id: 'elite_length_z_score',
        numeric: true,
        getLabel: () => 'ELZ',
        getTooltip: () => 'Elite length z score',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team'],
        graphable: true,
        showDifference: false,
        compareType: 'rank',
      },
      height_consistency: {
        id: 'height_consistency',
        numeric: true,
        getLabel: () => 'HC',
        getTooltip: () => 'Height consistency',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team'],
        graphable: true,
        showDifference: false,
        compareType: 'rank',
      },
      opponent_field_goal: {
        id: 'opponent_field_goal',
        numeric: true,
        getTooltip: () => 'Opponent average field goals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'FG';
          }
          return 'Opp. FG';
        },
      },
      opponent_field_goal_attempts: {
        id: 'opponent_field_goal_attempts',
        numeric: true,
        getTooltip: () => 'Opponent average field goal attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'FGA';
          }
          return 'Opp. FGA';
        },
      },
      opponent_field_goal_percentage: {
        id: 'opponent_field_goal_percentage',
        numeric: true,
        getTooltip: () => 'Opponent average field goal percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'FGA';
          }
          return 'Opp. FGA';
        },
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'opponent_field_goal_percentage' in row ? row.opponent_field_goal_percentage : 0}%`;
        },
      },
      opponent_two_point_field_goal: {
        id: 'opponent_two_point_field_goal',
        numeric: true,
        getTooltip: () => 'Opponent average two point field goals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return '2FG';
          }
          return 'Opp. 2FG';
        },
      },
      opponent_two_point_field_goal_attempts: {
        id: 'opponent_two_point_field_goal_attempts',
        numeric: true,
        getTooltip: () => 'Opponent average two point field goal attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return '2FGA';
          }
          return 'Opp. 2FGA';
        },
      },
      opponent_two_point_field_goal_percentage: {
        id: 'opponent_two_point_field_goal_percentage',
        numeric: true,
        getTooltip: () => 'Opponent average two point field goal percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return '2FG%';
          }
          return 'Opp. 2FG%';
        },
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'opponent_two_point_field_goal_percentage' in row ? row.opponent_two_point_field_goal_percentage : 0}%`;
        },
      },
      opponent_three_point_field_goal: {
        id: 'opponent_three_point_field_goal',
        numeric: true,
        getTooltip: () => 'Opponent average three point field goals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return '3FG';
          }
          return 'Opp. 3FG';
        },
      },
      opponent_three_point_field_goal_attempts: {
        id: 'opponent_three_point_field_goal_attempts',
        numeric: true,
        getTooltip: () => 'Opponent average three point field goal attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return '3FGA';
          }
          return 'Opp. 3FGA';
        },
      },
      opponent_three_point_field_goal_percentage: {
        id: 'opponent_three_point_field_goal_percentage',
        numeric: true,
        getTooltip: () => 'Opponent average three point field goal percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return '3FG%';
          }
          return 'Opp. 3FG%';
        },
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'opponent_three_point_field_goal_percentage' in row ? row.opponent_three_point_field_goal_percentage : 0}%`;
        },
      },
      opponent_free_throws: {
        id: 'opponent_free_throws',
        numeric: true,
        getTooltip: () => 'Opponent average free throws per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'FT';
          }
          return 'Opp. FT';
        },
      },
      opponent_free_throw_attempts: {
        id: 'opponent_free_throw_attempts',
        numeric: true,
        getTooltip: () => 'Opponent average free throw attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'FTA';
          }
          return 'Opp. FTA';
        },
      },
      opponent_free_throw_percentage: {
        id: 'opponent_free_throw_percentage',
        numeric: true,
        getTooltip: () => 'Opponent average free throw percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 2,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'FT%';
          }
          return 'Opp. FT%';
        },
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'opponent_free_throw_percentage' in row ? row.opponent_free_throw_percentage : 0}%`;
        },
      },
      opponent_offensive_rebounds: {
        id: 'opponent_offensive_rebounds',
        numeric: true,
        getTooltip: () => 'Opponent average offensive rebounds per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'ORB';
          }
          return 'Opp. ORB';
        },
      },
      opponent_defensive_rebounds: {
        id: 'opponent_defensive_rebounds',
        numeric: true,
        getTooltip: () => 'Opponent average defensive rebounds per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'DRB';
          }
          return 'Opp. DRB';
        },
      },
      opponent_total_rebounds: {
        id: 'opponent_total_rebounds',
        numeric: true,
        getTooltip: () => 'Opponent average total rebounds per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'TRB';
          }
          return 'Opp. TRB';
        },
      },
      opponent_assists: {
        id: 'opponent_assists',
        numeric: true,
        getTooltip: () => 'Opponent average assists per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'AST';
          }
          return 'Opp. AST';
        },
      },
      opponent_steals: {
        id: 'opponent_steals',
        numeric: true,
        getTooltip: () => 'Opponent average steals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'STL';
          }
          return 'Opp. STL';
        },
      },
      opponent_blocks: {
        id: 'opponent_blocks',
        numeric: true,
        getTooltip: () => 'Opponent average blocks per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'BLK';
          }
          return 'Opp. BLK';
        },
      },
      opponent_turnovers: {
        id: 'opponent_turnovers',
        numeric: true,
        getTooltip: () => 'Opponent average turnovers per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'TOV';
          }
          return 'Opp. TOV';
        },
      },
      opponent_fouls: {
        id: 'opponent_fouls',
        numeric: true,
        getTooltip: () => 'Opponent average fouls per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        precision: 0,
        showDifference: true,
        getLabel: () => {
          if (view === 'matchup') {
            return 'PF';
          }
          return 'Opp. PF';
        },
      },
      opponent_points: {
        id: 'opponent_points',
        numeric: true,
        getTooltip: () => 'Opponent average points per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        getLabel: () => {
          return 'Opp. PTS';
        },
      },
      opponent_possessions: {
        id: 'opponent_possessions',
        numeric: true,
        getLabel: () => 'Opp. Poss.',
        getTooltip: () => 'Opponent average possessions per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_minutes_played: {
        id: 'opponent_minutes_played',
        numeric: true,
        getLabel: () => 'Opp. MP',
        getTooltip: () => 'Opponent average minutes played per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team'],
        graphable: true,
      },
      minutes_per_game: {
        id: 'minutes_per_game',
        numeric: true,
        getLabel: () => 'MPG',
        getTooltip: () => 'Minutes played per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      points_per_game: {
        id: 'points_per_game',
        numeric: true,
        getLabel: () => 'PPG',
        getTooltip: () => 'Points per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      field_goal_per_game: {
        id: 'field_goal_per_game',
        numeric: true,
        getLabel: () => 'FG',
        getTooltip: () => 'Average field goals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      field_goal_attempts_per_game: {
        id: 'field_goal_attempts_per_game',
        numeric: true,
        getLabel: () => 'FGA',
        getTooltip: () => 'Average field goal attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      two_point_field_goal_per_game: {
        id: 'two_point_field_goal_per_game',
        numeric: true,
        getLabel: () => '2FG',
        getTooltip: () => 'Average two point field goals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      two_point_field_goal_attempts_per_game: {
        id: 'two_point_field_goal_attempts_per_game',
        numeric: true,
        getLabel: () => '2FGA',
        getTooltip: () => 'Average two point field goal attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      three_point_field_goal_per_game: {
        id: 'three_point_field_goal_per_game',
        numeric: true,
        getLabel: () => '3FG',
        getTooltip: () => 'Average three point field goals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      three_point_field_goal_attempts_per_game: {
        id: 'three_point_field_goal_attempts_per_game',
        numeric: true,
        getLabel: () => '3FGA',
        getTooltip: () => 'Average three field goal attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      free_throws_per_game: {
        id: 'free_throws_per_game',
        numeric: true,
        getLabel: () => 'FT',
        getTooltip: () => 'Average free throws per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      free_throw_attempts_per_game: {
        id: 'free_throw_attempts_per_game',
        numeric: true,
        getLabel: () => 'FTA',
        getTooltip: () => 'Average free throw attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      offensive_rebounds_per_game: {
        id: 'offensive_rebounds_per_game',
        numeric: true,
        getLabel: () => 'ORB',
        getTooltip: () => 'Offensive rebounds per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      defensive_rebounds_per_game: {
        id: 'defensive_rebounds_per_game',
        numeric: true,
        getLabel: () => 'DRB',
        getTooltip: () => 'Defensive rebounds per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      total_rebounds_per_game: {
        id: 'total_rebounds_per_game',
        numeric: true,
        getLabel: () => 'TRB',
        getTooltip: () => 'Total rebounds per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      assists_per_game: {
        id: 'assists_per_game',
        numeric: true,
        getLabel: () => 'AST',
        getTooltip: () => 'Assists per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      steals_per_game: {
        id: 'steals_per_game',
        numeric: true,
        getLabel: () => 'STL',
        getTooltip: () => 'Steals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      blocks_per_game: {
        id: 'blocks_per_game',
        numeric: true,
        getLabel: () => 'BLK',
        getTooltip: () => 'Blocks per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      turnovers_per_game: {
        id: 'turnovers_per_game',
        numeric: true,
        getLabel: () => 'TO',
        getTooltip: () => 'Turnovers per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      fouls_per_game: {
        id: 'fouls_per_game',
        numeric: true,
        getLabel: () => 'PF',
        getTooltip: () => 'Fouls per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      player_efficiency_rating: {
        id: 'player_efficiency_rating',
        numeric: true,
        getLabel: () => 'PER',
        getTooltip: () => 'srating.io Player efficiency rating metric',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      true_shooting_percentage: {
        id: 'true_shooting_percentage',
        numeric: true,
        getLabel: () => 'TS%',
        getTooltip: () => 'True shooting percentage, takes into account all field goals and free throws.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      effective_field_goal_percentage: {
        id: 'effective_field_goal_percentage',
        numeric: true,
        getLabel: () => 'eFG%',
        getTooltip: () => 'Effective field goal percentage, adjusted field goal % since 3 points greater than 2.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      offensive_rebound_percentage: {
        id: 'offensive_rebound_percentage',
        numeric: true,
        getLabel: () => 'ORB%',
        getTooltip: () => 'Offensive rebound percentage, estimate of % of offensive rebounds player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      defensive_rebound_percentage: {
        id: 'defensive_rebound_percentage',
        numeric: true,
        getLabel: () => 'DRB%',
        getTooltip: () => 'Defensive rebound percentage, estimate of % of defensive rebounds player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      total_rebound_percentage: {
        id: 'total_rebound_percentage',
        numeric: true,
        getLabel: () => 'TRB%',
        getTooltip: () => 'Total rebound percentage, estimate of % of total rebounds player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      assist_percentage: {
        id: 'assist_percentage',
        numeric: true,
        getLabel: () => 'AST%',
        getTooltip: () => 'Assist percentage, estimate of % of assists player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      steal_percentage: {
        id: 'steal_percentage',
        numeric: true,
        getLabel: () => 'STL%',
        getTooltip: () => 'Steal percentage, estimate of % of steals player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      block_percentage: {
        id: 'block_percentage',
        numeric: true,
        getLabel: () => 'BLK%',
        getTooltip: () => 'Block percentage, estimate of % of blocks player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      turnover_percentage: {
        id: 'turnover_percentage',
        numeric: true,
        getLabel: () => 'TOV%',
        getTooltip: () => 'Turnover percentage, estimate of % of turnovers player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      usage_percentage: {
        id: 'usage_percentage',
        numeric: true,
        getLabel: () => 'USG%',
        getTooltip: () => 'Usage percentage, estimate of % of plays ran through player while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['player', 'transfer'],
        graphable: true,
      },
      passing_attempts: {
        id: 'passing_attempts',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'ATT';
          }

          return (view === 'player' ? 'P ATT-T' : 'P ATT');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'ATT-T' : 'ATT');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Passing attempts';
          }
          return (view === 'player' ? `Total passing attempts in a ${career ? 'career' : 'season'}` : 'Passing attempts per game');
        },
      },
      passing_completions_and_attempts: {
        id: 'passing_completions_and_attempts',
        getLabel: () => 'C/ATT',
        getTooltip: () => 'Completions / Attempts',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCFBID()],
        getViews: () => boxscoreViews,
        graphable: false,
        showDifference: true,
        precision: 0,
      },
      passing_completions: {
        id: 'passing_completions',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'COMP';
          }

          return (view === 'player' ? 'P COMP-T' : 'P COMP');
        },
        getAltLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'COMP';
          }

          return (view === 'player' ? 'COMP-T' : 'COMP');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Passing completions';
          }

          return (view === 'player' ? `Total passing completions in a ${career ? 'career' : 'season'}` : 'Passing completions per game');
        },
      },
      passing_yards: {
        id: 'passing_yards',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'YDS';
          }

          return (view === 'player' ? 'P YDS-T' : 'P YDS');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'YDS-T' : 'YDS');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Passing yards';
          }

          return (view === 'player' ? `Total passing yards in a ${career ? 'career' : 'season'}` : 'Passing yards per game');
        },
      },
      passing_completion_percentage: {
        id: 'passing_completion_percentage',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'COMP%';
          }

          return 'P COMP%';
        },
        getAltLabel: () => {
          return 'COMP%';
        },
        getTooltip: () => {
          return 'Passing completions percentage';
        },
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'passing_completion_percentage' in row ? row.passing_completion_percentage : 0}%`;
        },
      },
      passing_yards_per_attempt: {
        id: 'passing_yards_per_attempt',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'AVG';
          }

          return 'P AVG';
        },
        getAltLabel: () => {
          return 'AVG';
        },
        getTooltip: () => {
          return 'Passing yard per attempt';
        },
      },
      passing_yards_per_completion: {
        id: 'passing_yards_per_completion',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'YDS per COMP';
          }

          return 'P YDS per COMP';
        },
        getAltLabel: () => 'YDS per COMP',
        getTooltip: () => {
          return 'Passing yard per completion';
        },
      },
      passing_touchdowns: {
        id: 'passing_touchdowns',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'TD';
          }

          return (view === 'player' ? 'P TD-T' : 'P TD');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'TD-T' : 'TD');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Touchdowns';
          }
          return (view === 'player' ? `Total passing touchdowns in a ${career ? 'career' : 'season'}` : 'Passing touchdowns per game');
        },
      },
      passing_interceptions: {
        id: 'passing_interceptions',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'INT';
          }

          return (view === 'player' ? 'P INT-T' : 'P INT');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'INT-T' : 'INT');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Interceptions';
          }
          return (view === 'player' ? `Total passing interceptions in a ${career ? 'career' : 'season'}` : 'Passing interceptions per game');
        },
      },
      passing_long: {
        id: 'passing_long',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'LONG';
          }

          return 'P LONG';
        },
        getAltLabel: () => {
          return 'LONG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Long';
          }
          return 'Passing long';
        },
      },
      rushing_attempts: {
        id: 'rushing_attempts',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'ATT';
          }

          return (view === 'player' ? 'R ATT-T' : 'R ATT');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'ATT-T' : 'ATT');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Attempts';
          }
          return (view === 'player' ? `Total rushing attempts in a ${career ? 'career' : 'season'}` : 'Rushing attempts per game');
        },
      },
      rushing_yards: {
        id: 'rushing_yards',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'YDS';
          }

          return (view === 'player' ? 'R YDS-T' : 'R YDS');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'YDS-T' : 'YDS');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Yards';
          }
          return (view === 'player' ? `Total rushing yards in a ${career ? 'career' : 'season'}` : 'Rushing yards per game');
        },
      },
      rushing_yards_per_attempt: {
        id: 'rushing_yards_per_attempt',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'AVG';
          }

          return 'R AVG';
        },
        getAltLabel: () => {
          return 'AVG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Yards per attempt';
          }
          return 'Rushing yards per attempt';
        },
      },
      rushing_touchdowns: {
        id: 'rushing_touchdowns',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'TD';
          }

          return (view === 'player' ? 'R TD-T' : 'R TD');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'TD-T' : 'TD');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Touchdowns';
          }
          return (view === 'player' ? `Total rushing touchdowns in a ${career ? 'career' : 'season'}` : 'Rushing touchdowns per game');
        },
      },
      rushing_long: {
        id: 'rushing_long',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'LONG';
          }

          return 'R LONG';
        },
        getAltLabel: () => {
          return 'LONG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Long';
          }
          return 'Rushing long';
        },
      },
      receptions: {
        id: 'receptions',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'REC';
          }

          return (view === 'player' ? 'REC-T' : 'REC');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'REC-T' : 'REC');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Receptions';
          }
          return (view === 'player' ? `Total receptions in ${career ? 'career' : 'season'}` : 'Receptions per game');
        },
      },
      receiving_yards: {
        id: 'receiving_yards',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'YDS';
          }

          return (view === 'player' ? 'REC YDS-T' : 'REC YDS');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'YDS-T' : 'YDS');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Yards';
          }
          return (view === 'player' ? `Total receiving yards in ${career ? 'career' : 'season'}` : 'Receiving yards per game');
        },
      },
      receiving_yards_per_reception: {
        id: 'receiving_yards_per_reception',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'AVG';
          }

          return 'REC AVG';
        },
        getAltLabel: () => {
          return 'AVG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Yards per reception';
          }
          return 'Receiving yards per reception';
        },
      },
      receiving_touchdowns: {
        id: 'receiving_touchdowns',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'TD';
          }

          return (view === 'player' ? 'REC TD-T' : 'REC TD');
        },
        getAltLabel: () => {
          return (view === 'player' ? 'TD-T' : 'TD');
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Touchdowns';
          }
          return (view === 'player' ? `Total receiving touchdowns in ${career ? 'career' : 'season'}` : 'Receiving touchdowns per game');
        },
      },
      receiving_long: {
        id: 'receiving_long',
        numeric: true,
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'LONG';
          }

          return 'REC LONG';
        },
        getAltLabel: () => {
          return 'LONG';
        },
        getTooltip: () => {
          if (boxscoreViews.includes(view)) {
            return 'Longest attempt';
          }
          return 'Receiving long';
        },
      },
      // punt_returns: {
      //   id: 'punt_returns',
      //   numeric: true,
      //   getLabel: () => 'Punt ret.',
      //   getTooltip: () => 'Punt returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_yards: {
      //   id: 'punt_return_yards',
      //   numeric: true,
      //   getLabel: () => 'Punt ret. yards',
      //   getTooltip: () => 'Punt return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_yards_per_attempt: {
      //   id: 'punt_return_yards_per_attempt',
      //   numeric: true,
      //   getLabel: () => 'Punt ret. yards per att.',
      //   getTooltip: () => 'Punt return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_touchdowns: {
      //   id: 'punt_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Punt ret. TD',
      //   getTooltip: () => 'Punt return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_long: {
      //   id: 'punt_return_long',
      //   numeric: true,
      //   getLabel: () => 'Punt ret. long',
      //   getTooltip: () => 'Punt return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_returns: {
      //   id: 'kick_returns',
      //   numeric: true,
      //   getLabel: () => 'Kick ret.',
      //   getTooltip: () => 'Kick returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_yards: {
      //   id: 'kick_return_yards',
      //   numeric: true,
      //   getLabel: () => 'Kick ret. yards',
      //   getTooltip: () => 'Kick return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_yards_per_attempt: {
      //   id: 'kick_return_yards_per_attempt',
      //   numeric: true,
      //   getLabel: () => 'Kick ret. yards per att.',
      //   getTooltip: () => 'Kick return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_touchdowns: {
      //   id: 'kick_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Kick ret. TD',
      //   getTooltip: () => 'Kick return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_long: {
      //   id: 'kick_return_long',
      //   numeric: true,
      //   getLabel: () => 'Kick ret. long',
      //   getTooltip: () => 'Kick return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punts: {
      //   id: 'punts',
      //   numeric: true,
      //   getLabel: () => 'Punts',
      //   getTooltip: () => 'Punts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_yards: {
      //   id: 'punt_yards',
      //   numeric: true,
      //   getLabel: () => 'Punt yards',
      //   getTooltip: () => 'Punt yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_average: {
      //   id: 'punt_average',
      //   numeric: true,
      //   getLabel: () => 'Punt avg.',
      //   getTooltip: () => 'Punt average',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_long: {
      //   id: 'punt_long',
      //   numeric: true,
      //   getLabel: () => 'Punt long',
      //   getTooltip: () => 'Punt long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goals_attempted: {
      //   id: 'field_goals_attempted',
      //   numeric: true,
      //   getLabel: () => 'FG att.',
      //   getTooltip: () => 'Field goals attempted',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goals_made: {
      //   id: 'field_goals_made',
      //   numeric: true,
      //   getLabel: () => 'FGs',
      //   getTooltip: () => 'Field goals made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goal_percentage: {
      //   id: 'field_goal_percentage',
      //   numeric: true,
      //   getLabel: () => 'FG%',
      //   getTooltip: () => 'Field goal percentage',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goals_longest_made: {
      //   id: 'field_goals_longest_made',
      //   numeric: true,
      //   getLabel: () => 'FG long',
      //   getTooltip: () => 'Field goal longest made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // extra_points_attempted: {
      //   id: 'extra_points_attempted',
      //   numeric: true,
      //   getLabel: () => '2pt att.',
      //   getTooltip: () => '2pt conversion attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // extra_points_made: {
      //   id: 'extra_points_made',
      //   numeric: true,
      //   getLabel: () => '2pt con.',
      //   getTooltip: () => '2pt conversions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // interceptions: {
      //   id: 'interceptions',
      //   numeric: true,
      //   getLabel: () => 'Int.',
      //   getTooltip: () => 'Interceptions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // interception_return_yards: {
      //   id: 'interception_return_yards',
      //   numeric: true,
      //   getLabel: () => 'Int. ret. yards',
      //   getTooltip: () => 'Interceptions return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // interception_return_touchdowns: {
      //   id: 'interception_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Int. ret. TD',
      //   getTooltip: () => 'Interceptions return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // solo_tackles: {
      //   id: 'solo_tackles',
      //   numeric: true,
      //   getLabel: () => 'Solo tackle',
      //   getTooltip: () => 'Solo tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // assisted_tackles: {
      //   id: 'assisted_tackles',
      //   numeric: true,
      //   getLabel: () => 'Ast. tackle',
      //   getTooltip: () => 'Assisted tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // tackles_for_loss: {
      //   id: 'tackles_for_loss',
      //   numeric: true,
      //   getLabel: () => 'Tackle for loss',
      //   getTooltip: () => 'Tackles for loss',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // sacks: {
      //   id: 'sacks',
      //   numeric: true,
      //   getLabel: () => 'Sacks',
      //   getTooltip: () => 'Sacks',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // passes_defended: {
      //   id: 'passes_defended',
      //   numeric: true,
      //   getLabel: () => 'Pass defended',
      //   getTooltip: () => 'Passes defended',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumbles_recovered: {
      //   id: 'fumbles_recovered',
      //   numeric: true,
      //   getLabel: () => 'Fumble rec.',
      //   getTooltip: () => 'Fumbles recovered',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumble_return_touchdowns: {
      //   id: 'fumble_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Fumble ret. TD',
      //   getTooltip: () => 'Fumbles returned to touchdown',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // quarterback_hurries: {
      //   id: 'quarterback_hurries',
      //   numeric: true,
      //   getLabel: () => 'QB hurry',
      //   getTooltip: () => 'QB hurries',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumbles: {
      //   id: 'fumbles',
      //   numeric: true,
      //   getLabel: () => 'Fumbles',
      //   getTooltip: () => 'Fumbles',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumbles_lost: {
      //   id: 'fumbles_lost',
      //   numeric: true,
      //   getLabel: () => 'Fumbles lost',
      //   getTooltip: () => 'Fumbles lost',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      yards_per_play: {
        id: 'yards_per_play',
        numeric: true,
        getLabel: () => 'YPP',
        getTooltip: () => 'Yards per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      points_per_play: {
        id: 'points_per_play',
        numeric: true,
        getLabel: () => 'PPP',
        getTooltip: () => 'Points per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      // successful_pass_plays: {
      //   id: 'successful_pass_plays',
      //   numeric: true,
      //   getLabel: () => 'SPP',
      //   getTooltip: () => 'Successful pass plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // successful_rush_plays: {
      //   id: 'successful_rush_plays',
      //   numeric: true,
      //   getLabel: () => 'SRP',
      //   getTooltip: () => 'Successful rush plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // offensive_dvoa: {
      //   id: 'offensive_dvoa',
      //   numeric: true,
      //   getLabel: () => 'O-DVOA',
      //   getTooltip: () => 'offensive_dvoa', // todo
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // defensive_dvoa: {
      //   id: 'defensive_dvoa',
      //   numeric: true,
      //   getLabel: () => 'D-DVOA',
      //   getTooltip: () => 'defensive_dvoa', // todo
      //   sort: 'higher', // todo
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // first_downs: {
      //   id: 'first_downs',
      //   numeric: true,
      //   getLabel: () => '1st downs',
      //   getTooltip: () => '1st downs',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // third_down_conversions: {
      //   id: 'third_down_conversions',
      //   numeric: true,
      //   getLabel: () => '3rd down conv.',
      //   getTooltip: () => '3rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // third_down_attempts: {
      //   id: 'third_down_attempts',
      //   numeric: true,
      //   getLabel: () => '3rd down att.',
      //   getTooltip: () => '3rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // fourth_down_conversions: {
      //   id: 'fourth_down_conversions',
      //   numeric: true,
      //   getLabel: () => '4rd down conv.',
      //   getTooltip: () => '4rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // fourth_down_attempts: {
      //   id: 'fourth_down_attempts',
      //   numeric: true,
      //   getLabel: () => '4rd down att.',
      //   getTooltip: () => '4rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // time_of_possession_seconds: {
      //   id: 'time_of_possession_seconds',
      //   numeric: true,
      //   getLabel: () => 'ToP',
      //   getTooltip: () => 'Time of possession in seconds',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      opponent_yards_per_play: {
        id: 'opponent_yards_per_play',
        numeric: true,
        getLabel: () => 'Opp. YPP',
        getTooltip: () => 'Opponent Yards per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_points_per_play: {
        id: 'opponent_points_per_play',
        numeric: true,
        getLabel: () => 'Opp. PPP',
        getTooltip: () => 'Opponent Points per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      // opponent_successful_pass_plays: {
      //   id: 'opponent_successful_pass_plays',
      //   numeric: true,
      //   getLabel: () => 'Opp. SPP',
      //   getTooltip: () => 'Opponent Successful pass plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_successful_rush_plays: {
      //   id: 'opponent_successful_rush_plays',
      //   numeric: true,
      //   getLabel: () => 'Opp. SRP',
      //   getTooltip: () => 'Opponent Successful rush plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_offensive_dvoa: {
      //   id: 'opponent_offensive_dvoa',
      //   numeric: true,
      //   getLabel: () => 'Opp. O-DVOA',
      //   getTooltip: () => 'Opponent offensive_dvoa', // todo
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_defensive_dvoa: {
      //   id: 'opponent_defensive_dvoa',
      //   numeric: true,
      //   getLabel: () => 'Opp. D-DVOA',
      //   getTooltip: () => 'Opponent defensive_dvoa', // todo
      //   sort: 'higher', // todo
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_first_downs: {
      //   id: 'opponent_first_downs',
      //   numeric: true,
      //   getLabel: () => 'Opp. 1st downs',
      //   getTooltip: () => 'Opponent 1st downs',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_third_down_conversions: {
      //   id: 'opponent_third_down_conversions',
      //   numeric: true,
      //   getLabel: () => 'Opp. 3rd down conv.',
      //   getTooltip: () => 'Opponent 3rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_third_down_attempts: {
      //   id: 'opponent_third_down_attempts',
      //   numeric: true,
      //   getLabel: () => 'Opp. 3rd down att.',
      //   getTooltip: () => 'Opponent 3rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fourth_down_conversions: {
      //   id: 'opponent_fourth_down_conversions',
      //   numeric: true,
      //   getLabel: () => 'Opp. 4rd down conv.',
      //   getTooltip: () => 'Opponent 4rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fourth_down_attempts: {
      //   id: 'opponent_fourth_down_attempts',
      //   numeric: true,
      //   getLabel: () => 'Opp. 4rd down att.',
      //   getTooltip: () => 'Opponent 4rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_time_of_possession_seconds: {
      //   id: 'opponent_time_of_possession_seconds',
      //   numeric: true,
      //   getLabel: () => 'Opp. ToP',
      //   getTooltip: () => 'Opponent Time of possession in seconds',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      opponent_passing_attempts: {
        id: 'opponent_passing_attempts',
        numeric: true,
        getLabel: () => 'Opp. Pass att.',
        getTooltip: () => 'Opponent Passing attempts',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_completions: {
        id: 'opponent_passing_completions',
        numeric: true,
        getLabel: () => 'Opp. Pass comp.',
        getTooltip: () => 'Opponent Passing completions',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_yards: {
        id: 'opponent_passing_yards',
        numeric: true,
        getLabel: () => 'Opp. Pass yards',
        getTooltip: () => 'Opponent Passing yards',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_completion_percentage: {
        id: 'opponent_passing_completion_percentage',
        numeric: true,
        getLabel: () => 'Opp. Pass comp. %',
        getTooltip: () => 'Opponent Passing completions percentage',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_yards_per_attempt: {
        id: 'opponent_passing_yards_per_attempt',
        numeric: true,
        getLabel: () => 'Opp. Pass yards per att.',
        getTooltip: () => 'Opponent Passing yard per attempt',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_yards_per_completion: {
        id: 'opponent_passing_yards_per_completion',
        numeric: true,
        getLabel: () => 'Opp. Pass yards per comp.',
        getTooltip: () => 'Opponent Passing yards per completion',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_touchdowns: {
        id: 'opponent_passing_touchdowns',
        numeric: true,
        getLabel: () => 'Opp. Pass TD',
        getTooltip: () => 'Opponent Passing touchdowns',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_interceptions: {
        id: 'opponent_passing_interceptions',
        numeric: true,
        getLabel: () => 'Opp. Pass int.',
        getTooltip: () => 'Opponent Passing interceptions',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_rating_pro: {
        id: 'opponent_passing_rating_pro',
        numeric: true,
        getLabel: () => 'Opp. QBR(p)',
        getTooltip: () => 'Opponent Quarter back rating (pro)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_rating_college: {
        id: 'opponent_passing_rating_college',
        numeric: true,
        getLabel: () => 'Opp. QBR(c)',
        getTooltip: () => 'Opponent Quarter back rating (college)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      opponent_passing_long: {
        id: 'opponent_passing_long',
        numeric: true,
        getLabel: () => 'Opp. Pass long',
        getTooltip: () => 'Opponent Passing long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_attempts: {
        id: 'opponent_rushing_attempts',
        numeric: true,
        getLabel: () => 'Opp. Rush att.',
        getTooltip: () => 'Opponent Rushing attempts',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_yards: {
        id: 'opponent_rushing_yards',
        numeric: true,
        getLabel: () => 'Opp. Rush yards',
        getTooltip: () => 'Opponent Rushing yards',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_yards_per_attempt: {
        id: 'opponent_rushing_yards_per_attempt',
        numeric: true,
        getLabel: () => 'Opp. Rush yards per att.',
        getTooltip: () => 'Opponent Rushing yards per attempt',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_touchdowns: {
        id: 'opponent_rushing_touchdowns',
        numeric: true,
        getLabel: () => 'Opp. Rush TD',
        getTooltip: () => 'Opponent Rushing touchdowns',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_long: {
        id: 'opponent_rushing_long',
        numeric: true,
        getLabel: () => 'Opp. Rush long',
        getTooltip: () => 'Opponent Rushing long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_receptions: {
        id: 'opponent_receptions',
        numeric: true,
        getLabel: () => 'Opp. Receptions',
        getTooltip: () => 'Opponent # of receptions',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_yards: {
        id: 'opponent_receiving_yards',
        numeric: true,
        getLabel: () => 'Opp. Rec. yards',
        getTooltip: () => 'Opponent Receiving yards',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_yards_per_reception: {
        id: 'opponent_receiving_yards_per_reception',
        numeric: true,
        getLabel: () => 'Opp. Rec. yards per recep.',
        getTooltip: () => 'Opponent Receiving yards per reception',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_touchdowns: {
        id: 'opponent_receiving_touchdowns',
        numeric: true,
        getLabel: () => 'Opp. Rec. TD',
        getTooltip: () => 'Opponent Receiving touchdowns',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_long: {
        id: 'opponent_receiving_long',
        numeric: true,
        getLabel: () => 'Opp. Rec. long',
        getTooltip: () => 'Opponent Receiving long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['team', 'conference'],
        graphable: true,
      },
      // opponent_punt_returns: {
      //   id: 'opponent_punt_returns',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt ret.',
      //   getTooltip: () => 'Opponent Punt returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_yards: {
      //   id: 'opponent_punt_return_yards',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt ret. yards',
      //   getTooltip: () => 'Opponent Punt return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_yards_per_attempt: {
      //   id: 'opponent_punt_return_yards_per_attempt',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt ret. yards per att.',
      //   getTooltip: () => 'Opponent Punt return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_touchdowns: {
      //   id: 'opponent_punt_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt ret. TD',
      //   getTooltip: () => 'Opponent Punt return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_long: {
      //   id: 'opponent_punt_return_long',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt ret. long',
      //   getTooltip: () => 'Opponent Punt return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_returns: {
      //   id: 'opponent_kick_returns',
      //   numeric: true,
      //   getLabel: () => 'Opp. Kick ret.',
      //   getTooltip: () => 'Opponent Kick returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_yards: {
      //   id: 'opponent_kick_return_yards',
      //   numeric: true,
      //   getLabel: () => 'Opp. Kick ret. yards',
      //   getTooltip: () => 'Opponent Kick return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_yards_per_attempt: {
      //   id: 'opponent_kick_return_yards_per_attempt',
      //   numeric: true,
      //   getLabel: () => 'Opp. Kick ret. yards per att.',
      //   getTooltip: () => 'Opponent Kick return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_touchdowns: {
      //   id: 'opponent_kick_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Opp. Kick ret. TD',
      //   getTooltip: () => 'Opponent Kick return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_long: {
      //   id: 'opponent_kick_return_long',
      //   numeric: true,
      //   getLabel: () => 'Opp. Kick ret. long',
      //   getTooltip: () => 'Opponent Kick return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punts: {
      //   id: 'opponent_punts',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punts',
      //   getTooltip: () => 'Opponent Punts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_yards: {
      //   id: 'opponent_punt_yards',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt yards',
      //   getTooltip: () => 'Opponent Punt yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_average: {
      //   id: 'opponent_punt_average',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt avg.',
      //   getTooltip: () => 'Opponent Punt average',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_long: {
      //   id: 'opponent_punt_long',
      //   numeric: true,
      //   getLabel: () => 'Opp. Punt long',
      //   getTooltip: () => 'Opponent Punt long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goals_attempted: {
      //   id: 'opponent_field_goals_attempted',
      //   numeric: true,
      //   getLabel: () => 'Opp. FG att.',
      //   getTooltip: () => 'Opponent Field goals attempted',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goals_made: {
      //   id: 'opponent_field_goals_made',
      //   numeric: true,
      //   getLabel: () => 'Opp. FGs',
      //   getTooltip: () => 'Opponent Field goals made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goal_percentage: {
      //   id: 'opponent_field_goal_percentage',
      //   numeric: true,
      //   getLabel: () => 'Opp. FG%',
      //   getTooltip: () => 'Opponent Field goal percentage',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goals_longest_made: {
      //   id: 'opponent_field_goals_longest_made',
      //   numeric: true,
      //   getLabel: () => 'Opp. FG long',
      //   getTooltip: () => 'Opponent Field goal longest made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_extra_points_attempted: {
      //   id: 'opponent_extra_points_attempted',
      //   numeric: true,
      //   getLabel: () => 'Opp. 2pt att.',
      //   getTooltip: () => 'Opponent 2pt conversion attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_extra_points_made: {
      //   id: 'opponent_extra_points_made',
      //   numeric: true,
      //   getLabel: () => 'Opp. 2pt con.',
      //   getTooltip: () => 'Opponent 2pt conversions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_interceptions: {
      //   id: 'opponent_interceptions',
      //   numeric: true,
      //   getLabel: () => 'Opp. Int.',
      //   getTooltip: () => 'Opponent Interceptions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_interception_return_yards: {
      //   id: 'opponent_interception_return_yards',
      //   numeric: true,
      //   getLabel: () => 'Opp. Int. ret. yards',
      //   getTooltip: () => 'Opponent Interceptions return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_interception_return_touchdowns: {
      //   id: 'opponent_interception_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Opp. Int. ret. TD',
      //   getTooltip: () => 'Opponent Interceptions return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_solo_tackles: {
      //   id: 'opponent_solo_tackles',
      //   numeric: true,
      //   getLabel: () => 'Opp. Solo tackle',
      //   getTooltip: () => 'Opponent Solo tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_assisted_tackles: {
      //   id: 'opponent_assisted_tackles',
      //   numeric: true,
      //   getLabel: () => 'Opp. Ast. tackle',
      //   getTooltip: () => 'Opponent Assisted tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_tackles_for_loss: {
      //   id: 'opponent_tackles_for_loss',
      //   numeric: true,
      //   getLabel: () => 'Opp. Tackle for loss',
      //   getTooltip: () => 'Opponent Tackles for loss',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_sacks: {
      //   id: 'opponent_sacks',
      //   numeric: true,
      //   getLabel: () => 'Opp. Sacks',
      //   getTooltip: () => 'Opponent Sacks',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_passes_defended: {
      //   id: 'opponent_passes_defended',
      //   numeric: true,
      //   getLabel: () => 'Opp. Pass defended',
      //   getTooltip: () => 'Opponent Passes defended',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumbles_recovered: {
      //   id: 'opponent_fumbles_recovered',
      //   numeric: true,
      //   getLabel: () => 'Opp. Fumble rec.',
      //   getTooltip: () => 'Opponent Fumbles recovered',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumble_return_touchdowns: {
      //   id: 'opponent_fumble_return_touchdowns',
      //   numeric: true,
      //   getLabel: () => 'Opp. Fumble ret. TD',
      //   getTooltip: () => 'Opponent Fumbles returned to touchdown',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_quarterback_hurries: {
      //   id: 'opponent_quarterback_hurries',
      //   numeric: true,
      //   getLabel: () => 'Opp. QB hurry',
      //   getTooltip: () => 'Opponent QB hurries',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumbles: {
      //   id: 'opponent_fumbles',
      //   numeric: true,
      //   getLabel: () => 'Opp. Fumbles',
      //   getTooltip: () => 'Opponent Fumbles',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumbles_lost: {
      //   id: 'opponent_fumbles_lost',
      //   numeric: true,
      //   getLabel: () => 'Opp. Fumbles lost',
      //   getTooltip: () => 'Opponent Fumbles lost',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   getViews: () => ['team', 'conference'],
      //   graphable: true,
      // },
      passing_attempts_per_game: {
        id: 'passing_attempts_per_game',
        numeric: true,
        getLabel: () => 'Pass att.',
        getAltLabel: () => 'ATT',
        getTooltip: () => 'Passing attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      passing_completions_per_game: {
        id: 'passing_completions_per_game',
        numeric: true,
        getLabel: () => 'Pass comp.',
        getAltLabel: () => 'COMP',
        getTooltip: () => 'Passing completions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      passing_yards_per_game: {
        id: 'passing_yards_per_game',
        numeric: true,
        getLabel: () => 'Pass yards',
        getAltLabel: () => 'YDS',
        getTooltip: () => 'Passing yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      passing_touchdowns_per_game: {
        id: 'passing_touchdowns_per_game',
        numeric: true,
        getLabel: () => 'Pass TD',
        getAltLabel: () => 'TD',
        getTooltip: () => 'Passing touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      passing_interceptions_per_game: {
        id: 'passing_interceptions_per_game',
        numeric: true,
        getLabel: () => 'Pass int.',
        getAltLabel: () => 'INT',
        getTooltip: () => 'Passing interceptions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      rushing_attempts_per_game: {
        id: 'rushing_attempts_per_game',
        numeric: true,
        getLabel: () => 'Rush att',
        getAltLabel: () => 'ATT',
        getTooltip: () => 'Rushing attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      rushing_yards_per_game: {
        id: 'rushing_yards_per_game',
        numeric: true,
        getLabel: () => 'Rush yards',
        getAltLabel: () => 'YDS',
        getTooltip: () => 'Rushing yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      rushing_touchdowns_per_game: {
        id: 'rushing_touchdowns_per_game',
        numeric: true,
        getLabel: () => 'Rush TD',
        getAltLabel: () => 'TD',
        getTooltip: () => 'Rushing touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      receptions_per_game: {
        id: 'receptions_per_game',
        numeric: true,
        getLabel: () => 'Receptions',
        getAltLabel: () => 'REC',
        getTooltip: () => '# of receptions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      receiving_yards_per_game: {
        id: 'receiving_yards_per_game',
        numeric: true,
        getLabel: () => 'Rec. yards',
        getAltLabel: () => 'YDS',
        getTooltip: () => 'Receiving yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      receiving_touchdowns_per_game: {
        id: 'receiving_touchdowns_per_game',
        numeric: true,
        getLabel: () => 'Rec. TD',
        getAltLabel: () => 'TD',
        getTooltip: () => 'Receiving touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      punt_returns_per_game: {
        id: 'punt_returns_per_game',
        numeric: true,
        getLabel: () => 'Punt ret.',
        getAltLabel: () => 'RET',
        getTooltip: () => 'Punt returns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      punt_return_yards_per_game: {
        id: 'punt_return_yards_per_game',
        numeric: true,
        getLabel: () => 'Punt ret. yards',
        getAltLabel: () => 'YDS',
        getTooltip: () => 'Punt return yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      punt_return_touchdowns_per_game: {
        id: 'punt_return_touchdowns_per_game',
        numeric: true,
        getLabel: () => 'Punt ret. TD',
        getAltLabel: () => 'TD',
        getTooltip: () => 'Punt return touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      kick_returns_per_game: {
        id: 'kick_returns_per_game',
        numeric: true,
        getLabel: () => 'Kick ret.',
        getAltLabel: () => 'RET',
        getTooltip: () => 'Kick returns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      kick_return_yards_per_game: {
        id: 'kick_return_yards_per_game',
        numeric: true,
        getLabel: () => 'Kick ret. yards',
        getAltLabel: () => 'YDS',
        getTooltip: () => 'Kick return yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      kick_return_touchdowns_per_game: {
        id: 'kick_return_touchdowns_per_game',
        numeric: true,
        getLabel: () => 'Kick ret. TD',
        getAltLabel: () => 'TD',
        getTooltip: () => 'Kick return touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      punts_per_game: {
        id: 'punts_per_game',
        numeric: true,
        getLabel: () => 'Punts',
        getTooltip: () => 'Punts per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      punt_yards_per_game: {
        id: 'punt_yards_per_game',
        numeric: true,
        getLabel: () => 'Punt yards',
        getAltLabel: () => 'YDS',
        getTooltip: () => 'Punt yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      field_goals_attempted_per_game: {
        id: 'field_goals_attempted_per_game',
        numeric: true,
        getLabel: () => 'FGA',
        getTooltip: () => 'Field goals attempted per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      field_goals_made_per_game: {
        id: 'field_goals_made_per_game',
        numeric: true,
        getLabel: () => 'FG',
        getTooltip: () => 'Field goals made per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      interceptions_per_game: {
        id: 'interceptions_per_game',
        numeric: true,
        getLabel: () => 'INT',
        getTooltip: () => 'Interceptions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      sacks_per_game: {
        id: 'sacks_per_game',
        numeric: true,
        getLabel: () => 'Sacks',
        getTooltip: () => 'Sacks per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      fumbles_per_game: {
        id: 'fumbles_per_game',
        numeric: true,
        getLabel: () => 'Fumbles',
        getTooltip: () => 'Fumbles per game',
        sort: 'lower',
        organization_ids: [Organization.getCFBID()],
        getViews: () => ['player'],
        graphable: true,
      },
      rank_delta_combo: {
        id: 'rank_delta_combo',
        numeric: true,
        getLabel: () => 'Δ 1/7',
        getTooltip: () => 'Rank difference since last ranking (1 day / 7 days)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews.filter((v) => v !== 'transfer'),
        graphable: false,
      },
      rank_delta_one: {
        id: 'rank_delta_one',
        numeric: true,
        getLabel: () => 'Δ',
        getTooltip: () => 'Rank difference since last ranking (1 day)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews.filter((v) => v !== 'transfer'),
        graphable: true,
      },
      rank_delta_seven: {
        id: 'rank_delta_seven',
        numeric: true,
        getLabel: () => 'Δ7',
        getTooltip: () => 'Rank difference since last week ranking (7 days)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => allViews.filter((v) => v !== 'transfer'),
        graphable: true,
      },
      ap_rank: {
        id: 'ap_rank',
        numeric: true,
        getLabel: () => 'AP',
        getTooltip: () => 'Associated Press rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'matchup'],
        graphable: false,
        getDisplayValue: (row: CompareStatisticRow) => {
          return 'ap_rank' in row ? row.ap_rank : '-';
        },
        getValue: (row: CompareStatisticRow) => {
          return 'ap_rank' in row ? row.ap_rank : Infinity;
        },
        showDifference: true,
        precision: 0,
      },
      kenpom_rank: {
        id: 'kenpom_rank',
        numeric: true,
        getLabel: () => 'KP',
        getTooltip: () => 'kenpom.com rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'matchup'],
        graphable: false,
        getDisplayValue: (row: CompareStatisticRow) => {
          return 'kenpom_rank' in row ? row.kenpom_rank : '-';
        },
        getValue: (row: CompareStatisticRow) => {
          return 'kenpom_rank' in row ? row.kenpom_rank : Infinity;
        },
        showDifference: true,
        precision: 0,
      },
      srs_rank: {
        id: 'srs_rank',
        numeric: true,
        getLabel: () => 'SRS',
        getTooltip: () => 'Simple rating system rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'matchup'],
        graphable: false,
        getDisplayValue: (row: CompareStatisticRow) => {
          return 'srs_rank' in row ? row.srs_rank : '-';
        },
        getValue: (row: CompareStatisticRow) => {
          return 'srs_rank' in row ? row.srs_rank : Infinity;
        },
        showDifference: true,
        precision: 0,
      },
      net_rank: {
        id: 'net_rank',
        numeric: true,
        getLabel: () => 'NET',
        getTooltip: () => 'NET rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'matchup'],
        graphable: false,
        getDisplayValue: (row: CompareStatisticRow) => {
          return 'net_rank' in row ? row.net_rank : '-';
        },
        getValue: (row: CompareStatisticRow) => {
          return 'net_rank' in row ? row.net_rank : Infinity;
        },
        showDifference: true,
        precision: 0,
      },
      coaches_rank: {
        id: 'coaches_rank',
        numeric: true,
        getLabel: () => 'Coaches',
        getTooltip: () => 'Coaches poll rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['team', 'matchup'],
        graphable: false,
        getDisplayValue: (row: CompareStatisticRow) => {
          return 'coaches' in row ? row.coaches : '-';
        },
        getValue: (row: CompareStatisticRow) => {
          return 'coaches' in row ? row.coaches : Infinity;
        },
        showDifference: true,
        precision: 0,
      },
      committed: {
        id: 'committed',
        numeric: false,
        getLabel: () => 'Committed',
        getTooltip: () => 'Player committed',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['transfer'],
        graphable: false,
      },
      committed_team_name: {
        id: 'committed_team_name',
        numeric: false,
        getLabel: () => 'New team',
        getTooltip: () => 'New (committed) team name',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        getViews: () => ['transfer'],
        graphable: false,
      },
      position: {
        id: 'position',
        numeric: false,
        getLabel: () => 'Position',
        getTooltip: () => 'Player position',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['player', 'transfer'],
        graphable: false,
      },
      number: {
        id: 'number',
        numeric: false,
        getLabel: () => 'Number',
        getTooltip: () => 'Jersey number',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['player', 'transfer'],
        graphable: false,
      },
      height: {
        id: 'height',
        numeric: true,
        getLabel: () => 'Ht.',
        getTooltip: () => 'Player height',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['player', 'transfer'],
        graphable: false,
      },
      fatigue: {
        id: 'fatigue',
        numeric: true,
        getLabel: () => 'FA',
        getTooltip: () => 'Fatigue',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team'],
        graphable: false,
      },
      desperation: {
        id: 'desperation',
        numeric: true,
        getLabel: () => 'DES',
        getTooltip: () => 'Desperation',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team'],
        graphable: false,
      },
      over_confidence: {
        id: 'over_confidence',
        numeric: true,
        getLabel: () => 'OVC',
        getTooltip: () => 'Over confidence',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        getViews: () => ['team'],
        graphable: false,
      },
    };

    for (const key in columns) {
      if (
        !columns[key].organization_ids.includes(organization_id) ||
        !columns[key].getViews().includes(view) ||
        (graphable !== undefined && graphable !== columns[key].graphable) ||
        (disabled !== undefined && 'disabled' in columns[key] && disabled !== columns[key].disabled)
      ) {
        delete columns[key];
      }
    }

    return columns;
  }

  public static getViewableColumns = (
    {
      organization_id,
      view,
      columnView,
      customColumns,
      positions,
      career = false,
    } :
    {
      organization_id: string;
      view: string;
      columnView: string;
      customColumns: string[];
      positions: string[];
      career: boolean;
    },
  ): string[] => {
    if (columnView === 'custom') {
      return customColumns;
    }

    if (organization_id === Organization.getCBBID() || organization_id === Organization.getNBAID()) {
      if (columnView === 'composite') {
        if (view === 'team') {
          return ['rank', 'name', 'rank_delta_combo', 'record', 'conf_record', 'elo', 'adjusted_efficiency_rating', 'elo_sos', 'offensive_rating', 'defensive_rating', 'opponent_efficiency_rating', 'streak', 'conference_code'];
        }
        if (view === 'player') {
          if (career) {
            return ['rank', 'name', 'max_elo', 'efficiency_rating', 'offensive_rating', 'defensive_rating', 'player_efficiency_rating', 'minutes_per_game', 'points_per_game', 'usage_percentage', 'true_shooting_percentage'];
          }
          return ['rank', 'name', 'team_name', 'rank_delta_combo', 'elo', 'efficiency_rating', 'offensive_rating', 'defensive_rating', 'player_efficiency_rating', 'minutes_per_game', 'points_per_game', 'usage_percentage', 'true_shooting_percentage'];
        }
        if (view === 'roster' && organization_id === Organization.getCBBID()) {
          return ['rank', 'is_transfer', 'name', 'elo', 'efficiency_rating', 'offensive_rating', 'defensive_rating', 'player_efficiency_rating', 'minutes_per_game', 'points_per_game', 'usage_percentage', 'true_shooting_percentage'];
        }
        if (view === 'roster' && organization_id === Organization.getNBAID()) {
          return ['rank', 'name', 'elo', 'efficiency_rating', 'offensive_rating', 'defensive_rating', 'player_efficiency_rating', 'minutes_per_game', 'points_per_game', 'usage_percentage', 'true_shooting_percentage', 'last_game_on_team_date'];
        }
        if (view === 'conference') {
          return ['rank', 'name', 'rank_delta_combo', 'elo', 'adjusted_efficiency_rating', 'elo_sos', 'opponent_efficiency_rating', 'offensive_rating', 'defensive_rating', 'nonconfwins'];
        }
        if (view === 'transfer') {
          return ['rank', 'name', 'team_name', 'committed_team_name', 'elo', 'efficiency_rating', 'offensive_rating', 'defensive_rating', 'player_efficiency_rating', 'minutes_per_game', 'points_per_game', 'usage_percentage', 'true_shooting_percentage'];
        }
        if (view === 'coach') {
          return [
            'rank',
            'name',
            'team_name',
            'rank_delta_combo',
            'elo',
            'elo_sos',
            'games',
            'win_percentage',
            'conf_win_percentage',
            'nonconf_win_percentage',
            'home_win_percentage',
            'road_win_percentage',
            'neutral_win_percentage',
          ];
        }
      } else if (columnView === 'offense') {
        if (view === 'team') {
          return ['rank', 'name', 'offensive_rating', 'points', 'field_goal_percentage', 'two_point_field_goal_percentage', 'three_point_field_goal_percentage', 'free_throw_percentage', 'offensive_rebounds', 'assists', 'turnovers', 'possessions', 'pace'];
        }
        if (view === 'player' || view === 'transfer' || view === 'roster') {
          return ['rank', 'name', 'offensive_rating', 'points_per_game', 'field_goal_percentage', 'two_point_field_goal_percentage', 'three_point_field_goal_percentage', 'free_throw_percentage', 'offensive_rebounds_per_game', 'assists_per_game', 'turnovers_per_game', 'turnover_percentage'];
        }
        if (view === 'conference') {
          return ['rank', 'name', 'offensive_rating', 'points', 'field_goal_percentage', 'two_point_field_goal_percentage', 'three_point_field_goal_percentage', 'free_throw_percentage', 'offensive_rebounds', 'assists', 'turnovers', 'possessions', 'pace'];
        }
      } else if (columnView === 'defense') {
        if (view === 'team') {
          return ['rank', 'name', 'defensive_rating', 'defensive_rebounds', 'steals', 'blocks', 'opponent_points', 'opponent_field_goal_percentage', 'opponent_two_point_field_goal_percentage', 'opponent_three_point_field_goal_percentage', 'fouls'];
        }
        if (view === 'player' || view === 'transfer' || view === 'roster') {
          return ['rank', 'name', 'defensive_rating', 'defensive_rebounds_per_game', 'steals_per_game', 'blocks_per_game', 'fouls_per_game', 'defensive_rebound_percentage', 'steal_percentage', 'block_percentage'];
        }
        if (view === 'conference') {
          return ['rank', 'name', 'defensive_rating', 'defensive_rebounds', 'steals', 'blocks', 'opponent_points', 'opponent_field_goal_percentage', 'opponent_two_point_field_goal_percentage', 'opponent_three_point_field_goal_percentage', 'fouls'];
        }
      }
    }

    if (organization_id === Organization.getCFBID()) {
      if (columnView === 'composite') {
        if (view === 'team') {
          return ['rank', 'name', 'rank_delta_combo', 'record', 'conf_record', 'elo', 'passing_rating_college', 'yards_per_play', 'points_per_play', 'points', 'opponent_points', 'elo_sos', 'conference_code'];
        }
        if (
          (view === 'player' || view === 'roster') &&
          positions &&
          positions.includes('QB')
        ) {
          if (view === 'roster') {
            return ['rank', 'is_transfer', 'name', 'elo', 'adjusted_passing_rating', 'passing_rating_college', 'passing_attempts', 'passing_completions', 'passing_yards', 'passing_completion_percentage', 'passing_yards_per_attempt', 'passing_yards_per_completion', 'passing_touchdowns', 'passing_interceptions'];
          }
          return ['rank', 'name', 'team_name', 'rank_delta_combo', 'elo', 'adjusted_passing_rating', 'passing_rating_college', 'passing_attempts', 'passing_completions', 'passing_yards', 'passing_completion_percentage', 'passing_yards_per_attempt', 'passing_yards_per_completion', 'passing_touchdowns', 'passing_interceptions'];
        }
        if (
          (view === 'player' || view === 'roster') &&
          positions &&
          positions.includes('rushing')
        ) {
          if (view === 'roster') {
            return ['rank', 'is_transfer', 'name', 'elo', 'rushing_attempts', 'rushing_yards', 'rushing_yards_per_attempt', 'rushing_touchdowns', 'rushing_long'];
          }
          return ['rank', 'name', 'team_name', 'rank_delta_combo', 'elo', 'rushing_attempts', 'rushing_yards', 'rushing_yards_per_attempt', 'rushing_touchdowns', 'rushing_long'];
        }
        if (
          (view === 'player' || view === 'roster') &&
          positions &&
          positions.includes('receiving')
        ) {
          if (view === 'roster') {
            return ['rank', 'is_transfer', 'name', 'elo', 'receptions', 'receiving_yards', 'receiving_yards_per_reception', 'receiving_touchdowns', 'receiving_long'];
          }
          return ['rank', 'name', 'team_name', 'rank_delta_combo', 'elo', 'receptions', 'receiving_yards', 'receiving_yards_per_reception', 'receiving_touchdowns', 'receiving_long'];
        }
        if (view === 'conference') {
          return ['rank', 'name', 'rank_delta_combo', 'elo', 'passing_rating_college', 'points', 'yards_per_play', 'points_per_play'];
        }
        if (view === 'coach') {
          return [
            'rank',
            'name',
            'team_name',
            'rank_delta_combo',
            'elo',
            'elo_sos',
            'games',
            'win_percentage',
            'conf_win_percentage',
            'nonconf_win_percentage',
            'home_win_percentage',
            'road_win_percentage',
            'neutral_win_percentage',
          ];
        }
      } else if (columnView === 'offense') {
        if (view === 'team' || view === 'conference') {
          return ['rank', 'name', 'passing_rating_college', 'passing_yards_per_attempt', 'rushing_yards_per_attempt', 'passing_attempts', 'passing_completions', 'passing_yards', 'passing_completion_percentage', 'passing_yards_per_completion', 'passing_touchdowns', 'passing_interceptions', 'passing_long', 'rushing_attempts', 'rushing_yards', 'rushing_touchdowns', 'rushing_long'];
        }
      } else if (columnView === 'passing') {
        if (view === 'player') {
          return ['rank', 'name', 'adjusted_passing_rating', 'passing_rating_college', 'passing_rating_pro', 'passing_attempts_per_game', 'passing_completions_per_game', 'passing_yards_per_game', 'passing_completion_percentage', 'passing_yards_per_attempt', 'passing_yards_per_completion', 'passing_touchdowns_per_game', 'passing_interceptions_per_game', 'passing_long'];
        }
        if (view === 'roster') {
          return ['rank', 'is_transfer', 'name', 'adjusted_passing_rating', 'passing_rating_college', 'passing_rating_pro', 'passing_attempts_per_game', 'passing_completions_per_game', 'passing_yards_per_game', 'passing_completion_percentage', 'passing_yards_per_attempt', 'passing_yards_per_completion', 'passing_touchdowns_per_game', 'passing_interceptions_per_game', 'passing_long'];
        }
        if (view === 'compare') {
          return ['rank', 'name', 'team_name', 'adjusted_passing_rating', 'passing_rating_college', 'passing_rating_pro', 'passing_attempts_per_game', 'passing_completions_per_game', 'passing_yards_per_game', 'passing_completion_percentage', 'passing_yards_per_attempt', 'passing_yards_per_completion', 'passing_touchdowns_per_game', 'passing_interceptions_per_game', 'passing_long'];
        }
      } else if (columnView === 'rushing') {
        if (view === 'team' || view === 'conference') {
          return ['rank', 'name', 'rushing_attempts', 'rushing_yards', 'rushing_yards_per_attempt', 'rushing_touchdowns', 'rushing_long'];
        }

        if (view === 'player') {
          return ['rank', 'name', 'rushing_attempts_per_game', 'rushing_yards_per_game', 'rushing_yards_per_attempt', 'rushing_touchdowns_per_game', 'rushing_long'];
        }
        if (view === 'roster') {
          return ['rank', 'is_transfer', 'name', 'rushing_attempts_per_game', 'rushing_yards_per_game', 'rushing_yards_per_attempt', 'rushing_touchdowns_per_game', 'rushing_long'];
        }
        if (view === 'compare') {
          return ['rank', 'name', 'team_name', 'rushing_attempts_per_game', 'rushing_yards_per_game', 'rushing_yards_per_attempt', 'rushing_touchdowns_per_game', 'rushing_long'];
        }
      } else if (columnView === 'receiving') {
        if (view === 'team' || view === 'conference') {
          return ['rank', 'name', 'receptions', 'receiving_yards', 'receiving_yards_per_reception', 'receiving_touchdowns', 'receiving_long'];
        }

        if (view === 'player') {
          return ['rank', 'name', 'receptions_per_game', 'receiving_yards_per_game', 'receiving_yards_per_reception', 'receiving_touchdowns_per_game', 'receiving_long'];
        }

        if (view === 'roster') {
          return ['rank', 'is_transfer', 'name', 'receptions_per_game', 'receiving_yards_per_game', 'receiving_yards_per_reception', 'receiving_touchdowns_per_game', 'receiving_long'];
        }

        if (view === 'compare') {
          return ['rank', 'name', 'team_name', 'receptions_per_game', 'receiving_yards_per_game', 'receiving_yards_per_reception', 'receiving_touchdowns_per_game', 'receiving_long'];
        }
      } else if (columnView === 'defense') {
        if (view === 'team' || view === 'conference') {
          return ['rank', 'name', 'opponent_points', 'opponent_yards_per_play', 'opponent_points_per_play', 'opponent_passing_completion_percentage', 'opponent_passing_yards_per_attempt', 'opponent_rushing_yards_per_attempt'];
        }
      }
    }

    return [];
  };
}

export default TableColumns;
