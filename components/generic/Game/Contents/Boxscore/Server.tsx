'use server';

import { Client } from '@/components/generic/Game/Contents/Boxscore/Client';
import { useServerAPI } from '@/components/serverAPI';
import { Basketball, Football, General } from '@srating-io/types';

const Server = async (
  { game }:
  { game: General.Game },
) => {
  const { game_id, organization_id, division_id } = game;
  const revalidateSeconds = 30;

  const boxscores: Basketball.Boxscores | Football.Boxscores = await useServerAPI({
    class: 'boxscore',
    function: 'readBoxscore',
    arguments: { game_id, organization_id, division_id },
    cache: revalidateSeconds,
  });

  const player_boxscores: Basketball.PlayerBoxscores | Football.PlayerBoxscores = await useServerAPI({
    class: 'player_boxscore',
    function: 'readPlayerBoxscore',
    arguments: { game_id, organization_id, division_id },
    cache: revalidateSeconds,
  });

  const players_ids = Object.values(player_boxscores).filter((player_boxscore) => (player_boxscore.player_id)).map((player_boxscore) => player_boxscore.player_id);

  let players = {};

  if (players_ids.length) {
    players = await useServerAPI({
      class: 'player',
      function: 'read',
      arguments: { player_id: players_ids },
      cache: revalidateSeconds,
    });
  }

  return (
    <>
      <Client game = {game} boxscores = {boxscores} player_boxscores = {player_boxscores} players = {players} />
    </>
  );
};

export default Server;
