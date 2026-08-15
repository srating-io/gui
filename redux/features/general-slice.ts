import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export type InitialState = {
  online: boolean;
};


export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};


export const stateController = new State<InitialState>({
  type: 'general',
});

stateController.set_url_param_type_x_keys({
  string: [],
  number: [],
  array: [],
  boolean: [],
});

// stateController.set_key_x_local_storage_key({
//   session_id: 'session_id',
// });

stateController.setInitialState({
  online: true,
});

export const general = createSlice({
  name: 'general',
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
    updateDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.updateDataKey(state, key, value);
    },
    setDataKey: <K extends keyof InitialState>(state: InitialState, action: PayloadAction<ActionPayload<K>>) => {
      const { value, key } = action.payload;
      stateController.setDataKey(state, key, value);
    },
  },
});

export const {
  updateFromURL,
  setDataKey,
  reset,
  resetDataKey,
  updateDataKey,
} = general.actions;
export default general.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
