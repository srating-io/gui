'use client';

import RankSpan from '@/components/generic/RankSpan';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { Tooltip, Typography, useTheme } from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';


const Team = ({ organization_id, division_id, season, teamStats }: { organization_id: string, division_id: string, season: number, teamStats: Basketball.StatisticRanking | Football.StatisticRanking }) => {
  const theme = useTheme();
  const getMax = () => {
    if (teamStats.max) {
      return teamStats.max;
    }

    return Organization.getNumberOfTeams({ organization_id, division_id, season });
  };

  const maxTeams = getMax();

  const allColumns = TableColumns.getColumns({ organization_id, view: 'team' });

  const getSections = () => {
    const margin_columns = ['win_margin', 'loss_margin', 'confwin_margin', 'confloss_margin'];
    const record_columns = ['wins', 'losses', 'confwins', 'conflosses', 'neutralwins', 'neutrallosses', 'homewins', 'homelosses', 'roadwins', 'roadlosses'];

    if (Organization.getCFBID() === organization_id) {
      return [
        {
          name: 'Overview',
          columns: ['elo', 'elo_sos', 'points', 'passing_rating_college', 'passing_rating_pro', 'yards_per_play', 'points_per_play'],
        },
        {
          name: 'Passing',
          columns: ['passing_completions', 'passing_attempts', 'passing_completion_percentage', 'passing_yards', 'passing_yards_per_attempt', 'passing_yards_per_completion', 'passing_touchdowns', 'passing_interceptions', 'passing_long'],
        },
        {
          name: 'Rushing',
          columns: ['rushing_attempts', 'rushing_yards', 'rushing_yards_per_attempt', 'rushing_touchdowns', 'rushing_long'],
        },
        {
          name: 'Receiving',
          columns: ['receptions', 'receiving_yards', 'receiving_yards_per_reception', 'receiving_touchdowns', 'receiving_long'],
        },
        {
          name: 'Margin',
          columns: margin_columns,
        },
        {
          name: 'Record',
          columns: record_columns,
        },
        {
          name: 'Defensive',
          columns: [
            'opponent_points',
            'opponent_yards_per_play',
            'opponent_points_per_play',
            'opponent_passing_attempts',
            'opponent_passing_completions',
            'opponent_passing_yards',
            'opponent_passing_completion_percentage',
            'opponent_passing_yards_per_attempt',
            'opponent_passing_yards_per_completion',
            'opponent_passing_touchdowns',
            'opponent_passing_interceptions',
            'opponent_passing_rating_pro',
            'opponent_passing_rating_college',
            'opponent_passing_long',
            'opponent_rushing_attempts',
            'opponent_rushing_yards',
            'opponent_rushing_yards_per_attempt',
            'opponent_rushing_touchdowns',
            'opponent_rushing_long',
            'opponent_receptions',
            'opponent_receiving_yards',
            'opponent_receiving_yards_per_reception',
            'opponent_receiving_touchdowns',
            'opponent_receiving_long',
          ],
        },
      ];
    }

    if (
      Organization.getCBBID() === organization_id ||
      Organization.getNBAID() === organization_id
    ) {
      return [
        {
          name: 'Overview',
          columns: [
            'elo',
            'elo_sos',
            'adjusted_efficiency_rating',
            'opponent_efficiency_rating',
            'offensive_rating',
            'defensive_rating',
            'points',
            'opponent_points',
          ],
        },
        {
          name: 'Offense',
          columns: [
            'field_goal',
            'field_goal_attempts',
            'field_goal_percentage',
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
          columns: [
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
          columns: [
            'opponent_two_point_field_goal',
            'opponent_two_point_field_goal_attempts',
            'opponent_two_point_field_goal_percentage',
            'opponent_three_point_field_goal',
            'opponent_three_point_field_goal_attempts',
            'opponent_three_point_field_goal_percentage',
            'opponent_offensive_rebounds',
            'opponent_defensive_rebounds',
            'opponent_assists',
            'opponent_steals',
            'opponent_blocks',
            'opponent_turnovers',
            'opponent_fouls',
          ],
        },
        {
          name: 'Margin',
          columns: margin_columns,
        },
        {
          name: 'Record',
          columns: record_columns,
        },
      ];
    }

    return [];
  };

  const sections = getSections();

  const getStatBlock = (column: string) => {
    const columnData = allColumns[column];
    const value = column in teamStats ? teamStats[column] : 0;
    const rank = `${column}_rank` in teamStats ? teamStats[`${column}_rank`] : null;
    const label = columnData.getAltLabel ? columnData.getAltLabel() : columnData.getLabel();
    return (
      <div key = {`${label}-div`} style = {{
        textAlign: 'center', flex: '1', minWidth: 100, maxWidth: 100, margin: 10,
      }}>
        <Tooltip key={label} position = 'top' text={columnData.getTooltip()}><Typography style = {{ color: theme.text.secondary }} type ='body1'>{label}</Typography></Tooltip>
        {/* <hr style = {{'padding': 0, 'margin': 'auto', 'width': 50}} /> */}
        <div><Typography type='caption'>{value}</Typography>{rank ? <RankSpan rank = {rank} useOrdinal = {true} max = {maxTeams} /> : ''}</div>
      </div>
    );
  };

  return (
    <div style = {{ padding: '0px 5px' }}>
      {sections.map(({ name, columns }, sectionIndex) => {
        return (
          <div key = {sectionIndex}>
            <Typography type='body1'>{name}</Typography>
            <div style = {{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {columns.map((column) => {
                return getStatBlock(column);
              })}
            </div>
            {sectionIndex < sections.length - 1 ? <hr /> : ''}
          </div>
        );
      })}
    </div>
  );
};

export default Team;
