'use client';

import React, { useState } from 'react';

import { Color } from '@esmalley/ts-utils';
import { Skeleton, Tooltip, Typography, useTheme } from '@esmalley/react-material-ui';

import { ChartPalette, getChartPalette } from './palette';

export type SequenceCell = {
  key: string;
  title?: string;
  /**
   * 0 to 1, taken along the sequential ramp. Null leaves the cell blank, which is what an event
   * with nothing to rate yet looks like.
   */
  intensity: number | null;
  /**
   * The rating behind this cell has not arrived yet, so the bar is a skeleton instead of a colour.
   *
   * This is not the same as a null intensity, and the strip would be lying if it used one for the
   * other: null is a settled answer - there is nothing to rate, and there never will be - while
   * this is the question still being asked. Both would otherwise paint the same flat grey.
   */
  loading?: boolean;
  /**
   * What sits under the cell: one or two characters for a settled outcome, or a node when the
   * standing in of something else - a lock, a glyph - says it better than a letter would.
   */
  mark?: React.ReactNode;
  outcome?: 'good' | 'bad' | null;
  /** Overrides the colour the outcome would give a text mark, for a scale of its own. */
  markColor?: string;
  tooltip: string;
  onSelect?: () => void;
  /**
   * Where the cell goes when clicked. Given alongside `onSelect` it keeps the cell a real link, so
   * it opens in a new tab and shows its destination on hover like the rows it summarises.
   */
  href?: string;
};

/**
 * How a ramp colour is actually painted.
 *
 * The last tenth of the way back towards the surface takes the edge off every cell at once, which
 * matters more here than in a chart with a handful of marks: thirty saturated blocks in a row
 * shout, and the reader is meant to be reading the pattern across them rather than any one of
 * them. The legend swatch is mixed the same way so that it shows the colours the strip has.
 */
const getFill = (palette: ChartPalette, color: string): string => Color.lerpColor(palette.surface, color, 0.9);

/**
 * The bar, the mark under it, and - when the cell stands for a row the reader can open - the link
 * and the hover that say so.
 */
const Cell = (
  {
    cell,
    palette,
  }:
  {
    cell: SequenceCell;
    palette: ChartPalette;
  },
) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const interactive = !!(cell.onSelect || cell.href);
  const lit = interactive && hovered;

  const getMarkColor = () => {
    if (cell.markColor) {
      return cell.markColor;
    }

    if (cell.outcome === 'good') {
      return theme.success[theme.mode === 'light' ? 'dark' : 'light'];
    }

    if (cell.outcome === 'bad') {
      return theme.error[theme.mode === 'light' ? 'dark' : 'light'];
    }

    return theme.text.secondary;
  };

  /**
   * The skeleton takes the bar's exact box, so nothing moves when the colour arrives - the strip
   * is a row of thirty small things, and a reflow at this size reads as the whole chart twitching.
   */
  const bar = cell.loading ?
    <Skeleton style = {{
      height: 18,
      width: '100%',
      borderRadius: 2,
      margin: 0,
      padding: 0,
      transform: 'initial',
    }} /> :
    (
      <div style = {{
        height: 18,
        borderRadius: 2,
        backgroundColor: cell.intensity === null ? palette.grid : getFill(palette, palette.sequential(cell.intensity)),
        // the 2px gap the mark spec asks for between adjacent fills, so two hard games in a row read
        // as two cells rather than one wide block. Hover spends the same 1px on the outline, which
        // leaves the geometry still while the cell lights up.
        border: `1px solid ${lit ? theme.text.primary : palette.surface}`,
        boxSizing: 'border-box',
      }} />
    );

  /**
   * The click lands on the cell rather than on the link inside it, so a mark that handles its own
   * click - a lock that opens a dialog instead of following the row - only has to stop the event
   * from bubbling, and the href is left to serve the middle click and the status bar.
   */
  const handleClick = (e: React.SyntheticEvent) => {
    if (!cell.onSelect) {
      return;
    }

    e.preventDefault();
    cell.onSelect();
  };

  return (
    <Tooltip position = 'top' text = {cell.tooltip}>
      <div
        onClick = {handleClick}
        onPointerEnter = {() => setHovered(true)}
        onPointerLeave = {() => setHovered(false)}
        style = {{
          width: 32,
          margin: '0px 1px',
          padding: '1px 0px',
          borderRadius: 3,
          cursor: interactive ? 'pointer' : 'default',
          textAlign: 'center',
          backgroundColor: lit ? theme.action.hover : 'transparent',
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        }}
      >
        {cell.title ? <Typography type = 'caption' style = {{ fontSize: 10, color: theme.text.secondary }}>{cell.title}</Typography> : ''}
        {
          cell.href ?
            <a href = {cell.href} style = {{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{bar}</a>
            : bar
        }
        {/* fixed, so a cell marked with an icon lines up with the ones marked with a letter */}
        <div style = {{ height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {
            cell.mark === null || cell.mark === undefined || typeof cell.mark === 'string' || typeof cell.mark === 'number' ?
              <Typography type = 'caption' style = {{ fontSize: 10, color: getMarkColor() }}>
                {cell.mark || '·'}
              </Typography>
              : cell.mark
          }
        </div>
      </div>
    </Tooltip>
  );
};

/**
 * One cell per event, in order, each coloured by how hard it was.
 *
 * A season read as a list of rows is a season nobody reads: thirty tiles, each needing its own
 * glance, and the pattern across them - a brutal December, a soft run into March, three straight
 * losses to good sides - never assembles. Shrunk to one cell each they fit on a line, and the
 * pattern is the only thing left.
 *
 * Two things are encoded and they are kept apart rather than layered into one swatch: the bar is
 * how strong the opponent was, the mark underneath is what happened. Putting difficulty into the
 * background behind a coloured letter would have the two encodings fighting for the same pixels,
 * and the letter would lose against the dark end of the ramp.
 */
const ChartSequenceStrip = (
  {
    cells,
    title,
    scaleLow,
    scaleHigh,
  }:
  {
    cells: SequenceCell[];
    title?: string;
    /** What the pale end of the ramp means, and what the strong end means. */
    scaleLow: string;
    scaleHigh: string;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme, 'strong');

  if (!cells.length) {
    return null;
  }

  return (
    <div style = {{ padding: '0px 5px' }}>
      <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography type = 'body1'>{title || 'Schedule'}</Typography>
        <div style = {{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{scaleLow}</Typography>
          {/* the ramp itself, so the reader is told what the shading means rather than guessing */}
          <div style = {{
            width: 64,
            height: 8,
            borderRadius: 4,
            background: `linear-gradient(to right, ${palette.sequentialSamples().map((color) => getFill(palette, color)).join(', ')})`,
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{scaleHigh}</Typography>
        </div>
      </div>
      <div style = {{ display: 'flex', flexWrap: 'wrap', rowGap: 6, marginTop: 4 }}>
        {cells.map((cell) => <Cell key = {cell.key} cell = {cell} palette = {palette} />)}
      </div>
    </div>
  );
};

export default ChartSequenceStrip;
