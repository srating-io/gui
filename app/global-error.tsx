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
