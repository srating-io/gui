'use server';

import { Client } from '@/components/generic/Picks/AccuracyLoader/Client';
import { useServerAPI } from '@/components/serverAPI';


const Server = async ({ organization_id, division_id, date, season }) => {
  const revalidateSeconds = 60 * 5; // cache for 5 mins

  const accuracy: object = await useServerAPI({
    class: 'odds',
    function: 'getStatsData',
    arguments: {
      organization_id,
      division_id,
      date,
      season,
    },
    cache: revalidateSeconds,
  });

  return (
    <>
      <Client accuracy={accuracy} />
    </>
  );
};

export default Server;
