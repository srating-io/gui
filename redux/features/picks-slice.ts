import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export type InitialState = {
  view: string;
  subview: string | null;
  season: number | null;
  loadingView: boolean;
  scrollTop: number,
  picksLoading: boolean,
  picks: object,
  dates_checked: object,
  gameStats: object,
  gameStatsLoading: boolean,
};

export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'picks',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
    'season',
  ],
  number: [],
  array: [],
  boolean: [],
});

stateController.setInitialState({
  view: 'picks',
  subview: null,
  season: null,
  loadingView: true,
  scrollTop: 0,
  picksLoading: false,
  picks: {},
  dates_checked: {},
  gameStats: {},
  gameStatsLoading: true,
});


export const picks = createSlice({
  name: 'picks',
  initialState: stateController.getInitialState(),
  reducers: {
    updateFromURL: (state) => {
      stateController.updateStateFromUrlParams(state);
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
  updateFromURL,
  reset,
  resetDataKey,
  setDataKey,
} = picks.actions;
export default picks.reducer;
