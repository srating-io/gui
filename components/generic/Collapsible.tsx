'use client';

import ExpandLessIcon from '@esmalley/react-material-icons/ExpandLess';
import ExpandMoreIcon from '@esmalley/react-material-icons/ExpandMore';
import { Divider, Typography, useTheme } from '@esmalley/react-material-ui';
import { Style } from '@esmalley/ts-utils';
import React from 'react';


/**
 * An expandable section. Controlled on purpose: the parent owns which section is open, so a
 * walkthrough can force one open from outside without this holding a competing copy of that state.
 */
const Collapsible = (
  {
    id,
    title,
    summary,
    marker,
    badge,
    badgeColor,
    open,
    onToggle,
    divider,
    children,
  }:
  {
    id: string;
    title: string;
    summary?: string;
    marker?: React.JSX.Element | string;
    badge?: string;
    badgeColor?: string;
    open: boolean;
    onToggle: (id: string) => void;
    divider?: boolean;
    children: React.ReactNode;
  },
) => {
  const theme = useTheme();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(id);
    }
  };

  // a class, not an inline style, because the row needs a hover state to read as clickable
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '6px 8px',
    // the hover area bleeds past the body padding while the text stays aligned with it
    margin: '0px -8px',
    borderRadius: 4,
    transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:hover': {
      backgroundColor: theme.action.hover,
    },
  };

  return (
    <div>
      <div
        role = 'button'
        tabIndex = {0}
        aria-expanded = {open}
        aria-controls = {`${id}-body`}
        onClick = {() => onToggle(id)}
        onKeyDown = {handleKeyDown}
        className = {Style.getStyleClassName(rowStyle)}
      >
        {
          marker ?
            <span style = {{ display: 'flex', justifyContent: 'center', minWidth: 24, marginRight: 4, color: theme.text.secondary }}>{marker}</span>
            : null
        }
        <div style = {{ flex: 1, minWidth: 0 }}>
          <Typography type = 'subtitle2'>{title}</Typography>
          {
            // a closed row stays one line, so anything long belongs in the body instead
            summary && !open ?
              <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</Typography>
              : null
          }
        </div>
        {
          badge ?
            <Typography type = 'caption' style = {{ color: badgeColor || theme.text.secondary, whiteSpace: 'nowrap', marginLeft: 8 }}>{badge}</Typography>
            : null
        }
        <span style = {{ display: 'flex', marginLeft: 4, color: theme.text.secondary }}>
          {open ? <ExpandLessIcon style = {{ fontSize: 20 }} /> : <ExpandMoreIcon style = {{ fontSize: 20 }} />}
        </span>
      </div>
      {open ? <div id = {`${id}-body`} style = {{ padding: '0 0 12px 28px' }}>{children}</div> : null}
      {divider ? <Divider style = {{ margin: '2px 0px' }} /> : null}
    </div>
  );
};

export default Collapsible;
