'use client';

import RankSpan from '@/components/generic/RankSpan';
import { Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { Textor } from '@esmalley/ts-utils';

export type ChartTooltipEntry = {
  value: number;
  name: string;
  stroke?: string;
  color?: string;
  dataKey?: string;
  unit?: string;
  payload?: object;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;
  /**
   * Turns the hovered row into the tooltip's heading. Defaults to the x value, which is right for
   * most charts; pass one when the axis shows a short form and the tooltip should spell it out.
   */
  formatLabel?: (row: object, label?: string | number) => React.ReactNode;
  /**
   * Turns a series value into what the reader sees. Handed the whole row so it can reach sibling
   * fields, which is how the rank suffix below finds its own column.
   */
  formatValue?: (entry: ChartTooltipEntry, row: object) => React.ReactNode;
  /**
   * When set, a series carrying unit='rank' also shows its rank out of this many. The unit prop is
   * doing duty as a marker here, which is why it is spelled out rather than inferred.
   */
  rankMax?: number;
  /**
   * Orders the rows. Worth passing on a chart with many series, where reading the hovered values
   * best-first is the whole point; recharts' own order follows the series declaration.
   */
  sortEntries?: (a: ChartTooltipEntry, b: ChartTooltipEntry) => number;
};

/**
 * The tooltip every chart shares.
 *
 * Tooltips enhance, they never gate: every value is also reachable from the axis, the legend, or
 * the table the surface offers. Keyboard focus shows the same content as hover.
 */
const ChartTooltip = (
  { active, payload, label, formatLabel, formatValue, rankMax = 0, sortEntries }: ChartTooltipProps,
) => {
  const theme = useTheme();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const row = payload[0].payload || {};

  const heading = formatLabel ? formatLabel(row, label) : label;

  // copied before sorting: the array recharts hands over is its own
  const entries = sortEntries ? [...payload].sort(sortEntries) : payload;

  return (
    <Paper elevation = {3} style = {{ padding: '5px 10px' }}>
      <div>
        <Typography type = 'subtitle2' style = {{ color: theme.text.secondary }}>{heading}</Typography>
      </div>
      {
        entries.map((entry, index) => {
          const color = entry.stroke || entry.color;
          const rank = rankMax && entry.unit === 'rank' && entry.dataKey ? row[`${entry.dataKey}_rank`] : null;

          return (
            <div key = {`${entry.dataKey || entry.name}-${index}`} style = {{ display: 'flex' }}>
              <Typography type = 'body1' style = {{ color }}>{Textor.toSentenceCase(entry.name)}:</Typography>
              <Typography type = 'body1' style = {{ marginLeft: 5, color }}>
                {formatValue ? formatValue(entry, row) : entry.value}
                {rank ? <RankSpan rank = {rank} max = {rankMax} useOrdinal = {true} /> : ''}
              </Typography>
            </div>
          );
        })
      }
    </Paper>
  );
};

export default ChartTooltip;
