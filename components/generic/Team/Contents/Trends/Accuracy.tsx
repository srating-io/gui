'use client';

import { ChartResidual, ResidualPoint } from '@/components/generic/Chart';
import Odds from '@/components/helpers/Odds';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Dates } from '@esmalley/ts-utils';
import { Button, LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';
import { Team } from '@srating-io/types';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useTransition } from 'react';
import { setLoading } from '@/redux/features/loading-slice';


/**
 * What the model called against what happened, one mark per finished game.
 *
 * The season's accuracy figure counts how often the winner was named and discards by how much,
 * which is where a lean hides: calling this team right nine times in ten while being four points
 * high on every one of them still reads as ninety percent. Here it shows as a cloud sitting off
 * the diagonal.
 *
 * Margins are taken from this team's perspective rather than the home side's, so a mark in the
 * top right is a win the model saw coming and one in the top left is a win it did not.
 */
const Accuracy = ({ games, team_id }: { games: Team.getScheduleResults, team_id: string }) => {
  const theme = useTheme();
  const [, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const predictions = useAppSelector((state) => state.teamReducer.schedulePredictions);
  const isLoadingPredictions = useAppSelector((state) => state.teamReducer.schedulePredictionsLoading);
  const hasAccess = useAppSelector((state) => state.userReducer.isValidSession);
  const navigation = useNavigation();

  const game_id_x_prediction = {};

  for (const prediction_id in predictions) {
    const row = predictions[prediction_id];
    game_id_x_prediction[row.game_id] = row;
  }

  const getPoints = (): ResidualPoint[] => {
    const points: ResidualPoint[] = [];

    for (const game_id in games) {
      const game = games[game_id];
      const homeScore = game.home_score;
      const awayScore = game.away_score;
      const prediction = game_id_x_prediction[game_id];

      if (game.status !== 'final' || homeScore === null || awayScore === null || !prediction) {
        continue;
      }

      const predictedHomeMargin = Odds.getProjectedMargin(prediction);

      if (predictedHomeMargin === null) {
        continue;
      }

      const isHome = game.home_team_id === team_id;
      const opponent_id = isHome ? game.away_team_id : game.home_team_id;
      const opponentName = game.teams[opponent_id] ? game.teams[opponent_id].name : 'Unknown';

      points.push({
        key: game.game_id,
        label: `${Dates.format(game.start_datetime, 'M jS')} ${isHome ? 'vs' : '@'} ${opponentName}`,
        predicted: +(isHome ? predictedHomeMargin : -predictedHomeMargin).toFixed(1),
        actual: isHome ? homeScore - awayScore : awayScore - homeScore,
      });
    }

    return points;
  };

  // the predictions arrive from the client after the page has painted, and an empty chart that
  // turns into a full one a moment later reads as a bug rather than as loading
  if (isLoadingPredictions) {
    return (
      <div style = {{ display: 'flex', justifyContent: 'center', padding: '20px 0px' }}>
        <LinearProgress color = {theme.secondary.main} containerStyle = {{ width: '50%' }} />
      </div>
    );
  }

  const points = getPoints();

  if (!hasAccess) {
    const handleSubscribe = () => {
      dispatch(setLoading(true));
      startTransition(() => {
        navigation.getRouter().push('/pricing');
      });
    };

    const handleLiveWinRate = () => {
      navigation.picksView({ view: 'stats' });
    };

    return (
      <div style = {{ maxWidth: 400, margin: 'auto' }}>
        <Typography type = 'h6' style = {{ marginBottom: 10 }}>Subscription required</Typography>
        <Typography type = 'body1' style = {{ marginBottom: 10 }}>Subscribe for just $5 per month to unlock subscriber tools!</Typography>
        <Typography type = 'a' onClick = {handleLiveWinRate}>View the live accuracy</Typography>
        <div style = {{ textAlign: 'right' }}>
          <Button onClick={handleSubscribe} autoFocus title = {'Subscribe'} value = 'subscribe' />
        </div>
      </div>
    );
  }

  // the chart holds its own floor on how few games it will draw, so the empty state is whatever
  // it declines to render
  return (
    <div style = {{ textAlign: 'center' }}>
      {
        points.length < 5 ?
          <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>Not enough data points yet... come back soon!</Typography> :
          <>
            <Typography type = 'body1' style = {{ padding: '0px 5px' }}>Called against finished</Typography>
            <div style = {{ margin: 'auto', maxWidth: 560 }}>
              <ChartResidual
                points = {points}
                xLabel = 'Projected margin'
                yLabel = 'Actual margin'
              />
            </div>
          </>
      }
    </div>
  );
};

export default Accuracy;
