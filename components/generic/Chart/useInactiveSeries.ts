'use client';

import { useState } from 'react';

export type InactiveSeries = {
  /** dataKeys the reader has switched off. */
  inactive: string[];
  /** Flip one series on or off. */
  toggle: (dataKey: string) => void;
  /** Whether a given series is currently hidden. */
  isHidden: (dataKey?: string | number) => boolean;
};

/**
 * Tracks which series the reader has switched off from the legend.
 *
 * Kept as a hook rather than repeated in each chart so that hiding a series behaves the same
 * everywhere, and so an axis that fits itself to the data can ask what is actually being drawn.
 */
const useInactiveSeries = (): InactiveSeries => {
  const [inactive, setInactive] = useState<string[]>([]);

  const toggle = (dataKey: string) => {
    setInactive((previous) => (
      previous.includes(dataKey) ?
        previous.filter((key) => key !== dataKey) :
        [...previous, dataKey]
    ));
  };

  const isHidden = (dataKey?: string | number) => Boolean(dataKey && inactive.includes(dataKey.toString()));

  return { inactive, toggle, isHidden };
};

export default useInactiveSeries;
