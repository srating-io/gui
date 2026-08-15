
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import State from '@/components/helpers/State';

const rankLocalStorageKey = 'DISPLAY.RANK';
const picksSortLocalStorageKey = 'DISPLAY.PICKS.SORT';
const conferencesLocalStorageKey = 'DISPLAY.CONFERENCE_IDS';
const positionsLocalStorageKey = 'DISPLAY.POSITIONS';
const statusesLocalStorageKey = 'DISPLAY.STATUSES';
const cardsViewLocalStorageKey = 'DISPLAY.GAMES.CARDSVIEW';
const gamesFilterLocalStorageKey = 'DISPLAY.GAMES.FILTER';
const oddsLocalStorageKey = 'DISPLAY.ODDS';

let rankLocalStorage: string | null = null;
let picksSortLocalStorage: string | null = null;
let conferencesLocalStorage: string | null = null;
let positionsLocalStorage: string | null = null;
let statusesLocalStorage: string | null = null;
let cardsViewLocalStorage: string | null = null;
let gamesFilterLocalStorage: string | null = null;
let oddsLocalStorage: string | null = null;

if (typeof window !== 'undefined') {
  rankLocalStorage = localStorage.getItem(rankLocalStorageKey);
  picksSortLocalStorage = localStorage.getItem(picksSortLocalStorageKey);
  conferencesLocalStorage = localStorage.getItem(conferencesLocalStorageKey);
  positionsLocalStorage = localStorage.getItem(positionsLocalStorageKey);
  statusesLocalStorage = localStorage.getItem(statusesLocalStorageKey);
  cardsViewLocalStorage = localStorage.getItem(cardsViewLocalStorageKey);
  gamesFilterLocalStorage = localStorage.getItem(gamesFilterLocalStorageKey);
  oddsLocalStorage = localStorage.getItem(oddsLocalStorageKey);
}

type InitialState = {
  rank: string,
  picksSort: string,
  conferences: string[],
  positions: string[],
  statuses: string[],
  cardsView: string,
  gamesFilter: string,
  hideOdds: number, // 0 or 1
  // season: number,
};

type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'display',
});

stateController.set_checkType(false);

stateController.set_url_param_type_x_keys({
  string: [
  ],
  number: [],
  array: [
    'conferences',
    'positions',
  ],
  boolean: [],
});

stateController.set_key_x_local_storage_key({
  rank: rankLocalStorageKey,
  picksSort: picksSortLocalStorageKey,
  conferences: conferencesLocalStorageKey,
  positions: positionsLocalStorageKey,
  statuses: statusesLocalStorageKey,
  cardsView: cardsViewLocalStorageKey,
  gamesFilter: gamesFilterLocalStorageKey,
  hideOdds: oddsLocalStorageKey,
});

stateController.setDefaultState(Object.freeze({
  rank: 'rank',
  picksSort: 'start_time',
  conferences: [],
  positions: [],
  statuses: ['pre', 'live', 'final'],
  cardsView: 'compact',
  gamesFilter: 'all',
  hideOdds: 0,
}));


stateController.setInitialState({
  rank: rankLocalStorage || 'rank',
  picksSort: picksSortLocalStorage || 'start_time',
  conferences: (conferencesLocalStorage && JSON.parse(conferencesLocalStorage)) || [],
  positions: (positionsLocalStorage && JSON.parse(positionsLocalStorage)) || [],
  statuses: (statusesLocalStorage && JSON.parse(statusesLocalStorage)) || ['pre', 'live', 'final'],
  cardsView: cardsViewLocalStorage || 'compact',
  gamesFilter: gamesFilterLocalStorage || 'all',
  hideOdds: +(oddsLocalStorage || 0),
  // season: new HelperCBB().getCurrentSeason(),
});


export const display = createSlice({
  name: 'display',
  initialState: stateController.getInitialState(),
  reducers: {
    updateFromURL: (state) => {
      stateController.updateStateFromUrlParams(state);
    },
    updateDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.updateDataKey(state, key, value);
    },
    reset: {
      reducer: (state, action: PayloadAction<boolean | undefined>) => {
        stateController.reset(state, action.payload);
      },
      // prepare receives optional payload and returns { payload }
      prepare: (payload?: boolean) => ({ payload }),
    },
    resetDataKey: (state: InitialState, action: PayloadAction<InitialStateKeys>) => {
      stateController.resetDataKey(state, action.payload);
    },
    setDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.setDataKey(state, key, value);
    },
  },
});

export const {
  reset, resetDataKey, updateDataKey, setDataKey, updateFromURL,
} = display.actions;
export default display.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
