'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../redux/store';
import Initializer from '@/components/helpers/Initializer';
import dictionaryReducer, { load } from '@/redux/features/dictionary-slice';
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
  dictionary,
}: {
  children: React.ReactNode,
  /**
   * Read from the cookie by the layout, so the store holds the same mode on both sides of
   * hydration. UXBaseline puts the mode in the markup, so a store that guessed it here threw a
   * mismatch on every load in light mode.
   */
  themeMode: Themes,
  /**
   * Fetched by the layout. Read during render by `Organization.getNumberOfTeams`,
   * `Team.getConference` and the rank colours, so it cannot arrive in an effect.
   */
  dictionary?: object | null,
}) {
  // the same string on the server and the client, unlike `window.location`
  const pathName = usePathname();

  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore({
      themeReducer: { mode: themeMode },
      organizationReducer: {
        organization_id: Initializer.getInitialOrganizationID(pathName),
        division_id: Initializer.getInitialDivisionID(pathName),
        season: Initializer.getInitialSeason(pathName),
      },
      // run the slice's own reducer so the derived tables are built exactly as `load` builds them
      dictionaryReducer: dictionary ?
        dictionaryReducer(undefined, load(dictionary)) :
        undefined,
    });
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
