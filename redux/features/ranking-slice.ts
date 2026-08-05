
import State from '@/components/helpers/State';
import { RankingTable } from '@/types/general';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


type InitialState = {
  view: string,
  season: number | null,
  order: string,
  orderBy: string,
  class_years: string[],
  hideCommitted: boolean,
  hideUnderTwoMPG: boolean,
  filterCommittedConf: boolean,
  filterOriginalConf: boolean,
  tableScrollTop: number,
  tableFullscreen: boolean,
  lastUpdated: string | null,
  columnView: string,
  customColumns: Array<string>,
  data: object | null,
  filteredRows: RankingTable[] | null | boolean,
  searchValue: string,
  loadingView: boolean,
};

type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends InitialStateKeys> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'ranking',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
    'season',
    'order',
    'orderBy',
    'columnView',
  ],
  array: [
    'customColumns',
    'class_years',
  ],
  boolean: [
    'hideCommitted',
    'hideUnderTwoMPG',
    'filterCommittedConf',
    'filterOriginalConf',
  ],
});

stateController.setInitialState({
  view: 'team',
  season: null,
  order: 'asc',
  orderBy: 'rank',
  class_years: [],
  hideCommitted: false,
  hideUnderTwoMPG: false,
  filterCommittedConf: true,
  filterOriginalConf: true,
  tableScrollTop: 0,
  tableFullscreen: false,
  lastUpdated: null,
  columnView: 'composite',
  customColumns: ['rank', 'name'],
  data: null,
  filteredRows: null,
  searchValue: '',
  loadingView: true,
} as InitialState);


export const ranking = createSlice({
  name: 'ranking',
  initialState: stateController.getInitialState(),
  reducers: {
    updateFromURL: (state) => {
      stateController.updateStateFromUrlParams(state);
    },
    updateDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.updateDataKey(state, key, value);
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
  reset,
  setDataKey,
  resetDataKey,
  updateDataKey,
} = ranking.actions;
export default ranking.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
