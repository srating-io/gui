'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@esmalley/react-material-ui';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_group-slice';


/** How long the outline stays up before it stops being a pointer and starts being clutter. */
const HIGHLIGHT_MS = 4000;

/**
 * Wraps a card so the how it works guide can point at it. Holds its own ref rather than looking
 * the node up by id: this page scrolls inside a container, not the window, and scrollIntoView
 * walks to whichever ancestor that is on its own.
 */
const Anchor = (
  {
    id,
    children,
    style = {},
  }:
  {
    id: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
  },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);

  const highlighted_anchor = useAppSelector((state) => state.fantasyGroupReducer.highlighted_anchor);
  const active = highlighted_anchor === id;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (active) {
      // centered rather than aligned to the top, which would park the card under the fixed header
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      timer = setTimeout(() => {
        dispatch(setDataKey({ key: 'highlighted_anchor', value: null }));
      }, HIGHLIGHT_MS);
    }

    // cleared on change, so a second Show me is not cut short by the first one's timer
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [active]);

  const activeStyle: React.CSSProperties = active ? {
    // an outline instead of a border, so pointing at a card never reflows it
    outline: `2px solid ${theme.secondary.main}`,
    outlineOffset: 2,
    borderRadius: 8,
  } : {};

  return (
    <div ref = {ref} id = {id} style = {{ ...style, ...activeStyle }}>
      {children}
    </div>
  );
};

export default Anchor;
