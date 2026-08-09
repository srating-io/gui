'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { load } from '@/redux/features/dictionary-slice';

const Client = ({ data }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(load(data));
  }, [dispatch, data]);

  return null;
};

export default Client;
