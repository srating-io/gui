'use client';

import HelperGame from '@/components/helpers/Game';
import { getBreakPoint } from '@/components/generic/Game/Header/ClientWrapper';
import Refresher from '../Refresher';
import { Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


const Client = (
  { game, tag }:
  { game: General.Game; tag: string; },
) => {
  const { width } = useWindowDimensions();
  const theme = useTheme();

  let scoreVariant: string = 'h4';

  if (width < getBreakPoint()) {
    scoreVariant = 'h6';
  }

  const Game = new HelperGame({
    game,
  });

  const getScore = (score: number | null) => {
    if (!Game.isInProgress() && !Game.isFinal()) {
      return null;
    }

    return (
      <div>
        <Typography type = {scoreVariant as 'h4' | 'h5'}>{score || 0}</Typography>
      </div>
    );
  };

  const getTime = () => {
    return (
      <div>
        {!Game.isInProgress() ? <div><Typography type = 'overline' style = {{ color: theme.text.secondary }}>{Game.getStartDate(null)}</Typography></div> : ''}
        <div><Typography type = 'overline' style = {{ color: theme.info.dark }}>{Game.getTime()}</Typography></div>
      </div>
    );
  };

  return (
    <>
      <div style = {{
        display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', textAlign: 'center',
      }}>
        {getScore(game.away_score)}
        {getTime()}
        {getScore(game.home_score)}
      </div>
      <Refresher key = {game.game_id} game = {game} tag = {tag} />
    </>
  );
};

export default Client;
