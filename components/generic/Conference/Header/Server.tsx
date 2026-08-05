'use server';

import HeaderClient from '@/components/generic/Conference/Header/Client';
import { useServerAPI } from '@/components/serverAPI';
import { General } from '@srating-io/types';
import { unstable_noStore } from 'next/cache';


const Server = async ({ organization_id, division_id, season, conference_id }) => {
  unstable_noStore();
  const revalidateSeconds = 60 * 60 * 2; // 2 hours

  const conference_statistic_ranking = await useServerAPI({
    class: 'conference_statistic_ranking',
    function: 'getStats',
    arguments: {
      organization_id,
      division_id,
      season,
      conference_id,
      current: '1',
    },
    cache: revalidateSeconds,
  });

  const team_season_conferences: General.TeamSeasonConferences = await useServerAPI({
    class: 'team_season_conference',
    function: 'read',
    arguments: {
      conference_id,
      organization_id,
    },
    cache: revalidateSeconds,
  });


  const allSeasons = Object.values(team_season_conferences).map((row) => row.season);
  // gets only the unique ones
  const seasons = [...new Set(allSeasons)];

  return (
    <>
      <HeaderClient conference_statistic_ranking = {conference_statistic_ranking} season = {season} conference_id = {conference_id} seasons = {seasons} />
    </>
  );
};

export default Server;
