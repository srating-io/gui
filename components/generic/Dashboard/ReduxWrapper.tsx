'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dashboard-slice';

const ReduxWrapper = (
  {
    children,
    view,
  }:
  {
    children: React.ReactNode,
    view: string
  },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDataKey({ key: 'view', value: view }));
  }, [dispatch, view]);

  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
