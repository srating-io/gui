'use client';

import Chart from '@/components/generic/Chart';
import { LineProps, YAxisProps } from 'recharts';
import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/compare-slice';
import ColumnPicker from '@/components/generic/ColumnPicker';
import Team from '@/components/helpers/Team';
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

const getColors = ({ home_team, away_team }) => {
  const theme = useTheme();

  let homeColor = (home_team && home_team.primary_color);
  let awayColor = (away_team && away_team.primary_color);

  if (awayColor === homeColor) {
    awayColor = theme.info.main;
  }

  if (!homeColor) {
    homeColor = theme.info.main;
  }

  if (!awayColor) {
    awayColor = theme.info.main;
  }

  if (Color.areColorsSimilar(homeColor, awayColor)) {
    const analogousColors = Color.getAnalogousColors(awayColor);
    let any = false;

    for (let i = 0; i < analogousColors.length; i++) {
      if (!Color.areColorsSimilar(homeColor, analogousColors[i])) {
        awayColor = analogousColors[i];
        any = true;
        break;
      }
    }

    if (!any) {
      awayColor = Color.invertColor(awayColor);
    }
  }

  return { homeColor, awayColor };
};


const Client = ({ statistic_rankings }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const backgroundColor = theme.background.main;
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const home_team_id = useAppSelector((state) => state.compareReducer.home_team_id);
  const away_team_id = useAppSelector((state) => state.compareReducer.away_team_id);
  const teams = useAppSelector((state) => state.compareReducer.teams);

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
  const trendsColumn = useAppSelector((state) => state.compareReducer.trendsColumn) || standardColumns[0];

  const homeName = (home_team_id && new Team({ team: teams[home_team_id] }).getName()) || 'Unknown';
  const awayName = (away_team_id && new Team({ team: teams[away_team_id] }).getName()) || 'Unknown';

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
    <ColumnPicker key = {'compare-trends-custom-column-picker'} options = {allColumns} selected = {trendsColumn ? [trendsColumn] : []} filled = {false} isRadio = {true} autoClose={true} actionHandler = {handleColumn} />,
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

    const which = home_team_id === row.team_id ? 'home' : 'away';

    for (const key in row) {
      date_of_rank_x_data[row.date_of_rank][`${which}_${key}`] = row[key];
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
    const homeValue = data[`home_${trendsColumn}`];
    const awayValue = data[`away_${trendsColumn}`];

    if (
      `home_${trendsColumn}` in data ||
      `away_${trendsColumn}` in data
    ) {
      if (
        minYaxis === null ||
        homeValue < minYaxis ||
        awayValue < minYaxis
      ) {
        minYaxis = homeValue < awayValue ? homeValue : awayValue;
      }

      if (
        maxYaxis === null ||
        homeValue > maxYaxis ||
        awayValue > maxYaxis
      ) {
        maxYaxis = homeValue > awayValue ? homeValue : awayValue;
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

  const colors = getColors({
    home_team: home_team_id && teams[home_team_id],
    away_team: away_team_id && teams[away_team_id],
  });

  if (trendsColumn in allColumns) {
    const statistic = allColumns[trendsColumn];


    const lines: LineProps[] = [
      {
        type: 'monotone',
        name: homeName,
        dataKey: `home_${statistic.id}`,
        stroke: Color.getTextColor(colors.homeColor, backgroundColor),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
      {
        type: 'monotone',
        name: awayName,
        dataKey: `away_${statistic.id}`,
        stroke: Color.getTextColor(colors.awayColor, backgroundColor),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
    ];

    const YAxisProps: YAxisProps = { scale: 'auto' };
    if (minYaxis !== null && maxYaxis !== null) {
      YAxisProps.domain = [minYaxis, maxYaxis];
    }
    chart = <Chart XAxisDataKey={'date_friendly'} YAxisLabel={statistic.getLabel()} rows={formattedData} lines={lines} YAxisProps={YAxisProps} />;
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
