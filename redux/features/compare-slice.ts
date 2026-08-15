import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team } from '@srating-io/types';

type InitialState = {
  teams: {[team_id: string]: Team.loadTeamResults},
  home_team_id: string | null,
  away_team_id: string | null,
  next_search: string | null,
  neutral_site: boolean,
  view: string | null,
  subview: string | null,
  season: number,
  scrollTop: number,
  hideLowerBench: boolean,
  topPlayersOnly: boolean,
  predictions: object,
  predictionsLoading: boolean,
  loadingView: boolean,
  trendsColumn: string | null,
};

type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'compare',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
    'home_team_id',
    'away_team_id',
  ],
  number: [],
  array: [],
  boolean: [
    'neutral_site',
  ],
});

stateController.setInitialState({
  teams: {},
  home_team_id: null,
  away_team_id: null,
  next_search: null,
  neutral_site: false,
  view: 'team',
  subview: null,
  season: 0,
  scrollTop: 0,
  hideLowerBench: true,
  topPlayersOnly: false,
  predictions: {},
  predictionsLoading: true,
  loadingView: true,
  trendsColumn: null,
});


export const compare = createSlice({
  name: 'compare',
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
  setDataKey,
  resetDataKey,
  reset,
} = compare.actions;
export default compare.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
