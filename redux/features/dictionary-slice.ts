

import { Objector } from '@esmalley/ts-utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { General } from '@srating-io/types';


type InitialState = {
  conference: General.Conferences,
  organization: General.Organizations,
  division: General.Divisions,
  terminology: General.Terminologies,
  fantasy_payout_rule: General.FantasyPayoutRules,
  organization_id_x_division_id_x_season_x_count: object,
  organization_id_x_division_id_x_season_x_conference_id_x_true: object,
  organization_id_x_division_id_x_ranking_seasons: object,
};

const initialState = {
  conference: {},
  organization: {},
  division: {},
  terminology: {},
  fantasy_payout_rule: {},
  organization_id_x_division_id_x_season_x_count: {},
  organization_id_x_division_id_x_season_x_conference_id_x_true: {},
  organization_id_x_division_id_x_ranking_seasons: {},
} as InitialState;

const defaultState = Object.freeze(Objector.deepClone(initialState));

export const dictionary = createSlice({
  name: 'dictionary',
  initialState,
  reducers: {
    load: (state, action: PayloadAction<object>) => {
      const data = action.payload;
      for (const table in data) {
        state[table] = data[table];
      }
    },
  },
});

export const { load } = dictionary.actions;
export default dictionary.reducer;
