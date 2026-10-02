import { Objector } from '@esmalley/ts-utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Themes } from '@esmalley/react-material-ui';

const localStorageKey = 'theme';

export const themeCookieKey = 'theme';

/**
 * A year. The mode is a preference, not a session, and the cookie is the only copy of it a request
 * carries, so losing it costs a wrong first paint.
 */
const cookieMaxAge = 60 * 60 * 24 * 365;

export const defaultMode: Themes = 'dark';

/** Narrows whatever came out of a cookie or localStorage, both of which hold arbitrary strings. */
export const asMode = (value: string | null | undefined): Themes | null => (
  value === 'dark' || value === 'light' ? value : null
);

type InitialState = {
  mode: Themes,
};

/**
 * Deliberately a constant rather than a read of the browser.
 *
 * UXBaseline writes the body colours into a style tag, so the mode is part of the markup React
 * hydrates against. A store seeded from localStorage disagreed with the server, which only ever saw
 * the default, and React threw a hydration mismatch on every load in light mode. The real mode now
 * arrives as preloaded state from the layout, which reads it from the cookie - see `updateTheme`.
 */
const initialState = {
  mode: defaultMode,
} as InitialState;

const defaultState = Object.freeze(Objector.deepClone(initialState));

/**
 * The mode the browser knows about, for the one render where the cookie cannot answer.
 *
 * A first-ever visit has no cookie, and anyone who set the mode before it was stored in one has it
 * only in localStorage. Both are resolved after hydration, where changing the mode is just a
 * re-render rather than a mismatch.
 */
export const resolveStoredMode = (): Themes => {
  if (typeof window === 'undefined') {
    return defaultMode;
  }

  const stored = asMode(localStorage.getItem(localStorageKey));

  if (stored) {
    return stored;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return defaultMode;
};

export const theme = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<Themes>) => {
      if (typeof document !== 'undefined') {
        // the cookie is what makes the next server render agree with the client; localStorage is
        // kept so a browser that drops the cookie still remembers the choice
        document.cookie = `${themeCookieKey}=${action.payload}; path=/; max-age=${cookieMaxAge}; samesite=lax`;
        localStorage.setItem(localStorageKey, action.payload);
      }
      state.mode = action.payload;
    },
  },
});

export const { updateTheme } = theme.actions;
export default theme.reducer;
