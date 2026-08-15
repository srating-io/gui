'use client';

import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/game-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Game } from '@srating-io/types';
import { useEffect, useState } from 'react';


const PredictionLoader = ({ game_id }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [lastID, setLastID] = useState(null);

  const getData = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setLastID(game_id);
    dispatch(setDataKey({ key: 'gamePredictionLoading', value: true }));

    useClientAPI({
      class: 'game',
      function: 'getScores',
      arguments: {
        game_id,
      },
    }).then((response: Game.getScoresResults) => {
      dispatch(setDataKey({ key: 'gamePrediction', value: response }));
      dispatch(setDataKey({ key: 'gamePredictionLoading', value: false }));
      setLoading(false);
    }).catch((e) => {
      dispatch(setDataKey({ key: 'gamePredictionLoading', value: false }));
      setLoading(false);
    });
  };


  useEffect(() => {
    if (lastID !== game_id) {
      getData();
    }
  }, [game_id]);

  return null;
};

export default PredictionLoader;
