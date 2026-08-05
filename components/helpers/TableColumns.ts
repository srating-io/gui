/* eslint-disable no-nested-ternary */

import { TableColumnsType } from '@esmalley/react-material-ui';
import { CompareStatisticRow } from '../generic/CompareStatistic';
import Organization from './Organization';


class TableColumns {
  public static getColumns(
    { organization_id, view, graphable, disabled }:
    { organization_id: string; view: string; graphable?: boolean; disabled?: boolean; },
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
        label: 'Rk',
        tooltip: 'srating.io Rank',
        sticky: true,
        disabled: true,
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews,
        graphable: true,
        widths: {
          default: 50,
          425: 40,
        },
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
        label: (view === 'player' || view === 'transfer' ? 'Player' : (view === 'conference' ? 'Conference' : (view === 'coach' ? 'Coach' : 'Team'))),
        tooltip: (view === 'player' || view === 'transfer' ? 'Player name' : (view === 'conference' ? 'Conference name' : (view === 'coach' ? 'Coach name' : 'Team name'))),
        sticky: true,
        disabled: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews,
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
        label: 'Game',
        tooltip: 'Game',
        sticky: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['player_boxscore'],
        graphable: false,
      },
      team_name: {
        id: 'team_name',
        numeric: false,
        label: (view === 'transfer' ? 'Prev. team' : 'Team'),
        tooltip: (view === 'transfer' ? 'Previous team name' : 'Team name'),
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['player', 'transfer', 'coach'],
        graphable: false,
        widths: {
          default: 85,
        },
      },
      is_transfer: {
        id: 'is_transfer',
        numeric: false,
        label: 'T',
        tooltip: 'Player is a transfer',
        sticky: true,
        organization_ids: [Organization.getCBBID(), Organization.getCFBID()],
        views: ['roster'],
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
        label: 'Traded',
        tooltip: 'Last game on team date before trade',
        sticky: true,
        organization_ids: [Organization.getNBAID()],
        views: ['roster'],
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
        label: 'Conf.',
        tooltip: 'Conference',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'player', 'transfer'],
        graphable: false,
        widths: {
          default: 100,
        },
      },
      elo: {
        id: 'elo',
        numeric: true,
        label: 'SR',
        tooltip: 'srating.io elo rating',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      fantasy_points: {
        id: 'fantasy_points',
        numeric: true,
        label: 'FP',
        tooltip: 'Fantasy points',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['fantasy_player_boxscore'],
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
        label: 'PTS',
        tooltip: (view === 'player' || view === 'transfer' ? 'Total points in season' : 'Average points per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews,
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
            return 'Total points in season';
          }

          return 'Average points per game';
        },
      },
      offensive_rating: {
        id: 'offensive_rating',
        numeric: true,
        label: 'ORT',
        tooltip: 'srating.io Offensive rating',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'player', 'conference', 'transfer', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      defensive_rating: {
        id: 'defensive_rating',
        numeric: true,
        label: 'DRT',
        tooltip: 'srating.io Defensive rating',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'player', 'conference', 'transfer', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      efficiency_rating: {
        id: 'efficiency_rating',
        numeric: true,
        label: (view === 'team' ? 'EM' : 'ERT'),
        tooltip: `srating.io ${(view === 'team' ? 'Efficiency margin (Offensive rating - Defensive rating)' : 'Efficiency rating')}`,
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'player', 'conference', 'transfer'],
        graphable: true,
      },
      adjusted_efficiency_rating: {
        id: 'adjusted_efficiency_rating',
        numeric: true,
        label: 'aEM',
        tooltip: ' srating.io Adjusted Efficiency margin (Offensive rating - Defensive rating) + aSOS',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      adjusted_passing_rating: {
        id: 'adjusted_passing_rating',
        numeric: true,
        label: 'aQBR',
        tooltip: 'srating.io Adjusted Quarter back rating',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      passing_rating_pro: {
        id: 'passing_rating_pro',
        numeric: true,
        label: 'QBR(p)',
        tooltip: 'srating.io Quarter back rating (pro)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'player', 'conference', 'transfer'],
        graphable: true,
      },
      passing_rating_college: {
        id: 'passing_rating_college',
        numeric: true,
        label: 'QBR(c)',
        tooltip: 'srating.io Quarter back rating (college)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
        graphable: true,
      },
      field_goal: {
        id: 'field_goal',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'FG-T' : 'FG'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total field goals made in season' : 'Average field goals per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total field goals made in season' : 'Average field goals per game');
        },
      },
      field_goal_attempts: {
        id: 'field_goal_attempts',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'FGA-T' : 'FGA'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total field goal attempts in season' : 'Average field goal attempts per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total field goal attempts in season' : 'Average field goal attempts per game');
        },
      },
      field_goal_percentage: {
        id: 'field_goal_percentage',
        numeric: true,
        label: 'FG%',
        tooltip: 'Field goal percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
        label: (view === 'player' || view === 'transfer' ? '2FG-T' : '2FG'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total two point field goals made in season' : 'Average two point field goals per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total two point field goals made in season' : 'Average two point field goals per game');
        },
      },
      two_point_field_goal_attempts: {
        id: 'two_point_field_goal_attempts',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? '2FGA-T' : '2FGA'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total two point field goal attempts in season' : 'Average two point field goal attempts per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total two point field goal attempts in season' : 'Average two point field goal attempts per game');
        },
      },
      two_point_field_goal_percentage: {
        id: 'two_point_field_goal_percentage',
        numeric: true,
        label: '2FG%',
        tooltip: 'Two point field goal percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
        label: (view === 'player' || view === 'transfer' ? '3FG-T' : '3FG'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total three point field goals made in season' : 'Average three point field goals per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total three point field goals made in season' : 'Average three point field goals per game');
        },
      },
      three_point_field_goal_attempts: {
        id: 'three_point_field_goal_attempts',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? '3FGA-T' : '3FGA'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total three field goal attempts in season' : 'Average three field goal attempts per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total three field goal attempts in season' : 'Average three field goal attempts per game');
        },
      },
      three_point_field_goal_percentage: {
        id: 'three_point_field_goal_percentage',
        numeric: true,
        label: '3FG%',
        tooltip: 'Three field goal percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
        label: (view === 'player' || view === 'transfer' ? 'FT-T' : 'FT'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total free throws made in season' : 'Average free throws per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total free throws made in season' : 'Average free throws per game');
        },
      },
      free_throw_attempts: {
        id: 'free_throw_attempts',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'FTA-T' : 'FTA'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total free throw attempts in season' : 'Average free throw attempts per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total free throw attempts in season' : 'Average free throw attempts per game');
        },
      },
      free_throw_percentage: {
        id: 'free_throw_percentage',
        numeric: true,
        label: 'FT%',
        tooltip: 'Free throw percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
        graphable: true,
        precision: 2,
        showDifference: true,
        getDisplayValue: (row: CompareStatisticRow) => {
          return `${'free_throw_percentage' in row && row.free_throw_percentage !== null ? row.free_throw_percentage : 0}%`;
        },
      },
      fg: {
        id: 'fg',
        label: 'FG',
        tooltip: 'Field goals',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player_boxscore'],
        graphable: false,
      },
      two_fg: {
        id: 'two_fg',
        label: '2P',
        tooltip: '2 point field goals',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player_boxscore'],
        graphable: false,
      },
      three_fg: {
        id: 'three_fg',
        label: '3P',
        tooltip: '3 point field goals',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player_boxscore'],
        graphable: false,
      },
      ft: {
        id: 'ft',
        label: 'FT',
        tooltip: 'Free throws',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player_boxscore'],
        precision: 0,
        showDifference: true,
        graphable: false,
      },
      offensive_rebounds: {
        id: 'offensive_rebounds',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'ORB-T' : 'ORB'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total offensive rebounds in season' : 'Average offensive rebounds per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total offensive rebounds in season' : 'Average offensive rebounds per game');
        },
      },
      defensive_rebounds: {
        id: 'defensive_rebounds',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'DRB-T' : 'DRB'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total defensive rebounds in season' : 'Average defensive rebounds per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total defensive rebounds in season' : 'Average defensive rebounds per game');
        },
      },
      total_rebounds: {
        id: 'total_rebounds',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'TRB-T' : 'TRB'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total rebounds in season' : 'Average total rebounds per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'player', 'conference', 'transfer'],
        graphable: true,
      },
      assists: {
        id: 'assists',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'AST-T' : 'AST'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total assists in season' : 'Average assists per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total assists in season' : 'Average assists per game');
        },
      },
      steals: {
        id: 'steals',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'STL-T' : 'STL'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total steals in season' : 'Average steals per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total steals in season' : 'Average steals per game');
        },
      },
      blocks: {
        id: 'blocks',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'BLK-T' : 'BLK'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total blocks in season' : 'Average blocks per game'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total blocks in season' : 'Average blocks per game');
        },
      },
      turnovers: {
        id: 'turnovers',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'TOV-T' : 'TOV'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total turnovers in season' : 'Average turnovers per game'),
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total turnovers in season' : 'Average turnovers per game');
        },
      },
      fouls: {
        id: 'fouls',
        numeric: true,
        label: (view === 'player' || view === 'transfer' ? 'PF-T' : 'PF'),
        tooltip: (view === 'player' || view === 'transfer' ? 'Total fouls in season' : 'Average fouls per game'),
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: allViews,
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
          return (view === 'player' || view === 'transfer' ? 'Total fouls in season' : 'Average fouls per game');
        },
      },
      plus_minus: {
        id: 'plus_minus',
        numeric: true,
        label: 'P/M',
        tooltip: 'Plus / minus (The change in score while the player was in game, postiive is better)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        // views: ['player', 'transfer', 'player_boxscore', 'roster'],
        views: [],
        graphable: true,
        precision: 0,
        showDifference: true,
      },
      record: {
        id: 'record',
        numeric: false,
        label: 'W/L',
        tooltip: 'Win/Loss',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'CR',
        tooltip: 'Conference Record Win/Loss',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'matchup'],
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
        label: 'A/H Rec.',
        tooltip: 'Away record / Home record',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews,
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
        label: 'G',
        tooltip: 'Games played',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews,
        graphable: true,
      },
      wins: {
        id: 'wins',
        numeric: true,
        label: 'Wins',
        tooltip: 'Wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      losses: {
        id: 'losses',
        numeric: true,
        label: 'Losses',
        tooltip: 'Losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      neutralwins: {
        id: 'neutralwins',
        numeric: true,
        label: 'Neut. wins',
        tooltip: 'Neutral wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      neutrallosses: {
        id: 'neutrallosses',
        numeric: true,
        label: 'Neut. losses',
        tooltip: 'Neutral losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      homewins: {
        id: 'homewins',
        numeric: true,
        label: 'Home wins',
        tooltip: 'Home wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      homelosses: {
        id: 'homelosses',
        numeric: true,
        label: 'Home losses',
        tooltip: 'Home losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      roadwins: {
        id: 'roadwins',
        numeric: true,
        label: 'Road wins',
        tooltip: 'Road wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      roadlosses: {
        id: 'roadlosses',
        numeric: true,
        label: 'Road losses',
        tooltip: 'Road losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach'],
        graphable: true,
        showDifference: true,
      },
      confwins: {
        id: 'confwins',
        numeric: false,
        label: 'CONF W',
        tooltip: 'Conference Total Wins',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'coach'],
        graphable: true,
        showDifference: true,
      },
      conflosses: {
        id: 'conflosses',
        numeric: false,
        label: 'CONF L',
        tooltip: 'Conference Total Losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'coach'],
        graphable: true,
        showDifference: true,
      },
      nonconfwins: {
        id: 'nonconfwins',
        numeric: false,
        label: 'NONC W',
        tooltip: 'Non-Conference Total Wins',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'coach', 'conference'],
        graphable: true,
        showDifference: true,
      },
      nonconflosses: {
        id: 'nonconflosses',
        numeric: false,
        label: 'NONC L',
        tooltip: 'Non-Conference Total Losses',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'coach', 'conference'],
        graphable: true,
        showDifference: true,
      },
      win_percentage: {
        id: 'win_percentage',
        numeric: true,
        label: 'W%',
        tooltip: 'Win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['coach'],
        graphable: true,
        showDifference: true,
      },
      conf_win_percentage: {
        id: 'conf_win_percentage',
        numeric: true,
        label: 'C%',
        tooltip: 'Conference win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['coach'],
        graphable: true,
        showDifference: true,
      },
      nonconf_win_percentage: {
        id: 'nonconf_win_percentage',
        numeric: true,
        label: 'NON C%',
        tooltip: 'Non-Conference win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['coach'],
        graphable: true,
        showDifference: true,
      },
      home_win_percentage: {
        id: 'home_win_percentage',
        numeric: true,
        label: 'H%',
        tooltip: 'Home win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['coach'],
        graphable: true,
        showDifference: true,
      },
      road_win_percentage: {
        id: 'road_win_percentage',
        numeric: true,
        label: 'R%',
        tooltip: 'Road win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['coach'],
        graphable: true,
        showDifference: true,
      },
      neutral_win_percentage: {
        id: 'neutral_win_percentage',
        numeric: true,
        label: 'N%',
        tooltip: 'Neutral win percentage',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['coach'],
        graphable: true,
        showDifference: true,
      },
      streak: {
        id: 'streak',
        numeric: true,
        label: 'Streak',
        tooltip: 'Number of wins or losses in a row (negative for loss)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'matchup'],
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
        label: 'Win margin',
        tooltip: 'Win margin',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      loss_margin: {
        id: 'loss_margin',
        numeric: true,
        label: 'Loss margin',
        tooltip: 'Loss margin',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      confwin_margin: {
        id: 'confwin_margin',
        numeric: true,
        label: 'C Win margin',
        tooltip: 'Conference Win margin',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      confloss_margin: {
        id: 'confloss_margin',
        numeric: true,
        label: 'C Loss margin',
        tooltip: 'Conference Loss margin',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      nonconfwin_margin: {
        id: 'nonconfwin_margin',
        numeric: false,
        label: 'NONC W Margin',
        tooltip: 'Non-Conference Avg. # of Win Margin',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['conference'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      nonconfloss_margin: {
        id: 'nonconfloss_margin',
        numeric: false,
        label: 'NONC L Margin',
        tooltip: 'Non-Conference Avg. # of Loss Margin',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['conference'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      possessions: {
        id: 'possessions',
        numeric: true,
        label: 'Poss.',
        tooltip: 'Average possessions per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        precision: 0,
      },
      pace: {
        id: 'pace',
        numeric: true,
        label: 'Pace',
        tooltip: 'Average pace per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      minutes_played: {
        id: 'minutes_played',
        numeric: true,
        label: 'MP',
        tooltip: (view === 'team' ? 'Average minutes played per game' : 'Total minutes played'),
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'player', 'transfer', 'player_boxscore'],
        graphable: true,
      },
      opponent_offensive_rating: {
        id: 'opponent_offensive_rating',
        numeric: true,
        label: 'oORT',
        tooltip: 'Opponent average Offensive rating',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_defensive_rating: {
        id: 'opponent_defensive_rating',
        numeric: true,
        label: 'oDRT',
        tooltip: 'Opponent average Defensive rating ',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_efficiency_rating: {
        id: 'opponent_efficiency_rating',
        numeric: true,
        label: 'aSOS',
        tooltip: 'Strength of schedule (Opponent Efficiency margin (oORT - oDRT))',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      elo_sos: {
        id: 'elo_sos',
        numeric: true,
        label: 'eSOS',
        tooltip: 'Strength of schedule (opponent elo)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'coach', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      weighted_height_average: {
        id: 'weighted_height_average',
        numeric: true,
        label: 'WHA',
        tooltip: 'Weighted height average (inches)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team'],
        graphable: true,
        showDifference: false,
        compareType: 'rank',
      },
      elite_length_z_score: {
        id: 'elite_length_z_score',
        numeric: true,
        label: 'ELZ',
        tooltip: 'Elite length z score',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team'],
        graphable: true,
        showDifference: false,
        compareType: 'rank',
      },
      height_consistency: {
        id: 'height_consistency',
        numeric: true,
        label: 'HC',
        tooltip: 'Height consistency',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team'],
        graphable: true,
        showDifference: false,
        compareType: 'rank',
      },
      opponent_field_goal: {
        id: 'opponent_field_goal',
        numeric: true,
        label: 'Opp. FG',
        tooltip: 'Opponent average field goals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. FGA',
        tooltip: 'Opponent average field goal attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. FG%',
        tooltip: 'Opponent average field goal percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. 2FG',
        tooltip: 'Opponent average two point field goals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. 2FGA',
        tooltip: 'Opponent average two point field goal attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. 2FG%',
        tooltip: 'Opponent average two point field goal percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. 3FG',
        tooltip: 'Opponent average three point field goals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. 3FGA',
        tooltip: 'Opponent average three point field goal attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. 3FG%',
        tooltip: 'Opponent average three point field goal percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. FT',
        tooltip: 'Opponent average free throws per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. FTA',
        tooltip: 'Opponent average free throw attempts per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. FT%',
        tooltip: 'Opponent average free throw percentage per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. ORB',
        tooltip: 'Opponent average offensive rebounds per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. DRB',
        tooltip: 'Opponent average defensive rebounds per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. TRB',
        tooltip: 'Opponent average total rebounds per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. AST',
        tooltip: 'Opponent average assists per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. STL',
        tooltip: 'Opponent average steals per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. BLK',
        tooltip: 'Opponent average blocks per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. TOV',
        tooltip: 'Opponent average turnovers per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. PF',
        tooltip: 'Opponent average fouls per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference', 'matchup'],
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
        label: 'Opp. PTS',
        tooltip: 'Opponent average points per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        getLabel: () => {
          return 'Opp. PTS';
        },
      },
      opponent_possessions: {
        id: 'opponent_possessions',
        numeric: true,
        label: 'Opp. Poss.',
        tooltip: 'Opponent average possessions per game',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_minutes_played: {
        id: 'opponent_minutes_played',
        numeric: true,
        label: 'Opp. MP',
        tooltip: 'Opponent average minutes played per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team'],
        graphable: true,
      },
      minutes_per_game: {
        id: 'minutes_per_game',
        numeric: true,
        label: 'MPG',
        tooltip: 'Minutes played per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      points_per_game: {
        id: 'points_per_game',
        numeric: true,
        label: 'PPG',
        tooltip: 'Points per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      field_goal_per_game: {
        id: 'field_goal_per_game',
        numeric: true,
        label: 'FG',
        tooltip: 'Average field goals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      field_goal_attempts_per_game: {
        id: 'field_goal_attempts_per_game',
        numeric: true,
        label: 'FGA',
        tooltip: 'Average field goal attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      two_point_field_goal_per_game: {
        id: 'two_point_field_goal_per_game',
        numeric: true,
        label: '2FG',
        tooltip: 'Average two point field goals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      two_point_field_goal_attempts_per_game: {
        id: 'two_point_field_goal_attempts_per_game',
        numeric: true,
        label: '2FGA',
        tooltip: 'Average two point field goal attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      three_point_field_goal_per_game: {
        id: 'three_point_field_goal_per_game',
        numeric: true,
        label: '3FG',
        tooltip: 'Average three point field goals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      three_point_field_goal_attempts_per_game: {
        id: 'three_point_field_goal_attempts_per_game',
        numeric: true,
        label: '3FGA',
        tooltip: 'Average three field goal attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      free_throws_per_game: {
        id: 'free_throws_per_game',
        numeric: true,
        label: 'FT',
        tooltip: 'Average free throws per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      free_throw_attempts_per_game: {
        id: 'free_throw_attempts_per_game',
        numeric: true,
        label: 'FTA',
        tooltip: 'Average free throw attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      offensive_rebounds_per_game: {
        id: 'offensive_rebounds_per_game',
        numeric: true,
        label: 'ORB',
        tooltip: 'Offensive rebounds per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      defensive_rebounds_per_game: {
        id: 'defensive_rebounds_per_game',
        numeric: true,
        label: 'DRB',
        tooltip: 'Defensive rebounds per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      total_rebounds_per_game: {
        id: 'total_rebounds_per_game',
        numeric: true,
        label: 'TRB',
        tooltip: 'Total rebounds per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      assists_per_game: {
        id: 'assists_per_game',
        numeric: true,
        label: 'AST',
        tooltip: 'Assists per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      steals_per_game: {
        id: 'steals_per_game',
        numeric: true,
        label: 'STL',
        tooltip: 'Steals per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      blocks_per_game: {
        id: 'blocks_per_game',
        numeric: true,
        label: 'BLK',
        tooltip: 'Blocks per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      turnovers_per_game: {
        id: 'turnovers_per_game',
        numeric: true,
        label: 'TO',
        tooltip: 'Turnovers per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      fouls_per_game: {
        id: 'fouls_per_game',
        numeric: true,
        label: 'PF',
        tooltip: 'Fouls per game',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      player_efficiency_rating: {
        id: 'player_efficiency_rating',
        numeric: true,
        label: 'PER',
        tooltip: 'srating.io Player efficiency rating metric',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      true_shooting_percentage: {
        id: 'true_shooting_percentage',
        numeric: true,
        label: 'TS%',
        tooltip: 'True shooting percentage, takes into account all field goals and free throws.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      effective_field_goal_percentage: {
        id: 'effective_field_goal_percentage',
        numeric: true,
        label: 'eFG%',
        tooltip: 'Effective field goal percentage, adjusted field goal % since 3 points greater than 2.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      offensive_rebound_percentage: {
        id: 'offensive_rebound_percentage',
        numeric: true,
        label: 'ORB%',
        tooltip: 'Offensive rebound percentage, estimate of % of offensive rebounds player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      defensive_rebound_percentage: {
        id: 'defensive_rebound_percentage',
        numeric: true,
        label: 'DRB%',
        tooltip: 'Defensive rebound percentage, estimate of % of defensive rebounds player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      total_rebound_percentage: {
        id: 'total_rebound_percentage',
        numeric: true,
        label: 'TRB%',
        tooltip: 'Total rebound percentage, estimate of % of total rebounds player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      assist_percentage: {
        id: 'assist_percentage',
        numeric: true,
        label: 'AST%',
        tooltip: 'Assist percentage, estimate of % of assists player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      steal_percentage: {
        id: 'steal_percentage',
        numeric: true,
        label: 'STL%',
        tooltip: 'Steal percentage, estimate of % of steals player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      block_percentage: {
        id: 'block_percentage',
        numeric: true,
        label: 'BLK%',
        tooltip: 'Block percentage, estimate of % of blocks player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      turnover_percentage: {
        id: 'turnover_percentage',
        numeric: true,
        label: 'TOV%',
        tooltip: 'Turnover percentage, estimate of % of turnovers player had while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      usage_percentage: {
        id: 'usage_percentage',
        numeric: true,
        label: 'USG%',
        tooltip: 'Usage percentage, estimate of % of plays ran through player while on floor.',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['player', 'transfer'],
        graphable: true,
      },
      passing_attempts: {
        id: 'passing_attempts',
        numeric: true,
        label: (view === 'player' ? 'P ATT-T' : 'P ATT'),
        alt_label: (view === 'player' ? 'ATT-T' : 'ATT'),
        tooltip: (view === 'player' ? 'Total passing attempts in a season' : 'Passing attempts per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total passing attempts in a season' : 'Passing attempts per game');
        },
      },
      passing_completions_and_attempts: {
        id: 'passing_completions_and_attempts',
        label: 'C/ATT',
        tooltip: 'Completions / Attempts',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCFBID()],
        views: boxscoreViews,
        graphable: false,
        showDifference: true,
        precision: 0,
      },
      passing_completions: {
        id: 'passing_completions',
        numeric: true,
        label: (view === 'player' ? 'P COMP-T' : 'P COMP'),
        alt_label: (view === 'player' ? 'COMP-T' : 'COMP'),
        tooltip: (view === 'player' ? 'Total passing completions in a season' : 'Passing completions per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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

          return (view === 'player' ? 'Total passing completions in a season' : 'Passing completions per game');
        },
      },
      passing_yards: {
        id: 'passing_yards',
        numeric: true,
        label: (view === 'player' ? 'P YDS-T' : 'P YDS'),
        alt_label: (view === 'player' ? 'YDS-T' : 'YDS'),
        tooltip: (view === 'player' ? 'Total passing yards in a season' : 'Passing yards per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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

          return (view === 'player' ? 'Total passing yards in a season' : 'Passing yards per game');
        },
      },
      passing_completion_percentage: {
        id: 'passing_completion_percentage',
        numeric: true,
        label: 'P COMP%',
        alt_label: 'COMP%',
        tooltip: 'Passing completions percentage',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
        label: 'P AVG',
        alt_label: 'AVG',
        tooltip: 'Passing yard per attempt',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
        label: 'P YDS per COMP',
        alt_label: 'YDS per COMP',
        tooltip: 'Passing yards per completion',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
        graphable: true,
        showDifference: true,
        precision: 0,
        getLabel: () => {
          if (boxscoreViews.includes(view) || view === 'matchup') {
            return 'YDS per COMP';
          }

          return 'P YDS per COMP';
        },
        getTooltip: () => {
          return 'Passing yard per completion';
        },
      },
      passing_touchdowns: {
        id: 'passing_touchdowns',
        numeric: true,
        label: (view === 'player' ? 'P TD-T' : 'P TD'),
        alt_label: (view === 'player' ? 'TD-T' : 'TD'),
        tooltip: (view === 'player' ? 'Total passing touchdowns in a season' : 'Passing touchdowns per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total passing touchdowns in a season' : 'Passing touchdowns per game');
        },
      },
      passing_interceptions: {
        id: 'passing_interceptions',
        numeric: true,
        label: (view === 'player' ? 'P INT-T' : 'P INT'),
        alt_label: (view === 'player' ? 'INT-T' : 'INT'),
        tooltip: (view === 'player' ? 'Total passing interceptions in a season' : 'Passing interceptions per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total passing interceptions in a season' : 'Passing interceptions per game');
        },
      },
      passing_long: {
        id: 'passing_long',
        numeric: true,
        label: 'P LONG',
        alt_label: 'LONG',
        tooltip: 'Passing long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
        label: (view === 'player' ? 'R ATT-T' : 'R ATT'),
        alt_label: (view === 'player' ? 'ATT-T' : 'ATT'),
        tooltip: (view === 'player' ? 'Total rushing attempts in a season' : 'Rushing attempts per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total rushing attempts in a season' : 'Rushing attempts per game');
        },
      },
      rushing_yards: {
        id: 'rushing_yards',
        numeric: true,
        label: (view === 'player' ? 'R YDS-T' : 'R YDS'),
        alt_label: (view === 'player' ? 'YDS-T' : 'YDS'),
        tooltip: (view === 'player' ? 'Total rushing yards in a season' : 'Rushing yards per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total rushing yards in a season' : 'Rushing yards per game');
        },
      },
      rushing_yards_per_attempt: {
        id: 'rushing_yards_per_attempt',
        numeric: true,
        label: 'R AVG',
        alt_label: 'AVG',
        tooltip: 'Rushing yards per attempt',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
        label: (view === 'player' ? 'R TD-T' : 'R TD'),
        alt_label: (view === 'player' ? 'TD-T' : 'TD'),
        tooltip: (view === 'player' ? 'Total rushing touchdowns in a season' : 'Rushing touchdowns per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total rushing touchdowns in a season' : 'Rushing touchdowns per game');
        },
      },
      rushing_long: {
        id: 'rushing_long',
        label: 'LONG',
        tooltip: 'Longest attempt',
        sort: 'higher',
        numeric: true,
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
        label: (view === 'player' ? 'REC-T' : 'REC'),
        alt_label: (view === 'player' ? 'REC-T' : 'REC'),
        tooltip: (view === 'player' ? 'Total receptions in a season' : 'Receptions per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total receptions in a season' : 'Receptions per game');
        },
      },
      receiving_yards: {
        id: 'receiving_yards',
        numeric: true,
        label: (view === 'player' ? 'REC YDS-T' : 'REC YDS'),
        alt_label: (view === 'player' ? 'YDS-T' : 'YDS'),
        tooltip: (view === 'player' ? 'Total receiving yards in a season' : 'Receiving yards per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total receiving yards in a season' : 'Receiving yards per game');
        },
      },
      receiving_yards_per_reception: {
        id: 'receiving_yards_per_reception',
        numeric: true,
        label: 'REC AVG',
        alt_label: 'AVG',
        tooltip: 'Receiving yards per reception',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
        label: (view === 'player' ? 'REC TD-T' : 'REC TD'),
        alt_label: (view === 'player' ? 'TD-T' : 'TD'),
        tooltip: (view === 'player' ? 'Total receiving touchdowns in a season' : 'Receiving touchdowns per game'),
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
          return (view === 'player' ? 'Total receiving touchdowns in a season' : 'Receiving touchdowns per game');
        },
      },
      receiving_long: {
        id: 'receiving_long',
        numeric: true,
        label: 'REC LONG',
        alt_label: 'LONG',
        tooltip: 'Receiving long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: allViews,
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
      //   label: 'Punt ret.',
      //   tooltip: 'Punt returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_yards: {
      //   id: 'punt_return_yards',
      //   numeric: true,
      //   label: 'Punt ret. yards',
      //   tooltip: 'Punt return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_yards_per_attempt: {
      //   id: 'punt_return_yards_per_attempt',
      //   numeric: true,
      //   label: 'Punt ret. yards per att.',
      //   tooltip: 'Punt return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_touchdowns: {
      //   id: 'punt_return_touchdowns',
      //   numeric: true,
      //   label: 'Punt ret. TD',
      //   tooltip: 'Punt return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_return_long: {
      //   id: 'punt_return_long',
      //   numeric: true,
      //   label: 'Punt ret. long',
      //   tooltip: 'Punt return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_returns: {
      //   id: 'kick_returns',
      //   numeric: true,
      //   label: 'Kick ret.',
      //   tooltip: 'Kick returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_yards: {
      //   id: 'kick_return_yards',
      //   numeric: true,
      //   label: 'Kick ret. yards',
      //   tooltip: 'Kick return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_yards_per_attempt: {
      //   id: 'kick_return_yards_per_attempt',
      //   numeric: true,
      //   label: 'Kick ret. yards per att.',
      //   tooltip: 'Kick return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_touchdowns: {
      //   id: 'kick_return_touchdowns',
      //   numeric: true,
      //   label: 'Kick ret. TD',
      //   tooltip: 'Kick return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // kick_return_long: {
      //   id: 'kick_return_long',
      //   numeric: true,
      //   label: 'Kick ret. long',
      //   tooltip: 'Kick return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punts: {
      //   id: 'punts',
      //   numeric: true,
      //   label: 'Punts',
      //   tooltip: 'Punts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_yards: {
      //   id: 'punt_yards',
      //   numeric: true,
      //   label: 'Punt yards',
      //   tooltip: 'Punt yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_average: {
      //   id: 'punt_average',
      //   numeric: true,
      //   label: 'Punt avg.',
      //   tooltip: 'Punt average',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // punt_long: {
      //   id: 'punt_long',
      //   numeric: true,
      //   label: 'Punt long',
      //   tooltip: 'Punt long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goals_attempted: {
      //   id: 'field_goals_attempted',
      //   numeric: true,
      //   label: 'FG att.',
      //   tooltip: 'Field goals attempted',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goals_made: {
      //   id: 'field_goals_made',
      //   numeric: true,
      //   label: 'FGs',
      //   tooltip: 'Field goals made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goal_percentage: {
      //   id: 'field_goal_percentage',
      //   numeric: true,
      //   label: 'FG%',
      //   tooltip: 'Field goal percentage',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // field_goals_longest_made: {
      //   id: 'field_goals_longest_made',
      //   numeric: true,
      //   label: 'FG long',
      //   tooltip: 'Field goal longest made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // extra_points_attempted: {
      //   id: 'extra_points_attempted',
      //   numeric: true,
      //   label: '2pt att.',
      //   tooltip: '2pt conversion attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // extra_points_made: {
      //   id: 'extra_points_made',
      //   numeric: true,
      //   label: '2pt con.',
      //   tooltip: '2pt conversions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // interceptions: {
      //   id: 'interceptions',
      //   numeric: true,
      //   label: 'Int.',
      //   tooltip: 'Interceptions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // interception_return_yards: {
      //   id: 'interception_return_yards',
      //   numeric: true,
      //   label: 'Int. ret. yards',
      //   tooltip: 'Interceptions return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // interception_return_touchdowns: {
      //   id: 'interception_return_touchdowns',
      //   numeric: true,
      //   label: 'Int. ret. TD',
      //   tooltip: 'Interceptions return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // solo_tackles: {
      //   id: 'solo_tackles',
      //   numeric: true,
      //   label: 'Solo tackle',
      //   tooltip: 'Solo tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // assisted_tackles: {
      //   id: 'assisted_tackles',
      //   numeric: true,
      //   label: 'Ast. tackle',
      //   tooltip: 'Assisted tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // tackles_for_loss: {
      //   id: 'tackles_for_loss',
      //   numeric: true,
      //   label: 'Tackle for loss',
      //   tooltip: 'Tackles for loss',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // sacks: {
      //   id: 'sacks',
      //   numeric: true,
      //   label: 'Sacks',
      //   tooltip: 'Sacks',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // passes_defended: {
      //   id: 'passes_defended',
      //   numeric: true,
      //   label: 'Pass defended',
      //   tooltip: 'Passes defended',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumbles_recovered: {
      //   id: 'fumbles_recovered',
      //   numeric: true,
      //   label: 'Fumble rec.',
      //   tooltip: 'Fumbles recovered',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumble_return_touchdowns: {
      //   id: 'fumble_return_touchdowns',
      //   numeric: true,
      //   label: 'Fumble ret. TD',
      //   tooltip: 'Fumbles returned to touchdown',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // quarterback_hurries: {
      //   id: 'quarterback_hurries',
      //   numeric: true,
      //   label: 'QB hurry',
      //   tooltip: 'QB hurries',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumbles: {
      //   id: 'fumbles',
      //   numeric: true,
      //   label: 'Fumbles',
      //   tooltip: 'Fumbles',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      // fumbles_lost: {
      //   id: 'fumbles_lost',
      //   numeric: true,
      //   label: 'Fumbles lost',
      //   tooltip: 'Fumbles lost',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'player', 'conference', 'transfer'],
      //   graphable: true,
      // },
      yards_per_play: {
        id: 'yards_per_play',
        numeric: true,
        label: 'YPP',
        tooltip: 'Yards per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      points_per_play: {
        id: 'points_per_play',
        numeric: true,
        label: 'PPP',
        tooltip: 'Points per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
      },
      // successful_pass_plays: {
      //   id: 'successful_pass_plays',
      //   numeric: true,
      //   label: 'SPP',
      //   tooltip: 'Successful pass plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // successful_rush_plays: {
      //   id: 'successful_rush_plays',
      //   numeric: true,
      //   label: 'SRP',
      //   tooltip: 'Successful rush plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // offensive_dvoa: {
      //   id: 'offensive_dvoa',
      //   numeric: true,
      //   label: 'O-DVOA',
      //   tooltip: 'offensive_dvoa', // todo
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // defensive_dvoa: {
      //   id: 'defensive_dvoa',
      //   numeric: true,
      //   label: 'D-DVOA',
      //   tooltip: 'defensive_dvoa', // todo
      //   sort: 'higher', // todo
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // first_downs: {
      //   id: 'first_downs',
      //   numeric: true,
      //   label: '1st downs',
      //   tooltip: '1st downs',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // third_down_conversions: {
      //   id: 'third_down_conversions',
      //   numeric: true,
      //   label: '3rd down conv.',
      //   tooltip: '3rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // third_down_attempts: {
      //   id: 'third_down_attempts',
      //   numeric: true,
      //   label: '3rd down att.',
      //   tooltip: '3rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // fourth_down_conversions: {
      //   id: 'fourth_down_conversions',
      //   numeric: true,
      //   label: '4rd down conv.',
      //   tooltip: '4rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // fourth_down_attempts: {
      //   id: 'fourth_down_attempts',
      //   numeric: true,
      //   label: '4rd down att.',
      //   tooltip: '4rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // time_of_possession_seconds: {
      //   id: 'time_of_possession_seconds',
      //   numeric: true,
      //   label: 'ToP',
      //   tooltip: 'Time of possession in seconds',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      opponent_yards_per_play: {
        id: 'opponent_yards_per_play',
        numeric: true,
        label: 'Opp. YPP',
        tooltip: 'Opponent Yards per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_points_per_play: {
        id: 'opponent_points_per_play',
        numeric: true,
        label: 'Opp. PPP',
        tooltip: 'Opponent Points per play',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      // opponent_successful_pass_plays: {
      //   id: 'opponent_successful_pass_plays',
      //   numeric: true,
      //   label: 'Opp. SPP',
      //   tooltip: 'Opponent Successful pass plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_successful_rush_plays: {
      //   id: 'opponent_successful_rush_plays',
      //   numeric: true,
      //   label: 'Opp. SRP',
      //   tooltip: 'Opponent Successful rush plays',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_offensive_dvoa: {
      //   id: 'opponent_offensive_dvoa',
      //   numeric: true,
      //   label: 'Opp. O-DVOA',
      //   tooltip: 'Opponent offensive_dvoa', // todo
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_defensive_dvoa: {
      //   id: 'opponent_defensive_dvoa',
      //   numeric: true,
      //   label: 'Opp. D-DVOA',
      //   tooltip: 'Opponent defensive_dvoa', // todo
      //   sort: 'higher', // todo
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_first_downs: {
      //   id: 'opponent_first_downs',
      //   numeric: true,
      //   label: 'Opp. 1st downs',
      //   tooltip: 'Opponent 1st downs',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_third_down_conversions: {
      //   id: 'opponent_third_down_conversions',
      //   numeric: true,
      //   label: 'Opp. 3rd down conv.',
      //   tooltip: 'Opponent 3rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_third_down_attempts: {
      //   id: 'opponent_third_down_attempts',
      //   numeric: true,
      //   label: 'Opp. 3rd down att.',
      //   tooltip: 'Opponent 3rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fourth_down_conversions: {
      //   id: 'opponent_fourth_down_conversions',
      //   numeric: true,
      //   label: 'Opp. 4rd down conv.',
      //   tooltip: 'Opponent 4rd down conversion',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fourth_down_attempts: {
      //   id: 'opponent_fourth_down_attempts',
      //   numeric: true,
      //   label: 'Opp. 4rd down att.',
      //   tooltip: 'Opponent 4rd down attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_time_of_possession_seconds: {
      //   id: 'opponent_time_of_possession_seconds',
      //   numeric: true,
      //   label: 'Opp. ToP',
      //   tooltip: 'Opponent Time of possession in seconds',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      opponent_passing_attempts: {
        id: 'opponent_passing_attempts',
        numeric: true,
        label: 'Opp. Pass att.',
        tooltip: 'Opponent Passing attempts',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_completions: {
        id: 'opponent_passing_completions',
        numeric: true,
        label: 'Opp. Pass comp.',
        tooltip: 'Opponent Passing completions',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_yards: {
        id: 'opponent_passing_yards',
        numeric: true,
        label: 'Opp. Pass yards',
        tooltip: 'Opponent Passing yards',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_completion_percentage: {
        id: 'opponent_passing_completion_percentage',
        numeric: true,
        label: 'Opp. Pass comp. %',
        tooltip: 'Opponent Passing completions percentage',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_yards_per_attempt: {
        id: 'opponent_passing_yards_per_attempt',
        numeric: true,
        label: 'Opp. Pass yards per att.',
        tooltip: 'Opponent Passing yard per attempt',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_yards_per_completion: {
        id: 'opponent_passing_yards_per_completion',
        numeric: true,
        label: 'Opp. Pass yards per comp.',
        tooltip: 'Opponent Passing yards per completion',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_touchdowns: {
        id: 'opponent_passing_touchdowns',
        numeric: true,
        label: 'Opp. Pass TD',
        tooltip: 'Opponent Passing touchdowns',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_interceptions: {
        id: 'opponent_passing_interceptions',
        numeric: true,
        label: 'Opp. Pass int.',
        tooltip: 'Opponent Passing interceptions',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_rating_pro: {
        id: 'opponent_passing_rating_pro',
        numeric: true,
        label: 'Opp. QBR(p)',
        tooltip: 'Opponent Quarter back rating (pro)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_passing_rating_college: {
        id: 'opponent_passing_rating_college',
        numeric: true,
        label: 'Opp. QBR(c)',
        tooltip: 'Opponent Quarter back rating (college)',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference', 'matchup'],
        graphable: true,
        showDifference: true,
        compareType: 'rank',
      },
      opponent_passing_long: {
        id: 'opponent_passing_long',
        numeric: true,
        label: 'Opp. Pass long',
        tooltip: 'Opponent Passing long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_attempts: {
        id: 'opponent_rushing_attempts',
        numeric: true,
        label: 'Opp. Rush att.',
        tooltip: 'Opponent Rushing attempts',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_yards: {
        id: 'opponent_rushing_yards',
        numeric: true,
        label: 'Opp. Rush yards',
        tooltip: 'Opponent Rushing yards',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_yards_per_attempt: {
        id: 'opponent_rushing_yards_per_attempt',
        numeric: true,
        label: 'Opp. Rush yards per att.',
        tooltip: 'Opponent Rushing yards per attempt',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_touchdowns: {
        id: 'opponent_rushing_touchdowns',
        numeric: true,
        label: 'Opp. Rush TD',
        tooltip: 'Opponent Rushing touchdowns',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_rushing_long: {
        id: 'opponent_rushing_long',
        numeric: true,
        label: 'Opp. Rush long',
        tooltip: 'Opponent Rushing long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_receptions: {
        id: 'opponent_receptions',
        numeric: true,
        label: 'Opp. Receptions',
        tooltip: 'Opponent # of receptions',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_yards: {
        id: 'opponent_receiving_yards',
        numeric: true,
        label: 'Opp. Rec. yards',
        tooltip: 'Opponent Receiving yards',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_yards_per_reception: {
        id: 'opponent_receiving_yards_per_reception',
        numeric: true,
        label: 'Opp. Rec. yards per recep.',
        tooltip: 'Opponent Receiving yards per reception',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_touchdowns: {
        id: 'opponent_receiving_touchdowns',
        numeric: true,
        label: 'Opp. Rec. TD',
        tooltip: 'Opponent Receiving touchdowns',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      opponent_receiving_long: {
        id: 'opponent_receiving_long',
        numeric: true,
        label: 'Opp. Rec. long',
        tooltip: 'Opponent Receiving long',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['team', 'conference'],
        graphable: true,
      },
      // opponent_punt_returns: {
      //   id: 'opponent_punt_returns',
      //   numeric: true,
      //   label: 'Opp. Punt ret.',
      //   tooltip: 'Opponent Punt returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_yards: {
      //   id: 'opponent_punt_return_yards',
      //   numeric: true,
      //   label: 'Opp. Punt ret. yards',
      //   tooltip: 'Opponent Punt return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_yards_per_attempt: {
      //   id: 'opponent_punt_return_yards_per_attempt',
      //   numeric: true,
      //   label: 'Opp. Punt ret. yards per att.',
      //   tooltip: 'Opponent Punt return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_touchdowns: {
      //   id: 'opponent_punt_return_touchdowns',
      //   numeric: true,
      //   label: 'Opp. Punt ret. TD',
      //   tooltip: 'Opponent Punt return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_return_long: {
      //   id: 'opponent_punt_return_long',
      //   numeric: true,
      //   label: 'Opp. Punt ret. long',
      //   tooltip: 'Opponent Punt return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_returns: {
      //   id: 'opponent_kick_returns',
      //   numeric: true,
      //   label: 'Opp. Kick ret.',
      //   tooltip: 'Opponent Kick returns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_yards: {
      //   id: 'opponent_kick_return_yards',
      //   numeric: true,
      //   label: 'Opp. Kick ret. yards',
      //   tooltip: 'Opponent Kick return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_yards_per_attempt: {
      //   id: 'opponent_kick_return_yards_per_attempt',
      //   numeric: true,
      //   label: 'Opp. Kick ret. yards per att.',
      //   tooltip: 'Opponent Kick return yards per attempt',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_touchdowns: {
      //   id: 'opponent_kick_return_touchdowns',
      //   numeric: true,
      //   label: 'Opp. Kick ret. TD',
      //   tooltip: 'Opponent Kick return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_kick_return_long: {
      //   id: 'opponent_kick_return_long',
      //   numeric: true,
      //   label: 'Opp. Kick ret. long',
      //   tooltip: 'Opponent Kick return long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punts: {
      //   id: 'opponent_punts',
      //   numeric: true,
      //   label: 'Opp. Punts',
      //   tooltip: 'Opponent Punts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_yards: {
      //   id: 'opponent_punt_yards',
      //   numeric: true,
      //   label: 'Opp. Punt yards',
      //   tooltip: 'Opponent Punt yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_average: {
      //   id: 'opponent_punt_average',
      //   numeric: true,
      //   label: 'Opp. Punt avg.',
      //   tooltip: 'Opponent Punt average',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_punt_long: {
      //   id: 'opponent_punt_long',
      //   numeric: true,
      //   label: 'Opp. Punt long',
      //   tooltip: 'Opponent Punt long',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goals_attempted: {
      //   id: 'opponent_field_goals_attempted',
      //   numeric: true,
      //   label: 'Opp. FG att.',
      //   tooltip: 'Opponent Field goals attempted',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goals_made: {
      //   id: 'opponent_field_goals_made',
      //   numeric: true,
      //   label: 'Opp. FGs',
      //   tooltip: 'Opponent Field goals made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goal_percentage: {
      //   id: 'opponent_field_goal_percentage',
      //   numeric: true,
      //   label: 'Opp. FG%',
      //   tooltip: 'Opponent Field goal percentage',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_field_goals_longest_made: {
      //   id: 'opponent_field_goals_longest_made',
      //   numeric: true,
      //   label: 'Opp. FG long',
      //   tooltip: 'Opponent Field goal longest made',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_extra_points_attempted: {
      //   id: 'opponent_extra_points_attempted',
      //   numeric: true,
      //   label: 'Opp. 2pt att.',
      //   tooltip: 'Opponent 2pt conversion attempts',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_extra_points_made: {
      //   id: 'opponent_extra_points_made',
      //   numeric: true,
      //   label: 'Opp. 2pt con.',
      //   tooltip: 'Opponent 2pt conversions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_interceptions: {
      //   id: 'opponent_interceptions',
      //   numeric: true,
      //   label: 'Opp. Int.',
      //   tooltip: 'Opponent Interceptions',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_interception_return_yards: {
      //   id: 'opponent_interception_return_yards',
      //   numeric: true,
      //   label: 'Opp. Int. ret. yards',
      //   tooltip: 'Opponent Interceptions return yards',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_interception_return_touchdowns: {
      //   id: 'opponent_interception_return_touchdowns',
      //   numeric: true,
      //   label: 'Opp. Int. ret. TD',
      //   tooltip: 'Opponent Interceptions return touchdowns',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_solo_tackles: {
      //   id: 'opponent_solo_tackles',
      //   numeric: true,
      //   label: 'Opp. Solo tackle',
      //   tooltip: 'Opponent Solo tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_assisted_tackles: {
      //   id: 'opponent_assisted_tackles',
      //   numeric: true,
      //   label: 'Opp. Ast. tackle',
      //   tooltip: 'Opponent Assisted tackles',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_tackles_for_loss: {
      //   id: 'opponent_tackles_for_loss',
      //   numeric: true,
      //   label: 'Opp. Tackle for loss',
      //   tooltip: 'Opponent Tackles for loss',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_sacks: {
      //   id: 'opponent_sacks',
      //   numeric: true,
      //   label: 'Opp. Sacks',
      //   tooltip: 'Opponent Sacks',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_passes_defended: {
      //   id: 'opponent_passes_defended',
      //   numeric: true,
      //   label: 'Opp. Pass defended',
      //   tooltip: 'Opponent Passes defended',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumbles_recovered: {
      //   id: 'opponent_fumbles_recovered',
      //   numeric: true,
      //   label: 'Opp. Fumble rec.',
      //   tooltip: 'Opponent Fumbles recovered',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumble_return_touchdowns: {
      //   id: 'opponent_fumble_return_touchdowns',
      //   numeric: true,
      //   label: 'Opp. Fumble ret. TD',
      //   tooltip: 'Opponent Fumbles returned to touchdown',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_quarterback_hurries: {
      //   id: 'opponent_quarterback_hurries',
      //   numeric: true,
      //   label: 'Opp. QB hurry',
      //   tooltip: 'Opponent QB hurries',
      //   sort: 'higher',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumbles: {
      //   id: 'opponent_fumbles',
      //   numeric: true,
      //   label: 'Opp. Fumbles',
      //   tooltip: 'Opponent Fumbles',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      // opponent_fumbles_lost: {
      //   id: 'opponent_fumbles_lost',
      //   numeric: true,
      //   label: 'Opp. Fumbles lost',
      //   tooltip: 'Opponent Fumbles lost',
      //   sort: 'lower',
      //   organization_ids: [Organization.getCFBID()],
      //   views: ['team', 'conference'],
      //   graphable: true,
      // },
      passing_attempts_per_game: {
        id: 'passing_attempts_per_game',
        numeric: true,
        label: 'Pass att.',
        alt_label: 'ATT',
        tooltip: 'Passing attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      passing_completions_per_game: {
        id: 'passing_completions_per_game',
        numeric: true,
        label: 'Pass comp.',
        alt_label: 'COMP',
        tooltip: 'Passing completions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      passing_yards_per_game: {
        id: 'passing_yards_per_game',
        numeric: true,
        label: 'Pass yards',
        alt_label: 'YDS',
        tooltip: 'Passing yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      passing_touchdowns_per_game: {
        id: 'passing_touchdowns_per_game',
        numeric: true,
        label: 'Pass TD',
        alt_label: 'TD',
        tooltip: 'Passing touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      passing_interceptions_per_game: {
        id: 'passing_interceptions_per_game',
        numeric: true,
        label: 'Pass int.',
        alt_label: 'INT',
        tooltip: 'Passing interceptions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      rushing_attempts_per_game: {
        id: 'rushing_attempts_per_game',
        numeric: true,
        label: 'Rush att',
        alt_label: 'ATT',
        tooltip: 'Rushing attempts per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      rushing_yards_per_game: {
        id: 'rushing_yards_per_game',
        numeric: true,
        label: 'Rush yards',
        alt_label: 'YDS',
        tooltip: 'Rushing yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      rushing_touchdowns_per_game: {
        id: 'rushing_touchdowns_per_game',
        numeric: true,
        label: 'Rush TD',
        alt_label: 'TD',
        tooltip: 'Rushing touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      receptions_per_game: {
        id: 'receptions_per_game',
        numeric: true,
        label: 'Receptions',
        alt_label: 'REC',
        tooltip: '# of receptions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      receiving_yards_per_game: {
        id: 'receiving_yards_per_game',
        numeric: true,
        label: 'Rec. yards',
        alt_label: 'YDS',
        tooltip: 'Receiving yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      receiving_touchdowns_per_game: {
        id: 'receiving_touchdowns_per_game',
        numeric: true,
        label: 'Rec. TD',
        alt_label: 'TD',
        tooltip: 'Receiving touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      punt_returns_per_game: {
        id: 'punt_returns_per_game',
        numeric: true,
        label: 'Punt ret.',
        alt_label: 'RET',
        tooltip: 'Punt returns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      punt_return_yards_per_game: {
        id: 'punt_return_yards_per_game',
        numeric: true,
        label: 'Punt ret. yards',
        alt_label: 'YDS',
        tooltip: 'Punt return yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      punt_return_touchdowns_per_game: {
        id: 'punt_return_touchdowns_per_game',
        numeric: true,
        label: 'Punt ret. TD',
        alt_label: 'TD',
        tooltip: 'Punt return touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      kick_returns_per_game: {
        id: 'kick_returns_per_game',
        numeric: true,
        label: 'Kick ret.',
        alt_label: 'RET',
        tooltip: 'Kick returns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      kick_return_yards_per_game: {
        id: 'kick_return_yards_per_game',
        numeric: true,
        label: 'Kick ret. yards',
        alt_label: 'YDS',
        tooltip: 'Kick return yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      kick_return_touchdowns_per_game: {
        id: 'kick_return_touchdowns_per_game',
        numeric: true,
        label: 'Kick ret. TD',
        alt_label: 'TD',
        tooltip: 'Kick return touchdowns per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      punts_per_game: {
        id: 'punts_per_game',
        numeric: true,
        label: 'Punts',
        tooltip: 'Punts per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      punt_yards_per_game: {
        id: 'punt_yards_per_game',
        numeric: true,
        label: 'Punt yards',
        alt_label: 'YDS',
        tooltip: 'Punt yards per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      field_goals_attempted_per_game: {
        id: 'field_goals_attempted_per_game',
        numeric: true,
        label: 'FGA',
        tooltip: 'Field goals attempted per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      field_goals_made_per_game: {
        id: 'field_goals_made_per_game',
        numeric: true,
        label: 'FG',
        tooltip: 'Field goals made per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      interceptions_per_game: {
        id: 'interceptions_per_game',
        numeric: true,
        label: 'INT',
        tooltip: 'Interceptions per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      sacks_per_game: {
        id: 'sacks_per_game',
        numeric: true,
        label: 'Sacks',
        tooltip: 'Sacks per game',
        sort: 'higher',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      fumbles_per_game: {
        id: 'fumbles_per_game',
        numeric: true,
        label: 'Fumbles',
        tooltip: 'Fumbles per game',
        sort: 'lower',
        organization_ids: [Organization.getCFBID()],
        views: ['player'],
        graphable: true,
      },
      rank_delta_combo: {
        id: 'rank_delta_combo',
        numeric: true,
        label: 'Δ 1/7',
        tooltip: 'Rank difference since last ranking (1 day / 7 days)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews.filter((v) => v !== 'transfer'),
        graphable: false,
      },
      rank_delta_one: {
        id: 'rank_delta_one',
        numeric: true,
        label: 'Δ',
        tooltip: 'Rank difference since last ranking (1 day)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews.filter((v) => v !== 'transfer'),
        graphable: true,
      },
      rank_delta_seven: {
        id: 'rank_delta_seven',
        numeric: true,
        label: 'Δ7',
        tooltip: 'Rank difference since last week ranking (7 days)',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: allViews.filter((v) => v !== 'transfer'),
        graphable: true,
      },
      ap_rank: {
        id: 'ap_rank',
        numeric: true,
        label: 'AP',
        tooltip: 'Associated Press rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'matchup'],
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
        label: 'KP',
        tooltip: 'kenpom.com rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'matchup'],
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
        label: 'SRS',
        tooltip: 'Simple rating system rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'matchup'],
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
        label: 'NET',
        tooltip: 'NET rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'matchup'],
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
        label: 'Coaches',
        tooltip: 'Coaches poll rank',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['team', 'matchup'],
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
        label: 'Committed',
        tooltip: 'Player committed',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['transfer'],
        graphable: false,
      },
      committed_team_name: {
        id: 'committed_team_name',
        numeric: false,
        label: 'New team',
        tooltip: 'New (committed) team name',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID()],
        views: ['transfer'],
        graphable: false,
      },
      position: {
        id: 'position',
        numeric: false,
        label: 'Position',
        tooltip: 'Player position',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['player', 'transfer'],
        graphable: false,
      },
      number: {
        id: 'number',
        numeric: false,
        label: 'Number',
        tooltip: 'Jersey number',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['player', 'transfer'],
        graphable: false,
      },
      height: {
        id: 'height',
        numeric: true,
        label: 'Ht.',
        tooltip: 'Player height',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['player', 'transfer'],
        graphable: false,
      },
      fatigue: {
        id: 'fatigue',
        numeric: true,
        label: 'FA',
        tooltip: 'Fatigue',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team'],
        graphable: false,
      },
      desperation: {
        id: 'desperation',
        numeric: true,
        label: 'DES',
        tooltip: 'Desperation',
        sort: 'higher',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team'],
        graphable: false,
      },
      over_confidence: {
        id: 'over_confidence',
        numeric: true,
        label: 'OVC',
        tooltip: 'Over confidence',
        sort: 'lower',
        organization_ids: [Organization.getCBBID(), Organization.getNBAID(), Organization.getCFBID()],
        views: ['team'],
        graphable: false,
      },
    };

    for (const key in columns) {
      if (
        !columns[key].organization_ids.includes(organization_id) ||
        !columns[key].views.includes(view) ||
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
    } :
    {
      organization_id: string;
      view: string;
      columnView: string;
      customColumns: string[];
      positions: string[];
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
