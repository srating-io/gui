'use client';

import {
  Area, CartesianGrid, ComposedChart, Label, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import HelperChart from '@/components/helpers/Chart';
import { Typography, useTheme } from '@esmalley/react-material-ui';

/**
 * A consensus line with the spread of its sources behind it.
 *
 * A single number implies an agreement that often is not there. When every book has the same
 * line, the band collapses to the line and the number means what it says; when they are two
 * points apart, the band opens and the reader can see that the market has not made its mind up -
 * which is itself the signal, and is exactly what a lone consensus figure hides.
 *
 * The band is the same hue as the line at low opacity rather than a second colour, because it is
 * not a second series: it is the uncertainty around this one.
 */
const ChartBandLine = (
  {
    rows,
    bandKey,
    lineKey,
    xAxisDataKey,
    yAxisLabel,
    height = 300,
    caption,
    tooltipLabel,
    formatValue,
  }:
  {
    rows: object[];
    /** Field holding a [low, high] pair. */
    bandKey: string;
    lineKey: string;
    xAxisDataKey: string;
    yAxisLabel: string;
    height?: number;
    caption?: string;
    tooltipLabel?: string;
    formatValue?: (value: number) => string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  if (!rows.length) {
    return null;
  }

  let bounds: [number | null, number | null] = [null, null];

  for (const row of rows) {
    bounds = HelperChart.extend(bounds, row[lineKey]);

    // the axis has to clear the band, not just the line it wraps
    const band = row[bandKey];

    if (Array.isArray(band)) {
      bounds = HelperChart.extend(bounds, band[0]);
      bounds = HelperChart.extend(bounds, band[1]);
    }
  }

  const domain = HelperChart.getDomain(bounds[0], bounds[1]);

  return (
    <div>
      <div style = {{ height, padding: '0px 5px' }}>
        <ResponsiveContainer width = '100%' height = '100%'>
          <ComposedChart data = {rows} margin = {{ top: 10, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke = {palette.grid} />
            <XAxis dataKey = {xAxisDataKey} minTickGap = {20} tickLine = {false} axisLine = {false} type = 'category' />
            <YAxis {...(domain ? { domain } : {})} width = {56} tickLine = {false} axisLine = {false}>
              <Label offset = {10} value = {yAxisLabel} angle = {-90} position = 'insideLeft' style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 14 }} />
            </YAxis>
            <Tooltip
              cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }}
              content = {
                <ChartTooltip
                  formatLabel = {(row, label) => row[tooltipLabel || xAxisDataKey] || label}
                  formatValue = {(entry) => {
                    const value = entry.value as unknown;

                    if (Array.isArray(value)) {
                      const [low, high] = value;

                      return low === high ?
                        'every book agrees' :
                        `${formatValue ? formatValue(low) : low} to ${formatValue ? formatValue(high) : high}`;
                    }

                    return formatValue ? formatValue(Number(value)) : `${value}`;
                  }}
                />
              }
            />
            <Area
              type = 'monotone'
              name = 'Book range'
              dataKey = {bandKey}
              stroke = 'none'
              fill = {palette.series(0)}
              fillOpacity = {0.22}
              connectNulls = {true}
              isAnimationActive = {false}
            />
            <Line
              type = 'monotone'
              name = 'Consensus'
              dataKey = {lineKey}
              stroke = {palette.series(0)}
              strokeWidth = {2}
              dot = {false}
              connectNulls = {true}
              isAnimationActive = {false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {
        caption ?
          <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center' }}>{caption}</Typography>
          : ''
      }
    </div>
  );
};

export default ChartBandLine;
