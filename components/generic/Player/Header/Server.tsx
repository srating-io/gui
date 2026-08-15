'use server';

import { Client } from '@/components/generic/Player/Header/Client';
import { useServerAPI } from '@/components/serverAPI';
import { Basketball, Football } from '@srating-io/types';

const Server = async ({ organization_id, division_id, season, player_id, team_id, player_team_season_id }) => {
  const revalidateSeconds = 60 * 60 * 6; // 6 hours

  let player_statistic_ranking = await useServerAPI({
    class: 'player_statistic_ranking',
    function: 'getStats',
    arguments: {
      organization_id,
      division_id,
      season,
      player_id,
      player_team_season_id,
      current: '1',
      career: 0,
      career_active: 0,
    },
    cache: revalidateSeconds,
  }) as Basketball.PlayerStatisticRanking | Football.PlayerStatisticRanking;

  // if there is no current row, they were probably traded and we are looking at the historical stats when they were last on that team
  // so read the rows and get the last one
  if (!player_statistic_ranking || !player_statistic_ranking.player_statistic_ranking_id) {
    const player_statistic_rankings = await useServerAPI({
      class: 'player_statistic_ranking',
      function: 'readStats',
      arguments: {
        organization_id,
        division_id,
        season,
        player_id,
        player_team_season_id,
        career: 0,
        career_active: 0,
      },
      cache: revalidateSeconds,
    }) as Basketball.PlayerStatisticRankings | Football.PlayerStatisticRankings;

    for (const id in player_statistic_rankings) {
      const row = player_statistic_rankings[id];

      if (
        (!player_statistic_ranking || !player_statistic_ranking.player_statistic_ranking_id) ||
        player_statistic_ranking.date_of_rank < row.date_of_rank
      ) {
        player_statistic_ranking = row;
      }
    }
  }


  const statistic_ranking = await useServerAPI({
    class: 'statistic_ranking',
    function: 'getStats',
    arguments: {
      organization_id,
      division_id,
      team_id,
      season,
      current: '1',
    },
    cache: revalidateSeconds,
  }) as Basketball.StatisticRanking | Football.StatisticRanking;


  return (
    <>
      <Client organization_id={organization_id} division_id={division_id} player_statistic_ranking = {player_statistic_ranking} statistic_ranking = {statistic_ranking} season = {season} player_team_season_id = {player_team_season_id} />
    </>
  );
};

export default Server;
