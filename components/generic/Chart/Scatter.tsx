'use client';

import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceArea, ReferenceLine, ResponsiveContainer, Label, LabelList,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { getChartPalette } from './palette';
import HelperChart from '@/components/helpers/Chart';
import { Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

export type ScatterPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  xRank?: number;
  yRank?: number;
  /**
   * Picks this mark out of the cloud and names it.
   *
   * Set it on the marks a search matched rather than handing over only those marks: a position on
   * a scatter is read against everything around it, and one dot alone cannot be "strong at both
   * ends" of anything.
   */
  highlighted?: boolean;
};

/**
 * Two measures at once, one mark per entity.
 *
 * This is the shape a table cannot make: a table ranks on one column at a time, so "strong attack,
 * leaky defence" is something the reader has to assemble by eye across two sorted lists. Here it is
 * a position.
 *
 * The y axis is reversed whenever lower is better, so that up and to the right always reads as
 * better on both measures no matter which way the underlying number runs. The crosshairs sit on the
 * league mean, which is what makes a quadrant mean anything.
 *
 * Every mark is the same colour on purpose. One series needs no legend, and colouring by conference
 * or by rank would either exceed what anyone can tell apart or repaint the survivors when the
 * reader filters - identity here is carried by position and by the label on hover.
 *
 * The one exception is a highlight: marks flagged `highlighted` keep the colour and are named,
 * while the rest drop back to the muted shade. That is two values of one encoding, not a second
 * series, and it only ever answers "which of these is the one I asked for".
 */
