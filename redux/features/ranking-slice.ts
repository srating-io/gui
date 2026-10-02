
import State from '@/components/helpers/State';
import { RankingTable } from '@/types/general';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export type InitialState = {
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
  chartView: boolean,
  /**
   * Which chart `chartView` is showing. Null until a tab is picked, which keeps the param out of
   * the url for the chart a reader lands on, and is what leaving chart view resets it to.
   */
  chart: string | null,
  /** Tints each ranked cell by where it falls in the league, so a column can be read at a glance. */
  heatMap: boolean,
  lastUpdated: string | null,
  columnView: string,
  customColumns: Array<string>,
  data: object | null,
  filteredRows: RankingTable[] | null | boolean,
  searchValue: string,
  loadingView: boolean,
  career: number,
  career_active: number,
};

export type InitialStateKeys = keyof InitialState;

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
    'chart',
  ],
  number: [
    'career',
    'career_active',
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
    'chartView',
    'heatMap',
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
  chartView: false,
  chart: null,
  heatMap: false,
  lastUpdated: null,
  columnView: 'composite',
  customColumns: ['rank', 'name'],
  data: null,
  filteredRows: null,
  searchValue: '',
  loadingView: true,
  career: 0,
  career_active: 0,
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
