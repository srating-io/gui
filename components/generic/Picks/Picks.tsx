'use client';


import Tile from '@/components/generic/Picks/Tile';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import AdditionalOptions from '@/components/generic/Picks/AdditionalOptions';
import ConferencePicker from '@/components/generic/ConferencePicker';
import ConferenceChips from '../ConferenceChips';
import { setLoading } from '@/redux/features/loading-slice';
import { useTransition } from 'react';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, Typography } from '@esmalley/react-material-ui';
import { Game, General } from '@srating-io/types';
import HelperGame from '@/components/helpers/Game';

export type PicksGameWithPrediction = Game.getGamesResults[string] & {
  prediction?: General.Prediction;
};

export type PickResultsWithPrediction = {
  [K in keyof Game.getGamesResults]: PicksGameWithPrediction;
};


const Picks = ({ games }: {games: PickResultsWithPrediction}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();
  const skip_sort_game_ids = useAppSelector((state) => state.favoriteReducer.skip_sort_game_ids);
  const game_ids = useAppSelector((state) => state.favoriteReducer.game_ids);
  const picksSort = useAppSelector((state) => state.displayReducer.picksSort);
  const selectedConferences = useAppSelector((state) => state.displayReducer.conferences);

  const hasAccess = useAppSelector((state) => state.userReducer.isValidSession);
  const picksData = useAppSelector((state) => state.picksReducer.picks);

  const sorted_games = Object.values(games);

  // Precomputed rather than derived inside the comparator, which runs O(n log n) times per
  // render. The projection and the market rows arrive from the picks store after the server
  // props, so merge a copy here rather than relying on the tile children to have run yet.
  const game_id_x_edge: { [game_id: string]: number | null } = {};

  if (picksSort === 'best_value') {
    for (let i = 0; i < sorted_games.length; i++) {
      const row = sorted_games[i];
      const liveRow = (picksData && row.game_id in picksData) ? picksData[row.game_id] : null;
      const merged = liveRow ? { ...row, ...liveRow } : row;

      game_id_x_edge[row.game_id] = new HelperGame({ game: merged }).getBestEdge().edge;
    }
  }

  sorted_games.sort((a, b) => {
    const aIsPinned = (
      skip_sort_game_ids.indexOf(a.game_id) === -1 &&
      game_ids.length &&
      game_ids.indexOf(a.game_id) > -1
    );

    const bIsPinned = (
      skip_sort_game_ids.indexOf(b.game_id) === -1 &&
      game_ids.length &&
      game_ids.indexOf(b.game_id) > -1
    );

    if (aIsPinned && !bIsPinned) {
      return -1;
    }

    if (!aIsPinned && bIsPinned) {
      return 1;
    }

    if (picksSort === 'best_value') {
      const aEdge = game_id_x_edge[a.game_id];
      const bEdge = game_id_x_edge[b.game_id];

      if (aEdge !== bEdge) {
        // Games with no market line or no projection fall to the bottom rather than being
        // treated as a zero edge, which would scatter them through the middle of the list.
        if (aEdge === null || aEdge === undefined) {
          return 1;
        }

        if (bEdge === null || bEdge === undefined) {
          return -1;
        }

        return aEdge > bEdge ? -1 : 1;
      }
    }

    if (
      picksSort === 'win_percentage' &&
      a.prediction &&
      b.prediction
    ) {
      const a_percentage = a.prediction.home_percentage > a.prediction.away_percentage ? a.prediction.home_percentage : a.prediction.away_percentage;
      const b_percentage = b.prediction.home_percentage > b.prediction.away_percentage ? b.prediction.home_percentage : b.prediction.away_percentage;

      if (a_percentage !== b_percentage) {
        return a_percentage > b_percentage ? -1 : 1;
      }
    }

    return a.start_datetime > b.start_datetime ? 1 : -1;
  });

  const gameContainers: React.JSX.Element[] = [];

  for (let i = 0; i < sorted_games.length; i++) {
    const game = sorted_games[i];

    if (
      selectedConferences.length &&
      selectedConferences.indexOf(game.teams[game.away_team_id].conference_id || '') === -1 &&
      selectedConferences.indexOf(game.teams[game.home_team_id].conference_id || '') === -1
    ) {
      continue;
    }

    gameContainers.push(<Tile key = {game.game_id} game = {game} />);
  }

  if (!hasAccess) {
    const handleSubscribe = () => {
      dispatch(setLoading(true));
      startTransition(() => {
        navigation.getRouter().push('/pricing');
      });
    };

    const handleLiveWinRate = () => {
      navigation.picksView({
        view: 'stats',
      });
    };

    return (
      <div style = {{ maxWidth: 400, margin: 'auto' }}>
        <Typography type = 'h6' style = {{ marginBottom: 10 }}>Subscription required</Typography>
        <Typography type = 'body1' style = {{ marginBottom: 10 }}>Subscribe for just $5 per month to get access to the win percentage and predicted score for every game!</Typography>
        <Typography type = 'a' onClick = {handleLiveWinRate}>View the live accuracy</Typography>
        <div style = {{ textAlign: 'right' }}>
          <Button onClick={handleSubscribe} autoFocus title = {'Subscribe'} value = 'subscribe' />
        </div>
      </div>
    );
  }

  return (
    <>
      <div style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ConferencePicker />
        <AdditionalOptions />
      </div>
      <div style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ConferenceChips />
      </div>
      <div style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {
          gameContainers.length ? gameContainers : <Typography type = 'h5'>No games found :( please adjust filter. </Typography>
        }
      </div>
    </>
  );
};

export default Picks;
