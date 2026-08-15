import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { General } from '@srating-io/types';


type InitialState = {
  view: string,
  subview: string | null,
  team: General.Team,
  team_season_conference: General.TeamSeasonConference,
  schedulePredictions: General.Predictions,
  schedulePredictionsLoading: boolean,
  scheduleStats: object,
  scheduleStatsLoading: boolean,
  showScheduleDifferentials: boolean,
  showScheduleHistoricalRankRecord: boolean,
  visibleScheduleDifferentials: string[],
  scheduleView: string,
  scrollTop: number,
  loadingView: boolean,
  trendsBoxscoreLine: boolean,
  trendsColumn: string | null,
};

type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};


const stateController = new State<InitialState>({
  type: 'team',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
    // 'season',
    'trendsColumn',
  ],
  number: [],
  array: [],
  boolean: [],
});

stateController.setInitialState({
  view: 'schedule',
  subview: null,
  team: {} as General.Team,
  team_season_conference: {} as General.TeamSeasonConference,
  schedulePredictions: {},
  schedulePredictionsLoading: true,
  scheduleStats: {},
  scheduleStatsLoading: true,
  showScheduleDifferentials: false,
  showScheduleHistoricalRankRecord: true,
  visibleScheduleDifferentials: [],
  scheduleView: 'default',
  scrollTop: 0,
  loadingView: true,
  trendsBoxscoreLine: false,
  trendsColumn: null,
});



export const team = createSlice({
  name: 'team',
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
    updateDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.updateDataKey(state, key, value);
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
  updateDataKey,
} = team.actions;
export default team.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
