'use client';

import { getStore } from '@/app/StoreProvider';
import { setDataKey, setSecret } from '@/redux/features/user-slice';
import { setLoading } from '@/redux/features/loading-slice';
import { refresh } from './generic/actions';
import { getTagLabel } from './handlers/secret/shared';
import { Objector } from '@esmalley/ts-utils';

const protocol = process.env.NEXT_PUBLIC_CLIENT_PROTOCAL;
const hostname = process.env.NEXT_PUBLIC_CLIENT_HOST;
const port = +(process.env.NEXT_PUBLIC_CLIENT_PORT || 4000);
const useOrigin = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_CLIENT_USE_ORIGIN === 'true') : false);
const path = process.env.NEXT_PUBLIC_CLIENT_PATH || '';

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

interface ApiResponse {
  error?: boolean;
  code?: number;
}

/**
 * Handles the common response logic (error codes 105, 103, 102).
 * @param json - The JSON response from the API.
 * @param isRetry - Flag to indicate if this is a retry response (to skip 'secret expired' dispatch).
 * @returns The original JSON response.
 */
function handleResponse(json: ApiResponse, isRetry: boolean = false): object {
  if (json && json.error) {
    const store = getStore();

    switch (json.code) {
      case 105: // New update available
        store.dispatch(setDataKey({ key: 'newUpdate', value: true }));
        break;
      case 103: // Secret expired
        // On first failure, we dispatch to clear the secret.
        // Then try to reload it
        if (!isRetry) {
          store.dispatch(setLoading(true));
          store.dispatch(setSecret(null));
          refresh(getTagLabel());
        }
        break;
      case 102: // No kryptos sent
        // todo: Implement logic for no kryptos sent
        break;
      default:
        // Handle other errors if necessary
        break;
    }
  }
  return json;
}

/**
 * Executes the actual fetch request and handles JSON parsing and error processing.
 * @param url - The target URL for the API request.
 * @param fetchArgs - Arguments to pass to the fetch function (including method, headers, body).
 * @param isRetry - Flag to pass to handleResponse.
 * @returns The JSON response or an empty object on fetch/parse error.
 */
async function executeFetch(url: string, fetchArgs: RequestInit, isRetry: boolean = false): Promise<ApiResponse> {
  try {
    const response = await fetch(url, fetchArgs);
    const json = await response.json();
    return handleResponse(json, isRetry);
  } catch (error) {
    // Re-throw AbortErrors so the caller component's catch block receives it
    if (error.name === 'AbortError') {
      throw error;
    }
    console.log(error);
    return {};
  }
}


// todo this needs to be a hook / functional component, so when the store.getState() stuff changes it is refreshed with the correct values?

export async function useClientAPI(args, optional_fetch_args = {}): Promise<any> {
  let url: string = `${protocol}://${hostname}:${port}`;
  if (useOrigin) {
    url = window.location.origin + path;
  }

  let store = getStore();

  const session_id = (typeof window !== 'undefined' && localStorage.getItem('session_id')) || store.getState().userReducer.session_id || null;
  let secret = (typeof window !== 'undefined' && sessionStorage.getItem('secret')) || store.getState().userReducer.secret_id || null;
  const kryptos = (typeof window !== 'undefined' && sessionStorage.getItem('kryptos')) || store.getState().userReducer.kryptos || null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // if (apiKey) {
  //   headers['X-API-KEY'] = apiKey;
  // }

  if (session_id) {
    headers['X-SESSION-ID'] = session_id;
  }

  if (secret) {
    headers['X-SECRET-ID'] = secret;
  }

  if (kryptos) {
    headers['X-KRYPTOS-ID'] = kryptos;
  }

  const fetchArgs: RequestInit = Objector.extender({}, optional_fetch_args, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });

  let fetchRequest = await executeFetch(url, fetchArgs, false);


  if (fetchRequest.error && fetchRequest.code === 103) {
    // try again in 3 seconds on first failure
    await sleep(3000);

    store = getStore();

    secret = (typeof window !== 'undefined' && sessionStorage.getItem('secret')) || store.getState().userReducer.secret_id || null;

    // @ts-expect-error it will be defined
    fetchArgs.headers['X-SECRET-ID'] = secret;

    fetchRequest = await executeFetch(url, fetchArgs, true);
  }

  return fetchRequest;
}

