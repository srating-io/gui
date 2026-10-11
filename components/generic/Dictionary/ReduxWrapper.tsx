'use client';

import React from 'react';
import Loader from './Loader';

const ReduxWrapper = (
  { children, table, table_id }:
  { children: React.ReactNode, table?: string, table_id?: string },
) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Loader table={table} table_id={table_id} />
      {children}
    </div>
  );
};

export default ReduxWrapper;
