'use client';

import { LazyPanel } from '@/components/generic/Chart';
import { Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import React from 'react';
import { getColumns } from '../../ContentsWrapper';

/**
 * One preview in a tour section.
 *
 * The caption is the question the chart answers, in the chart's own words - every component in the
 * chart kit opens with a docblock stating what a table could not tell you, and that is better copy
 * than anything written fresh for a landing page.
 *
 * Nothing inside mounts until the reader is within a screen of it. Fourteen recharts charts
 * measured and laid out at once is seconds of blocked main thread for the two that are visible,
 * and this page exists to feel fast.
 */
const Panel = (
  {
    caption,
    /** Columns this chart needs to stay legible. Clamped to however many the grid is running. */
    span = 1,
    /**
     * Space held open until the chart arrives, so the page does not move as panels fill in.
     *
     * A floor rather than a fixed height - see `LazyPanel` - so a chart that adds a title or a
     * legend around its plot is not left hanging out of the bottom of its own box.
     */
    reserve,
    children,
    paper = true,
  }:
  {
    caption?: string;
    span?: 1 | 2 | 3;
    reserve: number;
    children: React.ReactNode;
    paper?: boolean;
  },
) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const columns = getColumns(width);

  const getContents = (children: React.ReactNode) => {
    if (paper) {
      return <Paper style = {{ padding: 10, height: '100%' }}>{children}</Paper>;
    }

    return <div>{children}</div>;
  };

  return (
    <div style = {{ gridColumn: `span ${Math.min(span, columns)}` }}>
      {getContents(
        <>
          {
            caption ?
              <Typography type = 'body2' style = {{ color: theme.text.secondary, margin: '0px 0px 8px 0px' }}>{caption}</Typography> :
              ''
          }
          <LazyPanel height = {reserve} grow>{children}</LazyPanel>
        </>,
      )}
    </div>
  );
};

export default Panel;
