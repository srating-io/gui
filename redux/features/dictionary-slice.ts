

import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Fantasy, General } from '@srating-io/types';


type InitialState = {
  conference: General.Conferences,
  organization: General.Organizations,
  division: General.Divisions,
  terminology: General.Terminologies,
  fantasy_payout_rule: Fantasy.FantasyPayoutRules,
  organization_id_x_division_id_x_season_x_count: object,
  organization_id_x_division_id_x_season_x_conference_id_x_true: object,
  organization_id_x_division_id_x_ranking_seasons: object,
  row: object | undefined,
  rows: Record<string, Record<string, unknown>>,
  // The row as edited in RowDetails. Lives here so the header's save button can read it.
  form: object | undefined,
  formError: string,
  loadingView: boolean,
};


type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'dictionary',
});

stateController.set_url_param_type_x_keys({
  string: [],
  number: [],
  array: [],
  boolean: [],
});

stateController.setInitialState({
  conference: {},
  organization: {},
  division: {},
  terminology: {},
  fantasy_payout_rule: {},
  organization_id_x_division_id_x_season_x_count: {},
  organization_id_x_division_id_x_season_x_conference_id_x_true: {},
  organization_id_x_division_id_x_ranking_seasons: {},
  row: {},
  rows: {},
  form: {},
  formError: '',
  loadingView: true,
});


export const dictionary = createSlice({
  name: 'dictionary',
  initialState: stateController.getInitialState(),
  reducers: {
    load: (state, action: PayloadAction<object>) => {
      const data = action.payload;
      for (const table in data) {
        state[table] = data[table];
      }
    },
    setDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.setDataKey(state, key, value);
    },
  },
});

export const { load, setDataKey } = dictionary.actions;
export default dictionary.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
