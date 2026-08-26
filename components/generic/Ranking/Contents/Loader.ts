'use client';

import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/ranking-slice';
import { setDataKey as setCacheDataKey } from '@/redux/features/cache-slice';
import { useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';
import { getStore } from '@/app/StoreProvider';
import { Objector } from '@esmalley/ts-utils';

export const getCachedDataKey = ({ organization_id, division_id, season, view, career, career_active }) => {
  return `${organization_id}${division_id}${season}${view}${career}${career_active}_ranking_data`;
};

const Loader = ({ organization_id, division_id, season, view, career, career_active }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const seconds = 60 * 60; // cache for 1 hours
    let fxn = 'getTeamRanking';
    if (view === 'player') {
      fxn = 'getPlayerRanking';
    } else if (view === 'transfer') {
      fxn = 'getTransferRanking';
    } else if (view === 'conference') {
      fxn = 'getConferenceRanking';
    } else if (view === 'coach') {
      fxn = 'getCoachRanking';
    }

    const dataArgs = {
      class: 'ranking',
      function: 'load',
      arguments: {
        organization_id,
        division_id,
        season,
        fxn,
        career,
        career_active,
      },
      cache: seconds,
    };

    const store = getStore();

    const one_hour_ms = 60 * 60 * 1000;
    const requestTime = new Date().getTime();
    const cachedDataKey = getCachedDataKey({ organization_id, division_id, season, view, career, career_active });

    const { rankingData } = store.getState().cacheReducer;

    if (
      rankingData &&
      cachedDataKey in rankingData &&
      'timer' in rankingData[cachedDataKey] &&
      'data' in rankingData[cachedDataKey]
    ) {
      const { data, timer } = rankingData[cachedDataKey];
      const timerValue = +(timer || Infinity);
      if ((+requestTime - timerValue) < one_hour_ms) {
        if (data) {
          dispatch(setDataKey({ key: 'data', value: data }));
          dispatch(setDataKey({ key: 'loadingView', value: false }));
          return;
        }
      }
    }


    dispatch(setDataKey({ key: 'loadingView', value: true }));

    useClientAPI(dataArgs, { signal: controller.signal })
      .then((response) => {
        let data = response;
        if (data.error) {
          data = {};
        }
        const store = getStore();
        const rankingData = Objector.deepClone(store.getState().cacheReducer.rankingData);
        delete rankingData[cachedDataKey];
        rankingData[cachedDataKey] = { timer: requestTime, data: response };

        dispatch(setCacheDataKey({ key: 'rankingData', value: rankingData }));
        dispatch(setDataKey({ key: 'data', value: response }));
        dispatch(setDataKey({ key: 'loadingView', value: false }));
      }).catch((e) => {
        if (e?.name !== 'AbortError') {
          dispatch(setDataKey({ key: 'loadingView', value: false }));
        }
      });

    // eslint-disable-next-line consistent-return
    return () => {
      controller.abort();
    };
  }, [view, season, organization_id, division_id, career, career_active, dispatch]);

  return null;
};

export default Loader;
