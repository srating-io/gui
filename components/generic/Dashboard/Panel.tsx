'use client';

import { Paper, Typography, useTheme } from '@esmalley/react-material-ui';

/**
 * The chrome every dashboard panel sits in: a heading above a Paper, with an icon.
 *
 * Shared so the five panels agree on spacing and heading weight without repeating it, and so a
 * change to the look happens once.
 */

export const paperStyle = {
  padding: 16,
  marginTop: 16,
};

/** Columns collapse to one below this, matching the rest of the app's card layouts. */
export const innerBreakPoint = 600;

const Panel = (
  {
    icon,
    title,
    action,
    paper = true,
    children,
  }:
  {
    icon: React.JSX.Element,
    title: string,
    action?: React.ReactNode,
    // A table or a list of its own tiles brings its own surface, so boxing it in another one just
    // nests two papers.
    paper?: boolean,
    children: React.ReactNode,
  },
) => {
  // Matches what `Paper` renders for its own `title`, so the two look the same. We render it here
  // rather than passing `title` through because `Paper`'s `buttons` slot is positioned over this
  // same band, and because the paperless variant still needs a heading.
  const heading = (
    <div style = {{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: paperStyle.marginTop,
      marginBottom: 8,
    }}>
      <div style = {{ display: 'flex', alignItems: 'center' }}>
        <span style = {{ display: 'flex', marginRight: 8 }}>{icon}</span>
        <Typography type = 'h6'>{title}</Typography>
      </div>
      {action ? <div style = {{ display: 'flex', alignItems: 'center' }}>{action}</div> : ''}
    </div>
  );

  return (
    <div>
      {heading}
      {paper ? <Paper style={{ padding: paperStyle.padding }}>{children}</Paper> : children}
    </div>
  );
};

/**
 * What a panel shows when the query came back with nothing. A panel whose data failed to load
 * returns empty rather than throwing, so this covers both "none yet" and "could not read it".
 */
export const Empty = ({ message }: { message: string }) => {
  const theme = useTheme();

  return (
    <div style = {{
      padding: 16,
      display: 'flex',
      justifyContent: 'center',
      fontStyle: 'italic',
      color: theme.text.secondary,
    }}>
      <Typography type = 'body2' style = {{ color: theme.text.secondary }}>{message}</Typography>
    </div>
  );
};

export default Panel;
