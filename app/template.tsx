'use client';

import React, { useState, useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import Header from '@/components/generic/Header';
import FooterNavigation from '@/components/generic/FooterNavigation';
import { ScrollContainer, ScrollProvider } from '@/contexts/scrollContext';
import Spinner from '@/components/generic/Spinner';
import { Objector, socket, toast } from '@esmalley/ts-utils';
import { setDataKey as setDataKeyGeneral } from '@/redux/features/general-slice';
import { getStore } from './StoreProvider';
import { InitialState, setDataKey as setDataKeyUser } from '@/redux/features/user-slice';
import { ThemeProvider, Toast, useWindowDimensions, UXBaseline } from '@esmalley/react-material-ui';
import { resolveStoredMode, updateTheme } from '@/redux/features/theme-slice';


const Template = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.themeReducer.mode);
  const session_id = useAppSelector((state) => state.userReducer.session_id);
  const user = useAppSelector((state) => state.userReducer.user);
  const pendingStatusRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMSWait = 2100;

  const { width } = useWindowDimensions();

  /**
   * TODO this fixes some hydration issues...but shouldnt be needed...
   * I think this causes flashing too
   */
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // the cookie is all the server render had to go on. A first visit has none, and anyone who
    // picked a mode before it was kept in one has it only in localStorage, so those are applied
    // here - after hydration, where changing the mode is a re-render rather than a mismatch
    const stored = resolveStoredMode();

    if (stored !== themeMode) {
      dispatch(updateTheme(stored));
    }
  }, []);


  useEffect(() => {
    const connectionHanlder = (event: CustomEvent) => {
      const status = event?.detail;

      if (status === 'connected') {
        dispatch(setDataKeyGeneral({ key: 'online', value: true }));
        if (pendingStatusRef.current) {
          // If a disconnect was queued, this is a RECONNECTION
          clearTimeout(pendingStatusRef.current);
          pendingStatusRef.current = null;

          pendingStatusRef.current = setTimeout(() => {
            toast.success('Reconnected');
            pendingStatusRef.current = null;
          }, pendingMSWait);
        } else {
          pendingStatusRef.current = setTimeout(() => {
            toast.success('Connected');
            pendingStatusRef.current = null;
          }, pendingMSWait);
        }
      }

      if (status === 'disconnected') {
        dispatch(setDataKeyGeneral({ key: 'online', value: false }));
        // Clear any existing timers to avoid double-processing
        if (pendingStatusRef.current) {
          clearTimeout(pendingStatusRef.current);
        }

        // Buffer the error toast to see if a 'connected' event follows
        pendingStatusRef.current = setTimeout(() => {
          toast.error('Lost connection');
          pendingStatusRef.current = null;
        }, pendingMSWait);
      }

      // 3. Stale logic (usually immediate)
      if (status === 'stale') {
        toast.info('Stale connection');
      }
    };

    const messageHandler = (event: CustomEvent) => {
      if (
        event &&
        event.detail &&
        event.detail.type === 'data' &&
        event.detail.table &&
        event.detail.id &&
        event.detail.data &&
        event.detail.table === 'user'
      ) {
        const d: object = event.detail.data;
        const store = getStore();
        for (const key in d) {
          let value = d[key];
          if (key in store.getState().userReducer) {
            value = Objector.extender({}, store.getState().userReducer[key], value);
          }
          dispatch(setDataKeyUser({ key: key as keyof InitialState, value }));
        }
      }
    };

    const refresher = () => {
      if (session_id && user && user.user_id) {
        // todo security on subscribing to a user which is not you, add session_id as well to check its the same user?
        socket.message({ type: 'subscribe', table: 'user', id: user.user_id });
      }
    };


    if (session_id) {
      socket.connect(
        session_id,
        {
          hostname: process.env.NEXT_PUBLIC_WS_HOST as string,
          port: process.env.NEXT_PUBLIC_WS_PORT,
          path: process.env.NEXT_PUBLIC_WS_PATH as string,
        },
      );

      refresher();

      socket.addEventListener('connection_state', connectionHanlder);
      socket.addEventListener('message', messageHandler);

      socket.addEventListener('refresh', refresher);
    }

    return () => {
      if (session_id && user && user.user_id) {
        socket.message({ type: 'unsubscribe', table: 'user', id: user.user_id });
      }
      socket.removeEventListener('connection_state', connectionHanlder);
      socket.removeEventListener('message', messageHandler);
      socket.removeEventListener('refresh', refresher);
      if (pendingStatusRef.current) {
        clearTimeout(pendingStatusRef.current);
      }
    };
  }, [session_id, user]);


  let paddingTop = '64px';

  if (width < 600) {
    paddingTop = '56px';
  }

  return (
    <ThemeProvider theme={themeMode}>
      <UXBaseline />
      {
      isMounted ?
        <ScrollProvider>
          <ScrollContainer>
            <div>
              <Toast style = {{ bottom: 64 }} />
              <Spinner />
              <Header />
                <div style = {{ padding: `${paddingTop} 0px 56px 0px` }}>
                  {children}
                </div>
              <FooterNavigation />
            </div>
          </ScrollContainer>
        </ScrollProvider>
        : ''
      }
    </ThemeProvider>
  );
};

export default Template;