const ChartScatter = (
  {
    points,
    xLabel,
    yLabel,
    yLowerIsBetter = false,
    quadrantLabels,
    onSelect,
    height = 460,
    /**
     * Above this many marks the plot labels nothing and leans on hover instead.
     *
     * Left out, it scales with the width the names have to share. Pass one only to override that.
     */
    labelThreshold,
  }:
  {
    points: ScatterPoint[];
    xLabel: string;
    yLabel: string;
    yLowerIsBetter?: boolean;
    quadrantLabels?: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string };
    onSelect?: (id: string) => void;
    height?: number;
    labelThreshold?: number;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const { width } = useWindowDimensions();

  if (!points.length) {
    return <Typography type = 'h6' style = {{ textAlign: 'center', margin: '20px 0px' }}>Nothing to plot yet...</Typography>;
  }

  let xBounds: [number | null, number | null] = [null, null];
  let yBounds: [number | null, number | null] = [null, null];
  let xTotal = 0;
  let yTotal = 0;

  for (const point of points) {
    xBounds = HelperChart.extend(xBounds, point.x);
    yBounds = HelperChart.extend(yBounds, point.y);
    xTotal += point.x;
    yTotal += point.y;
  }

  /**
   * Extra room at the edges when the corners are carrying captions.
   *
   * The captions sit in the plot's four corners, so the data has to be held off the edges or a
   * team up in the top left lands underneath the words describing it. A mark's own name sits a
   * line above the mark, which is what collides first, so the clearance is bigger than the dot.
   *
   * Asked for as padding rather than applied afterwards, so the domain ends still come back
   * rounded to something an axis can put on a tick.
   */
  const padding = quadrantLabels ? HelperChart.PADDING + 0.08 : HelperChart.PADDING;

  const xDomain = HelperChart.getDomain(xBounds[0], xBounds[1], padding);
  const yDomain = HelperChart.getDomain(yBounds[0], yBounds[1], padding);

  const xMean = +(xTotal / points.length).toFixed(2);
  const yMean = +(yTotal / points.length).toFixed(2);

  /**
   * How many names the plot can carry before it is a wall of text.
   *
   * Filtered to one conference, a dozen or so teams are left, and at that size making the reader
   * hover every dot to find out who is who is the chart withholding the one thing it knows. Past
   * it, position is the identity and hover does the naming.
   *
   * It scales with width because the names do not: the same "North Carolina A&T" that fits a
   * desktop plot nine times over covers half a phone.
   */
  const getLabelThreshold = (): number => {
    if (labelThreshold !== undefined) {
      return labelThreshold;
    }

    if (width <= 450) {
      return 5;
    }

    if (width <= 700) {
      return 10;
    }

    // 18 rather than 15, because the filter this is really for is a conference, and the biggest of
    // them - the Big Ten and the ACC - are 18 teams. A bar below that labels the small conferences
    // and leaves the ones most readers filter to unnamed, which is the wrong way round
    return 18;
  };

  const threshold = getLabelThreshold();

  const highlightedCount = points.filter((point) => point.highlighted).length;
  const highlighting = highlightedCount > 0;

  // few enough to name everyone, so everyone is named - a search on top of that is carried by the
  // colour alone, since the name it would add is already on the plot
  const labelAll = points.length <= threshold;

  // a broad search can match half a conference, and twenty names stacked over each other is worse
  // than none, so the same bar applies to how many of them get named
  const nameHighlighted = !labelAll && highlighting && highlightedCount <= threshold;

  // recharts draws the marks in the order it is given them, so a highlighted mark handed over early
  // would sit under every muted one drawn across it afterwards
  const ordered = highlighting ?
    [...points].sort((a, b) => Number(!!a.highlighted) - Number(!!b.highlighted)) :
    points;

  // a transparent disc carries the pointer target so a 8px mark does not have to be hit dead centre
  const Mark = ({ cx, cy, payload }: { cx?: number; cy?: number; payload?: ScatterPoint }) => {
    if (cx === undefined || cy === undefined) {
      return null;
    }

    const marked = !highlighting || !!payload?.highlighted;

    return (
      <g style = {{ cursor: onSelect ? 'pointer' : 'default' }}>
        <circle cx = {cx} cy = {cy} r = {13} fill = 'transparent' />
        <circle
          cx = {cx}
          cy = {cy}
          r = {marked && highlighting ? 6 : 4}
          fill = {marked ? palette.series(0) : palette.muted}
          stroke = {palette.surface}
          strokeWidth = {2}
        />
        {
          // named here rather than through LabelList, which labels either every mark or none
          nameHighlighted && payload?.highlighted ?
            <text
              x = {cx}
              y = {cy - 12}
              textAnchor = 'middle'
              style = {{ fill: palette.ink.primary, fontSize: 11, pointerEvents: 'none' }}
            >
              {payload.name}
            </text> :
            null
        }
      </g>
    );
  };

  /**
   * Corner captions, drawn in the plot rather than floated over it.
   *
   * They were absolutely positioned divs with insets measured against the plot box, which meant
   * guessing how much room the ticks and the axis title would take - and the y ticks are as wide
   * as the numbers happen to be, so the top left caption drifted outside the axes.
   *
   * A ReferenceArea per quadrant is measured by recharts off the same scales as the marks, so each
   * caption lands in the corner of the quadrant it describes whatever the ticks do. The areas draw
   * nothing themselves; they are a box for the text to hang on.
   */
  const quadrants = (): React.JSX.Element[] | null => {
    if (!quadrantLabels || !xDomain || !yDomain) {
      return null;
    }

    // the axis is flipped when lower is better, so the top of the plot is the bottom of the domain
    const [yTop, yBottom] = yLowerIsBetter ? [yDomain[0], yDomain[1]] : [yDomain[1], yDomain[0]];

    const corners: { value: string; x: number; y: number; position: 'insideTopLeft' | 'insideTopRight' | 'insideBottomLeft' | 'insideBottomRight' }[] = [
      { value: quadrantLabels.topLeft, x: xDomain[0], y: yTop, position: 'insideTopLeft' },
      { value: quadrantLabels.topRight, x: xDomain[1], y: yTop, position: 'insideTopRight' },
      { value: quadrantLabels.bottomLeft, x: xDomain[0], y: yBottom, position: 'insideBottomLeft' },
      { value: quadrantLabels.bottomRight, x: xDomain[1], y: yBottom, position: 'insideBottomRight' },
    ];

    return corners.map((corner) => (
      <ReferenceArea
        key = {corner.position}
        x1 = {corner.x}
        x2 = {xMean}
        y1 = {corner.y}
        y2 = {yMean}
        fill = 'none'
        fillOpacity = {0}
        stroke = 'none'
        label = {{
          value: corner.value,
          position: corner.position,
          fill: palette.ink.secondary,
          fontSize: 11,
        }}
      />
    ));
  };

  return (
    <div>
      {/* outside the sized box below, not inside it: ResponsiveContainer takes its 100% from that
          box, so a sibling in there makes the chart overflow by the caption's height and pushes
          the plot down out from under the corner captions, which are placed against its edges */}
      <div style = {{ textAlign: 'center', marginBottom: 2 }}>
        <Typography type = 'caption' style = {{ color: palette.ink.secondary }}>
          {`${points.length} ${points.length === 1 ? 'team' : 'teams'} · league average ${xLabel} ${xMean} · ${yLabel} ${yMean}`}
        </Typography>
      </div>
      <div style = {{ width: '100%', height, position: 'relative' }}>
        <ResponsiveContainer width = '100%' height = '100%'>
          <ScatterChart margin = {{ top: 16, right: 24, bottom: 32, left: 12 }}>
            <CartesianGrid stroke = {palette.grid} />
            <XAxis
              type = 'number'
              dataKey = 'x'
              name = {xLabel}
              domain = {xDomain || ['auto', 'auto']}
              tickLine = {false}
              axisLine = {false}
              tick = {{ fill: palette.ink.secondary, fontSize: 12 }}
            >
              <Label value = {xLabel} position = 'bottom' offset = {8} style = {{ textAnchor: 'middle', fill: palette.ink.secondary, fontSize: 13 }} />
            </XAxis>
            <YAxis
              type = 'number'
              dataKey = 'y'
              name = {yLabel}
              domain = {yDomain || ['auto', 'auto']}
              reversed = {yLowerIsBetter}
              tickLine = {false}
              axisLine = {false}
              tick = {{ fill: palette.ink.secondary, fontSize: 12 }}
            >
              <Label value = {yLabel} angle = {-90} position = 'insideLeft' style = {{ textAnchor: 'middle', fill: palette.ink.secondary, fontSize: 13 }} />
            </YAxis>
            {/* recharts sizes scatter marks from the z range; the shape draws its own radius, so this
                only needs to stop it scaling them */}
            <ZAxis range = {[60, 60]} />

            {quadrants()}

            <ReferenceLine x = {xMean} stroke = {palette.ink.secondary} strokeOpacity = {0.5} />
            <ReferenceLine y = {yMean} stroke = {palette.ink.secondary} strokeOpacity = {0.5} />

            <Tooltip
              cursor = {{ stroke: theme.warning.main, strokeWidth: 1 }}
              content = {
                <ChartTooltip
                  formatLabel = {(row: ScatterPoint) => row.name}
                  formatValue = {(entry) => entry.value}
                />
              }
            />

            <Scatter
              data = {ordered}
              shape = {<Mark />}
              isAnimationActive = {false}
              onClick = {(point) => {
                if (onSelect && point && point.id) {
                  onSelect(point.id);
                }
              }}
            >
              {
                labelAll ?
                  <LabelList dataKey = 'name' position = 'top' offset = {10} style = {{ fill: palette.ink.primary, fontSize: 11 }} /> :
                  null
              }
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartScatter;
