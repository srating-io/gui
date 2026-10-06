'use client';

/**
 * Browser error reporting.
 *
 * Everything that catches an error in this app funnels through `report`, which decides whether it
 * is worth sending and then posts it straight at the api server as `audit_gui.log()`, exactly the
 * way `clientAPI` posts everything else. No route handler, no server action, nothing of next's in
 * the path -- the only thing between the browser and `audit_gui` is nginx.
 *
 * internal.ts answers 102 to a request carrying neither kryptos nor secret, but `isReport` there
 * lets this one call through without either -- a page that broke before `handlers/kryptos/Client`
 * ran holds no kryptos, and that is exactly the page worth hearing from. The kryptos is still sent
 * when the tab has one; nothing depends on it.
 *
 * The guards here are the cheap first line, not the real one -- they run in a browser, so they are
 * advisory and a hostile client simply ignores them. Their job is to stop an *honest* page from
 * flooding: a component that throws in a render loop produces thousands of identical errors a
 * second, and without a cap it would drown the table and the user's connection both. The limit that
 * actually binds lives in the api class, which recomputes the fingerprint and rate limits per
 * process.
 *
 * `global-error.tsx` deliberately does not import this file -- see the note in its header. It
 * inlines the one request it needs instead.
 */

export type Source =
  | 'global-error'
  | 'window-error'
  | 'unhandled-rejection'
  | 'request-error'
  | 'api-failure';

export type Report = {
  source: Source;
  name?: string;
  message?: string;
  digest?: string;
  stack?: string;
  route?: string;
};

/**
 * The api server, addressed the same way `clientAPI` addresses it: through our own origin in
 * production, where nginx proxies `/api` to it, and straight at the host in development.
 *
 * Duplicated rather than imported because `clientAPI` imports this file -- and because the import
 * would pull the redux store in with it, which is one of the things that may be broken by the time
 * anything here runs.
 */
const protocol = process.env.NEXT_PUBLIC_CLIENT_PROTOCAL;
const hostname = process.env.NEXT_PUBLIC_CLIENT_HOST;
const port = +(process.env.NEXT_PUBLIC_CLIENT_PORT || 4000);
const useOrigin = process.env.NEXT_PUBLIC_CLIENT_USE_ORIGIN === 'true';
const apiPath = process.env.NEXT_PUBLIC_CLIENT_PATH || '';

export const endpoint = (): string => (
  useOrigin ? window.location.origin + apiPath : `${protocol}://${hostname}:${port}`
);

/**
 * Per page load, and per tab. Both are deliberately small: past a handful of reports the extra ones
 * tell you nothing the first few did not, and the counter on the row is what measures severity.
 */
const PER_LOAD = 5;
const PER_SESSION = 20;
const MIN_INTERVAL_MS = 2000;

const SEEN_KEY = 'audit_gui_seen';
const COUNT_KEY = 'audit_gui_count';
const SEEN_MAX = 50;

/**
 * Errors that are never this app's bug.
 *
 * `Script error.` is what the browser reports for a cross origin script with no CORS headers -- it
 * carries no message, no stack and no file, so there is nothing to act on. The ResizeObserver
 * notice is a benign spec quirk every browser emits. `AbortError` is a cancelled fetch, which
 * `clientAPI` raises on purpose when a component unmounts mid request.
 */
const IGNORED = [
  'script error',
  'resizeobserver loop',
  'aborterror',
  'the operation was aborted',
  'load failed',
];

/**
 * Stacks rooted outside our own origin. Browser extensions inject scripts into every page and throw
 * constantly; so do the ad and analytics tags the root layout carries. Neither is something anyone
 * here can fix, and together they would be the bulk of the table.
 */
const FOREIGN = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'safari-web-extension://',
  'googletagmanager.com',
  'googlesyndication.com',
  'google-analytics.com',
  'doubleclick.net',
  'gstatic.com/recaptcha',
];

let sentThisLoad = 0;
let lastSentAt = 0;

