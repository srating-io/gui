'use client';

import RankSpan from '@/components/generic/RankSpan';
import { useAppSelector } from '@/redux/hooks';
import { ChartDivergingBars, ChartDumbbell, ChartRankStrip, DivergingBar, DumbbellRow, RankStripRow } from '@/components/generic/Chart';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { Tooltip, Typography, useTheme } from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';


const Team = ({ organization_id, division_id, season, teamStats }: { organization_id: string, division_id: string, season: number, teamStats: Basketball.StatisticRanking | Football.StatisticRanking }) => {
  const theme = useTheme();
  const statsCharts = useAppSelector((state) => state.teamReducer.statsCharts);

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

  /**
   * The handful of measures a reader wants before anything else: how good, how good on each side
   * of the ball, and who they played to get there. Everything below is detail on top of these.
   */
  const getHeadlineColumns = () => {
    if (Organization.getCFBID() === organization_id) {
      return ['elo', 'points', 'opponent_points', 'yards_per_play', 'elo_sos'];
    }

    return ['elo', 'adjusted_efficiency_rating', 'offensive_rating', 'defensive_rating', 'elo_sos'];
  };

  const getStripRows = (): RankStripRow[] => {
    const stripRows: RankStripRow[] = [];

    for (const column of getHeadlineColumns()) {
      const columnData = allColumns[column];
      const rank = teamStats[`${column}_rank`];

      if (!columnData || !rank || !(column in teamStats)) {
        continue;
      }

      stripRows.push({
        key: column,
        label: columnData.getAltLabel ? columnData.getAltLabel() : columnData.getLabel(),
        value: teamStats[column],
        rank,
        tooltip: columnData.getTooltip(),
      });
    }

    return stripRows;
  };

  /**
   * Every ranked stat on the row, as distance from the middle of the league.
   *
   * Drawn from the same sections rendered below, so the bars and the grid can never disagree about
   * which stats this sport has.
   */
  const getStandoutBars = (): DivergingBar[] => {
    const bars: DivergingBar[] = [];
    const seen: { [column: string]: boolean } = {};

    // without a denominator there is no middle of the league to measure distance from
    if (maxTeams < 2) {
      return bars;
    }

    for (const section of sections) {
      for (const column of section.columns) {
        const rank = teamStats[`${column}_rank`];

        if (seen[column] || !rank || !(column in teamStats)) {
          continue;
        }

        seen[column] = true;

        const columnData = allColumns[column];

        if (!columnData) {
          continue;
        }

        // 1 at the top of the league and 0 at the bottom, then recentred so the league's middle
        // sits at zero and the bar's length is how far from ordinary the team is
        const standing = 1 - ((Math.min(rank, maxTeams) - 1) / (maxTeams - 1));

        bars.push({
          key: column,
          label: columnData.getAltLabel ? columnData.getAltLabel() : columnData.getLabel(),
          value: (standing - 0.5) * 2,
          // the same figure-and-rank pairing the strips above and the grid below print, rather
          // than a bare number the reader has to guess the denominator for
          detail: <>{teamStats[column]}<RankSpan rank = {rank} max = {maxTeams} useOrdinal = {true} /></>,
          tooltip: columnData.getTooltip(),
        });
      }
    }

    return bars;
  };

  /**
   * The same record under different conditions.
   *
   * 36-3 is one number covering two teams - the one at home and the one on the road - and a
   * conference record covering a third. The length of each connector is how much the context
   * actually mattered.
   */
  const getSplitRows = (): DumbbellRow[] => {
    const rate = (wins: number, losses: number) => {
      const played = wins + losses;

      return played ? +((wins / played) * 100).toFixed(1) : null;
    };

    const homeWins = teamStats.homewins || 0;
    const homeLosses = teamStats.homelosses || 0;
    const roadWins = teamStats.roadwins || 0;
    const roadLosses = teamStats.roadlosses || 0;
    const confWins = teamStats.confwins || 0;
    const confLosses = teamStats.conflosses || 0;

    // non conference is what is left once the conference games are taken out of the overall record
    const nonConfWins = (teamStats.wins || 0) - confWins;
    const nonConfLosses = (teamStats.losses || 0) - confLosses;

    const splits = [
      {
        key: 'venue',
        label: 'Home / road',
        from: rate(homeWins, homeLosses),
        to: rate(roadWins, roadLosses),
        fromDetail: `${homeWins}-${homeLosses}`,
        toDetail: `${roadWins}-${roadLosses}`,
        tooltip: 'Win rate at home against win rate away from home.',
      },
      {
        key: 'competition',
        label: 'Conf. / non-conf.',
        from: rate(confWins, confLosses),
        to: rate(nonConfWins, nonConfLosses),
        fromDetail: `${confWins}-${confLosses}`,
        toDetail: `${nonConfWins}-${nonConfLosses}`,
        tooltip: 'Win rate inside the conference against everyone else.',
      },
    ];

    return splits
      .filter((split) => split.from !== null && split.to !== null)
      .map((split) => ({ ...split, from: split.from as number, to: split.to as number }));
  };

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

  // each chart draws nothing at all until the season has ranks behind it, so the rule that
  // separates it from the next block is held back with it - otherwise a team page opened in the
  // preseason leads with three bare lines and no charts
  //
  // With the charts switched off none of this is built either, rather than built and thrown away
  const stripRows = statsCharts ? getStripRows() : [];
  const standoutBars = statsCharts ? getStandoutBars() : [];
  const splitRows = statsCharts ? getSplitRows() : [];

  return (
    <div style = {{ padding: '0px 5px' }}>
      {
        stripRows.length && maxTeams > 1 ?
          <>
            <ChartRankStrip rows = {stripRows} max = {maxTeams} />
            <hr />
          </> :
          ''
      }
      {
        standoutBars.length ?
          <>
            {/* twelve is about what fits without scrolling and comfortably more than anyone can
                hold in mind at once; past that the list stops being a summary and becomes the
                grid again */}
            <ChartDivergingBars bars = {standoutBars} limit = {12} />
            <hr />
          </> :
          ''
      }
      {
        splitRows.length ?
          <>
            <ChartDumbbell
              rows = {splitRows}
              domain = {[0, 100]}
              fromLabel = 'home / conference'
              toLabel = 'road / non-conference'
              title = 'Same team, different week'
              unit = ''
            />
            <hr />
          </> :
          ''
      }
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
