
import State from '@/components/helpers/State';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Basketball, Fantasy, General } from '@srating-io/types';

export type InitialState = {
  view: string;
  subview?: string;
  isOwner: boolean;
  fantasy_group: Fantasy.FantasyGroup;
  fantasy_group_user: Fantasy.FantasyGroupUser | null;
  fantasy_group_users: Fantasy.FantasyGroupUsers;
  fantasy_group_invites: Fantasy.FantasyGroupInvites;
  fantasy_group_comments: Fantasy.FantasyGroupComments;
  fantasy_entrys: Fantasy.FantasyEntrys;
  fantasy_draft_orders: Fantasy.FantasyDraftOrders;
  fantasy_entry_players: Fantasy.FantasyEntryPlayers;
  player_team_seasons: General.PlayerTeamSeasons;
  players: General.Players;
  fantasy_rankings: Fantasy.FantasyRankings;
  fantasy_entry_player_statistic_rankings: {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  };
  loadingView: boolean;
};

export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends InitialStateKeys> = {
  key: K;
  value: InitialState[K];
};

export const stateController = new State<InitialState>({
  type: 'fantasy_group',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'subview',
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
  view: 'home',
  subview: 'draft_board',
  isOwner: false,
  fantasy_group: {} as Fantasy.FantasyGroup,
  fantasy_group_invites: {} as Fantasy.FantasyGroupInvites,
  fantasy_group_users: {} as Fantasy.FantasyGroupUsers,
  fantasy_group_comments: {} as Fantasy.FantasyGroupComments,
  fantasy_group_user: null,
  fantasy_entrys: {} as Fantasy.FantasyEntrys,
  fantasy_draft_orders: {} as Fantasy.FantasyDraftOrders,
  fantasy_entry_players: {} as Fantasy.FantasyEntryPlayers,
  player_team_seasons: {} as General.PlayerTeamSeasons,
  players: {} as General.Players,
  fantasy_rankings: {} as Fantasy.FantasyRankings,
  fantasy_entry_player_statistic_rankings: {} as {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  },
  loadingView: true,
});


export const fantasy_group = createSlice({
  name: 'fantasy_group',
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
} = fantasy_group.actions;
export default fantasy_group.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
