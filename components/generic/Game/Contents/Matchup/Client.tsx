'use client';

import CompareStatistic, { CompareStatisticRow } from '@/components/generic/CompareStatistic';
import { useAppSelector } from '@/redux/hooks';
import PredictionLine from './PredictionLine';
import Organization from '@/components/helpers/Organization';
import React, { Profiler } from 'react';
import TableColumns from '@/components/helpers/TableColumns';
import { Objector } from '@esmalley/ts-utils';
import { Skeleton, Typography } from '@esmalley/react-material-ui';


/**
* Get the loading skeletons for the picks stats
*/
export const getSkeleton = (numberOfSkeletons: number): React.JSX.Element[] => {
  const skeletons: React.JSX.Element[] = [];

  for (let i = 0; i < numberOfSkeletons; i++) {
    skeletons.push(<Skeleton key = {i} animation="wave" style = {{
      width: '100%', maxWidth, height: 15, margin: '10px auto',
    }} />);
  }

  return skeletons;
};

export const maxWidth = 600;

export const getSections = () => {
  // Ones up here are shared by both CBB and CFB (for now)
  const overviewKeys = [
    'record',
    'conf_record',
    'streak',
    'away_record_home_record',
  ];

  const marginKeys = [
    'win_margin',
    'loss_margin',
    'confwin_margin',
    'confloss_margin',
  ];

  if (Organization.isCFB()) {
    return [
      {
        name: 'Record',
        keys: overviewKeys,
      },
      {
        name: 'Rank',
        keys: [
          'rank',
          'elo',
        ],
      },
      {
        name: 'Efficiency',
        keys: [
          'passing_rating_college',
          'yards_per_play',
          'points_per_play',
          'points',
          'opponent_points',
          // 'defensive_dvoa',
          // 'offensive_dvoa',
        ],
      },
      {
        name: 'Passing',
        keys: [
          'passing_completions',
          'passing_attempts',
          'passing_yards',
          'passing_completion_percentage',
          'passing_yards_per_attempt',
          'passing_yards_per_completion',
          'passing_touchdowns',
          'passing_interceptions',
          'passing_long',
        ],
      },
      {
        name: 'Rushing',
        keys: [
          'rushing_attempts',
          'rushing_yards',
          'rushing_yards_per_attempt',
          'rushing_touchdowns',
          'rushing_long',
        ],
      },
      /*
      {
        name: 'Receiving',
        keys: [
          'receptions',
          'receiving_yards',
          'receiving_yards_per_reception',
          'receiving_touchdowns',
          'receiving_long',
        ],
      },
      */
      {
        name: 'Margin',
        keys: marginKeys,
      },
      // {
      //   name: 'Defensive',
      //   keys: [
      //     {
      //       name: 'Opp. PTS',
      //       title: 'Opponent points',
      //       away: awayStats.opponent_points,
      //       home: homeStats.opponent_points,
      //       awayCompareValue: awayStats.opponent_points,
      //       homeCompareValue: homeStats.opponent_points,
      //       awayRank: awayStats.opponent_points_rank,
      //       homeRank: homeStats.opponent_points_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. YPP',
      //       title: 'Opponent Yards per play',
      //       away: awayStats.opponent_yards_per_play,
      //       home: homeStats.opponent_yards_per_play,
      //       awayCompareValue: awayStats.opponent_yards_per_play,
      //       homeCompareValue: homeStats.opponent_yards_per_play,
      //       awayRank: awayStats.opponent_yards_per_play_rank,
      //       homeRank: homeStats.opponent_yards_per_play_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. PPP',
      //       title: 'Opponent Points per play',
      //       away: awayStats.opponent_points_per_play,
      //       home: homeStats.opponent_points_per_play,
      //       awayCompareValue: awayStats.opponent_points_per_play,
      //       homeCompareValue: homeStats.opponent_points_per_play,
      //       awayRank: awayStats.opponent_points_per_play_rank,
      //       homeRank: homeStats.opponent_points_per_play_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass att.',
      //       title: 'Opponent Passing attempts',
      //       away: awayStats.opponent_passing_attempts,
      //       home: homeStats.opponent_passing_attempts,
      //       awayCompareValue: awayStats.opponent_passing_attempts,
      //       homeCompareValue: homeStats.opponent_passing_attempts,
      //       awayRank: awayStats.opponent_passing_attempts_rank,
      //       homeRank: homeStats.opponent_passing_attempts_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass comp.',
      //       title: 'Opponent Passing completions',
      //       away: awayStats.opponent_passing_completions,
      //       home: homeStats.opponent_passing_completions,
      //       awayCompareValue: awayStats.opponent_passing_completions,
      //       homeCompareValue: homeStats.opponent_passing_completions,
      //       awayRank: awayStats.opponent_passing_completions_rank,
      //       homeRank: homeStats.opponent_passing_completions_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass yds',
      //       title: 'Opponent Passing yards',
      //       away: awayStats.opponent_passing_yards,
      //       home: homeStats.opponent_passing_yards,
      //       awayCompareValue: awayStats.opponent_passing_yards,
      //       homeCompareValue: homeStats.opponent_passing_yards,
      //       awayRank: awayStats.opponent_passing_yards_rank,
      //       homeRank: homeStats.opponent_passing_yards_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass comp. %',
      //       title: 'Opponent Passing completions percentage',
      //       away: awayStats.opponent_passing_completion_percentage,
      //       home: homeStats.opponent_passing_completion_percentage,
      //       awayCompareValue: awayStats.opponent_passing_completion_percentage,
      //       homeCompareValue: homeStats.opponent_passing_completion_percentage,
      //       awayRank: awayStats.opponent_passing_completion_percentage_rank,
      //       homeRank: homeStats.opponent_passing_completion_percentage_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass yds per att.',
      //       title: 'Opponent Passing yard per attempt',
      //       away: awayStats.opponent_passing_yards_per_attempt,
      //       home: homeStats.opponent_passing_yards_per_attempt,
      //       awayCompareValue: awayStats.opponent_passing_yards_per_attempt,
      //       homeCompareValue: homeStats.opponent_passing_yards_per_attempt,
      //       awayRank: awayStats.opponent_passing_yards_per_attempt_rank,
      //       homeRank: homeStats.opponent_passing_yards_per_attempt_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass yds per comp.',
      //       title: 'Opponent Passing yards per completion',
      //       away: awayStats.opponent_passing_yards_per_completion,
      //       home: homeStats.opponent_passing_yards_per_completion,
      //       awayCompareValue: awayStats.opponent_passing_yards_per_completion,
      //       homeCompareValue: homeStats.opponent_passing_yards_per_completion,
      //       awayRank: awayStats.opponent_passing_yards_per_completion_rank,
      //       homeRank: homeStats.opponent_passing_yards_per_completion_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass TD',
      //       title: 'Opponent Passing touchdowns',
      //       away: awayStats.opponent_passing_touchdowns,
      //       home: homeStats.opponent_passing_touchdowns,
      //       awayCompareValue: awayStats.opponent_passing_touchdowns,
      //       homeCompareValue: homeStats.opponent_passing_touchdowns,
      //       awayRank: awayStats.opponent_passing_touchdowns_rank,
      //       homeRank: homeStats.opponent_passing_touchdowns_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass int.',
      //       title: 'Opponent Passing interceptions',
      //       away: awayStats.opponent_passing_interceptions,
      //       home: homeStats.opponent_passing_interceptions,
      //       awayCompareValue: awayStats.opponent_passing_interceptions,
      //       homeCompareValue: homeStats.opponent_passing_interceptions,
      //       awayRank: awayStats.opponent_passing_interceptions_rank,
      //       homeRank: homeStats.opponent_passing_interceptions_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Pass long',
      //       title: 'Opponent Passing long',
      //       away: awayStats.opponent_passing_long,
      //       home: homeStats.opponent_passing_long,
      //       awayCompareValue: awayStats.opponent_passing_long,
      //       homeCompareValue: homeStats.opponent_passing_long,
      //       awayRank: awayStats.opponent_passing_long_rank,
      //       homeRank: homeStats.opponent_passing_long_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Rush att.',
      //       title: 'Opponent Rushing attempts',
      //       away: awayStats.opponent_rushing_attempts,
      //       home: homeStats.opponent_rushing_attempts,
      //       awayCompareValue: awayStats.opponent_rushing_attempts,
      //       homeCompareValue: homeStats.opponent_rushing_attempts,
      //       awayRank: awayStats.opponent_rushing_attempts_rank,
      //       homeRank: homeStats.opponent_rushing_attempts_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Rush yds',
      //       title: 'Opponent Rushing yards',
      //       away: awayStats.opponent_rushing_yards,
      //       home: homeStats.opponent_rushing_yards,
      //       awayCompareValue: awayStats.opponent_rushing_yards,
      //       homeCompareValue: homeStats.opponent_rushing_yards,
      //       awayRank: awayStats.opponent_rushing_yards_rank,
      //       homeRank: homeStats.opponent_rushing_yards_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Rush yds per att.',
      //       title: 'Opponent Rushing yards per attempt',
      //       away: awayStats.opponent_rushing_yards_per_attempt,
      //       home: homeStats.opponent_rushing_yards_per_attempt,
      //       awayCompareValue: awayStats.opponent_rushing_yards_per_attempt,
      //       homeCompareValue: homeStats.opponent_rushing_yards_per_attempt,
      //       awayRank: awayStats.opponent_rushing_yards_per_attempt_rank,
      //       homeRank: homeStats.opponent_rushing_yards_per_attempt_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Rush TD',
      //       title: 'Opponent Rushing touchdowns',
      //       away: awayStats.opponent_rushing_touchdowns,
      //       home: homeStats.opponent_rushing_touchdowns,
      //       awayCompareValue: awayStats.opponent_rushing_touchdowns,
      //       homeCompareValue: homeStats.opponent_rushing_touchdowns,
      //       awayRank: awayStats.opponent_rushing_touchdowns_rank,
      //       homeRank: homeStats.opponent_rushing_touchdowns_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     {
      //       name: 'Opp. Rush long',
      //       title: 'Opponent Rushing long',
      //       away: awayStats.opponent_rushing_long,
      //       home: homeStats.opponent_rushing_long,
      //       awayCompareValue: awayStats.opponent_rushing_long,
      //       homeCompareValue: homeStats.opponent_rushing_long,
      //       awayRank: awayStats.opponent_rushing_long_rank,
      //       homeRank: homeStats.opponent_rushing_long_rank,
      //       favored: 'lower',
      //       showDifference: true,
      //     },
      //     // {
      //     //   name: 'Opp. Recep.',
      //     //   title: 'Opponent # of receptions',
      //     //   away: awayStats.opponent_receptions,
      //     //   home: homeStats.opponent_receptions,
      //     //   awayCompareValue: awayStats.opponent_receptions,
      //     //   homeCompareValue: homeStats.opponent_receptions,
      //     //   awayRank: awayStats.opponent_receptions_rank,
      //     //   homeRank: homeStats.opponent_receptions_rank,
      //     //   favored: 'lower',
      //     //   showDifference: true,
      //     // },
      //     // {
      //     //   name: 'Opp. Rec. yds',
      //     //   title: 'Opponent Receiving yards',
      //     //   away: awayStats.opponent_receiving_yards,
      //     //   home: homeStats.opponent_receiving_yards,
      //     //   awayCompareValue: awayStats.opponent_receiving_yards,
      //     //   homeCompareValue: homeStats.opponent_receiving_yards,
      //     //   awayRank: awayStats.opponent_receiving_yards_rank,
      //     //   homeRank: homeStats.opponent_receiving_yards_rank,
      //     //   favored: 'lower',
      //     //   showDifference: true,
      //     // },
      //     // {
      //     //   name: 'Opp. Rec. yds per recep.',
      //     //   title: 'Opponent Receiving yards per reception',
      //     //   away: awayStats.opponent_receiving_yards_per_reception,
      //     //   home: homeStats.opponent_receiving_yards_per_reception,
      //     //   awayCompareValue: awayStats.opponent_receiving_yards_per_reception,
      //     //   homeCompareValue: homeStats.opponent_receiving_yards_per_reception,
      //     //   awayRank: awayStats.opponent_receiving_yards_per_reception_rank,
      //     //   homeRank: homeStats.opponent_receiving_yards_per_reception_rank,
      //     //   favored: 'lower',
      //     //   showDifference: true,
      //     // },
      //     // {
      //     //   name: 'Opp. Rec. TD',
      //     //   title: 'Opponent Receiving touchdowns',
      //     //   away: awayStats.opponent_receiving_touchdowns,
      //     //   home: homeStats.opponent_receiving_touchdowns,
      //     //   awayCompareValue: awayStats.opponent_receiving_touchdowns,
      //     //   homeCompareValue: homeStats.opponent_receiving_touchdowns,
      //     //   awayRank: awayStats.opponent_receiving_touchdowns_rank,
      //     //   homeRank: homeStats.opponent_receiving_touchdowns_rank,
      //     //   favored: 'lower',
      //     //   showDifference: true,
      //     // },
      //     // {
      //     //   name: 'Opp. Rec. long',
      //     //   title: 'Opponent Receiving long',
      //     //   away: awayStats.opponent_receiving_long,
      //     //   home: homeStats.opponent_receiving_long,
      //     //   awayCompareValue: awayStats.opponent_receiving_long,
      //     //   homeCompareValue: homeStats.opponent_receiving_long,
      //     //   awayRank: awayStats.opponent_receiving_long_rank,
      //     //   homeRank: homeStats.opponent_receiving_long_rank,
      //     //   favored: 'lower',
      //     //   showDifference: true,
      //     // },
      //   ],
      // },
    ];
  }

  // defaulting to CBB
  return [
    {
      name: 'Record',
      keys: overviewKeys,
    },
    {
      name: 'Efficiency',
      keys: [
        'adjusted_efficiency_rating',
        'opponent_efficiency_rating',
        'elo_sos',
        'offensive_rating',
        'defensive_rating',
        'points',
        'opponent_points',
      ],
    },
    {
      name: 'Rank',
      keys: [
        'rank',
        'elo',
        'net_rank',
        'kenpom_rank',
        'srs_rank',
        'ap_rank',
        'coaches_rank',
      ],
    },
    {
      name: 'Margin',
      keys: marginKeys,
    },
    {
      name: 'Offense',
      keys: [
        'possessions',
        'pace',
        'two_point_field_goal',
        'two_point_field_goal_attempts',
        'two_point_field_goal_percentage',
        'three_point_field_goal',
        'three_point_field_goal_attempts',
        'three_point_field_goal_percentage',
        'free_throws',
        'free_throw_attempts',
        'free_throw_percentage',
      ],
    },
    {
      name: 'Special',
      keys: [
        'offensive_rebounds',
        'defensive_rebounds',
        'assists',
        'steals',
        'blocks',
        'turnovers',
        'fouls',
        // 'fatigue',
        // 'desperation',
        // 'over_confidence',
      ],
    },
    {
      name: 'Defensive',
      keys: [
        'opponent_two_point_field_goal',
        'opponent_two_point_field_goal_attempts',
        'opponent_two_point_field_goal_percentage',
        'opponent_three_point_field_goal',
        'opponent_three_point_field_goal_attempts',
        'opponent_three_point_field_goal_percentage',
        'opponent_free_throws',
        'opponent_free_throw_attempts',
        'opponent_free_throw_percentage',
        'opponent_offensive_rebounds',
        'opponent_defensive_rebounds',
        'opponent_assists',
        'opponent_steals',
        'opponent_blocks',
        'opponent_turnovers',
        'opponent_fouls',
      ],
    },
  ];
};

