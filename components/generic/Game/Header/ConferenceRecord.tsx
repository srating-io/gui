'use client';

import { useAppSelector } from '@/redux/hooks';
import { Skeleton, Typography, useTheme } from '@esmalley/react-material-ui';
import { Game } from '@srating-io/types';

const ConferenceRecord = (
  { game, team_id }:
  { game: Game.GameWithOddsAndTeams; team_id: string; },
) => {
  const theme = useTheme();
  const gameStats = useAppSelector((state) => state.gameReducer.gameStats);
  const gameStatsLoading = useAppSelector((state) => state.gameReducer.gameStatsLoading);

  // const current = (gameStats[game.game_id] && gameStats[game.game_id].current[team_id]) || null;
  const historical = (gameStats[game.game_id] && gameStats[game.game_id].historical[team_id]) || null;
  const statistic_ranking = historical;

  const wins = (statistic_ranking && statistic_ranking.confwins) || 0;
  const losses = (statistic_ranking && statistic_ranking.conflosses) || 0;

  return (
    <Typography type = 'overline' style = {{ color: theme.text.secondary, fontSize: 11, lineHeight: 'initial', marginLeft: '5px', display: 'inline-block' }}>
      {
        gameStatsLoading ?
          <Skeleton style={{ width: 25, height: 10 }} />
          :
          ` (${wins}-${losses})`
      }
    </Typography>
  );
};

export default ConferenceRecord;
