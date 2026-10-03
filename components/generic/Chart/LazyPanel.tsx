'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mounts its children the first time they come near the viewport.
 *
 * A grid can run to a hundred panels, and a hundred recharts charts measured and laid out at once
 * costs seconds of blocked main thread for the eight a reader can actually see. The box keeps its
 * height either way, so nothing below it moves when a panel fills in and the scrollbar does not
 * grow as the page is read.
 *
 * The observer takes no root, which means the viewport - and that is right even on a page that
 * scrolls inside a container of its own rather than the document. Intersection is computed through
 * every ancestor's clip rect, so an element scrolled out of a nested scroller reports as not
 * intersecting without the scroller having to be named.
 *
 * It also latches: the first intersection disconnects the observer, so a panel scrolled past is
 * never torn down and rebuilt. `useOnScreen` is the hook for the other question - whether
 * something is on screen *now* - and is the wrong tool here for that reason.
 */
const LazyPanel = (
  {
    height,
    /**
     * Treat `height` as a floor rather than a fixed box.
     *
     * Needed by anything that sizes itself. Every chart in this directory that takes a `height`
     * applies it to its own plot and then adds a title, a legend or a caption around it, so its
     * real height is always more than the number it was handed - and a fixed box would have the
     * chrome hanging out of the bottom over whatever came next. The reserve is then an estimate,
     * which is affordable: the observer mounts a screen early, so the few pixels it settles by are
     * taken off screen rather than under the reader.
     */
    grow = false,
    children,
  }:
  {
    height: number;
    grow?: boolean;
    children: React.ReactNode;
  },
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown || !ref.current) {
      return undefined;
    }

    // older browsers and the server-rendered pass get everything at once rather than nothing
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      }
      // a screen of lead time, so a panel is drawn by the time it is scrolled to
    }, { rootMargin: '400px' });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [shown]);

  return (
    <div ref = {ref} style = {grow ? { minHeight: height } : { height }}>
      {shown ? children : null}
    </div>
  );
};

export default LazyPanel;
