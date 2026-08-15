'use server';

import { Client } from '@/components/generic/Game/Contents/Charts/Client';
import { useServerAPI } from '@/components/serverAPI';
import { General } from '@srating-io/types';

const Server = async ({ game }) => {
  const { game_id } = game;
  const revalidateSeconds = 30;

  const game_pulses: General.GamePulses = await useServerAPI({
    class: 'game_pulse',
    function: 'read',
    arguments: { game_id },
    cache: revalidateSeconds,
  });

  const odds: General.Oddsz = await useServerAPI({
    class: 'odds',
    function: 'read',
    arguments: {
      odds_id: Object.values(game_pulses).map((row) => row.odds_id),
    },
    cache: revalidateSeconds,
  });

  return (
    <>
      <Client game = {game} game_pulses = {game_pulses} odds = {odds} />
    </>
  );
};

export default Server;
