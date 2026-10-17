'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InitialState, setDataKey } from '@/redux/features/fantasy_group-slice';
import { getNavHeaderHeight } from './NavBar';
import { getStore } from '@/app/StoreProvider';
import { isRequestFailure, useClientAPI } from '@/components/clientAPI';
import { FantasyGroupLoadData, handleLoad } from './ReduxWrapper';
import { Objector, socket, toast } from '@esmalley/ts-utils';
import { Button, LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';

// TODO
// pending invites does not update from broadcast when someone joins
// invite field input annoying on mouse up after selecting to clear input if fired outside modal it closes the modal
// auto create first entry if free group?
// limt players by position? only 3 of center etc?
// select input in ios click then click out then click again, does not open


/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  const paddingTop = getNavHeaderHeight();
  return (
    <div style = {{ paddingTop, maxWidth: 1200, margin: 'auto' }}>
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

  const online = useAppSelector((state) => state.generalReducer.online);
  const session_id = useAppSelector((state) => state.userReducer.session_id);
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const loadingView = useAppSelector((state) => state.fantasyGroupReducer.loadingView);

  const [loaded, setLoaded] = useState(false);
  const [canView, setCanView] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // A ref, not state. `load` used to read a `request` it had closed over, so the refresher and the
  // reconnect path set it false and then returned early out of the stale copy they still held -
  // the refresh silently did nothing.
  const requesting = useRef(false);

  const paddingTop = getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;

  const load = useCallback(() => {
    if (!fantasy_group.fantasy_group_id || requesting.current) {
      return;
    }
    requesting.current = true;
    setLoadFailed(false);

    useClientAPI({
      class: 'fantasy_group',
      function: 'load',
      arguments: {
        fantasy_group_id: fantasy_group.fantasy_group_id,
      },
    }).then((fantasyData: FantasyGroupLoadData) => {
      requesting.current = false;
      setLoaded(true);

      // a request that never reached the api says nothing about permission, so do not tell someone
      // their own group is private because their wifi dropped
      if (isRequestFailure(fantasyData)) {
        setLoadFailed(true);
        return;
      }

      if (!fantasyData || fantasyData.error) {
        setCanView(false);
        return;
      }

      handleLoad({
        dispatch,
        data: fantasyData,
      });
    }).catch((err) => {
      console.log(err);
      requesting.current = false;
      setLoaded(true);
      setLoadFailed(true);
    });
  }, [fantasy_group.fantasy_group_id, session_id, dispatch]);

  useEffect(() => {
    dispatch(setDataKey({ key: 'loadingView', value: false }));
  }, [children]);


  useEffect(() => {
    const messageHandler = (event: CustomEvent) => {
      if (
        event &&
        event.detail &&
        event.detail.type === 'data' &&
        event.detail.table &&
        event.detail.id &&
        event.detail.data &&
        event.detail.table === 'fantasy_group'
      ) {
        const d: object = event.detail.data;
        const store = getStore();
        for (const key in d) {
          let value = d[key];
          if (key in store.getState().fantasyGroupReducer) {
            value = Objector.extender({}, store.getState().fantasyGroupReducer[key], value);
          }
          dispatch(setDataKey({ key: key as keyof InitialState, value }));
        }

        if (
          event.detail.toast &&
          event.detail.toast.table &&
          event.detail.toast.id
        ) {
          let object = event.detail.toast.table in event.detail.data && event.detail.toast.id in event.detail.data[event.detail.toast.table] ? event.detail.data[event.detail.toast.table] : null;
          if (
            !object &&
            `${event.detail.toast.table}s` in event.detail.data &&
            event.detail.toast.id in event.detail.data[`${event.detail.toast.table}s`]
          ) {
            object = event.detail.data[`${event.detail.toast.table}s`][event.detail.toast.id];
          }

          if (
            event.detail.toast.table === 'fantasy_draft_order' &&
            object !== null &&
            object.picked === 1
          ) {
            const fantasy_entry = (
              object.fantasy_entry_id in store.getState().fantasyGroupReducer.fantasy_entrys ?
                store.getState().fantasyGroupReducer.fantasy_entrys[object.fantasy_entry_id]
                : null
            );

            const fantasy_entry_player = (
              object.fantasy_entry_player_id in store.getState().fantasyGroupReducer.fantasy_entry_players ?
                store.getState().fantasyGroupReducer.fantasy_entry_players[object.fantasy_entry_player_id]
                : null
            );

            const player_team_season = (
              fantasy_entry_player && fantasy_entry_player.player_team_season_id in store.getState().fantasyGroupReducer.player_team_seasons ?
                store.getState().fantasyGroupReducer.player_team_seasons[fantasy_entry_player.player_team_season_id]
                : null
            );

            const player = (
              player_team_season &&
              player_team_season.player_id in store.getState().fantasyGroupReducer.players ?
                store.getState().fantasyGroupReducer.players[player_team_season.player_id]
                : null
            );

            toast.info(`${fantasy_entry?.name || 'UNK'} picked ${player ? `${player.first_name} ${player.last_name}` : 'UNK'}`);
          }
        }
      }
    };

    const refresher = () => {
      if (online && fantasy_group.fantasy_group_id) {
        load();
        socket.message({ type: 'subscribe', table: 'fantasy_group', id: fantasy_group.fantasy_group_id });
      }
    };

    socket.addEventListener('message', messageHandler);

    socket.addEventListener('refresh', refresher);

    if (session_id) {
      socket.connect(session_id);
    }

    if (fantasy_group.fantasy_group_id) {
      socket.message({ type: 'subscribe', table: 'fantasy_group', id: fantasy_group.fantasy_group_id });
    }

    return () => {
      if (fantasy_group.fantasy_group_id) {
        socket.message({ type: 'unsubscribe', table: 'fantasy_group', id: fantasy_group.fantasy_group_id });
      }
      socket.removeEventListener('message', messageHandler);
      socket.removeEventListener('refresh', refresher);
    };
  }, [session_id, fantasy_group.fantasy_group_id, online, load]);

  // Fetching in the render body double-fetched under React's double-invoked render, set state
  // during render, and never refetched when the group or the session changed.
  useEffect(() => {
    if (online) {
      load();
    }
  }, [online, load]);


  if (loadFailed) {
    return (
      <Contents>
        <Typography style = {{ textAlign: 'center' }} type = 'h5'>Could not load this league</Typography>
        <Typography style = {{ textAlign: 'center' }} type = 'body1'>Check your connection and try again.</Typography>
        <Button title = 'Retry' value = 'retry' onClick = {() => load()} containerStyle = {{ textAlign: 'center' }} />
      </Contents>
    );
  }

  if (!canView) {
    return (
      <Contents>
        <Typography style = {{ textAlign: 'center' }} type = 'h5'>You do not have permission to view this group!</Typography>
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
