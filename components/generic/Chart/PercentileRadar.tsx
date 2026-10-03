'use client';

import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import RankSpan from '@/components/generic/RankSpan';
import { getChartPalette } from './palette';
import { Numbers } from '@esmalley/ts-utils';
import { Typography, useTheme } from '@esmalley/react-material-ui';

export type RadarSpoke = {
  key: string;
  label: string;
  /** 0 to 100, where 100 is the best in the league on this measure. */
  percentile: number;
  /** The rank the percentile was derived from, printed beside the figure as a RankSpan. */
  rank: number;
  /** The underlying figure, read in the tooltip and in the table beside the chart. */
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
 *
 * The rank in that list is the same RankSpan the stat tables print, rather than the percentile the
 * shape is drawn from. A percentile is the right thing to plot, because every spoke has to share
 * one ring, and the wrong thing to read: "95th" and "262nd of 5634" are the same fact, and only
 * one of them carries its denominator.
 */
const ChartPercentileRadar = (
  {
    spokes,
    max,
    title,
    height = 300,
    caption,
  }:
  {
    spokes: RadarSpoke[];
    /** Number of ranked players; the denominator every rank beside the shape is measured against. */
    max: number;
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
                    formatValue = {(entry, row) => `${(row as RadarSpoke).detail} · ${Numbers.formatOrdinal(Math.round(Number(entry.value)))} pct`}
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
            <div key = {spoke.key} style = {{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0px',
            }}>
              <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{spoke.label}</Typography>
              <div style = {{ display: 'flex', alignItems: 'center' }}>
                <Typography type = 'caption'>{spoke.detail}</Typography>
                <RankSpan rank = {spoke.rank} max = {max} useOrdinal = {true} />
              </div>
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
