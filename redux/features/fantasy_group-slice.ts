
import State from '@/components/helpers/State';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Basketball, Fantasy, General } from '@srating-io/types';

export type InitialState = {
  view: string;
  subview?: string;
  // '' until the draft table reads the pool and picks a default, then 'season' or 'career_active'
  draft_stat_view?: string;
  isOwner: boolean;
  fantasy_group: Fantasy.FantasyGroup;
  fantasy_group_user: Fantasy.FantasyGroupUser | null;
  fantasy_group_users: Fantasy.FantasyGroupUsers;
  fantasy_group_invites: Fantasy.FantasyGroupInvites;
  fantasy_group_comments: Fantasy.FantasyGroupComments;
  fantasy_entrys: Fantasy.FantasyEntrys;
  fantasy_draft_orders: Fantasy.FantasyDraftOrders;
  fantasy_entry_players: Fantasy.FantasyEntryPlayers;
  // only ever this users own entries, the api does not return anyone elses
  fantasy_entry_pre_picks: Fantasy.FantasyEntryPrePicks;
  player_team_seasons: General.PlayerTeamSeasons;
  players: General.Players;
  fantasy_rankings: Fantasy.FantasyRankings;
  fantasy_entry_player_statistic_rankings: {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  };
  // the create entry modal: null is closed, '' is a new entry, a name resumes that entry's checkout.
  // shared because the checklist and the how it works card both open it, and only MyEntries mounts it
  joining_entry_name: string | null;
  // the card the how it works guide is pointing at, by dom id. shared because the guide and the
  // card it outlines are siblings, and deliberately not a url param so a reload does not restore it
  highlighted_anchor: string | null;
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
    'draft_stat_view',
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
  draft_stat_view: '',
  isOwner: false,
  fantasy_group: {} as Fantasy.FantasyGroup,
  fantasy_group_invites: {} as Fantasy.FantasyGroupInvites,
  fantasy_group_users: {} as Fantasy.FantasyGroupUsers,
  fantasy_group_comments: {} as Fantasy.FantasyGroupComments,
  fantasy_group_user: null,
  fantasy_entrys: {} as Fantasy.FantasyEntrys,
  fantasy_draft_orders: {} as Fantasy.FantasyDraftOrders,
  fantasy_entry_players: {} as Fantasy.FantasyEntryPlayers,
  fantasy_entry_pre_picks: {} as Fantasy.FantasyEntryPrePicks,
  player_team_seasons: {} as General.PlayerTeamSeasons,
  players: {} as General.Players,
  fantasy_rankings: {} as Fantasy.FantasyRankings,
  fantasy_entry_player_statistic_rankings: {} as {
    [fantasy_entry_player_statistic_ranking_id: string]: Fantasy.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  },
  joining_entry_name: null,
  highlighted_anchor: null,
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
