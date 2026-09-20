'use client';

import React, { useEffect, useRef, useState } from 'react';

import ChevronLeftIcon from '@esmalley/react-material-icons/ChevronLeft';
import FormatListBulletedIcon from '@esmalley/react-material-icons/FormatListBulleted';

import Sidebar from './Sidebar';
import { headerBarHeight } from '@/components/generic/Header';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { IconButton, Tooltip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

/**
 * Below this the sidebar defaults closed and opens over the full width instead of
 * sitting beside the article, which would leave it too narrow to read.
 */
const getBreakPoint = () => 900;

const railWidth = 220;

/** Matches the padding on the app/blog route wrappers. */
const pagePadding = 20;

const getWindowWidth = () => {
  return (typeof window === 'undefined' ? 0 : window.innerWidth);
};

const Layout = (
  {
    sidebarPosts,
    activeId,
    children,
  }:
  {
    sidebarPosts;
    activeId?: string;
    children: React.ReactNode;
  },
) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // useWindowDimensions reports 0 until after mount. Falling back to innerWidth keeps
  // the first render at the final size, instead of laying out as mobile-collapsed for
  // a frame and then shifting the article across once the measurement lands.
  const effectiveWidth = (width || getWindowWidth());
  const compact = (effectiveWidth < getBreakPoint());

  const [open, setOpen] = useState(() => {
    return (getWindowWidth() >= getBreakPoint());
  });

  // Reset the default only when the break point is actually crossed, otherwise a
  // manual toggle would be stomped on every resize tick.
  const previousCompact = useRef<boolean>(compact);

  useEffect(() => {
    if (!effectiveWidth || previousCompact.current === compact) {
      return;
    }
    previousCompact.current = compact;
    setOpen(!compact);
  }, [effectiveWidth, compact]);

  // The app scrolls inside .overlay_scroller, not the window, and the fixed header
  // overlays the top of it. The sidebar starts pagePadding below the header, so it has
  // to stick at exactly that offset -- sticking at the header height alone lets it
  // drift up by the padding before catching, which reads as a stutter on scroll.
  const topOffset = (effectiveWidth < 600 ? 56 : headerBarHeight) + pagePadding;

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleNavigate = () => {
    // On a phone the list covers the article, so get out of the way once a post is picked.
    if (compact) {
      setOpen(false);
    }
  };

  const toggle = (
    <Tooltip onClickRemove text = {open ? 'Hide posts' : 'Show posts'}>
      <IconButton
        onClick = {handleToggle}
        value = 'toggle_posts'
        icon = {open ? <ChevronLeftIcon size = {20} /> : <FormatListBulletedIcon size = {20} />}
      />
    </Tooltip>
  );

  const navStyle: React.CSSProperties = {
    flex: open && !compact ? `0 0 ${railWidth}px` : '0 0 auto',
    width: open && compact ? '100%' : undefined,
    position: 'sticky',
    top: topOffset,
    maxHeight: `calc(100vh - ${topOffset + footerNavigationHeight}px)`,
    overflowY: 'auto',
    // Opaque, or the article scrolls through the sidebar behind it.
    backgroundColor: theme.background.main,
    zIndex: 1,
    paddingBottom: 5,
  };

  return (
    <div
      style = {{
        display: 'flex',
        // alignItems flex-start is required, otherwise the sidebar stretches to the
        // full row height and sticky has no range to travel in.
        alignItems: 'flex-start',
        flexDirection: open && compact ? 'column' : 'row',
        gap: open && !compact ? 24 : 8,
        width: '100%',
      }}
    >
      <nav style = {navStyle}>
        {
          open ?
          <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography type = 'subtitle2' style = {{ paddingLeft: 10, color: theme.text.secondary }}>Posts</Typography>
            {toggle}
          </div> :
            toggle
        }
        {open ? <Sidebar sidebarPosts = {sidebarPosts} activeId = {activeId} onNavigate = {handleNavigate} /> : ''}
      </nav>
      <div style = {{ flex: 1, minWidth: 0, maxWidth: 800, width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
