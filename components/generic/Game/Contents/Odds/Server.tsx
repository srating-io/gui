'use server';

import { Client } from '@/components/generic/Game/Contents/Odds/Client';
import AccuracyLoaderServer from '@/components/generic/Picks/AccuracyLoader/Server';
import { useServerAPI } from '@/components/serverAPI';

const Server = async ({ game }) => {
  const { game_id } = game;
  const revalidateSeconds = 60 * 60; // 1 hour

  const oddsStats = await useServerAPI({
    class: 'game',
    function: 'getOddsStats',
    arguments: { game_id },
    cache: revalidateSeconds,
  });

  return (
    <>
      {/* Feeds the same slice the projections page uses, so the analysis below can show the
          model's track record at this game's confidence. */}
      <AccuracyLoaderServer
        organization_id = {game.organization_id}
        division_id = {game.division_id}
        date = {game.start_date}
        season = {game.season}
      />
      <Client game = {game} oddsStats = {oddsStats} />
    </>
  );
};

export default Server;
