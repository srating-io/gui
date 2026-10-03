'use client';

import Chart from '@/components/generic/Chart';
import HelperChart from '@/components/helpers/Chart';
import { LineProps, YAxisProps } from 'recharts';
import HelperGame from '@/components/helpers/Game';
import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/game-slice';
import ColumnPicker from '@/components/generic/ColumnPicker';
import { Color, Dates } from '@esmalley/ts-utils';
import { Chip, LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';

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

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 160;
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


const Client = ({ game, statistic_rankings }) => {
  const { organization_id } = game;

  const Game = new HelperGame({
    game,
  });

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

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const backgroundColor = theme.background.main;

  const trendsColumn = useAppSelector((state) => state.gameReducer.trendsColumn) || standardColumns[0];

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
    <ColumnPicker key = {'game-trends-custom-column-picker'} options = {allColumns} selected = {trendsColumn ? [trendsColumn] : []} filled = {false} isRadio = {true} autoClose={true} actionHandler = {handleColumn} />,
  );


  type Data = {
    team_id: string;
    home_elo?: number;
    away_elo?: number;
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

    const which = game.home_team_id === row.team_id ? 'home' : 'away';

    for (const key in row) {
      date_of_rank_x_data[row.date_of_rank][`${which}_${key}`] = row[key];
    }
  }


  const minYaxisElo = 1100;
  const maxYaxisElo = 2000;

  // const rows: Data[] = Object.values(date_of_rank_x_data);
  let bounds: [number | null, number | null] = [null, null];
  const rows: Data[] = [];
  for (const dor in date_of_rank_x_data) {
    const data = date_of_rank_x_data[dor];

    // taken one side at a time, so a date with only one team's row still contributes
    bounds = HelperChart.extend(bounds, data[`home_${trendsColumn}`]);
    bounds = HelperChart.extend(bounds, data[`away_${trendsColumn}`]);

    rows.push(data);
  }

  let domain = HelperChart.getDomain(bounds[0], bounds[1]);

  // hold elo on a fixed frame so the same gap reads the same size on every game's chart
  if (trendsColumn === 'elo') {
    domain = HelperChart.expandDomain(domain, minYaxisElo, maxYaxisElo);
  }


  const formattedData: Data[] = rows.sort((a: Data, b: Data) => {
    return a.date_of_rank > b.date_of_rank ? 1 : -1;
  });

  let lastHomeElo: number | null | undefined = null;
  let lastAwayElo: number | null | undefined = null;
  // connect the nulls
  for (let i = 0; i < formattedData.length; i++) {
    if (formattedData[i].home_elo) {
      lastHomeElo = formattedData[i].home_elo;
    }

    if (lastHomeElo && !('home_elo' in formattedData[i])) {
      formattedData[i].home_elo = lastHomeElo;
    }

    if (formattedData[i].away_elo) {
      lastAwayElo = formattedData[i].away_elo;
    }

    if (lastAwayElo && !('away_elo' in formattedData[i])) {
      formattedData[i].away_elo = lastAwayElo;
    }
  }

  let chart: React.JSX.Element | null = null;

  const colors = Game.getColors();

  if (trendsColumn in allColumns) {
    const statistic = allColumns[trendsColumn];

    const lines: LineProps[] = [
      {
        type: 'monotone',
        name: Game.getTeamName('home'),
        dataKey: `home_${statistic.id}`,
        stroke: Color.getTextColor(colors.homeColor, backgroundColor),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
      {
        type: 'monotone',
        name: Game.getTeamName('away'),
        dataKey: `away_${statistic.id}`,
        stroke: Color.getTextColor(colors.awayColor, backgroundColor),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
    ];

    const YAxisProps: YAxisProps = { scale: 'auto' };
    if (domain) {
      YAxisProps.domain = domain;
    }
    chart = <Chart key = {trendsColumn} XAxisDataKey={'date_friendly'} YAxisLabel={statistic.getLabel()} rows={formattedData} lines={lines} YAxisProps={YAxisProps} />;
  }

  return (
    <Contents>
      <div style = {{ display: 'flex', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {statsCompareChips}
      </div>
      {!formattedData.length ? <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>Nothing here yet...</Typography> : ''}
      {formattedData.length ? chart : ''}
    </Contents>
  );
};

export { Client, ClientSkeleton };
