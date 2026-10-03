'use client';

import { useMemo } from 'react';
import Chart, { ChartSmallMultiples, SmallMultiplePanel, SmallMultipleSeries, getChartPalette } from '@/components/generic/Chart';
import HelperChart from '@/components/helpers/Chart';
import { LineProps, YAxisProps } from 'recharts';
import ColumnPicker from '@/components/generic/ColumnPicker';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import AdditionalOptions from './AdditionalOptions';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/team-slice';
import { Dates } from '@esmalley/ts-utils';
import { Chip, Typography, useTheme } from '@esmalley/react-material-ui';


const StatsGraph = (
  {
    organization_id, division_id, season, statistic_rankings, games, conference_statistic_rankings, league_statistic_rankings, boxscores,
  }:
  { organization_id: string, division_id: string, season: number, statistic_rankings: object, games: object, conference_statistic_rankings: object, league_statistic_rankings: object, boxscores: object },
) => {
  const getMax = () => {
    return Organization.getNumberOfTeams({ organization_id, division_id, season });
  };

  let standardColumns = [
    'adjusted_efficiency_rating',
    'points',
    'field_goal_percentage',
    'elo',
  ];

  if (Organization.getCFBID() === organization_id) {
    standardColumns = [
      'passing_rating_college',
      'points',
      'yards_per_play',
      'elo',
    ];
  }

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const trendsBoxscoreLine = useAppSelector((state) => state.teamReducer.trendsBoxscoreLine);
  const trendsSmallMultiples = useAppSelector((state) => state.teamReducer.trendsSmallMultiples);
  const trendsColumn = useAppSelector((state) => state.teamReducer.trendsColumn) || standardColumns[0];

  const allColumns = TableColumns.getColumns({ organization_id, view: 'team', graphable: true, disabled: false });

  const handleColumn = (value: string) => {
    dispatch(setDataKey({ key: 'trendsColumn', value }));

    const current = new URLSearchParams(window.location.search);
    current.set('trendsColumn', value);
    window.history.replaceState(null, '', `?${current.toString()}`);

    // use pushState if we want to add to back button history
    // window.history.pushState(null, '', `?${current.toString()}`);
    // console.timeEnd('ColumnPicker.handleClick');
  };


  if (
    trendsColumn &&
    trendsColumn in allColumns &&
    !standardColumns.includes(trendsColumn)
  ) {
    standardColumns.push(allColumns[trendsColumn].id);
  }

  const statsCompareChips: React.JSX.Element[] = [];

  for (let i = 0; i < standardColumns.length; i++) {
    const column = allColumns[standardColumns[i]];
    statsCompareChips.push(
      <Chip
        key = {column.id}
        style = {{ margin: '5px 5px 10px 5px' }}
        filled = {trendsColumn === column.id}
        value = {column.id}
        onClick = {() => { handleColumn(column.id); }}
        title = {column.getLabel()}
      />,
    );
  }

  statsCompareChips.push(
    <ColumnPicker key = {'team-stat-custom-column-picker'} options = {allColumns} selected = {trendsColumn ? [trendsColumn] : []} filled = {false} isRadio = {true} autoClose={true} actionHandler = {handleColumn} />,
  );



  // this will also include all the statistic_ranking columns
  type Data = {
    team_id: string;
    elo: number;
    date_of_rank: string;
    date_friendly: string;
  };

  /**
   * Built once per real change rather than on every render.
   *
   * This walks every statistic_ranking, conference_statistic_ranking, league_statistic_ranking and
   * boxscore for the season to build one row per date. Doing that again on every render - each
   * resize, each hover that moves a tooltip - is work nobody asked for, and it hands recharts a new
   * `data` array identity each time, which it reads as "the data changed".
   */
  const { formattedData, domain } = useMemo(() => {
    const date_of_rank_x_data = {};

    for (const statistic_ranking_id in statistic_rankings) {
      const row = statistic_rankings[statistic_ranking_id];

      // remove preseason rows, so it doesnt start at 0... I think is is fine, unless I make preseason predictions for stats
      if (!row.games) {
        continue;
      }

      if (!(row.date_of_rank in date_of_rank_x_data)) {
        date_of_rank_x_data[row.date_of_rank] = {
          date_of_rank: row.date_of_rank,
          date_friendly: Dates.format(row.date_of_rank, 'M jS'),
        };
      }

      for (const key in row) {
        date_of_rank_x_data[row.date_of_rank][key] = row[key];
      }
    }

    for (const conference_statistic_ranking_id in conference_statistic_rankings) {
      const row = conference_statistic_rankings[conference_statistic_ranking_id];


      // remove preseason rows, so it doesnt start at 0... I think is is fine, unless I make preseason predictions for stats
      if (!row.wins && !row.losses) {
        continue;
      }

      if (!(row.date_of_rank in date_of_rank_x_data)) {
        date_of_rank_x_data[row.date_of_rank] = {
          date_of_rank: row.date_of_rank,
          date_friendly: Dates.format(row.date_of_rank, 'M jS'),
        };
      }

      for (const regularKey in row) {
        const modifiedKey = `conf_${regularKey}`;
        date_of_rank_x_data[row.date_of_rank][modifiedKey] = row[regularKey];
      }
    }

    for (const league_statistic_ranking_id in league_statistic_rankings) {
      const row = league_statistic_rankings[league_statistic_ranking_id];

      // remove preseason rows, so it doesnt start at 0... I think is is fine, unless I make preseason predictions for stats
      if (!row.wins && !row.losses) {
        continue;
      }

      if (!(row.date_of_rank in date_of_rank_x_data)) {
        date_of_rank_x_data[row.date_of_rank] = {
          date_of_rank: row.date_of_rank,
          date_friendly: Dates.format(row.date_of_rank, 'M jS'),
        };
      }

      for (const regularKey in row) {
        const modifiedKey = `league_${regularKey}`;
        date_of_rank_x_data[row.date_of_rank][modifiedKey] = row[regularKey];
      }
    }

    if (trendsBoxscoreLine) {
      for (const boxscore_id in boxscores) {
        const row = boxscores[boxscore_id];

        if (!(row.game_id in games)) {
          continue;
        }

        const date = games[row.game_id].start_date;

        if (!(date in date_of_rank_x_data)) {
          date_of_rank_x_data[date] = {
            date_of_rank: date,
            date_friendly: Dates.format(row.date, 'M jS'),
          };
        }

        for (const regularKey in row) {
          const modifiedKey = `boxscore_${regularKey}`;
          date_of_rank_x_data[date][modifiedKey] = row[regularKey];
        }
      }
    }

    const minYaxisElo = 1100;
    const maxYaxisElo = 2000;

    // const rows: Data[] = Object.values(date_of_rank_x_data);
    let bounds: [number | null, number | null] = [null, null];
    const rows: Data[] = [];
    for (const dor in date_of_rank_x_data) {
      const data = date_of_rank_x_data[dor];

      // the axis has to fit every line that gets drawn, not just the team's own
      bounds = HelperChart.extend(bounds, data[trendsColumn]);
      bounds = HelperChart.extend(bounds, data[`league_${trendsColumn}`]);
      bounds = HelperChart.extend(bounds, data[`conf_${trendsColumn}`]);

      if (trendsBoxscoreLine) {
        bounds = HelperChart.extend(bounds, data[`boxscore_${trendsColumn}`]);
      }

      rows.push(data);
    }

    let domain = HelperChart.getDomain(bounds[0], bounds[1]);

    // hold elo on a fixed frame so the same climb reads the same size on every team's chart
    if (trendsColumn === 'elo') {
      domain = HelperChart.expandDomain(domain, minYaxisElo, maxYaxisElo);
    }

    const sorted: Data[] = rows.sort((a: Data, b: Data) => (a.date_of_rank > b.date_of_rank ? 1 : -1));

    if (trendsBoxscoreLine) {
      HelperChart.trailingMean(sorted, `boxscore_${trendsColumn}`, `boxscore_avg_${trendsColumn}`);
    }

    // connect the nulls
    let lastElo: number | null = null;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].elo) {
        lastElo = sorted[i].elo;
      }

      if (lastElo && !('elo' in sorted[i])) {
        sorted[i].elo = lastElo;
      }
    }

    return { formattedData: sorted, domain };
  }, [statistic_rankings, conference_statistic_rankings, league_statistic_rankings, boxscores, games, trendsColumn, trendsBoxscoreLine]);

  /**
   * Every stat the grid can draw, in the order the tables put them in.
   *
   * A fixed list of eight was the wrong shape for what the grid is for: picking the headline
   * measures out in advance is what the chip row already does, and a reader who wants to see
   * whether the free throw rate moved with the turnovers has to be able to find both. So the
   * list is whatever the season actually has numbers for - a column with nothing behind it all
   * season would draw an empty frame and take a slot from one that has something to say.
   */
  const getPanels = (): SmallMultiplePanel[] => {
    const panels: SmallMultiplePanel[] = [];
    const latest = formattedData.length ? formattedData[formattedData.length - 1] : null;

    for (const column in allColumns) {
      const columnData = allColumns[column];
      let hasData = false;

      for (const row of formattedData) {
        const value = row[columnData.id];

        // the same test the axis helper applies, so a panel is offered exactly when it can be
        // given a scale
        if (typeof value === 'number' && Number.isFinite(value)) {
          hasData = true;
          break;
        }
      }

      if (!hasData) {
        continue;
      }

      panels.push({
        key: columnData.id,
        label: columnData.getAltLabel ? columnData.getAltLabel() : columnData.getLabel(),
        dataKey: columnData.id,
        rank: latest ? latest[`${columnData.id}_rank`] : undefined,
        // 1 is the top of the league, so a rank runs the other way round and a team climbing it
        // draws a line going up
        reversed: /(^|_)rank$/.test(columnData.id),
      });
    }

    return panels;
  };

  /**
   * The three lines every panel carries, named once in the grid's own legend.
   *
   * Same slots as the one-stat chart below, so a reader who learned that the league is the third
   * color there does not have to learn it again here.
   */
  const smallMultipleSeries: SmallMultipleSeries[] = [
    { key: 'team', name: 'Team', prefix: '', slot: 0, showRank: true },
    { key: 'conference', name: 'Conference', prefix: 'conf_', slot: 1 },
    { key: 'league', name: 'League', prefix: 'league_', slot: 2 },
  ];

  let chart: React.JSX.Element | null = null;

  if (trendsSmallMultiples) {
    chart = <ChartSmallMultiples rows = {formattedData} panels = {getPanels()} series = {smallMultipleSeries} xAxisDataKey = {'date_friendly'} rankMax = {getMax()} />;
  } else if (trendsColumn in allColumns) {
    const statistic = allColumns[trendsColumn];

    const lines: LineProps[] = [
      {
        type: 'monotone',
        name: statistic.getLabel(),
        dataKey: statistic.id,
        stroke: palette.series(0),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
        unit: 'rank', // hijacking this unit param to display Rankspan in tooltip
      },
      {
        type: 'monotone',
        name: `Conf. ${statistic.getLabel()}`,
        dataKey: `conf_${statistic.id}`,
        stroke: palette.series(1),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
      {
        type: 'monotone',
        name: `League ${statistic.getLabel()}`,
        dataKey: `league_${statistic.id}`,
        stroke: palette.series(2),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
    ];

    if (trendsBoxscoreLine) {
      // the games themselves, as marks with nothing joining them, and the trailing mean through
      // them. Both wear the same hue because they are the same measure - the dots are the
      // observations, the line is what those observations add up to
      lines.splice(1, 0, {
        type: 'monotone',
        name: `Box. ${statistic.getLabel()}`,
        dataKey: `boxscore_${statistic.id}`,
        stroke: palette.series(3),
        strokeWidth: 0,
        dot: { r: 4, fill: palette.series(3), strokeWidth: 0 },
        connectNulls: false,
        isAnimationActive: false,
      });

      lines.splice(2, 0, {
        type: 'monotone',
        name: `${HelperChart.TRAILING_WINDOW}-game avg.`,
        dataKey: `boxscore_avg_${statistic.id}`,
        stroke: palette.series(3),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      });
    }

    const YAxisProps: YAxisProps = { scale: 'auto' };
    if (domain) {
      YAxisProps.domain = domain;
    }
    chart = <Chart key = {trendsColumn} XAxisDataKey={'date_friendly'} YAxisLabel={statistic.getLabel()} rows={formattedData} lines={lines} YAxisProps={YAxisProps} rankMax = {getMax()} />;
  }


  return (
    <>
      <div style = {{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><AdditionalOptions /></div>
        {/* the chips pick which single stat to plot, and the grid plots all of them, so they
            have nothing left to choose while it is up */}
        <div style = {{ display: 'flex', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {trendsSmallMultiples ? '' : statsCompareChips}
        </div>
        <div></div>
      </div>
      <div style = {{ textAlign: 'center' }}>
        {!formattedData.length ? <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>Nothing here yet...</Typography> : ''}
        {formattedData.length ? chart : ''}
      </div>
    </>
  );
};

export default StatsGraph;
