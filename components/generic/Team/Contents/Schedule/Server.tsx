'use server';

import { Suspense } from 'react';

import { Client } from '@/components/generic/Team/Contents/Schedule/Client';
import { useServerAPI } from '@/components/serverAPI';
import { ClientSkeleton } from './StatsLoader/Client';
import StatsLoaderServer from './StatsLoader/Server';
import { Team } from '@srating-io/types';

const Server = async ({ organization_id, division_id, season, team_id }) => {
  const revalidateSeconds = 60;

  const games: Team.getScheduleResults = await useServerAPI({
    class: 'team',
    function: 'getSchedule',
    arguments: {
      organization_id,
      division_id,
      team_id,
      season,
    },
    cache: revalidateSeconds,
  });

  return (
    <>
      <Client games = {games} team_id = {team_id} />
      <Suspense fallback = {<ClientSkeleton />}>
        <StatsLoaderServer game_ids = {Object.keys(games)} organization_id={organization_id} division_id={division_id} season = {season} />
      </Suspense>
    </>
  );
};

export default Server;
