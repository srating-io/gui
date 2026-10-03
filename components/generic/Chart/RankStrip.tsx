'use client';

import { Tooltip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import RankSpan from '@/components/generic/RankSpan';
import { getChartPalette } from './palette';

export type RankStripRow = {
  /** Stable key, normally the column name. */
  key: string;
  label: string;
  /** Shown verbatim beside the strip, already formatted by the caller. */
  value: string | number;
  rank: number;
  tooltip?: string;
};

/** Where the quartile ticks sit, as a fraction of the track from the left. */
const QUARTILES = [0.25, 0.5, 0.75];

const MARKER = 13;

/**
 * One row per headline metric, each a 1-D track with this team's marker on it.
 *
 * The number "14th" tells a reader almost nothing on its own: 14th of 18 is bad and 14th of 364 is
 * excellent, and the table that carries the number rarely carries the denominator. A position on a
 * track carries both at once, and stacking four of them turns "what is this team" from a paragraph
 * into a shape - a marker hard right on offence and hard left on defence says more than either
 * rank does alone.
 *
 * Better is to the right on every row, whichever direction the underlying stat runs, so the rows
 * can be compared down the column rather than read one at a time. The marker takes its color from
 * the same diverging ramp as the ranking heat map, so blue means the same thing on both surfaces -
 * and the rank is printed beside every strip, so the color never carries the reading alone.
 */
const ChartRankStrip = (
  {
    rows,
    max,
    title,
  }:
  {
    rows: RankStripRow[];
    /** Number of teams in the league; the denominator every position is measured against. */
    max: number;
    title?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const { width } = useWindowDimensions();

  // the track is what has to survive a narrow screen, so the two text columns give up their room
  // first rather than squeezing the strip down to a stub
  const narrow = width <= 500;
  const labelWidth = narrow ? 62 : 96;
  const valueWidth = narrow ? 88 : 110;

  // without a denominator there is no track to place anything on
  if (max <= 1) {
    return null;
  }

  const usable = rows.filter((row) => row.rank && row.rank > 0);

  if (!usable.length) {
    return null;
  }

  const getRow = (row: RankStripRow) => {
    // 1 at the top of the league, 0 at the bottom, which is also the fraction of the track the
    // marker sits along - better to the right
    const standing = 1 - ((Math.min(row.rank, max) - 1) / (max - 1));
    const color = palette.diverging(1 - standing);

    const label = (
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{row.label}</Typography>
    );

    return (
      <div key = {row.key} style = {{ display: 'flex', alignItems: 'center', padding: '5px 0px' }}>
        <div style = {{ width: labelWidth, flexShrink: 0, textAlign: 'right', paddingRight: 10, overflow: 'hidden' }}>
          {row.tooltip ? <Tooltip position = 'top' text = {row.tooltip}>{label}</Tooltip> : label}
        </div>
        <div style = {{
          position: 'relative',
          flex: 1,
          // the row is the hit target, not the marker: a 13px dot is too small to hover reliably
          height: MARKER + 11,
          minWidth: 80,
        }}>
          <div style = {{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 6,
            marginTop: -3,
            borderRadius: 3,
            backgroundColor: palette.grid,
          }} />
          {QUARTILES.map((quartile) => (
            <div key = {quartile} style = {{
              position: 'absolute',
              top: '50%',
              left: `${quartile * 100}%`,
              width: 1,
              height: 10,
              marginTop: -5,
              backgroundColor: palette.muted,
            }} />
          ))}
          <div style = {{
            position: 'absolute',
            top: '50%',
            // pulled back in by half a marker at each end so the dot never hangs off the track
            left: `calc(${standing * 100}% + ${(0.5 - standing) * MARKER}px)`,
            width: MARKER,
            height: MARKER,
            marginTop: -(MARKER / 2),
            marginLeft: -(MARKER / 2),
            borderRadius: '50%',
            backgroundColor: color,
            // the 2px surface ring that keeps the dot legible wherever it lands on the track
            boxShadow: `0 0 0 2px ${palette.surface}`,
          }} />
        </div>
        <div style = {{
          width: valueWidth, flexShrink: 0, paddingLeft: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
        }}>
          <Typography type = 'caption'>{row.value}</Typography>
          <RankSpan rank = {row.rank} max = {max} useOrdinal = {true} />
        </div>
      </div>
    );
  };

  return (
    <div style = {{ padding: '0px 5px' }}>
      <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography type = 'body1'>{title || 'Where they rank'}</Typography>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>worse ← of {max} → better</Typography>
      </div>
      {usable.map((row) => getRow(row))}
    </div>
  );
};

export default ChartRankStrip;
