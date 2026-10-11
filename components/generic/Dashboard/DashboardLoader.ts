'use client';

import { useEffect } from 'react';
import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/dashboard-slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

/**
 * Fetches whichever panel is showing.
 *
 * Client side, so the request carries the session and the api can decide whether it is talking to
 * an admin. The server-side caller could not be used here even if it were convenient: it presents
 * the master secret, which skips the admin gate, so the answer would land in html that an
 * unauthenticated visitor receives.
 *
 * None of these requests sets `cache`, and none of them may. The internal server keys its shared
 * cluster cache on the class, function and arguments with no session in the key, and it answers
 * from that cache *before* the api function runs -- so a cached admin payload would be handed
 * straight to the next caller who asked for the same thing, with the admin check never executing.
 */
const DashboardLoader = () => {
  const dispatch = useAppDispatch();

  const session_id = useAppSelector((state) => state.userReducer.session_id);
  const view = useAppSelector((state) => state.dashboardReducer.view);
  const audit_gui_id = useAppSelector((state) => state.dashboardReducer.audit_gui_id);
  const days = useAppSelector((state) => state.dashboardReducer.days);

  useEffect(() => {
    // no session is not a different case from not being an admin, as far as this page is concerned
    if (!session_id) {
      dispatch(setDataKey({ key: 'denied', value: true }));
      dispatch(setDataKey({ key: 'loadingView', value: false }));
      return;
    }

    const controller = new AbortController();

    const request = (() => {
      if (view === 'errors') {
        if (audit_gui_id) {
          return {
            key: 'errorDetail' as const,
            args: {
              class: 'audit_gui',
              function: 'get',
              arguments: { audit_gui_id },
            },
          };
        }

        return {
          key: 'errors' as const,
          args: {
            class: 'audit_gui',
            function: 'read',
            arguments: {},
          },
        };
      }

      if (view === 'traffic') {
        return {
          key: 'traffic' as const,
          args: { class: 'dashboard', function: 'apiTraffic', arguments: { days } },
        };
      }

      if (view === 'revenue') {
        return {
          key: 'revenue' as const,
          args: { class: 'dashboard', function: 'revenue', arguments: {} },
        };
      }

      if (view === 'keys') {
        return {
          key: 'keys' as const,
          args: { class: 'dashboard', function: 'apiKeys', arguments: {} },
        };
      }

      return {
        key: 'overview' as const,
        args: { class: 'dashboard', function: 'overview', arguments: {} },
      };
    })();

    dispatch(setDataKey({ key: 'loadingView', value: true }));

    useClientAPI(request.args, { signal: controller.signal })
      .then((response) => {
        // a refusal and a transport failure both land here; neither is worth telling apart, since
        // the only thing this page can do with either is decline to render
        const denied = !!(response && response.error);

        dispatch(setDataKey({ key: 'denied', value: denied }));

        if (!denied) {
          if (request.key === 'errorDetail') {
            dispatch(setDataKey({ key: 'errorDetail', value: response || null }));
          } else {
            dispatch(setDataKey({ key: request.key, value: response }));
          }
        }

        dispatch(setDataKey({ key: 'loadingView', value: false }));
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') {
          dispatch(setDataKey({ key: 'loadingView', value: false }));
        }
      });

    // eslint-disable-next-line consistent-return
    return () => {
      controller.abort();
    };
  }, [dispatch, session_id, view, audit_gui_id, days]);

  return null;
};

export default DashboardLoader;
