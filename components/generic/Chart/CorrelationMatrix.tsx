'use client';

import { useMemo } from 'react';
import { Color } from '@esmalley/ts-utils';
import { Tooltip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import { getChartPalette } from './palette';

export type CorrelationMeasure = {
  key: string;
  /** Short enough to sit above a 40px column. */
  label: string;
  full: string;
  values: number[];
};

/** Fewer pairs than this and r is describing the sample rather than the relationship. */
const MINIMUM_PAIRS = 10;

/**
 * Pearson's r over the pairs where both measures have a number.
 *
 * Pairwise rather than dropping a team from every column when it is missing one value, because
 * one missing rebound figure should not quietly shrink the sample behind every other cell.
 *
 * Module scope rather than a closure inside the component: it depends on nothing but its two
 * arguments, and the grid below has to be able to call it from inside a memo.
 */
const correlate = (a: number[], b: number[]): number | null => {
  let n = 0;
  let sumA = 0;
  let sumB = 0;

  for (let i = 0; i < a.length; i++) {
    if (Number.isFinite(a[i]) && Number.isFinite(b[i])) {
      n++;
      sumA += a[i];
      sumB += b[i];
    }
  }

  if (n < MINIMUM_PAIRS) {
    return null;
  }

  const meanA = sumA / n;
  const meanB = sumB / n;

  let covariance = 0;
  let varianceA = 0;
  let varianceB = 0;

  for (let i = 0; i < a.length; i++) {
    if (Number.isFinite(a[i]) && Number.isFinite(b[i])) {
      const da = a[i] - meanA;
      const db = b[i] - meanB;

      covariance += da * db;
      varianceA += da * da;
      varianceB += db * db;
    }
  }

  if (varianceA <= 0 || varianceB <= 0) {
    return null;
  }

  return covariance / Math.sqrt(varianceA * varianceB);
};

/**
 * Every measure against every other, as correlation.
 *
 * The rest of the app shows what a team's numbers are. This shows which of those numbers are worth
 * having at all: a column that runs strongly with winning is a measure that describes good teams,
 * and one that sits near zero is a number the site has been printing for years that tells nobody
 * anything. Both are worth knowing and neither is visible anywhere else.
 *
 * The second reading is redundancy. Two measures that correlate at 0.95 with each other are one
 * measure wearing two names, and seeing that block light up is what stops a reader treating them
 * as two pieces of evidence.
 *
 * Diverging color because correlation has a meaningful zero and a direction: blue for measures
 * that move together, orange for ones that move apart, and nothing at all in the middle, where no
 * relationship is exactly what the reader should see.
 */
const ChartCorrelationMatrix = (
  {
    measures,
    title,
    explanation,
    caption,
  }:
  {
    measures: CorrelationMeasure[];
    title?: string;
    /** One line on how to read the grid. colors are not named: the ramp is the theme's. */
    explanation?: string;
    caption?: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const { width } = useWindowDimensions();

  /**
   * The whole grid, computed once.
   *
   * Two things were wrong with correlating inside the cell renderer. r is symmetric, so every pair
   * was measured twice, once for each triangle; and this component reads the window width, so a
   * drag of the window edge re-ran all of it per frame - fourteen measures over a league is around
   * a hundred and forty thousand passes each time. One pass per pair, held until the measures
   * themselves change.
   *
   * Callers that build their measures inline get the single pass but not the caching, since a fresh
   * array each render is a fresh dependency; the ranking view memoises its own.
   */
  const { usable, grid } = useMemo(() => {
    // every series has to be long enough for a correlation to mean anything
    const kept = measures.filter((measure) => measure.values.length >= MINIMUM_PAIRS);
    const pairs: { [rowKey: string]: { [columnKey: string]: number | null } } = {};

    for (const measure of kept) {
      pairs[measure.key] = {};
    }

    for (let i = 0; i < kept.length; i++) {
      for (let j = i + 1; j < kept.length; j++) {
        const r = correlate(kept[i].values, kept[j].values);

        pairs[kept[i].key][kept[j].key] = r;
        pairs[kept[j].key][kept[i].key] = r;
      }
    }

    return { usable: kept, grid: pairs };
  }, [measures]);

  if (usable.length < 3) {
    return null;
  }

  const narrow = width <= 700;
  const cell = narrow ? 30 : 42;
  const labelWidth = narrow ? 60 : 86;

  const getCell = (row: CorrelationMeasure, column: CorrelationMeasure) => {
    if (row.key === column.key) {
      // a measure against itself is 1 by definition and says nothing, so it is left blank rather
      // than drawn as the strongest cell on the chart
      return (
        <div key = {column.key} style = {{
          width: cell, height: cell, backgroundColor: palette.grid, borderRadius: 2, border: `1px solid ${palette.surface}`, boxSizing: 'border-box',
        }} />
      );
    }

    const r = grid[row.key][column.key];

    if (r === null || r === undefined) {
      return (
        <div key = {column.key} style = {{
          width: cell, height: cell, border: `1px solid ${palette.surface}`, boxSizing: 'border-box',
        }} />
      );
    }

    // -1 to 1 onto the diverging ramp, with 0 landing on its neutral middle
    const tint = Color.lerpColor(palette.surface, palette.diverging((1 - r) / 2), Math.min(Math.abs(r) + 0.15, 1));

    return (
      <Tooltip key = {column.key} position = 'top' text = {`${row.full} vs ${column.full}: r = ${r.toFixed(2)}`}>
        <div style = {{
          width: cell,
          height: cell,
          backgroundColor: tint,
          borderRadius: 2,
          border: `1px solid ${palette.surface}`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {
            narrow ? '' :
            <Typography type = 'caption' style = {{ fontSize: 10, color: theme.text.primary }}>
              {r.toFixed(2).replace('0.', '.').replace('-.', '−.')}
            </Typography>
          }
        </div>
      </Tooltip>
    );
  };

  return (
    <div style = {{ padding: '0px 5px' }}>
      <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography type = 'body1'>{title || 'What goes with what'}</Typography>
      </div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center', marginTop: 2, marginBottom: 6 }}>
        {explanation || 'Each square is how closely two measures move together. A strong color is a real relationship; a pale one means knowing the first tells you nothing about the second.'}
      </Typography>
      <div style = {{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'right' }}>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>move apart</Typography>
        <div style = {{
          width: 72,
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(to right, ${palette.diverging(1)}, ${palette.diverging(0.5)}, ${palette.diverging(0)})`,
        }} />
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>move together</Typography>
      </div>
      {/* auto margins centre the grid when it fits and collapse to nothing when it does not, which
          is what keeps the left edge reachable on a narrow screen rather than scrolled off */}
      <div style = {{ overflowX: 'auto' }}>
        <div style = {{ width: 'max-content', margin: '0px auto' }}>
          {/* the column headings, offset by the width of the row labels beside them */}
          <div style = {{ display: 'flex', marginLeft: labelWidth }}>
            {usable.map((column) => (
              <div key = {column.key} style = {{ width: cell, textAlign: 'center' }}>
                <Typography type = 'caption' style = {{ fontSize: 9, color: theme.text.secondary }}>{column.label}</Typography>
              </div>
            ))}
          </div>
          {usable.map((row) => (
            <div key = {row.key} style = {{ display: 'flex', alignItems: 'center' }}>
              <div style = {{ width: labelWidth, flexShrink: 0, textAlign: 'right', paddingRight: 8, overflow: 'hidden' }}>
                <Typography type = 'caption' style = {{ fontSize: 10, color: theme.text.secondary, whiteSpace: 'nowrap' }}>{row.label}</Typography>
              </div>
              {usable.map((column) => getCell(row, column))}
            </div>
          ))}
        </div>
      </div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center', marginTop: 4 }}>
        {caption || `Pearson's r across ${usable[0].values.length} rows`}
      </Typography>
    </div>
  );
};

export default ChartCorrelationMatrix;
