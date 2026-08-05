'use client';

import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/user-slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { General } from '@srating-io/types';
import { useEffect, useState } from 'react';

interface Data {
  subscription: General.Subscriptions;
  pricing: General.Pricings;
  api_key: General.ApiKeys;
  user: General.User;
  fantasy_group_user: General.FantasyGroupUsers;
  fantasy_group: General.FantasyGroups;
  user_payment_token: General.UserPaymentTokens;
}

const AccountLoader = () => {
  const dispatch = useAppDispatch();
  const session_id = useAppSelector((state) => state.userReducer.session_id);
  const loadedAccount = useAppSelector((state) => state.userReducer.loadedAccount);

  const [loading, setLoading] = useState(false);

  const loadAccount = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    useClientAPI({
      class: 'billing',
      function: 'loadAccount',
      arguments: {},
    }).then((accountData: Data) => {
      setLoading(false);

      dispatch(setDataKey({ key: 'loadedAccount', value: true }));
      dispatch(setDataKey({ key: 'user', value: accountData.user }));
      dispatch(setDataKey({ key: 'pricing', value: accountData.pricing }));
      dispatch(setDataKey({ key: 'api_key', value: accountData.api_key }));
      dispatch(setDataKey({ key: 'subscription', value: accountData.subscription }));
      dispatch(setDataKey({ key: 'fantasy_group_user', value: accountData.fantasy_group_user }));
      dispatch(setDataKey({ key: 'fantasy_group', value: accountData.fantasy_group }));
      dispatch(setDataKey({ key: 'user_payment_token', value: accountData.user_payment_token }));
    }).catch((err) => {
      setLoading(false);
      dispatch(setDataKey({ key: 'loadedAccount', value: true }));
      // todo error handling sometime maybe
    });
  };

  useEffect(() => {
    if (!loadedAccount && session_id) {
      loadAccount();
    }
  }, [session_id, loadedAccount]);

  return null;
};

export default AccountLoader;
