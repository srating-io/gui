'use client';

import { useAppSelector } from '@/redux/hooks';
import CompareStatistic, { CompareStatisticRow } from '@/components/generic/CompareStatistic';
import { getSkeleton, maxWidth } from '../Tile';
import Organization from '@/components/helpers/Organization';


const PredictionLine = ({ game }) => {
  const picksLoading = useAppSelector((state) => state.picksReducer.picksLoading);
  const picksData = useAppSelector((state) => state.picksReducer.picks);
  const numberOfTeams = Organization.getNumberOfTeams({ organization_id: game.organization_id, division_id: game.division_id, season: game.season });

  if (picksData && game.game_id in picksData) {
    Object.assign(game, picksData[game.game_id]);
  }

  const locked = (!game.prediction || (game.prediction.home_percentage === null && game.prediction.away_percentage === null));

  const away_percentage = (
    game &&
    game.prediction &&
    game.prediction.away_percentage
  );

  const home_percentage = (
    game &&
    game.prediction &&
    game.prediction.home_percentage
  );

  const away_score = (
    game &&
    game.prediction &&
    game.prediction.away_score
  );

  const home_score = (
    game &&
    game.prediction &&
    game.prediction.home_score
  );

  const compareRows: CompareStatisticRow[] = [
    {
      id: 'win_percentage',
      getLabel: () => 'Win %',
      getTooltip: () => 'Predicted win %',
      leftRow: { win_percentage: away_percentage },
      rightRow: { win_percentage: home_percentage },
      numeric: false,
      organization_ids: [Organization.getCBBID(), Organization.getCFBID()],
      getViews: () => ['matchup'],
      graphable: false,
      sort: 'higher',
      locked,
      getDisplayValue: (row) => {
        return `${(('win_percentage' in row ? Number(row.win_percentage) : 0) * 100).toFixed(0)}%`;
      },
      getValue: (row) => {
        return !locked && 'win_percentage' in row ? row.win_percentage : null;
      },
    },
    {
      id: 'predicted_score',
      getLabel: () => 'Predicted score',
      getTooltip: () => 'Predicted score',
      leftRow: { score: away_score },
      rightRow: { score: home_score },
      numeric: false,
      organization_ids: [Organization.getCBBID(), Organization.getCFBID()],
      getViews: () => ['matchup'],
      graphable: false,
      sort: 'higher',
      locked,
      getDisplayValue: (row) => {
        return !locked && 'score' in row ? row.score : 0;
      },
      getValue: (row) => {
        return !locked && 'score' in row ? row.score : 0;
      },
    },
  ];


  return (
    <>
      {
        picksLoading ?
          getSkeleton(2) :
          <CompareStatistic key = {game.game_id} maxWidth = {maxWidth} paper = {false} rows = {compareRows} max = {numberOfTeams} />
      }
    </>
  );
};

export default PredictionLine;
