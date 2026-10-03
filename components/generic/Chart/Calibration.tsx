'use client';

import {
  CartesianGrid, Label, LabelList, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import { Typography, useTheme } from '@esmalley/react-material-ui';

export type CalibrationPoint = {
  key: string;
  /** What was claimed, as a percentage. Normally the midpoint of a confidence band. */
  predicted: number;
  /** What happened, as a percentage of that band's games. */
  observed: number;
  total: number;
  correct: number;
  label: string;
};

/**
 * Claimed confidence against what actually happened.
 *
 * An accuracy percentage answers "how often is it right" and stops there, which lets two very
 * different models look identical: one that says 90% and is right 90% of the time, and one that
 * says 90% and is right 70% of the time, can post the same overall number once the easy games
 * are averaged in. This plot separates them. Every point on the diagonal means the stated
 * confidence was the truth; a point below it means the claim was too bold at that confidence,
 * and above means it was too timid.
 *
 * It is the one chart that can be read against its author rather than for them, which is exactly
 * why it is worth publishing.
 *
 * Marks are sized by how many games stand behind them, because a band holding nine games and a
 * band holding nine hundred should not argue with equal force.
 */
const ChartCalibration = (
  {
    points,
    height = 380,
    caption,
  }:
  {
    points: CalibrationPoint[];
    height?: number;
    caption?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  const usable = points.filter((point) => point.total > 0);

  if (!usable.length) {
    return null;
  }

  // the frame starts at the lowest band rather than at zero: nothing here ever claims 20%, and an
  // empty left half would shrink the part that carries the reading
  const lowest = Math.min(...usable.map((point) => Math.min(point.predicted, point.observed)));
  const floor = Math.max(0, Math.floor((lowest - 5) / 10) * 10);

  const biggest = Math.max(...usable.map((point) => point.total));

  // recharts spreads the row's own fields over the shape's props alongside the placement
  const Mark = ({ cx, cy, payload }: { cx?: number; cy?: number; payload?: CalibrationPoint }) => {
    if (cx === null || cy === null || cx === undefined || cy === undefined) {
      return <g />;
    }

    // area, not radius, carries the sample size - a radius scale would make a band with ten times
    // the games look a hundred times as heavy
    const radius = 6 + (14 * Math.sqrt(((payload && payload.total) || 0) / (biggest || 1)));

    return (
      <g>
        <circle cx = {cx} cy = {cy} r = {radius} fill = {palette.series(0)} fillOpacity = {0.55} />
        <circle cx = {cx} cy = {cy} r = {radius} fill = 'none' stroke = {palette.surface} strokeWidth = {2} />
      </g>
    );
  };

  return (
    <div>
      <div style = {{ height, padding: '0px 5px' }}>
        <ResponsiveContainer width = '100%' height = '100%'>
          {/* the right margin is the room the topmost band's own label sits in, outside the plot */}
          <ScatterChart margin = {{ top: 16, right: 52, bottom: 8, left: 0 }}>
            <CartesianGrid stroke = {palette.grid} />
            <XAxis
              type = 'number'
              dataKey = 'predicted'
              name = 'Predicted'
              domain = {[floor, 100]}
              ticks = {[floor, (floor + 100) / 2, 100]}
              tickLine = {false}
              axisLine = {false}
              unit = '%'
            >
              <Label value = 'Predicted' position = 'insideBottom' offset = {-6} style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 14 }} />
            </XAxis>
            <YAxis
              type = 'number'
              dataKey = 'observed'
              name = 'Actual'
              domain = {[floor, 100]}
              ticks = {[floor, (floor + 100) / 2, 100]}
              width = {56}
              tickLine = {false}
              axisLine = {false}
              unit = '%'
            >
              <Label value = 'Actual' angle = {-90} position = 'insideLeft' offset = {10} style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 14 }} />
            </YAxis>
            {/* no dataKey: the mark sizes itself off the row, and a third keyed axis would only
                add a third tooltip row saying what the second one already says */}
            <ZAxis range = {[60, 60]} />
            {/* the line the whole chart is read against: on it, the claim was the truth */}
            <ReferenceLine
              segment = {[{ x: floor, y: floor }, { x: 100, y: 100 }]}
              stroke = {palette.ink.secondary}
              strokeDasharray = '4 4'
            />
            <Tooltip
              cursor = {{ strokeDasharray: '3 3' }}
              content = {
                <ChartTooltip
                  formatLabel = {(row) => (row as CalibrationPoint).label}
                  formatValue = {(entry, row) => {
                    const point = row as CalibrationPoint;

                    // one row per axis, so each has to answer for its own axis - returning the
                    // whole summary here prints it once per row and tells the reader nothing
                    if (entry.dataKey === 'observed') {
                      return `${point.observed}% (${point.correct} of ${point.total})`;
                    }

                    return `${point.predicted}%`;
                  }}
                />
              }
            />
            <Scatter data = {usable} shape = {<Mark />} isAnimationActive = {false}>
              {/* five marks is few enough to name every one, so the reader never has to cross
                  reference a legend to find which band they are looking at */}
              <LabelList
                dataKey = 'label'
                position = 'right'
                offset = {14}
                style = {{ fill: palette.ink.secondary, fontSize: 11 }}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center' }}>
        {caption || 'on the dashed line the stated confidence matched reality · below it the call was too bold, above it too cautious · mark size is games'}
      </Typography>
    </div>
  );
};

export default ChartCalibration;
