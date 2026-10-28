'use client';

import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/ranking-slice';
import { setDataKey as setCacheDataKey } from '@/redux/features/cache-slice';
import { useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';
import { getStore } from '@/app/StoreProvider';
import { Objector } from '@esmalley/ts-utils';
import { buildRankingArguments } from '@/components/generic/Ranking/shared';

export const getCachedDataKey = ({ organization_id, division_id, season, view, career, career_active }) => {
  return `${organization_id}${division_id}${season}${view}${career}${career_active}_ranking_data`;
};

const Loader = ({ organization_id, division_id, season, view, career, career_active, grant }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const controller = new AbortController();

    // The api server decides the ttl, from the grant the server component signed. Passing a
    // number here would do nothing -- a browser cannot be trusted with one.
    const dataArgs = {
      class: 'ranking',
      function: 'load',
      arguments: buildRankingArguments({ organization_id, division_id, season, view, career, career_active }),
      grant,
    };

    const store = getStore();

    const one_hour_ms = 60 * 60 * 1000;
    const requestTime = new Date().getTime();
    const cachedDataKey = getCachedDataKey({ organization_id, division_id, season, view, career, career_active });

    const { rankingData } = store.getState().cacheReducer;

    // Read fresh off the store on every call: both draft Loaders can settle in the same tick, and
    // updateDataKey toggles membership rather than setting it.
    const setLoadError = (failed: boolean) => {
      const { loadErrorKeys } = getStore().getState().rankingReducer;

      if (loadErrorKeys.includes(cachedDataKey) === failed) {
        return;
      }

      dispatch(setDataKey({
        key: 'loadErrorKeys',
        value: failed ? [...loadErrorKeys, cachedDataKey] : loadErrorKeys.filter((key) => key !== cachedDataKey),
      }));
    };

    setLoadError(false);

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
        // Never cache a failure. The error object used to be cached and dispatched as if it were
        // ranking data - `data` was blanked here and then thrown away in favor of `response` on
        // every line below - so one transient failure left an empty player pool for an hour, on
        // draft day.
        if (response && response.error) {
          dispatch(setDataKey({ key: 'data', value: {} }));
          setLoadError(true);
          dispatch(setDataKey({ key: 'loadingView', value: false }));
          return;
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
          setLoadError(true);
          dispatch(setDataKey({ key: 'loadingView', value: false }));
        }
      });

    // eslint-disable-next-line consistent-return
    return () => {
      controller.abort();
    };
  }, [view, season, organization_id, division_id, career, career_active, grant, dispatch]);

  return null;
};

export default Loader;
