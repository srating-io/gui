
import Organization from '@/components/helpers/Organization';
import Division from '@/components/helpers/Division';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Initializer from '@/components/helpers/Initializer';
import { DEFAULT_CBB_SEASON, DEFAULT_CFB_SEASON, DEFAULT_NBA_SEASON } from '@/components/helpers/Defaults';
import { Objector } from '@esmalley/ts-utils';



type InitialState = {
  organization_id: string,
  division_id: string,
  season: number,
};


const initalOrganizationID = Initializer.getInitialOrganizationID();
const initalDivisionID = Initializer.getInitialDivisionID();
const initalSeason = Initializer.getInitialSeason();

const initialState = {
  organization_id: initalOrganizationID,
  division_id: initalDivisionID,
  season: initalSeason,
} as InitialState;

const defaultState = Object.freeze(Objector.deepClone(initialState));

export const organization = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    updateOrganizationID: (state, action: PayloadAction<string>) => {
      // if changing the organization_id, set the division_id and season back to the default.
      // without the season the sport changes underneath it and the old sport's season sticks.
      if (action.payload !== state.organization_id) {
        if (action.payload === Organization.getCBBID()) {
          state.division_id = Division.getD1();
          state.season = DEFAULT_CBB_SEASON;
        }
        if (action.payload === Organization.getCFBID()) {
          state.division_id = Division.getFBS();
          state.season = DEFAULT_CFB_SEASON;
        }
        if (action.payload === Organization.getNBAID()) {
          state.division_id = Division.getNBA();
          state.season = DEFAULT_NBA_SEASON;
        }
      }
      // eslint-disable-next-line no-param-reassign
      state.organization_id = action.payload;
    },
    updateDivisionID: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line no-param-reassign
      state.division_id = action.payload;
    },
  },
});

export const { updateOrganizationID, updateDivisionID } = organization.actions;
export default organization.reducer;
