'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { useCallback, useEffect, useRef, useState } from 'react';
import { setDataKey } from '@/redux/features/fantasy_entry-slice';
import { getNavHeaderHeight } from './NavBar';
import { isRequestFailure, useClientAPI } from '@/components/clientAPI';
import { FantasyEntryLoadData, handleLoad } from './ReduxWrapper';
import { socket } from '@esmalley/ts-utils';
import { Button, LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';



/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  const paddingTop = getNavHeaderHeight();
  return (
    <div style = {{ paddingTop, margin: 'auto' }}>
      {children}
    </div>
  );
};

const ContentsWrapper = (
  { children }:
  { children: React.JSX.Element },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const session_id = useAppSelector((state) => state.userReducer.session_id);
  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const loadingView = useAppSelector((state) => state.fantasyEntryReducer.loadingView);

  const [loaded, setLoaded] = useState(false);
  const [canView, setCanView] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // a ref rather than state, so a retry is not blocked by the copy of `request` the caller closed over
  const requesting = useRef(false);

  const paddingTop = getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;

  useEffect(() => {
    dispatch(setDataKey({ key: 'loadingView', value: false }));
  }, [children]);


  const load = useCallback(() => {
    if (!fantasy_entry.fantasy_entry_id || requesting.current) {
      return;
    }
    requesting.current = true;
    setLoadFailed(false);

    useClientAPI({
      class: 'fantasy_entry',
      function: 'load',
      arguments: {
        fantasy_entry_id: fantasy_entry.fantasy_entry_id,
      },
    }).then((data: FantasyEntryLoadData) => {
      requesting.current = false;
      setLoaded(true);

      // a request that never reached the api says nothing about permission
      if (isRequestFailure(data)) {
        setLoadFailed(true);
        return;
      }

      if (!data || data.error) {
        setCanView(false);
        return;
      }

      handleLoad({
        dispatch,
        data,
      });
    }).catch((err) => {
      console.log(err);
      requesting.current = false;
      setLoaded(true);
      setLoadFailed(true);
    });
  }, [fantasy_entry.fantasy_entry_id, session_id, dispatch]);

  // in the render body this double-fetched and never refetched on a session change
  useEffect(() => {
    load();
  }, [load]);

  // The entry page subscribed to nothing, so a roster never moved during a draft and a bracket
  // never moved during the tournament. Everything is broadcast against the group, and the group's
  // payload is keyed for the group reducer, so reload this entry rather than merging it in.
  useEffect(() => {
    const fantasy_group_id = fantasy_group.fantasy_group_id;

    if (!fantasy_group_id) {
      return undefined;
    }

    const messageHandler = (event: CustomEvent) => {
      if (
        event?.detail?.type === 'data' &&
        event.detail.table === 'fantasy_group' &&
        event.detail.id === fantasy_group_id
      ) {
        load();
      }
    };

    const refresher = () => {
      load();
      socket.message({ type: 'subscribe', table: 'fantasy_group', id: fantasy_group_id });
    };

    socket.addEventListener('message', messageHandler);
    socket.addEventListener('refresh', refresher);

    if (session_id) {
      socket.connect(session_id);
    }

    socket.message({ type: 'subscribe', table: 'fantasy_group', id: fantasy_group_id });

    return () => {
      socket.message({ type: 'unsubscribe', table: 'fantasy_group', id: fantasy_group_id });
      socket.removeEventListener('message', messageHandler);
      socket.removeEventListener('refresh', refresher);
    };
  }, [session_id, fantasy_group.fantasy_group_id, load]);

  if (loadFailed) {
    return (
      <Contents>
        <Typography style = {{ textAlign: 'center' }} type = 'h5'>Could not load this entry</Typography>
        <Typography style = {{ textAlign: 'center' }} type = 'body1'>Check your connection and try again.</Typography>
        <Button title = 'Retry' value = 'retry' onClick = {() => load()} containerStyle = {{ textAlign: 'center' }} />
      </Contents>
    );
  }

  if (!canView) {
    return (
      <Contents>
        <Typography style = {{ textAlign: 'center' }} type = 'h5'>You do not have permission to view this entry!</Typography>
      </Contents>
    );
  }

  return (
    <Contents>
      {
      loadingView || !loaded ?
        <div style = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: `calc(100vh - ${heightToRemove}px)`,
        }}>
          <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
        </div>
        : children
      }
    </Contents>
  );
};

export default ContentsWrapper;
