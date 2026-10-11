'use server';

import Client from '@/components/generic/Picks/Stats/Client';
import { useServerAPI } from '@/components/serverAPI';


const Server = async ({ organization_id, division_id, date, season }) => {
  const stats = await useServerAPI({
    class: 'odds',
    function: 'getStatsData',
    arguments: {
      organization_id,
      division_id,
      date,
      season,
    },
    cache: 60 * 5,
  });

  return (
    <>
      <Client stats = {stats} date = {date} season = {season} />
    </>
  );
};

export default Server;
