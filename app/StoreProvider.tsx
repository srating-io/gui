'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../redux/store';
import type { Themes } from '@esmalley/react-material-ui';

declare global {
  interface Window {
    globalStore: AppStore;
  }
}

let globalStore: AppStore;

export function getStore(): AppStore {
  if (!globalStore) {
    throw new Error('Store not initialized');
  }

  return globalStore;
}

export default function StoreProvider({
  children,
  themeMode,
}: {
  children: React.ReactNode,
  /**
   * Read from the cookie by the layout, so the store holds the same mode on both sides of
   * hydration. UXBaseline puts the mode in the markup, so a store that guessed it here threw a
   * mismatch on every load in light mode.
   */
  themeMode: Themes,
}) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore({ themeReducer: { mode: themeMode } });
    globalStore = storeRef.current;
  }

  // so I can debug garbage redux + react
  if (typeof window !== 'undefined') {
    window.globalStore = globalStore;
  }

  return (
    <Provider store={storeRef.current}>{children}</Provider>
  );
}
