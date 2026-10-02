'use client';

import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import { Typography, useTheme } from '@esmalley/react-material-ui';

export type RadarSpoke = {
  key: string;
  label: string;
  /** 0 to 100, where 100 is the best in the league on this measure. */
  percentile: number;
  /** The underlying figure and rank, read in the tooltip and in the table beside the chart. */
  detail: string;
};

/**
 * A player's skills as percentiles, on one loop.
 *
 * What a radar is good for is shape, and nothing else: a wedge pushed out on one side and flat on
 * the other is a specialist, an even ring is an all-rounder, and both register before a single
 * number is read. What it is bad for is comparing two spokes against each other, because the eye
 * judges the area of a wedge rather than its radius and area goes as the square.
 *
 * So the numbers are printed beside it rather than left to the shape. The chart answers "what kind
 * of player is this" and the list answers "how good, exactly" - and the list is the part a reader
 * should use for anything that matters.
 */
const ChartPercentileRadar = (
  {
    spokes,
    title,
    height = 300,
    caption,
  }:
  {
    spokes: RadarSpoke[];
    title?: string;
    height?: number;
    caption?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  const usable = spokes.filter((spoke) => Number.isFinite(spoke.percentile));

  // three spokes is the least that encloses an area; below that the shape means nothing
  if (usable.length < 3) {
    return null;
  }

  return (
    <div>
      <Typography type = 'body1' style = {{ padding: '0px 5px' }}>{title || 'Skill profile'}</Typography>
      <div style = {{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style = {{ flex: '1 1 300px', minWidth: 260, height }}>
          <ResponsiveContainer width = '100%' height = '100%'>
            <RadarChart data = {usable} outerRadius = '72%'>
              <PolarGrid stroke = {palette.grid} />
              <PolarAngleAxis dataKey = 'label' tick = {{ fill: palette.ink.secondary, fontSize: 11 }} />
              {/* the ring is always the whole league, so two players' shapes are drawn on the same
                  frame and can be held side by side */}
              <PolarRadiusAxis domain = {[0, 100]} tick = {false} axisLine = {false} />
              <Tooltip
                content = {
                  <ChartTooltip
                    formatLabel = {(row) => (row as RadarSpoke).label}
                    formatValue = {(entry, row) => `${(row as RadarSpoke).detail} · ${Math.round(Number(entry.value))}th pct`}
                  />
                }
              />
              <Radar
                name = 'Percentile'
                dataKey = 'percentile'
                stroke = {palette.series(0)}
                strokeWidth = {2}
                fill = {palette.series(0)}
                fillOpacity = {0.35}
                isAnimationActive = {false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {/* the table view the shape is not a substitute for */}
        <div style = {{ flex: '1 1 220px', minWidth: 200, padding: '0px 10px' }}>
          {usable.map((spoke) => (
            <div key = {spoke.key} style = {{ display: 'flex', justifyContent: 'space-between', padding: '2px 0px' }}>
              <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{spoke.label}</Typography>
              <Typography type = 'caption'>{spoke.detail} · {Math.round(spoke.percentile)}th</Typography>
            </div>
          ))}
        </div>
      </div>
      {
        caption ?
          <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center' }}>{caption}</Typography>
          : ''
      }
    </div>
  );
};

export default ChartPercentileRadar;
