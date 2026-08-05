'use client';

import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/picks-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Game } from '@srating-io/types';
import { useEffect, useState } from 'react';


const PicksLoader = ({ organization_id, division_id, date }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [lastDate, setLastDate] = useState(null);

  const getData = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setLastDate(date);
    dispatch(setDataKey({ key: 'picksLoading', value: true }));

    useClientAPI({
      class: 'game',
      function: 'getScores',
      arguments: {
        organization_id,
        division_id,
        start_date: date,
      },
    }).then((response: Game.getScoresResults) => {
      dispatch(setDataKey({ key: 'picks', value: response }));
      dispatch(setDataKey({ key: 'picksLoading', value: false }));
      setLoading(false);
    }).catch((e) => {
      dispatch(setDataKey({ key: 'picksLoading', value: false }));
      setLoading(false);
    });
  };


  useEffect(() => {
    if (lastDate !== date) {
      getData();
    }
  }, [organization_id, division_id, date]);

  return null;
};

export default PicksLoader;
