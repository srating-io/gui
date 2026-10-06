'use server';


type OptionalFetchArgs = {
  tags?: string[];
};

const protocol = process.env.SERVER_PROTOCAL;
const hostname = process.env.SERVER_HOST;
const port = process.env.SERVER_PORT;
const secret = process.env.SERVER_SECRET;

/**
 * Record a failed call in `audit_gui`.
 *
 * Not exported: everything exported from a `'use server'` module becomes a server action, and this
 * is not something a browser should be able to invoke.
 *
 * The report is sent through `useServerAPI` itself, which is the whole hazard here - when the api
 * server is unreachable *every* call fails, the report fails too, and without the guard below each
 * failure would report its own failure forever. Checking the class is what breaks the cycle.
 */
function reportServerFailure(args, error: unknown) {
  try {
    if (!args || args.class === 'audit_gui') {
      return;
    }

    const source = (error && typeof error === 'object' ? error : {}) as Record<string, unknown>;
    const text = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : '');

    // deliberately not awaited - the caller is a catch block on the render path and the page should
    // not wait on telemetry
    useServerAPI({
      class: 'audit_gui',
      function: 'log',
      arguments: {
        source: 'api-failure',
        release: process.env.COMMIT_HASH || 'unknown',
        name: text(source.name) || 'FetchError',
        message: `${args.class}:${args.function}() ${text(source.message) || String(error)}`,
        stack: text(source.stack),
      },
    });
  } catch {
    // a failure to report a failure is where this stops
  }
}

export async function useServerAPI(args, optional_fetch_args = {} as OptionalFetchArgs) {
  const request = JSON.stringify(args);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (secret) {
    headers['X-SECRET-ID'] = secret;
  }


  // console.time(`useServerAPI.fetch.${args.class}:${args.function}()`);

  const results = await fetch(`${protocol}://${hostname}:${port}`, {
    next: { revalidate: 0 },
    cache: 'no-store',
    ...optional_fetch_args,
    method: 'POST',
    headers,
    body: request,
  })
    .then((response) => response.json())
    .then((json) => json)
    .catch((error) => {
      // Still swallowed on purpose - callers destructure the result directly, so throwing here
      // would take the whole page down over one failed call. Reporting it is how a run of these
      // becomes visible instead of silently rendering empty pages.
      reportServerFailure(args, error);
      console.log(error);
      // throw new Error('Error');
    });

  // console.timeEnd(`useServerAPI.fetch.${args.class}:${args.function}()`);

  return results;
}



