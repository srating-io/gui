
import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Basketball, Fantasy, General } from '@srating-io/types';

export type InitialState = {
  view: string;
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
  player_boxscores: Basketball.PlayerBoxscores;
  // The rest of the league, for standing and pick value. Empty until the api returns them.
  fantasy_rankings: Fantasy.FantasyRankings;
  fantasy_ranking_history: Fantasy.FantasyRankings;
  fantasy_entrys: Fantasy.FantasyEntrys;
  // select and clear broadcast these on the fantasy_entry channel, and the handler only merges a
  // key the slice already knows about
  fantasy_selections: Fantasy.FantasySelections;
  fantasy_slates: Fantasy.FantasySlates;
  fantasy_draft_orders: Fantasy.FantasyDraftOrders;
  fantasy_group_user: Fantasy.FantasyGroupUser;
  league_player_ratings: { [fantasy_entry_player_id: string]: number };
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
    'view',
  ],
  number: [],
  array: [
  ],
  boolean: [
  ],
});

stateController.set_key_x_is_push_state({
  view: true,
});

stateController.setInitialState({
  view: 'overview',
  fantasy_entry: {} as Fantasy.FantasyEntry,
  fantasy_group: {} as Fantasy.FantasyGroup,
  fantasy_entry_players: {} as Fantasy.FantasyEntryPlayers,
  player_team_seasons: {} as General.PlayerTeamSeasons,
  players: {} as General.Players,
  fantasy_bracket_slots: {} as Fantasy.FantasyBracketSlots,
  bracket_teams: {} as General.BracketTeams,
  teams: {} as General.Teams,
  games: {} as General.Games,
  player_boxscores: {} as Basketball.PlayerBoxscores,
  fantasy_rankings: {} as Fantasy.FantasyRankings,
  fantasy_ranking_history: {} as Fantasy.FantasyRankings,
  fantasy_entrys: {} as Fantasy.FantasyEntrys,
  fantasy_selections: {} as Fantasy.FantasySelections,
  fantasy_slates: {} as Fantasy.FantasySlates,
  fantasy_draft_orders: {} as Fantasy.FantasyDraftOrders,
  fantasy_group_user: {} as Fantasy.FantasyGroupUser,
  league_player_ratings: {} as { [fantasy_entry_player_id: string]: number },
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
