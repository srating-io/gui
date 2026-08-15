
import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Game, General } from '@srating-io/types';


// this is the /sport/games/abc path

type InitialState = {
  game: Game.GameWithOddsAndTeams,
  coaches: General.Coaches,
  coach_team_seasons: General.CoachTeamSeasons,
  gameStats: object,
  coachStats: object,
  conferenceStats: object,
  player_statistic_rankings: object,
  gameStatsLoading: boolean,
  gamePrediction: object,
  gamePredictionLoading: boolean,
  refreshRate: number,
  refreshCountdown: number,
  refreshLoading: boolean,
  refreshEnabled: boolean,
  loadingView: boolean,
  view: string | null,
  subview: string | null,
  trendsColumn: string | null,
};

type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'game',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
    'trendsColumn',
  ],
  number: [],
  array: [],
  boolean: [],
});

stateController.setInitialState({
  game: {} as Game.GameWithOddsAndTeams,
  coaches: {},
  coach_team_seasons: {},
  gameStats: {},
  coachStats: {},
  conferenceStats: {},
  player_statistic_rankings: {},
  gameStatsLoading: true,
  gamePrediction: {},
  gamePredictionLoading: true,
  refreshRate: 15,
  refreshCountdown: 15,
  refreshLoading: false,
  refreshEnabled: true,
  loadingView: true,
  view: null,
  subview: null,
  trendsColumn: null,
});


export const game = createSlice({
  name: 'game',
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
  reset,
  resetDataKey,
} = game.actions;
export default game.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
