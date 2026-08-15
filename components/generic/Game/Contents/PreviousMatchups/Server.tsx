'use server';

import { Client } from '@/components/generic/Game/Contents/PreviousMatchups/Client';
import { useServerAPI } from '@/components/serverAPI';
import { General } from '@srating-io/types';

const Server = async ({ game }) => {
  // const tag = 'cbb.games.'+ game_id;

  const { game_id } = game;
  const revalidateSeconds = 3600; // 60 * 60; // 1 hour

  const previousMatchups: General.Games = await useServerAPI({
    class: 'game',
    function: 'getPreviousMatchups',
    arguments: {
      game_id,
      limit: 10,
    },
    cache: revalidateSeconds,
  });

  return (
    <>
      <Client game = {game} previousMatchups = {previousMatchups} />
    </>
  );
};

export default Server;
