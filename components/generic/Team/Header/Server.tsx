'use server';

import { Client } from '@/components/generic/Team/Header/Client';
import { useServerAPI } from '@/components/serverAPI';
import { CustomizedTeam } from '@/types/general';
import { General } from '@srating-io/types';



const Server = async ({ organization_id, division_id, season, team_id }) => {
  const revalidateSeconds = 60 * 60 * 2; // 2 hours

  const team: CustomizedTeam = await useServerAPI({
    class: 'team',
    function: 'loadTeam',
    arguments: {
      organization_id,
      division_id,
      team_id,
      season,
    },
    cache: revalidateSeconds,
  });

  const team_season_conferences: General.TeamSeasonConferences = await useServerAPI({
    class: 'team_season_conference',
    function: 'read',
    arguments: {
      team_id,
      organization_id,
    },
    cache: revalidateSeconds,
  });

  const coach_team_seasons: General.CoachTeamSeasons = await useServerAPI({
    class: 'coach_team_season',
    function: 'read',
    arguments: {
      team_id,
      season,
      organization_id,
    },
    cache: revalidateSeconds,
  });

  let coach_team_season: General.CoachTeamSeason | null = null;

  for (const id in coach_team_seasons) {
    const row = coach_team_seasons[id];

    if (
      !coach_team_season ||
      !row.end_date
    ) {
      coach_team_season = row;
    }
  }


  let coach: General.Coach | null = null;
  let coach_statistic_ranking: General.CoachStatisticRanking | null = null;

  if (coach_team_season && coach_team_season.coach_id) {
    coach = await useServerAPI({
      class: 'coach',
      function: 'get',
      arguments: {
        coach_id: coach_team_season.coach_id,
      },
      cache: revalidateSeconds,
    });

    coach_statistic_ranking = await useServerAPI({
      class: 'coach_statistic_ranking',
      function: 'getStats',
      arguments: {
        organization_id,
        division_id,
        coach_id: coach_team_season.coach_id,
        season: coach_team_season.season,
        current: '1',
      },
      cache: revalidateSeconds,
    });
  }

  const conference_statistic_ranking = await useServerAPI({
    class: 'conference_statistic_ranking',
    function: 'getStats',
    arguments: {
      organization_id,
      division_id,
      conference_id: team.conference_id,
      season,
      current: '1',
    },
    cache: revalidateSeconds,
  });

  const seasons = Object.values(team_season_conferences).map(((row) => row.season));
  // above should be unique already... but if not, uncomment
  // const seasons = [...new Set(allSeasons)];
  // console.timeEnd('header')
  return (
    <>
      <Client
        organization_id = {organization_id}
        division_id = {division_id}
        team = {team}
        season = {season}
        seasons = {seasons}
        coach = {coach}
        coach_statistic_ranking = {coach_statistic_ranking}
        conference_statistic_ranking = {conference_statistic_ranking}
      />
    </>
  );
};

export default Server;
