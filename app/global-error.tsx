'use client';

/**
 * The page of last resort, for when the root layout itself throws.
 *
 * Next swaps this in for the root layout, so nothing the app normally supplies is guaranteed to be
 * standing by the time it mounts: no store, no theme context, no component kit, no global
 * stylesheet. So it imports nothing at all. The brand colors are written out as literals rather
 * than read from `General.getLogoColor*`, which reach into the redux store - one of the things that
 * may well be what broke. An error page that throws on its way up leaves a blank document, which
 * is the one outcome worse than the error.
 *
 * Light and dark follow the OS rather than the app's theme cookie, because this file renders its
 * own document and the app's stylesheet never reaches it. Dark leads, as it does in the app.
 */
const STYLES = `
  :root {
    color-scheme: dark;
    --bg: #121212;
    --card: #1b1b1b;
    --border: #2e2e2e;
    --text: #ffffff;
    --muted: #a8a8a8;
    --pre: #141414;
    --accent: #1976d2;
    --logo-s: #FDD835;
    --logo-rating: #2AB92A;
  }

  @media (prefers-color-scheme: light) {
    :root {
      color-scheme: light;
      --bg: #fafafa;
      --card: #ffffff;
      --border: #e3e3e3;
      --text: #1a1a1a;
      --muted: #5f5f5f;
      --pre: #f5f5f5;
      --accent: #1565c0;
      --logo-s: #F9A825;
      --logo-rating: #482AB9;
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background-color: var(--bg);
    color: var(--text);
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px 16px;
  }

  .card {
    width: 100%;
    max-width: 560px;
    padding: 28px 24px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background-color: var(--card);
  }

  .logo {
    margin: 0px 0px 20px 0px;
    font-size: 24px;
    font-style: italic;
    font-weight: 600;
    text-align: center;
  }

  .logo-s {
    color: var(--logo-s);
  }

  .logo-rating {
    color: var(--logo-rating);
  }

  .title {
    margin: 0px 0px 8px 0px;
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }

  .copy {
    margin: 0px 0px 20px 0px;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.5;
    text-align: center;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .btn {
    padding: 9px 18px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background-color: transparent;
    color: var(--text);
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
  }

  .btn:hover {
    border-color: var(--muted);
  }

  .btn-primary {
    border-color: var(--accent);
    background-color: var(--accent);
    color: #ffffff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .details {
    margin: 24px 0px 0px 0px;
    padding: 16px 0px 0px 0px;
    border-top: 1px solid var(--border);
  }

  .summary {
    color: var(--muted);
    cursor: pointer;
    font-size: 13px;
  }

  .row {
    margin: 14px 0px 0px 0px;
  }

  .label {
    margin: 0px 0px 4px 0px;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .pre {
    margin: 0px;
    max-height: 220px;
    overflow: auto;
    padding: 10px 12px;
    border-radius: 4px;
    background-color: var(--pre);
    color: var(--text);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

/**
 * Next documents this prop as an `Error` but its own boundary does not promise one, so a thrown
 * string or a bare object can arrive here just as it was thrown. Every field is read defensively
 * and whatever is missing is dropped rather than printed as "undefined" at the reader.
 */
const readError = (error: unknown) => {
  const text = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : '');
  const source = (error && typeof error === 'object' ? error : {}) as Record<string, unknown>;

  return {
    name: text(source.name),
    message: text(source.message) || text(error),
    digest: text(source.digest),
    stack: text(source.stack),
  };
};

/**
 * Report the error that got us here.
 *
 * Written out longhand rather than calling `components/monitoring/report` because importing
 * anything here would break the rule the header sets out - this file renders when the root layout
 * is already broken, and every import is another thing that can fail on the way in. The cost is
 * this duplication; the benefit is that the page of last resort depends on nothing.
 *
 * The redux snapshot is best effort twice over: the store may never have initialized in this
 * scenario, and only an allowlist of it is sent. A whole `getState()` would carry the session id,
 * the secret and the kryptos straight into the database.
 */
let reported = false;

const send = (details: ReturnType<typeof readError>) => {
  let state = '';

  try {
    const store = (window as unknown as {
      globalStore?: { getState: () => Record<string, Record<string, unknown>> }
    }).globalStore;
    const full = store?.getState?.();

    if (full) {
      state = JSON.stringify({
        display: full.displayReducer,
        organization: full.organizationReducer,
        theme: full.themeReducer,
        isValidSession: full.userReducer?.isValidSession,
      });
    }
  } catch {
    // the store is the likeliest casualty of whatever broke; the error itself is what matters
  }

  /**
   * Straight at the api server, the same address `clientAPI` uses -- our own origin in production,
   * where nginx proxies `/api` to it. Spelled out here rather than imported, like everything else in
   * this file.
   *
   * A keepalive fetch rather than `sendBeacon` because the kryptos travels as a header, and a
   * beacon cannot carry one. It is sent when the tab has one but nothing here depends on it:
   * `isReport` in internal.ts lets `audit_gui.log` through with no credential at all, which is the
   * only reason a layout that threw before `handlers/kryptos/Client` ever ran can report anything.
   */
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let kryptos: string | null = null;

    try {
      kryptos = sessionStorage.getItem('kryptos');
    } catch {
      // private windows throw on access; nothing to do about it here
    }

    if (kryptos) {
      headers['X-KRYPTOS-ID'] = kryptos;
    }

    const url = (process.env.NEXT_PUBLIC_CLIENT_USE_ORIGIN === 'true')
      ? window.location.origin + (process.env.NEXT_PUBLIC_CLIENT_PATH || '')
      : `${process.env.NEXT_PUBLIC_CLIENT_PROTOCAL}://${process.env.NEXT_PUBLIC_CLIENT_HOST}:${process.env.NEXT_PUBLIC_CLIENT_PORT || 4000}`;

    /**
     * Cut to what the columns hold, for the reason spelled out beside `BUDGET` in
     * `components/monitoring/report.ts`: a keepalive body over 64KiB is a network error, and a
     * report that is too big to send is lost rather than shortened. A recursion stack is the field
     * that gets there. Written out again rather than imported, like everything else in this file.
     */
    const body = JSON.stringify({
      class: 'audit_gui',
      function: 'log',
      arguments: {
        source: 'global-error',
        release: (process.env.COMMIT_HASH || 'unknown').slice(0, 64),
        name: details.name.slice(0, 255),
        message: details.message.slice(0, 1024),
        digest: details.digest.slice(0, 64),
        stack: details.stack.slice(0, 8000),
        // collapsed the same way toPattern does in the monitoring helper -- both halves of it, ids
        // and numbers, so a global error on two different teams reads as one route rather than two
        route: window.location.pathname
          .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, '/[id]')
          .replace(/\/\d+(?=\/|$)/g, '/[n]')
          .slice(0, 255),
        state: state.slice(0, 16000),
      },
    });

    fetch(url, {
      method: 'POST',
      headers,
      keepalive: true,
      body,
    }).catch(() => {});
  } catch {
    // nothing left to try, and a reporting failure must not replace the error page with a blank one
  }
};

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error?: unknown;
  retry?: () => void;
  reset?: () => void;
}) {
  const details = readError(error);

  /**
   * Reported from the render body rather than an effect, because `useEffect` would have to be
   * imported and this file imports nothing. The module flag covers the double render that strict
   * mode does, and the `window` check covers the build: `/_global-error` is prerendered, so this
   * component is rendered once on the server where there is no `navigator` to beacon with.
   *
   * Off outside production unless asked for, the same condition `enabled()` applies in
   * `components/monitoring/report.ts` -- spelled out again rather than imported, like everything
   * else here. HMR, strict mode and the dev overlay all throw routinely and none of it means
   * anything. Both of these are inlined at build time, so reading them costs no import.
   */
  const enabled = (
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_AUDIT_GUI === '1'
  );

  if (typeof window !== 'undefined' && !reported && enabled) {
    reported = true;
    send(details);
  }

  // a server error arrives stripped of its message and carrying only the digest, which is the one
  // string that matches it to the server log - so it is worth showing even on its own
  const rows = [
    { label: 'Message', value: details.message },
    { label: 'Type', value: details.name },
    { label: 'Reference', value: details.digest },
    { label: 'Stack', value: details.stack },
  ].filter((row) => row.value);

  const handleReload = () => {
    window.location.reload();
  };

  /**
   * `retry` re-renders the boundary in place, which clears a transient failure without throwing
   * away the rest of the session. `reset` is the older name for roughly the same thing and a
   * reload is what is left if this ever renders without either.
   */
  const handleRetry = () => {
    // the next error of the session is a new one and worth hearing about. The flag is there for the
    // double render, not for the session, and leaving it set here would silence everything that
    // broke after the visitor tried again -- `handleReload` needs no such thing, since a reload
    // re-evaluates the module and the flag with it
    reported = false;

    if (retry) {
      retry();
      return;
    }

    if (reset) {
      reset();
      return;
    }

    handleReload();
  };

  return (
    <html lang = 'en'>
      <body>
        <style>{STYLES}</style>
        <title>Something went wrong | sRating</title>
        <div className = 'wrap'>
          <div className = 'card'>
            <p className = 'logo'>
              <span className = 'logo-s'>s</span><span className = 'logo-rating'>Rating</span>
            </p>
            <h1 className = 'title'>Something went wrong.</h1>
            <p className = 'copy'>
              An unexpected error has occurred. Trying again will often clear it - nothing on your account
              has been changed.
            </p>
            <div className = 'actions'>
              <button className = 'btn btn-primary' type = 'button' value = 'retry' onClick = {handleRetry}>Try again</button>
              <button className = 'btn' type = 'button' value = 'reload' onClick = {handleReload}>Reload page</button>
            </div>
            {
              rows.length ?
                <details className = 'details'>
                  <summary className = 'summary'>Error details</summary>
                  {rows.map((row) => (
                    <div className = 'row' key = {row.label}>
                      <p className = 'label'>{row.label}</p>
                      <pre className = 'pre'>{row.value}</pre>
                    </div>
                  ))}
                </details> :
                ''
            }
          </div>
        </div>
      </body>
    </html>
  );
}
