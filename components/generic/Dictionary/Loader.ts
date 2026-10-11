'use client';

import { useEffect } from 'react';
import { useClientAPI } from '@/components/clientAPI';
import { useAppDispatch } from '@/redux/hooks';
import { load, setDataKey } from '@/redux/features/dictionary-slice';

/**
 * Loads the dictionary data client side so the request carries the user's
 * session and the API can authorize it.
 */
const Loader = ({ table, table_id }: { table?: string, table_id?: string }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Nothing to load for the table selector
    if (!table) {
      dispatch(setDataKey({ key: 'loadingView', value: false }));
      return;
    }

    const controller = new AbortController();

    dispatch(setDataKey({ key: 'loadingView', value: true }));

    const args = table_id ?
      {
        class: table,
        function: 'get',
        arguments: { [`${table}_id`]: table_id },
      } :
      {
        class: table,
        function: 'read',
        arguments: {},
      };

    useClientAPI(args, { signal: controller.signal })
      .then((response) => {
        const data = (response && !response.error) ? response : {};
        if (table_id) {
          // Seed the editable copy here so RowDetails never renders a stale row
          dispatch(setDataKey({ key: 'row', value: data }));
          dispatch(setDataKey({ key: 'form', value: data }));
          dispatch(setDataKey({ key: 'formError', value: '' }));
        } else {
          dispatch(setDataKey({ key: 'rows', value: data }));
        }
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
  }, [table, table_id, dispatch]);

  return null;
};

export default Loader;
