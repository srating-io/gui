
import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { General } from '@srating-io/types';

export type InitialState = {
  view: string;
  subview: string | null;
  scrollTop: number;
  player: General.Player;
  player_team_season: General.PlayerTeamSeason | null;
  player_team_seasons: General.PlayerTeamSeasons;
  team: General.Team | null;
  teams: General.Teams;
  season: number | null;
  player_team_season_id: string | null;
  loadingView: boolean,
  trendsBoxscoreLine: boolean,
  trendsColumn: string | null,
  trendsSeasons: number[],
  showPerGameStats: boolean,
};

export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends InitialStateKeys> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'player',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
    'season',
    'trendsColumn',
    'player_team_season_id',
  ],
  array: [
    'trendsSeasons',
  ],
  boolean: [
    'trendsBoxscoreLine',
    'showPerGameStats',
  ],
});

stateController.setInitialState({
  view: 'stats',
  subview: null,
  scrollTop: 0,
  player: {} as General.Player,
  player_team_season: null,
  player_team_seasons: {} as General.PlayerTeamSeasons,
  team: null,
  teams: {} as General.Teams,
  season: null,
  player_team_season_id: null,
  loadingView: true,
  trendsBoxscoreLine: true,
  trendsColumn: null,
  trendsSeasons: [],
  showPerGameStats: true,
});

/*
export const stateThunk = createAsyncThunk(
  'router',
  ({ router }: { router: AppRouterInstance }) => {
    stateController.setRouter(router);
  },
);
*/

export const player = createSlice({
  name: 'player',
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
} = player.actions;
export default player.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
