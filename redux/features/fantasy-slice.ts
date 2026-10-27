
import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type InitialState = {
  view: string;
  // null means the sport current season, which is what the Surface resolved for the first render
  season: number | null;
  // only the seasons that have a league, straight from loadHome
  seasons: number[];
  loadingView: boolean,
};

export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends InitialStateKeys> = {
  key: K;
  value: InitialState[K];
};

export const stateController = new State<InitialState>({
  type: 'fantasy',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
  ],
  number: [
    'season',
  ],
  array: [
  ],
  boolean: [
  ],
});

stateController.set_key_x_is_push_state({
  view: true,
  season: true,
});

stateController.setInitialState({
  view: 'home',
  season: null,
  seasons: [],
  loadingView: true,
});


export const fantasy = createSlice({
  name: 'fantasy',
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
  setDataKey, resetDataKey, reset, updateFromURL,
} = fantasy.actions;
export default fantasy.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
