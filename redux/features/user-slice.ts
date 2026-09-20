import State from '@/components/helpers/State';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Auth, Fantasy, Payments } from '@srating-io/types';


// todo this should really be renamed to the account-slice to make the url of /account

export type InitialState = {
  view: string,
  session_id: string | null,
  secret_id: string | null,
  kryptos: string | null,
  innerTag: string | null,
  isValidSession: boolean,
  loadingSecret: boolean,
  newUpdate: boolean,
  loadingView: boolean,
  loadedAccount: boolean,
  user: Auth.User;
  subscription: Payments.Subscriptions;
  pricing: Payments.Pricings;
  api_key: Auth.ApiKeys;
  fantasy_group_user: Fantasy.FantasyGroupUsers;
  fantasy_group: Fantasy.FantasyGroups;
  user_payment_token: Payments.UserPaymentTokens;
  notifications: Auth.Notifications;
};


export type InitialStateKeys = keyof InitialState;

type ActionPayload<K extends keyof InitialState> = {
  key: K;
  value: InitialState[K];
};


export const stateController = new State<InitialState>({
  type: 'account',
});

stateController.set_url_param_type_x_keys({
  string: [
    'view',
  ],
  number: [],
  array: [],
  boolean: [],
});

stateController.set_key_x_local_storage_key({
  session_id: 'session_id',
});

stateController.setInitialState({
  view: 'subscriptions',
  session_id: (typeof window !== 'undefined' && localStorage.getItem('session_id')) || null,
  secret_id: null,
  kryptos: null,
  innerTag: null,
  isValidSession: false,
  loadingSecret: false,
  newUpdate: false,
  loadingView: true,
  loadedAccount: false,
  user: {} as Auth.User,
  subscription: {} as Payments.Subscriptions,
  pricing: {} as Payments.Pricings,
  api_key: {} as Auth.ApiKeys,
  fantasy_group_user: {} as Fantasy.FantasyGroupUsers,
  fantasy_group: {} as Fantasy.FantasyGroups,
  user_payment_token: {} as Payments.UserPaymentTokens,
  notifications: {} as Auth.Notifications,
});

export const user = createSlice({
  name: 'user',
  initialState: stateController.getInitialState(),
  reducers: {
    setKryptos: (state, action: PayloadAction<string|null>) => {
      if (typeof window !== 'undefined') {
        if (action.payload) {
          sessionStorage.setItem('kryptos', action.payload);
        } else {
          sessionStorage.removeItem('kryptos');
        }
      }
      state.kryptos = action.payload;
    },
    setSecret: (state, action: PayloadAction<string|null>) => {
      if (typeof window !== 'undefined') {
        if (action.payload) {
          sessionStorage.setItem('secret', action.payload);
        } else {
          sessionStorage.removeItem('secret');
        }
      }
      state.secret_id = action.payload;
    },
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
  setKryptos,
  setSecret,
  updateFromURL,
  setDataKey,
  reset,
  resetDataKey,
  updateDataKey,
} = user.actions;
export default user.reducer;

stateController.updateStateFromUrlParams(stateController.getInitialState());
