
import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { General } from '@srating-io/types';

export type InitialState = {
  loadingView: boolean,
  payment_router: General.PaymentRouter;
};

export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends InitialStateKeys> = {
  key: K;
  value: InitialState[K];
};

const stateController = new State<InitialState>({
  type: 'payment_router',
});

stateController.set_url_param_type_x_keys({
  string: [
  ],
  number: [],
  array: [
  ],
  boolean: [
  ],
});

stateController.setInitialState({
  loadingView: true,
  payment_router: {} as General.PaymentRouter,
});


export const payment_router = createSlice({
  name: 'payment_router',
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
} = payment_router.actions;
export default payment_router.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
