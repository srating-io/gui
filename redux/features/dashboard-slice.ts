import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Audit, AuditGui, Dashboard } from '@srating-io/types';

// this is the /dashboard path -- admin only, enforced by the api and not by this route

type InitialState = {
  view: string,
  /** Which bug the detail panel is showing. Empty means the list. */
  audit_gui_id: string,
  /** '' for every bug, '0' for open ones, '1' for resolved ones. */
  resolved: string,
  releases: string[],
  sources: string[],
  search: string,
  order_by: string,
  order: string,
  /** How far back the traffic panel looks. */
  days: number,

  loadingView: boolean,
  /**
   * The api refused us. Every endpoint behind this page answers `{ error: 'access denied' }` to a
   * caller who is not an admin, which is the only signal the browser gets or needs -- the role is
   * never checked here.
   */
  denied: boolean,

  overview: Dashboard.overviewResults | null,
  errors: Audit.AuditGuis | AuditGui.listResults | null,
  errorDetail: Audit.AuditGui | null,
  traffic: Dashboard.apiTrafficResults | null,
  revenue: Dashboard.revenueResults | null,
  keys: Dashboard.apiKeysResults | null,
};

type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

export const stateController = new State<InitialState>({
  type: 'dashboard',
});

stateController.set_url_param_type_x_keys({
  string: ['view', 'audit_gui_id', 'resolved', 'release', 'source', 'search', 'order_by', 'order'],
  number: ['days'],
  array: [],
  boolean: [],
});

/**
 * Opening one bug is a navigation, not a filter change, so it earns its own history entry. That is
 * what lets the standard back button walk out of the detail panel the way it does everywhere else.
 */
stateController.set_key_x_is_push_state({
  audit_gui_id: true,
});

stateController.setInitialState({
  view: 'overview',
  audit_gui_id: '',
  resolved: '0',
  releases: [],
  sources: [],
  search: '',
  order_by: 'last_seen',
  order: 'desc',
  days: 7,

  loadingView: true,
  denied: false,

  overview: null,
  errors: null,
  errorDetail: null,
  traffic: null,
  revenue: null,
  keys: null,
});


export const dashboard = createSlice({
  name: 'dashboard',
  initialState: stateController.getInitialState(),
  reducers: {
    updateFromURL: (state) => {
      stateController.updateStateFromUrlParams(state);
    },
    reset: {
      reducer: (state, action: PayloadAction<boolean | undefined>) => {
        stateController.reset(state, action.payload);
      },
      prepare: (payload?: boolean) => ({ payload }),
    },
    resetDataKey: (state: InitialState, action: PayloadAction<InitialStateKeys>) => {
      stateController.resetDataKey(state, action.payload);
    },
    setDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.setDataKey(state, key, value);
    },
    updateDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.updateDataKey(state, key, value);
    },
  },
});

export type { InitialState, InitialStateKeys };

export const {
  updateFromURL,
  updateDataKey,
  setDataKey,
  reset,
  resetDataKey,
} = dashboard.actions;
export default dashboard.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
