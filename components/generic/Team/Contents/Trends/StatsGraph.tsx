'use client';

import Chart from '@/components/generic/Chart';
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
  const trendsBoxscoreLine = useAppSelector((state) => state.teamReducer.trendsBoxscoreLine);
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
  let minYaxis: number | null = null;
  let maxYaxis: number | null = null;
  const rows: Data[] = [];
  for (const dor in date_of_rank_x_data) {
    const data = date_of_rank_x_data[dor];
    const value = data[trendsColumn];
    const boxscoreValue = data[`boxscore_${trendsColumn}`];
    const leagueValue = data[`league_${trendsColumn}`];
    const confValue = data[`conf_${trendsColumn}`];

    let compareMaxValue = value;
    if (!compareMaxValue || leagueValue > compareMaxValue) {
      compareMaxValue = leagueValue;
    }
    if (!compareMaxValue || confValue > compareMaxValue) {
      compareMaxValue = confValue;
    }
    if (!compareMaxValue || boxscoreValue > compareMaxValue) {
      compareMaxValue = boxscoreValue;
    }

    let compareMixValue = value;
    if (!compareMixValue || leagueValue < compareMixValue) {
      compareMixValue = leagueValue;
    }
    if (!compareMixValue || confValue < compareMixValue) {
      compareMixValue = confValue;
    }
    if (!compareMixValue || boxscoreValue < compareMixValue) {
      compareMixValue = boxscoreValue;
    }

    if (compareMixValue !== null || compareMixValue !== undefined) {
      if (
        minYaxis === null ||
        compareMixValue < minYaxis
      ) {
        minYaxis = compareMixValue;
      }
    }

    if (compareMaxValue !== null || compareMaxValue !== undefined) {
      if (
        maxYaxis === null ||
        compareMaxValue > maxYaxis
      ) {
        maxYaxis = compareMaxValue;
      }
    }

    rows.push(data);
  }


  // give the min and max some buffer
  const buffer = Math.ceil(((minYaxis || 0) + (maxYaxis || 0)) * 0.05);
  if (minYaxis !== null) {
    minYaxis = +(minYaxis - buffer).toFixed(0);
  }
  if (maxYaxis !== null) {
    maxYaxis = +(maxYaxis + buffer).toFixed(0);
  }

  if (trendsColumn === 'elo') {
    minYaxis = minYaxis && minYaxis < minYaxisElo ? minYaxis : minYaxisElo;
    maxYaxis = maxYaxis && maxYaxis > maxYaxisElo ? maxYaxis : maxYaxis;
  }

  const formattedData: Data[] = rows.sort((a: Data, b: Data) => (a.date_of_rank > b.date_of_rank ? 1 : -1));

  // connect the nulls
  let lastElo: number | null = null;
  for (let i = 0; i < formattedData.length; i++) {
    if (formattedData[i].elo) {
      lastElo = formattedData[i].elo;
    }

    if (lastElo && !('elo' in formattedData[i])) {
      formattedData[i].elo = lastElo;
    }
  }

  let chart: React.JSX.Element | null = null;

  if (trendsColumn in allColumns) {
    const statistic = allColumns[trendsColumn];

    const lines: LineProps[] = [
      {
        type: 'monotone',
        name: statistic.getLabel(),
        dataKey: statistic.id,
        stroke: theme.info.main,
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
        unit: 'rank', // hijacking this unit param to display Rankspan in tooltip
      },
      {
        type: 'monotone',
        name: `Conf. ${statistic.getLabel()}`,
        dataKey: `conf_${statistic.id}`,
        stroke: theme.warning.main,
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
      {
        type: 'monotone',
        name: `League ${statistic.getLabel()}`,
        dataKey: `league_${statistic.id}`,
        stroke: theme.secondary.dark,
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
    ];

    if (trendsBoxscoreLine) {
      // insert the line in the second position
      lines.splice(1, 0, {
        type: 'monotone',
        name: `Box. ${statistic.getLabel()}`,
        dataKey: `boxscore_${statistic.id}`,
        stroke: theme.success.dark,
        strokeWidth: 2,
        dot: true,
        connectNulls: true,
      });
    }

    const YAxisProps: YAxisProps = { scale: 'auto' };
    if (minYaxis !== null && maxYaxis !== null) {
      YAxisProps.domain = [minYaxis, maxYaxis];
    }
    chart = <Chart XAxisDataKey={'date_friendly'} YAxisLabel={statistic.getLabel()} rows={formattedData} lines={lines} YAxisProps={YAxisProps} rankMax = {getMax()} />;
  }


  return (
    <>
      <div style = {{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><AdditionalOptions /></div>
        <div style = {{ display: 'flex', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {statsCompareChips}
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
