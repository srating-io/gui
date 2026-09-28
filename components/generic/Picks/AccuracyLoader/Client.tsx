'use client';

import { setDataKey } from '@/redux/features/picks-slice';
import { useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';

const ClientSkeleton = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDataKey({ key: 'accuracyLoading', value: true }));
  }, [dispatch]);

  return null;
};

const Client = ({ accuracy }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDataKey({ key: 'accuracy', value: accuracy }));
    dispatch(setDataKey({ key: 'accuracyLoading', value: false }));
  }, [dispatch, accuracy]);

  return null;
};

export { Client, ClientSkeleton };
