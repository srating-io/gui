'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Label, Brush,
  YAxisProps,
} from 'recharts';
import { ChartLegend, ChartTooltip, useInactiveSeries, getChartPalette } from '@/components/generic/Chart';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
import { useAppSelector } from '@/redux/hooks';
import Team from '@/components/helpers/Team';
import TableColumns from '@/components/helpers/TableColumns';
import { Color, Dates } from '@esmalley/ts-utils';
import HelperChart from '@/components/helpers/Chart';
import ColumnPicker from '@/components/generic/ColumnPicker';
import { Chip, LinearProgress, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';

export interface TrendsType {
  elos: General.Elos;
  games: General.Games;
  statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings;
  team_season_conferences: General.TeamSeasonConferences;
}

const padding = 5;

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style={{ padding }}>
      {children}
    </div>
  );
};

const ClientSkeleton = () => {
  const theme = useTheme();
  const heightToRemove = padding + footerNavigationHeight + headerBarHeight + 190;
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

const Client = ({ organization_id, conference_id, data }: { organization_id: string, conference_id: string, data: TrendsType}) => {
  const theme = useTheme();
  const backgroundColor = theme.background.main;

  const { width } = useWindowDimensions();

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

  const breakPoint = 600;

  const teams = useAppSelector((state) => state.conferenceReducer.teams);
  const elos = (data && data.elos) || {};
  const games = (data && data.games) || {};
  const statistic_rankings = (data && data.statistic_rankings) || {};

  const series = useInactiveSeries();
  const palette = getChartPalette(theme);
  const [selectedChip, setSelectedChip] = useState(standardColumns[0]);
  const [customColumn, setCustomColumn] = useState<string | null>(null);

  const allColumns = TableColumns.getColumns({ organization_id, view: 'conference', graphable: true });

  if (customColumn && customColumn in allColumns) {
    standardColumns.push(allColumns[customColumn].id);
  }

  const handlCustomColumnsSave = (col) => {
    const selectedColumn = col || null;

    if (!standardColumns.includes(selectedColumn)) {
      setCustomColumn(selectedColumn);
    }

    if (selectedColumn) {
      setSelectedChip(selectedColumn);
    }
  };

  const statsCompareChips: React.JSX.Element[] = [];

  for (let i = 0; i < standardColumns.length; i++) {
    const column = allColumns[standardColumns[i]];
    statsCompareChips.push(
      <Chip
        key = {column.id}
        style = {{ margin: '5px 5px 10px 5px' }}
        filled = {selectedChip === column.id}
        value = {column.id}
        onClick = {() => { setSelectedChip(column.id); }}
        title = {column.getLabel()}
      />,
    );
  }

  statsCompareChips.push(
    <div style ={{ display: 'inline-block' }}>
      <ColumnPicker key = {'conference-stat-custom-column-picker'} options = {allColumns} selected = {customColumn ? [customColumn] : []} filled = {false} isRadio = {true} autoClose={true} actionHandler = {handlCustomColumnsSave} />
    </div>,
  );


  const date_of_rank_x_team_id_x_data = {};

  for (const statistic_ranking_id in statistic_rankings) {
    const row = statistic_rankings[statistic_ranking_id];

    // remove preseason rows, so it doesnt start at 0... I think is is fine, unless I make preseason predictions for stats
    if (!row.games) {
      continue;
    }

    if (!(row.date_of_rank in date_of_rank_x_team_id_x_data)) {
      date_of_rank_x_team_id_x_data[row.date_of_rank] = {};
    }

    if (!(row.team_id in date_of_rank_x_team_id_x_data[row.date_of_rank])) {
      date_of_rank_x_team_id_x_data[row.date_of_rank][row.team_id] = {};
    }

    Object.assign(date_of_rank_x_team_id_x_data[row.date_of_rank][row.team_id], row);
  }

  const sorted_date_of_ranks = Object.keys(date_of_rank_x_team_id_x_data).sort((a, b) => {
    return a > b ? 1 : -1;
  });

  let minYaxisElo = 1100;
  let maxYaxisElo = 2000;
  for (const elo_id in elos) {
    const row = elos[elo_id];

    if (row.elo < minYaxisElo) {
      minYaxisElo = row.elo;
    }

    if (row.elo > maxYaxisElo) {
      maxYaxisElo = row.elo;
    }

    if (row.game_id && row.game_id in games) {
      const { start_date } = games[row.game_id];

      if (!(start_date in date_of_rank_x_team_id_x_data)) {
        date_of_rank_x_team_id_x_data[start_date] = {};
      }

      if (!(row.team_id in date_of_rank_x_team_id_x_data[start_date])) {
        date_of_rank_x_team_id_x_data[start_date][row.team_id] = {};
      }

      date_of_rank_x_team_id_x_data[start_date][row.team_id].elo = row.elo;
    }
  }

  type Data = {
    date_friendly: string;
    elo?: number;
  };

  let bounds: [number | null, number | null] = [null, null];
  const formattedData: Data[] = [];

  for (let i = 0; i < sorted_date_of_ranks.length; i++) {
    const date_of_rank = sorted_date_of_ranks[i];

    const row = {
      date_friendly: Dates.format(date_of_rank, 'M jS'),
    };

    for (const team_id in date_of_rank_x_team_id_x_data[date_of_rank]) {
      const data = date_of_rank_x_team_id_x_data[date_of_rank][team_id];

      if (selectedChip in data) {
        const value = data[selectedChip];
        row[`${team_id}_${selectedChip}`] = value;

        // every team in the conference is its own line, so all of them feed the axis
        bounds = HelperChart.extend(bounds, value);
      }
    }

    formattedData.push(row);
  }


  // for elo connect the nulls
  if (selectedChip === 'elo') {
    // skip the first row
    for (let i = 1; i < formattedData.length; i++) {
      const lastRow = formattedData[i - 1];
      const currentRow = formattedData[i];

      // loop thru the last rows, add keys which are elo and not in current row, to connect the nulls
      for (const key in lastRow) {
        if (!(key in currentRow)) {
          const splat = key.split('_');
          if (
            splat.length === 2 &&
            splat[1] === 'elo'
          ) {
            currentRow[key] = lastRow[key];
          }
        }
      }
    }
  }

  // elo keeps its flat +/- 20, which already reads well against a conference's spread of lines
  const domain = selectedChip === 'elo' ?
    HelperChart.padDomain(bounds[0], bounds[1], 20) :
    HelperChart.getDomain(bounds[0], bounds[1]);


  const YAxisProps: YAxisProps = { scale: 'auto' };
  if (domain) {
    YAxisProps.domain = domain;
  }


  const getRankingGraph = () => {
    const renderLegend = ({ payload }) => (
      <ChartLegend
        payload = {payload}
        inactive = {series.inactive}
        onToggle = {series.toggle}
        layout = {width > breakPoint ? 'vertical' : 'horizontal'}
        size = 'caption'
      />
    );

    // many teams share one plot, so reading the hovered column best-first is the point of the
    // tooltip here rather than a nicety
    const sortTooltipEntries = (a, b) => {
      const column = allColumns[selectedChip];

      if (column.sort === 'higher') {
        return a.value > b.value ? -1 : 1;
      }

      if (column.sort === 'lower') {
        return a.value > b.value ? 1 : -1;
      }

      return 0;
    };

    const formatTooltipLabel = (row, label) => (
      row && row.date ? Dates.format(row.date, 'M jS \'y') : label
    );

    const getLines = () => {
      const lines: React.JSX.Element[] = [];
      for (const team_id in teams) {
        const team = teams[team_id];
        const TeamHelper = new Team({ team });
        const key = `${team_id}_${selectedChip}`;
        lines.push(
          <Line type = 'monotone' hide={series.isHidden(key)} name = {TeamHelper.getNameShort()} dataKey = {key} stroke = {Color.getTextColor(TeamHelper.getPrimaryColor(), backgroundColor)} strokeWidth={2} dot = {false} connectNulls = {true} />,
        );
      }

      return lines;
    };

    return (
      <>
        <div style = {{ display: 'flex', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                right: 10,
              }}
            >
              <CartesianGrid stroke = {palette.grid} />
              <XAxis dataKey = {'date_friendly'} minTickGap={20} tickLine = {false} axisLine = {false} type='category' />
              <YAxis {...YAxisProps}>
                <Label offset={10} value={(selectedChip in allColumns ? allColumns[selectedChip].getLabel() : 'Rank')} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: theme.info.main, fontSize: 18 }} />
              </YAxis>
              {
                width > breakPoint ?
                <Legend layout='vertical' align='right' verticalAlign='middle' content={renderLegend} /> :
                <Legend layout='horizontal' align='center' verticalAlign='top' content={renderLegend} />
              }
              {
                width > breakPoint ?
                  <Brush dataKey = 'name' startIndex={0} height={20} stroke = {theme.success.dark} /> :
                  ''
              }
              <RechartsTooltip cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }} content={<ChartTooltip formatLabel = {formatTooltipLabel} sortEntries = {sortTooltipEntries} />} />
              {getLines()}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style = {{ textAlign: 'center', marginLeft: 20 }}><Typography type='subtitle2' style = {{ color: theme.info.main }}>Date of rank</Typography></div>
      </>
    );
  };



  return (
    <Contents>
      <div style = {{ padding: '10px 10px 0px 10px', textAlign: 'center' }}>
        {statsCompareChips}
        {!formattedData.length ? <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>Nothing here yet...</Typography> : ''}
        {formattedData.length ? getRankingGraph() : ''}
      </div>
    </Contents>
  );
};

export { Client, ClientSkeleton };