/**
 * Where the user was when it broke.
 *
 * Stored as a pattern, not a url. Next gives us the resolved path on navigation, so the variable
 * parts are collapsed here -- otherwise the same bug on two different teams would carry two
 * different routes, fingerprint differently, and file as two bugs.
 */
let route = '';

export const toPattern = (value: string): string => {
  const path = (value || '').split('?')[0].split('#')[0];

  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, '/[id]')
    .replace(/\/\d+(?=\/|$)/g, '/[n]');
};

export const setRoute = (value: string) => {
  route = toPattern(value);
};

export const getRoute = () => (
  route || (typeof window === 'undefined' ? '' : toPattern(window.location.pathname))
);


/**
 * Reporting is off outside production unless explicitly asked for. HMR, strict mode double
 * invocation and the dev overlay all throw routinely, and none of it means anything.
 */
const enabled = () => (
  process.env.NODE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_AUDIT_GUI === '1'
);


/**
 * sessionStorage can throw outright in a private window or with site data blocked, so every read
 * and write of it is guarded and a failure just means the guard does not apply.
 */
const readSeen = (): string[] => {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeSeen = (seen: string[]) => {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-SEEN_MAX)));
  } catch {
    // nothing to do -- the in-memory counters still apply
  }
};

const readCount = (): number => {
  try {
    return +(sessionStorage.getItem(COUNT_KEY) || 0) || 0;
  } catch {
    return 0;
  }
};

const writeCount = (count: number) => {
  try {
    sessionStorage.setItem(COUNT_KEY, String(count));
  } catch {
    // see readSeen
  }
};


/**
 * A rough local grouping key. The api server computes the real fingerprint; this one only has to be
 * good enough to recognise the same error arriving twice in one tab.
 */
const keyOf = (report: Report): string => {
  const message = (report.message || '').replace(/\d+/g, '').slice(0, 120);
  const frame = (report.stack || '').split('\n')[1] || '';

  // the digest carries the key on its own for a server error, where it is the only field that
  // arrives -- without it every one of those in a tab shares one key and only the first is sent
  return `${report.source}:${report.name || ''}:${message}:${frame.trim().slice(0, 120)}:${report.digest || ''}`;
};


const ignorable = (report: Report): boolean => {
  const message = (report.message || '').toLowerCase();
  const stack = (report.stack || '').toLowerCase();

  // a digest with neither of them is not noise, it is a server component error: react strips the
  // message and the stack before they reach the browser and leaves only that one string, which is
  // what matches the report back to the row `onRequestError` wrote
  if (!message && !stack && !report.digest) {
    return true;
  }

  if (IGNORED.some((entry) => message.indexOf(entry) > -1)) {
    return true;
  }

  // only the frames matter -- a message may legitimately quote a third party url
  return FOREIGN.some((entry) => stack.indexOf(entry) > -1);
};


/**
 * Turn whatever was thrown into a report. Nothing guarantees an `Error`: a string, a plain object
 * or `undefined` can all arrive here, from a `throw` anywhere or from a rejected promise.
 */
export const describe = (error: unknown, source: Source): Report => {
  const thrown = (error && typeof error === 'object' ? error : {}) as Record<string, unknown>;
  const text = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : '');

  /**
   * A thrown number or boolean reads fine as a message. An object does not: `String()` turns every
   * one of them into `[object Object]`, which is the same string for everything ever thrown, so it
   * would group them all as one bug -- and would stand in front of the digest a server error
   * carries, which is the only thing that identifies one of those. Nothing is the honest answer;
   * `ignorable` drops the report if the name, stack and digest are all empty too.
   */
  const literal = (value: unknown): string => (
    value === null || value === undefined || typeof value === 'object' ? '' : String(value)
  );

  return {
    source,
    name: text(thrown.name),
    message: text(thrown.message) || text(error) || literal(error),
    digest: text(thrown.digest),
    stack: text(thrown.stack),
    route: getRoute(),
  };
};


/**
 * Send one error, if it passes every guard. Never throws, never returns anything useful, and is
 * never worth awaiting -- it is called from catch blocks and error boundaries, where failing loudly
 * would replace a small problem with a bigger one.
 */
