'use client';

import React, { useMemo, useState } from 'react';
import Chart, { getChartPalette } from '@/components/generic/Chart';
import HelperChart from '@/components/helpers/Chart';
import { LineProps, YAxisProps } from 'recharts';
import { RankingColumns } from '@/types/general';
import { Chip, useTheme } from '@esmalley/react-material-ui';

import { trendRows } from '../data/trends';


const TrendsExample = () => {
  const standardColumns = [
    'adjusted_efficiency_rating',
    'points',
    'three_point_field_goal_percentage',
  ];


  const [selectedChip, setSelectedChip] = useState(standardColumns[0]);

  const allColumns = getAllColumns();

  const theme = useTheme();
  const palette = getChartPalette(theme);

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
        title = {column.label}
      />,
    );
  }

  const formattedData = trendRows;

  /**
   * Fitted to the three lines, the way the team page fits its own.
   *
   * A hand picked pair of bounds per statistic is a second thing to keep true: the pair this chart
   * carried held the adjusted margin to 0 - 60, which pinned a league that averages zero to the
   * floor of the plot, and held points to 70 - 100, which cut the top off a 121 point opener.
   */
  const domain = useMemo(() => {
    let bounds: [number | null, number | null] = [null, null];

    for (const row of formattedData) {
      bounds = HelperChart.extend(bounds, row[selectedChip]);
      bounds = HelperChart.extend(bounds, row[`conf_${selectedChip}`]);
      bounds = HelperChart.extend(bounds, row[`league_${selectedChip}`]);
    }

    return HelperChart.getDomain(bounds[0], bounds[1]);
  }, [formattedData, selectedChip]);

  let chart: React.JSX.Element | null = null;

  if (selectedChip in allColumns) {
    const statistic = allColumns[selectedChip];

    const lines: LineProps[] = [
      {
        type: 'monotone',
        name: statistic.label,
        dataKey: statistic.id,
        stroke: palette.series(0),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
      {
        type: 'monotone',
        name: `Conf. ${statistic.label}`,
        dataKey: `conf_${statistic.id}`,
        stroke: palette.series(1),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
      {
        type: 'monotone',
        name: `League ${statistic.label}`,
        dataKey: `league_${statistic.id}`,
        stroke: palette.series(2),
        strokeWidth: 2,
        dot: false,
        connectNulls: true,
      },
    ];

    const YAxisProps: YAxisProps = { scale: 'auto' };
    if (domain) {
      YAxisProps.domain = domain;
    }
    chart = <Chart key = {selectedChip} XAxisDataKey={'date_friendly'} YAxisLabel={statistic.label} rows={formattedData} lines={lines} YAxisProps={YAxisProps} />;
  }


  return (
    <>
      <div style = {{ padding: '10px 10px 0px 10px', textAlign: 'center' }}>
        {statsCompareChips}
        {chart}
      </div>
    </>
  );
};

const getAllColumns = (): RankingColumns => {
  return {
    three_point_field_goal_percentage: {
      id: 'three_point_field_goal_percentage',
      numeric: true,
      label: '3FG%',
      tooltip: 'Three field goal percentage',
      sort: 'higher',
    },
    adjusted_efficiency_rating: {
      id: 'adjusted_efficiency_rating',
      numeric: true,
      label: 'aEM',
      tooltip: 'Adjusted Efficiency margin (Offensive rating - Defensive rating) + aSOS',
      sort: 'higher',
    },
    points: {
      id: 'points',
      numeric: true,
      label: 'PTS',
      tooltip: 'Average points per game',
      sort: 'higher',
    },
  };
};

export default TrendsExample;
