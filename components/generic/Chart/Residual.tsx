'use client';

import {
  CartesianGrid, Label, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import { Typography, useTheme } from '@esmalley/react-material-ui';

export type ResidualPoint = {
  key: string;
  label: string;
  predicted: number;
  actual: number;
};

/**
 * What was predicted against what happened, one mark per game.
 *
 * An accuracy percentage counts how often the winner was called and throws away everything about
 * by how much, which is where bias hides: a model can pick the right side nine times in ten while
 * being four points high on every single one of them, and the percentage will never say so. Here
 * that shows up immediately as a cloud sitting off the diagonal rather than straddling it.
 *
 * Three readings come out of the same picture, and they are deliberately given three different
 * channels so that none of them has to be hunted for:
 *
 *   - POSITION against the dashed diagonal is the error. Scatter around it is noise, which is
 *     mostly the sport; a cloud consistently to one side is bias, which is the model, and the
 *     mean residual in the caption puts a number on it.
 *   - color is how far that one call missed, so a one-point near-miss and a thirty-point blowout
 *     stop looking alike. The eye finds the bad nights without measuring anything.
 *   - The SHADED corners are the calls that picked the wrong winner outright. They were two bare
 *     reference lines at zero before, one shade off the gridlines and named nowhere, which made
 *     the most meaningful lines on the chart read as decoration.
 *
 * color and quadrant are kept apart on purpose. Quadrant correctness is the coarser of the two
 * and sometimes the more misleading - a game called at +1 that finishes -1 picked the wrong side
 * while being the model's best night of the season - so it gets the quieter channel, and the
 * honest measure of error gets the loud one.
 *
 * The frame takes equal scales on both axes and is kept near square, because "distance from the
 * line" is only readable when the diagonal is near 45 degrees. It is no longer forced symmetric
 * about zero: a team that is rarely predicted to lose was spending three of its four quadrants on
 * empty space, and the cloud that carries the whole reading was squashed into the corner.
 */
const ChartResidual = (
  {
    points,
    xLabel,
    yLabel,
    caption,
    /**
     * The miss, in the units of the axes, that paints a mark the full "bad" end of the ramp.
     *
     * Fixed rather than taken from the worst game in the set, so the colors mean the same thing
     * on every team's chart. Scaled to the data, a season where the model was never more than six
     * points out would still render a red mark, and the reader would have no way to know the
     * whole chart was a good one.
     */
    errorCap = 20,
  }:
  {
    points: ResidualPoint[];
    xLabel: string;
    yLabel: string;
    caption?: string;
    errorCap?: number;
  },
) => {
  const theme = useTheme();

  // the 'strong' ramp is the app's bad-to-good scale - red at 0, green at 1 - the same one the
  // rankings and the schedule strip speak. The default 'rank' ramp starts on the surface, which
  // is right when the low end means "nothing to see" and wrong here, where the low end is the
  // model's best work and has to be the easiest mark on the chart to find.
  const palette = getChartPalette(theme, 'strong');

  const usable = points.filter((point) => Number.isFinite(point.predicted) && Number.isFinite(point.actual));

  // a handful of games says nothing about bias, and drawing it invites reading noise as a finding
  if (usable.length < 5) {
    return null;
  }

  // zero is always in frame even when nothing came near it, because the quadrants are part of the
  // reading and a chart that quietly dropped them would be answering a different question
  const lowest = Math.min(0, ...usable.map((point) => Math.min(point.predicted, point.actual)));
  const highest = Math.max(0, ...usable.map((point) => Math.max(point.predicted, point.actual)));

  const domain: [number, number] = [
    Math.floor((lowest - 5) / 5) * 5,
    Math.ceil((highest + 5) / 5) * 5,
  ];

  const residuals = usable.map((point) => point.actual - point.predicted);
  const meanResidual = residuals.reduce((total, one) => total + one, 0) / residuals.length;

  // right side up is "the model had them too low", which is the phrasing a reader can act on
  const bias = Math.abs(meanResidual) < 0.5 ?
    'no consistent lean' :
    `${Math.abs(meanResidual).toFixed(1)} points ${meanResidual > 0 ? 'too low' : 'too high'} on average`;

  // the ramp runs bad to good, so what it is handed is how good the call was, not how far it missed
  const getMissColor = (point: ResidualPoint) => (
    palette.sequential(1 - Math.min(1, Math.abs(point.actual - point.predicted) / errorCap))
  );

  const Mark = ({ cx, cy, payload }: { cx?: number; cy?: number; payload?: ResidualPoint }) => {
    if (cx === null || cy === null || cx === undefined || cy === undefined || !payload) {
      return <g />;
    }

    return (
      <g>
        {/* a transparent disc so a 5px dot still has a hit target worth aiming at */}
        <circle cx = {cx} cy = {cy} r = {12} fill = 'transparent' />
        <circle cx = {cx} cy = {cy} r = {5} fill = {getMissColor(payload)} fillOpacity = {0.9} stroke = {palette.surface} strokeWidth = {1.5} />
      </g>
    );
  };

  // left to right is exact to badly missed, so the ramp is read from its good end backwards
  const swatches: string[] = [];
  for (let i = 0; i < 12; i++) {
    swatches.push(palette.sequential(1 - (i / 11)));
  }

  return (
    <div>
      <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, padding: '0px 5px' }}>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>exact</Typography>
        <div style = {{
          width: 64,
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(to right, ${swatches.join(', ')})`,
        }} />
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{`${errorCap}+ off`}</Typography>
      </div>
      <div style = {{ padding: '0px 5px' }}>
        <ResponsiveContainer width = '100%' aspect = {1}>
          <ScatterChart margin = {{ top: 14, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke = {palette.grid} />
            <XAxis type = 'number' dataKey = 'predicted' name = 'Predicted' domain = {domain} tickLine = {false} axisLine = {false}>
              <Label value = {xLabel} position = 'insideBottom' offset = {-6} style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 14 }} />
            </XAxis>
            <YAxis type = 'number' dataKey = 'actual' name = 'Actual' domain = {domain} width = {52} tickLine = {false} axisLine = {false}>
              <Label value = {yLabel} angle = {-90} position = 'insideLeft' offset = {10} style = {{ textAnchor: 'middle', fill: theme.info.main, fontSize: 14 }} />
            </YAxis>
            <ZAxis range = {[60, 60]} />
            {/* predicted a loss and won it, predicted a win and lost it: the two corners where the
                side itself was called wrong, shaded rather than ruled so they explain themselves */}
            <ReferenceArea
              x1 = {domain[0]} x2 = {0} y1 = {0} y2 = {domain[1]}
              fill = {palette.muted} fillOpacity = {0.14} strokeOpacity = {0}
              label = {{ value: 'wrong winner', position: 'insideTopLeft', fill: palette.ink.secondary, fontSize: 10 }}
            />
            <ReferenceArea
              x1 = {0} x2 = {domain[1]} y1 = {domain[0]} y2 = {0}
              fill = {palette.muted} fillOpacity = {0.14} strokeOpacity = {0}
              label = {{ value: 'wrong winner', position: 'insideBottomRight', fill: palette.ink.secondary, fontSize: 10 }}
            />
            {/* perfect prediction; the distance every mark is read by */}
            <ReferenceLine
              segment = {[{ x: domain[0], y: domain[0] }, { x: domain[1], y: domain[1] }]}
              stroke = {palette.ink.secondary}
              strokeDasharray = '4 4'
            />
            <Tooltip
              cursor = {{ strokeDasharray: '3 3' }}
              content = {
                <ChartTooltip
                  formatLabel = {(row) => (row as ResidualPoint).label}
                  formatValue = {(entry, row) => {
                    const point = row as ResidualPoint;

                    // the miss is what the color is saying, so the tooltip says it in words
                    // rather than leaving the reader to subtract the two rows above it
                    if (entry.dataKey === 'actual') {
                      const miss = point.actual - point.predicted;

                      return `${point.actual} (${miss === 0 ? 'exact' : `${Math.abs(miss)} ${miss > 0 ? 'better' : 'worse'} than called`})`;
                    }

                    return point.predicted;
                  }}
                />
              }
            />
            <Scatter data = {usable} shape = {<Mark />} isAnimationActive = {false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center' }}>
        {caption || `${usable.length} games · on the dashed line the call was exact · ${bias}`}
      </Typography>
    </div>
  );
};

export default ChartResidual;
