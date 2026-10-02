'use client';

import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { ChartDivergingArea, ChartTooltip, getChartPalette } from '@/components/generic/Chart';
import { Typography, useTheme } from '@esmalley/react-material-ui';

export type GameFlowRow = {
  time: string;
  /** Home score minus away score. Positive means the home side is ahead. */
  margin: number;
  /** Vig free home win probability, 0 to 100, or null where the book gave no price. */
  home_win_probability: number | null;
};

/**
 * The two readings a finished or running game is actually about, on one clock.
 *
 * The scoreboard says who won. What it does not say is whether the game was ever in doubt, and
 * those are different questions - a six point win that was a nineteen point lead with eight
 * minutes left is not the same game as a six point win that was level throughout. The margin
 * panel answers the second question and the win probability panel answers it again in the terms
 * the market used at the time, which is the closest thing to a record of what the game felt like
 * while it was happening.
 *
 * They are stacked rather than overlaid because they are different measures - points and a
 * percentage - and putting a percentage on a second y axis beside points would invent a
 * correspondence between the two scales that nothing in the data supports. Stacked on a shared
 * clock, a reader can still drop a vertical line through both.
 */
const GameFlow = (
  {
    rows,
    homeColor,
    awayColor,
    homeName,
    awayName,
  }:
  {
    rows: GameFlowRow[];
    homeColor: string;
    awayColor: string;
    homeName: string;
    awayName: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  const probabilities = rows
    .map((row) => row.home_win_probability)
    .filter((value): value is number => value !== null && value !== undefined);

  const hasProbability = probabilities.length > 0;

  // the fill runs between the line and the coin flip, so the shape reaches from the furthest the
  // line strayed on one side to the furthest on the other, with 50 always inside it. The gradient
  // is painted across that shape's box rather than the plot's, so the stop goes where 50 falls in
  // it - otherwise the colours swap somewhere other than the halfway line
  const probabilityMax = Math.max(50, ...probabilities);
  const probabilityMin = Math.min(50, ...probabilities);
  const probabilityOffset = probabilityMax === probabilityMin ?
    0.5 :
    (probabilityMax - 50) / (probabilityMax - probabilityMin);

  return (
    <div>
      {
        hasProbability ?
          <div>
            <Typography type = 'body1' style = {{ textAlign: 'left', padding: '0px 10px' }}>Win probability</Typography>
            <div style = {{ height: 190, padding: '0px 5px' }}>
              <ResponsiveContainer width = '100%' height = '100%'>
                <AreaChart data = {rows} margin = {{ top: 6, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id = 'game-flow-win-probability' x1 = '0' y1 = '0' x2 = '0' y2 = '1'>
                      <stop offset = {probabilityOffset} stopColor = {homeColor} stopOpacity = {0.85} />
                      <stop offset = {probabilityOffset} stopColor = {awayColor} stopOpacity = {0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke = {palette.grid} vertical = {false} />
                  {/* the clock is drawn once, under the lower panel, so the two plots stay the
                      same width and a reader can travel straight down between them */}
                  <XAxis dataKey = 'time' type = 'category' hide = {true} />
                  {/* no rotated axis title: this axis is the home side's chance, so a "Michigan"
                      label beside it reads as though the bottom half were Michigan's too. The key
                      under the panel says which colour is whom, which is the thing in doubt */}
                  <YAxis domain = {[0, 100]} ticks = {[0, 50, 100]} width = {52} tickLine = {false} axisLine = {false} unit = '%' />
                  {/* a coin flip is the line everything on this panel is read against */}
                  <ReferenceLine y = {50} stroke = {palette.ink.secondary} strokeWidth = {1} />
                  <Tooltip
                    cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }}
                    content = {
                      <ChartTooltip
                        formatValue = {(entry) => {
                          const number = Number(entry.value);

                          if (Number.isNaN(number)) {
                            return `${entry.value}`;
                          }

                          // stated as whoever is favoured rather than always as the home side, so
                          // the reader never has to do "100 minus" in their head
                          return number >= 50 ? `${homeName} ${Math.round(number)}%` : `${awayName} ${Math.round(100 - number)}%`;
                        }}
                      />
                    }
                  />
                  <Area
                    type = 'monotone'
                    name = 'Win probability'
                    dataKey = 'home_win_probability'
                    stroke = {palette.ink.secondary}
                    strokeWidth = {1}
                    fill = 'url(#game-flow-win-probability)'
                    baseValue = {50}
                    connectNulls = {true}
                    isAnimationActive = {false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style = {{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 2 }}>
              <div style = {{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style = {{
                  width: 10, height: 10, borderRadius: 2, backgroundColor: homeColor, display: 'inline-block',
                }} />
                <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{homeName} favoured</Typography>
              </div>
              <div style = {{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style = {{
                  width: 10, height: 10, borderRadius: 2, backgroundColor: awayColor, display: 'inline-block',
                }} />
                <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{awayName} favoured</Typography>
              </div>
            </div>
            <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center' }}>
              from the live money line, with the book&apos;s margin removed
            </Typography>
          </div>
          : ''
      }
      <Typography type = 'body1' style = {{ textAlign: 'left', padding: '10px 10px 0px 10px' }}>Scoring margin</Typography>
      <ChartDivergingArea
        rows = {rows}
        dataKey = 'margin'
        xAxisDataKey = 'time'
        positiveColor = {homeColor}
        negativeColor = {awayColor}
        positiveLabel = {homeName}
        negativeLabel = {awayName}
        yAxisLabel = 'Margin'
      />
    </div>
  );
};

export default GameFlow;
