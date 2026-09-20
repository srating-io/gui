
import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Basketball, Fantasy, General } from '@srating-io/types';

export type InitialState = {
  fantasy_entry: Fantasy.FantasyEntry;
  fantasy_group: Fantasy.FantasyGroup;
  fantasy_entry_players: Fantasy.FantasyEntryPlayers;
  player_team_seasons: General.PlayerTeamSeasons;
  players: General.Players;
  fantasy_bracket_slots: Fantasy.FantasyBracketSlots;
  bracket_teams: General.BracketTeams;
  teams: General.Teams;
  games: General.Games;
  fantasy_entry_player_statistic_rankings: {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  };
  // player_boxscores: PlayerBoxscores;
  loadingView: boolean;
};

export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends InitialStateKeys> = {
  key: K;
  value: InitialState[K];
};

export const stateController = new State<InitialState>({
  type: 'fantasy_entry',
});

stateController.set_url_param_type_x_keys({
  string: [
    // 'view',
  ],
  number: [],
  array: [
  ],
  boolean: [
  ],
});

// stateController.set_key_x_is_push_state({
//   view: true,
// });

stateController.setInitialState({
  fantasy_entry: {} as Fantasy.FantasyEntry,
  fantasy_group: {} as Fantasy.FantasyGroup,
  fantasy_entry_players: {} as Fantasy.FantasyEntryPlayers,
  player_team_seasons: {} as General.PlayerTeamSeasons,
  players: {} as General.Players,
  fantasy_bracket_slots: {} as Fantasy.FantasyBracketSlots,
  bracket_teams: {} as General.BracketTeams,
  teams: {} as General.Teams,
  games: {} as General.Games,
  // player_boxscores: {} as PlayerBoxscores,
  fantasy_entry_player_statistic_rankings: {} as {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  },
  loadingView: true,
});


export const fantasy_entry = createSlice({
  name: 'fantasy_entry',
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
} = fantasy_entry.actions;
export default fantasy_entry.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