export const report = (input: Report | unknown, source?: Source): void => {
  try {
    if (typeof window === 'undefined' || !enabled()) {
      return;
    }

    const payload = source ? describe(input, source) : (input as Report);

    if (!payload || !payload.source || ignorable(payload)) {
      return;
    }

    const now = Date.now();

    if (
      sentThisLoad >= PER_LOAD ||
      now - lastSentAt < MIN_INTERVAL_MS ||
      readCount() >= PER_SESSION
    ) {
      return;
    }

    const key = keyOf(payload);
    const seen = readSeen();

    // the same bug twice in one tab tells us nothing new, and a reload loop would otherwise report
    // on every pass
    if (seen.indexOf(key) > -1) {
      return;
    }

    seen.push(key);
    writeSeen(seen);
    writeCount(readCount() + 1);

    sentThisLoad++;
    lastSentAt = now;

    send({ ...payload, release: process.env.COMMIT_HASH || 'unknown' });
  } catch {
    // reporting an error must never itself become one
  }
};


/**
 * What each field is allowed to weigh, copied from `COLUMNS` in the api class.
 *
 * Not an optimization. A keepalive fetch is refused outright once its body passes 64KiB -- the spec
 * makes that a network error and chromium counts it against a quota shared by every keepalive
 * request in flight -- and a refused fetch rejects, which `send` swallows. So an oversized report is
 * not a truncated report, it is a silent one, and the reports at risk are the worst bugs: a render
 * loop or a runaway recursion in a browser that does not cap `error.stack` at ten frames produces a
 * stack of every frame on the way down, which is tens of thousands of lines.
 *
 * Cutting here to what the column holds anyway costs nothing -- the server would cut it to the same
 * length on arrival -- and it means the body cannot approach the ceiling in the first place.
 */
const BUDGET: Record<string, number> = {
  source: 32,
  release: 64,
  name: 255,
  message: 1024,
  digest: 64,
  route: 255,
  stack: 8000,
  state: 16000,
};

/**
 * Half the keepalive quota, so two reports in flight at once still both fit. The per-field budgets
 * above sum to well under this in anything ascii; this is the backstop for a message or a stack
 * that is mostly multibyte, where a character of budget can cost four bytes.
 */
const MAX_BYTES = 32768;

const weigh = (body: string): number => {
  try {
    return new Blob([body]).size;
  } catch {
    // no Blob, so guess high rather than low
    return body.length * 2;
  }
};

const envelope = (row: Record<string, unknown>): string => {
  const cut: Record<string, unknown> = {};

  for (const field in row) {
    const value = row[field];

    cut[field] = (typeof value === 'string' && BUDGET[field]) ?
      value.slice(0, BUDGET[field]) :
      value;
  }

  return JSON.stringify({
    class: 'audit_gui',
    function: 'log',
    arguments: cut,
  });
};


/**
 * `keepalive` rather than `sendBeacon`, which is the one real concession to going direct: a beacon
 * cannot carry headers, and without `X-KRYPTOS-ID` the api server answers 102 and writes nothing.
 * A keepalive fetch outlives the document in every browser that supports it, which is the same
 * property the beacon was there for.
 *
 * The kryptos is read from sessionStorage only, never from the store -- the store is as likely to be
 * the casualty as anything else, and `getStore()` here would be an import cycle besides.
 */
const send = (row: Record<string, unknown>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const kryptos = sessionStorage.getItem('kryptos');

    if (kryptos) {
      headers['X-KRYPTOS-ID'] = kryptos;
    }
  } catch {
    // sessionStorage can throw outright; the request still goes, and is still refused without it
  }

  try {
    let body = envelope(row);

    // the stack is the only field big enough to get here, and a report without one still carries
    // the message, the route and the fingerprint it groups under
    if (weigh(body) > MAX_BYTES) {
      body = envelope({ ...row, stack: String(row.stack || '').slice(0, 2000) });
    }

    fetch(endpoint(), {
      method: 'POST',
      headers,
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // out of options, and an unreported error is better than a broken page
  }
};
