'use client';

import {
  LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, ReferenceLine, LineProps, ReferenceLineProps, YAxisProps,
} from 'recharts';

import ChartLegend from './ChartLegend';
import ChartTooltip from './ChartTooltip';
import useInactiveSeries from './useInactiveSeries';
import { getChartPalette } from './palette';
import { useTheme } from '@esmalley/react-material-ui';

/**
 * Normalized chart display.
 * If you pass in rankMax it will attempt to add Rankspan to tooltip if the Line has a unit = 'rank'
 *
 * Callers that swap the plotted statistic - the chip rows on the team, player, game and compare
 * trends - pass a `key` of the selected column. recharts only tweens between two sets of points
 * when its own bookkeeping says the data changed exactly once, and switching a chip changes the
 * dataKey underneath it rather than the values, which it does not reliably treat as a transition.
 * Keying on the column remounts the chart instead, so the new statistic draws itself in, which is
 * the behaviour the chips had before and the one recharts does handle dependably.
 */
const Chart = (
  {
    rows,
    lines,
    referenceLines,
    YAxisProps,
    XAxisDataKey,
    YAxisLabel,
    rankMax = 0,
    tooltipLabel,
  }:
  {
    rows: object[],
    lines: LineProps[],
    referenceLines?: ReferenceLineProps[],
    YAxisProps: YAxisProps,
    XAxisDataKey: string,
    YAxisLabel: string,
    rankMax?: number,
    tooltipLabel?: string,
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  const series = useInactiveSeries();

  return (
    <div style = {{ display: 'flex', height: 300, padding: '0px 5px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={rows}
          margin={{
            right: 10,
          }}
        >
          <CartesianGrid stroke = {palette.grid} />
          <XAxis dataKey = {XAxisDataKey} minTickGap={20} tickLine = {false} axisLine = {false} type='category' /* interval={'preserveStartEnd'} */ />
          <YAxis {...YAxisProps}>
            <Label offset={10} value={YAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: theme.info.main, fontSize: 18 }} />
          </YAxis>
          {
            referenceLines ?
              referenceLines.map((referenceLine, index) => {
                // {..referenceLine} spread doesnt work for some reason... I guess if you add a prop then add it here too >.<
                return <ReferenceLine key = {index} x = {referenceLine.x} stroke = {referenceLine.stroke} label = {referenceLine.label} />;
              }) :
              ''
          }
          <Legend
            layout='horizontal'
            align='center'
            verticalAlign='bottom'
            margin = {{ top: 0, left: 10, right: 0, bottom: 0 }}
            content={({ payload }) => <ChartLegend payload = {payload} inactive = {series.inactive} onToggle = {series.toggle} />}
          />
          <Tooltip
            cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }}
            content={
              <ChartTooltip
                rankMax = {rankMax}
                formatLabel = {(row, label) => row[tooltipLabel || XAxisDataKey] || label}
              />
            }
          />
          {
            lines.map((line, index) => {
              // {..line} spread doesnt work for some reason... I guess if you add a prop then add it here too >.<
              return (
                <RechartsLine
                  key = {index}
                  hide = {series.isHidden(line.dataKey as string)}
                  type={line.type}
                  name={line.name}
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  dot={line.dot}
                  connectNulls={line.connectNulls}
                  unit={line.unit}
                  // recharts only mounts a line's dots once its entrance animation has finished, so
                  // a dots-only series - one drawn with no stroke - shows nothing at all until then.
                  // Those series opt out and appear straight away; everything else still draws in.
                  isAnimationActive={line.isAnimationActive}
                />
              );
            })
          }
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
