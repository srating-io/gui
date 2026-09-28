'use client';

import Analysis from '@/components/generic/Analysis/Analysis';
import { useAppSelector } from '@/redux/hooks';
import { maxWidth } from '../Tile';


/**
 * The shared analysis section, fed from the projections page's slice and collapsed by default
 * because a full slate renders one of these per game.
 */
const TileAnalysis = ({ game }) => {
  const picksData = useAppSelector((state) => state.picksReducer.picks);
  const picksLoading = useAppSelector((state) => state.picksReducer.picksLoading);
  const accuracy = useAppSelector((state) => state.picksReducer.accuracy);

  return (
    <Analysis
      game = {game}
      liveRows = {picksData}
      accuracy = {accuracy}
      loading = {picksLoading}
      maxWidth = {maxWidth}
      collapsible
    />
  );
};

export default TileAnalysis;
