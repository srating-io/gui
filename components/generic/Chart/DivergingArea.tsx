'use client';

import { useId } from 'react';
import {
  Area, AreaChart, CartesianGrid, Label, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import HelperChart from '@/components/helpers/Chart';
import { Typography, useTheme } from '@esmalley/react-material-ui';

/**
 * One measure that runs either side of a meaningful zero, filled to the zero line.
 *
 * A margin plotted as an ordinary line asks the reader to hold "which side of the axis is this"
 * in their head for the whole game. Filling to zero and colouring each side means the answer is
 * already on the page: who was ahead is the colour, and by how much is the height. The run of
 * colour across the x axis is then the shape of the game.
 *
 * The two colours are the two entities, so they are passed in rather than taken from the
 * categorical order - on a game page they are the teams' own colours, which the reader has
 * already learnt from the header.
 */
const ChartDivergingArea = (
  {
    rows,
    dataKey,
    xAxisDataKey,
    positiveColor,
    negativeColor,
    positiveLabel,
    negativeLabel,
    legendPositive,
    legendNegative,
    yAxisLabel,
    height = 170,
    showXAxis = true,
    tooltipLabel,
  }:
  {
    rows: object[];
    dataKey: string;
    xAxisDataKey: string;
    /** Colour for the half above zero, and the entity it belongs to. */
    positiveColor: string;
    negativeColor: string;
    /** Short name for each side, read in the tooltip right after the value. */
    positiveLabel: string;
    negativeLabel: string;
    /** Legend wording, when "<label> ahead" is not what the two sides mean. */
    legendPositive?: string;
    legendNegative?: string;
    yAxisLabel: string;
    height?: number;
    /** False when this panel is stacked under another that already carries the axis. */
    showXAxis?: boolean;
    tooltipLabel?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  // useId rather than a counter: two of these on one page would otherwise share a gradient id,
  // and the second would silently repaint the first
  const gradientId = `diverging-${useId().replace(/:/g, '')}`;

  if (!rows.length) {
    return null;
  }

  let bounds: [number | null, number | null] = [null, null];

  for (const row of rows) {
    bounds = HelperChart.extend(bounds, row[dataKey]);
  }

  // the frame is held symmetric about zero so that a ten point lead and a ten point deficit are
  // the same height. Letting each side size itself would make the smaller one look bigger than
  // it was whenever the game was lopsided
  const reach = Math.max(Math.abs(bounds[0] ?? 0), Math.abs(bounds[1] ?? 0)) || 1;
  const domain = HelperChart.getDomain(-reach, reach) || [-reach, reach];

  // A gradient is painted across the filled shape's own bounding box, not across the plot, so the
  // colour stop belongs where zero falls between the lowest and highest point the shape reaches -
  // not where zero falls on the axis. The shape always reaches zero, because zero is its baseline.
  const shapeMax = Math.max(bounds[1] ?? 0, 0);
  const shapeMin = Math.min(bounds[0] ?? 0, 0);
  const offset = shapeMax === shapeMin ? 0.5 : shapeMax / (shapeMax - shapeMin);

  return (
    <div style = {{ height, padding: '0px 5px' }}>
      <ResponsiveContainer width = '100%' height = '100%'>
        <AreaChart data = {rows} margin = {{ top: 6, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id = {gradientId} x1 = '0' y1 = '0' x2 = '0' y2 = '1'>
              <stop offset = {offset} stopColor = {positiveColor} stopOpacity = {0.85} />
              <stop offset = {offset} stopColor = {negativeColor} stopOpacity = {0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke = {palette.grid} vertical = {false} />
          <XAxis
            dataKey = {xAxisDataKey}
            minTickGap = {20}
            tickLine = {false}
            axisLine = {false}
            type = 'category'
            hide = {!showXAxis}
          />
          {/* three labels, the floor, zero and the ceiling; recharts' own picking lands on values
              like 1.9 that mean nothing on a symmetric frame */}
          <YAxis domain = {domain} ticks = {[domain[0], 0, domain[1]]} width = {52} tickLine = {false} axisLine = {false}>
            <Label offset = {10} value = {yAxisLabel} angle = {-90} position = 'insideLeft' style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 14 }} />
          </YAxis>
          {/* zero is the whole point of the chart, so it is drawn rather than left to the grid */}
          <ReferenceLine y = {0} stroke = {palette.ink.secondary} strokeWidth = {1} />
          <Tooltip
            cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }}
            content = {
              <ChartTooltip
                formatLabel = {(row, label) => row[tooltipLabel || xAxisDataKey] || label}
                formatValue = {(entry) => {
                  const number = Number(entry.value);

                  if (Number.isNaN(number)) {
                    return `${entry.value}`;
                  }

                  // the sign is carried by the colour and by the team named beside it, so a bare
                  // "-8" here would only read as a second, contradictory minus
                  return `${Math.abs(number)} ${number < 0 ? negativeLabel : positiveLabel}`;
                }}
              />
            }
          />
          <Area
            type = 'monotone'
            name = {yAxisLabel}
            dataKey = {dataKey}
            stroke = {palette.ink.secondary}
            strokeWidth = {1}
            fill = {`url(#${gradientId})`}
            connectNulls = {true}
            isAnimationActive = {false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* which colour is which team, stated once - the fill has no legend of its own and the
          reader should not have to infer it from who happened to win */}
      <div style = {{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 2 }}>
        <div style = {{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style = {{
            width: 10, height: 10, borderRadius: 2, backgroundColor: positiveColor, display: 'inline-block',
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{legendPositive || `${positiveLabel} ahead`}</Typography>
        </div>
        <div style = {{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style = {{
            width: 10, height: 10, borderRadius: 2, backgroundColor: negativeColor, display: 'inline-block',
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{legendNegative || `${negativeLabel} ahead`}</Typography>
        </div>
      </div>
    </div>
  );
};

export default ChartDivergingArea;
