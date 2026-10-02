'use client';

import { Tooltip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import { getChartPalette } from './palette';

export type DumbbellRow = {
  key: string;
  label: string;
  from: number;
  to: number;
  fromDetail: string;
  toDetail: string;
  tooltip?: string;
};

const MARKER = 12;

/**
 * Two conditions of the same measure, connected.
 *
 * A record of 36-3 is one number covering two quite different teams: the one at home and the one
 * on the road. Split apart and joined by a line, the gap between the dots *is* the finding - a
 * long connector says the context changes this team and a short one says it does not, and that
 * reads before either endpoint is examined.
 *
 * One shared axis across every row, because these are the same measure under different conditions.
 * Giving each row its own scale would make every gap look the same size, which is the one thing
 * the chart exists to distinguish.
 */
const ChartDumbbell = (
  {
    rows,
    domain,
    fromLabel,
    toLabel,
    title,
    unit = '',
  }:
  {
    rows: DumbbellRow[];
    /** Shared across every row; the caller sets it from what the measure can actually be. */
    domain: [number, number];
    fromLabel: string;
    toLabel: string;
    title?: string;
    unit?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const { width } = useWindowDimensions();

  const narrow = width <= 500;
  const labelWidth = narrow ? 76 : 116;

  const usable = rows.filter((row) => Number.isFinite(row.from) && Number.isFinite(row.to));

  if (!usable.length) {
    return null;
  }

  const [low, high] = domain;
  const span = high - low || 1;

  const toPercent = (value: number) => ((Math.min(Math.max(value, low), high) - low) / span) * 100;

  // the two ends are the two conditions, so they take two hues from the categorical order rather
  // than two shades of one - a reader should not have to judge lightness to tell them apart
  const fromColor = palette.series(0);
  const toColor = palette.series(1);

  const getRow = (row: DumbbellRow) => {
    const fromAt = toPercent(row.from);
    const toAt = toPercent(row.to);
    const left = Math.min(fromAt, toAt);
    const right = Math.max(fromAt, toAt);

    const label = (
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{row.label}</Typography>
    );

    const dot = (at: number, colour: string) => (
      <div style = {{
        position: 'absolute',
        top: '50%',
        left: `calc(${at}% + ${(0.5 - (at / 100)) * MARKER}px)`,
        width: MARKER,
        height: MARKER,
        marginTop: -(MARKER / 2),
        marginLeft: -(MARKER / 2),
        borderRadius: '50%',
        backgroundColor: colour,
        boxShadow: `0 0 0 2px ${palette.surface}`,
      }} />
    );

    return (
      <div key = {row.key} style = {{ display: 'flex', alignItems: 'center', padding: '5px 0px' }}>
        <div style = {{ width: labelWidth, flexShrink: 0, textAlign: 'right', paddingRight: 10, overflow: 'hidden' }}>
          {row.tooltip ? <Tooltip position = 'top' text = {row.tooltip}>{label}</Tooltip> : label}
        </div>
        <div style = {{ position: 'relative', flex: 1, height: MARKER + 12, minWidth: 100 }}>
          <div style = {{
            position: 'absolute', top: '50%', left: 0, right: 0, height: 2, marginTop: -1, backgroundColor: palette.grid,
          }} />
          {/* the connector is the finding, so it is heavier than the track it sits on */}
          <div style = {{
            position: 'absolute',
            top: '50%',
            left: `${left}%`,
            width: `${right - left}%`,
            height: 4,
            marginTop: -2,
            borderRadius: 2,
            backgroundColor: palette.muted,
          }} />
          {dot(fromAt, fromColor)}
          {dot(toAt, toColor)}
        </div>
        <div style = {{ width: narrow ? 92 : 132, flexShrink: 0, paddingLeft: 10, whiteSpace: 'nowrap' }}>
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{row.fromDetail} / {row.toDetail}{unit}</Typography>
        </div>
      </div>
    );
  };

  return (
    <div style = {{ padding: '0px 5px' }}>
      <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography type = 'body1'>{title || 'Splits'}</Typography>
        <div style = {{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style = {{
            width: 10, height: 10, borderRadius: '50%', backgroundColor: fromColor, display: 'inline-block',
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{fromLabel}</Typography>
          <span style = {{
            width: 10, height: 10, borderRadius: '50%', backgroundColor: toColor, display: 'inline-block', marginLeft: 8,
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{toLabel}</Typography>
        </div>
      </div>
      {usable.map((row) => getRow(row))}
    </div>
  );
};

export default ChartDumbbell;
