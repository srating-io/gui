'use client';

import { Typography } from '@esmalley/react-material-ui';
import { Textor } from '@esmalley/ts-utils';
import SaveButton from './SaveButton';

export const Client = ({ table, table_id }: { table?: string, table_id?: string }) => {
  const title = table ? Textor.toSentenceCase(table) : 'Dictionary';

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0px 8px' }}>
      <Typography type="subtitle1" style={{ fontWeight: 600, textAlign: 'center' }}>{title}</Typography>
      {table && table_id ? (
        <div style={{ position: 'absolute', right: 8, display: 'flex', alignItems: 'center' }}>
          <SaveButton table={table} />
        </div>
      ) : null}
    </div>
  );
};