const Client = ({ game }) => {
  const gameStats = useAppSelector((state) => state.gameReducer.gameStats);

  const numberOfTeams = Organization.getNumberOfTeams({ organization_id: game.organization_id, division_id: game.division_id, season: game.season });
  const homeStats = (gameStats[game.game_id] && gameStats[game.game_id].historical[game.home_team_id]) || {};
  const awayStats = (gameStats[game.game_id] && gameStats[game.game_id].historical[game.away_team_id]) || {};
  const columns = Objector.deepClone(TableColumns.getColumns({ organization_id: game.organization_id, view: 'matchup' }));
  const sections = getSections();


  return (
    <Profiler id="Game.Contents.Matchup.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <div style = {{ padding: '0px 5px 20px 5px' }}>
      <PredictionLine game={game} />

      {sections.map((section) => {
        const rows: CompareStatisticRow[] = [];

        section.keys.forEach((key) => {
          const row = columns[key] as CompareStatisticRow;

          row.leftRow = awayStats;
          row.rightRow = homeStats;

          rows.push(row);
        });

        return (
          <React.Fragment key = {section.name}>
            <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'body1'>{section.name}</Typography>
            <CompareStatistic max = {numberOfTeams} paper = {true} rows = {rows} />
          </React.Fragment>
        );
      })}
    </div>
    </Profiler>
  );
};

export default Client;
