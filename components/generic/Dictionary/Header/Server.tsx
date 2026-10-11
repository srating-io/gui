'use server';

import { Client } from '@/components/generic/Dictionary/Header/Client';

const Server = async ({ table, table_id }: { table?: string, table_id?: string }) => {
  return (
    <>
      <Client table={table} table_id={table_id} />
    </>
  );
};

export default Server;
