
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import State from '@/components/helpers/State';
import { Basketball, Football, General } from '@srating-io/types';

type InitialState = {
  view: string,
  subview: string | null,
  scrollTop: number,
  coach: General.Coach,
  coach_team_seasons: General.CoachTeamSeasons;
  teams: General.Teams;
  statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings;
  loadingView: boolean;
};

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

type InitialStateKeys = keyof InitialState;


const stateController = new State<InitialState>({
  type: 'compare',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
  ],
  number: [],
  array: [],
  boolean: [],
});

stateController.setInitialState({
  view: 'trends',
  subview: null,
  scrollTop: 0,
  coach: {} as General.Coach,
  coach_team_seasons: {},
  teams: {},
  statistic_rankings: {},
  loadingView: false,
});


export const coach = createSlice({
  name: 'coach',
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
} = coach.actions;
export default coach.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
