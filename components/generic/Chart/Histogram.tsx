'use client';

import {
  Bar, BarChart, CartesianGrid, Label, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import { Typography, useTheme } from '@esmalley/react-material-ui';

/**
 * How a measure is spread across the whole league, with one value called out on it.
 *
 * Every other chart here answers "what is this number". None of them answer "is that a lot", and
 * without the shape of the league behind it a rating of 118 is a digit rather than a fact. Once
 * the distribution is drawn the answer is a position: out on the thin right tail, or buried in the
 * bar where two hundred other teams also sit.
 *
 * The shape matters as much as the position. A measure where everyone clusters and three teams
 * escape is a different kind of measure from one that spreads evenly, and being first means
 * something different in each.
 */
const ChartHistogram = (
  {
    values,
    marker,
    xLabel,
    bins = 24,
    height = 260,
    noun = 'values',
    markerHint,
  }:
  {
    values: number[];
    /** The one value to call out, normally whoever the reader is looking for. */
    marker?: { value: number; label: string } | null;
    xLabel: string;
    bins?: number;
    height?: number;
    /** What one observation is, for the count in the caption - 'teams', 'players', 'games'. */
    noun?: string;
    /** How the reader would place their own mark on this, read only while there is no marker. */
    markerHint?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  const usable = values.filter((value) => typeof value === 'number' && Number.isFinite(value));

  // a handful of observations do not make a distribution worth drawing - the bars would be noise
  // the reader could mistake for a shape
  if (usable.length < 8) {
    return null;
  }

  const low = Math.min(...usable);
  const high = Math.max(...usable);
  const span = high - low;

  if (span <= 0) {
    return null;
  }

  const width = span / bins;

  let decimals = 2;

  if (width >= 10) {
    decimals = 0;
  } else if (width >= 1) {
    decimals = 1;
  }

  const buckets = Array.from({ length: bins }, (unused, index) => ({
    // the label is the bucket's own floor, so the axis reads as a number line rather than as
    // twenty four opaque category names
    label: (low + (index * width)).toFixed(decimals),
    from: low + (index * width),
    count: 0,
  }));

  for (const value of usable) {
    // the top value belongs in the last bucket rather than in a twenty fifth of its own
    const index = Math.min(Math.floor((value - low) / width), bins - 1);
    buckets[index].count++;
  }

  const getBucketLabel = (value: number) => {
    const index = Math.min(Math.max(Math.floor((value - low) / width), 0), bins - 1);

    return buckets[index].label;
  };

  const sorted = [...usable].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // where the marked value sits, or - when nothing is marked - how the reader would mark one
  let captionTail = '';

  if (marker) {
    captionTail = ` · ${marker.label} at ${marker.value}`;
  } else if (markerHint) {
    captionTail = ` · ${markerHint}`;
  }

  return (
    <div>
      <div style = {{ height, padding: '0px 5px' }}>
        <ResponsiveContainer width = '100%' height = '100%'>
          <BarChart data = {buckets} margin = {{ top: 16, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke = {palette.grid} vertical = {false} />
            <XAxis dataKey = 'label' minTickGap = {16} tickLine = {false} axisLine = {false} type = 'category'>
              <Label value = {xLabel} position = 'insideBottom' offset = {-2} style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 13 }} />
            </XAxis>
            <YAxis width = {44} tickLine = {false} axisLine = {false} allowDecimals = {false} />
            <Tooltip
              cursor = {{ fill: palette.grid, fillOpacity: 0.4 }}
              content = {
                <ChartTooltip
                  formatLabel = {(row) => `from ${(row as { label: string }).label}`}
                  formatValue = {(entry) => `${entry.value} teams`}
                />
              }
            />
            {/* the middle of the distribution, so "above average" is a place on the page */}
            <ReferenceLine x = {getBucketLabel(median)} stroke = {palette.muted} strokeDasharray = '4 4' />
            {
              marker ?
                <ReferenceLine
                  x = {getBucketLabel(marker.value)}
                  stroke = {palette.diverging(0)}
                  strokeWidth = {2}
                  label = {{
                    value: marker.label,
                    position: 'top',
                    fill: palette.diverging(0),
                    fontSize: 11,
                  }}
                />
                : null
            }
            <Bar dataKey = 'count' fill = {palette.series(0)} fillOpacity = {0.75} isAnimationActive = {false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center' }}>
        {usable.length} {noun} · dashed line is the median{captionTail}
      </Typography>
    </div>
  );
};

export default ChartHistogram;
