import crypto from 'crypto';

/**
 * Mints the signed cache grants that `srating.io-servers/cache-grant.ts` verifies.
 *
 * The api server will not take a cache ttl from a browser, and should not: `clientAPI` shares an
 * origin and a js realm with the devtools console, so any key or token it holds the console can
 * read and reuse. So the ttl is decided here, while rendering, and sealed with a key that only
 * ever exists in this node process. The browser forwards the sealed string and cannot alter it.
 * This is the same trade Next makes for the variables a server action closes over, and it carries
 * the same residual: a grant visible in the page can be replayed verbatim, which is why `class`,
 * `function` and a hash of `arguments` are inside the signature. A replay re-caches the one call
 * this component already made, at this ttl, and authorizes nothing else.
 *
 * **Server only.** Not marked `'use server'` on purpose -- every export of such a module becomes a
 * browser-callable endpoint, which would hand the console a minting endpoint. The `.server.ts`
 * suffix is for the reader; nothing enforces it, so do not import this from a `'use client'` file.
 */

/** Must match GRANT_LIFETIME_MS in srating.io-servers/cache-grant.ts. */
const GRANT_LIFETIME_MS = 5 * 60 * 1000;

export interface CacheGrantRequest {
  class: string;
  function: string;
  arguments: unknown;
  /** Seconds. The server clamps this to its own ceiling. */
  cache: number;
  /**
   * Set only when the response is identical for every caller, which lets all of them share one
   * cache entry. It is false by default because the api nulls and scrambles columns according to
   * the caller's subscription tier, so a shared entry would hand one tier's response to another.
   * The test is whether the call reaches transform_results on a class that declares
   * getNullableColumns or getScrambleColumns -- today game, odds and prediction.
   */
  public?: boolean;
}

let warned = false;

const getKey = (): Buffer | null => {
  const configured = process.env.CACHE_GRANT_KEY;

  if (typeof configured !== 'string' || !configured.length) {
    // Deliberately not thrown. A missing key means nothing caches, which is a performance
    // regression, and taking the render down over it would turn that into an outage.
    if (!warned) {
      warned = true;
      // the one signal that the key is missing -- without it the only symptom is reads quietly
      // never caching, which is invisible until someone profiles the api
      // eslint-disable-next-line no-console
      console.warn('CACHE_GRANT_KEY is not set, so no client read will be cached');
    }

    return null;
  }

  // base64 on both sides: createHmac reads a bare string as utf8, so a non-ascii key would sign
  // with different bytes here than in the api server's configuration.ts
  return Buffer.from(configured, 'base64');
};

/**
 * Sorts object keys at every depth so that two callers building the same arguments in a different
 * order still hash alike. Mirrors generateHash in sports-api/api/cache.ts, which is what the api
 * server hashes with -- this repo cannot import that submodule, so the two are held together by
 * components/cacheGrant.vector.ts instead. Run it after touching either.
 */
const sortObjectKeys = (value: unknown): unknown => {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sortObjectKeys(entry));
  }

  const sorted: Record<string, unknown> = {};

  for (const key of Object.keys(value).sort()) {
    sorted[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
  }

  return sorted;
};

export const hashArguments = (args: unknown): string => {
  // The api server forces hidden_access false before it builds the key, so hashing it as sent
  // would not match.
  const normalized = sortObjectKeys(
    args && typeof args === 'object' && !Array.isArray(args) && 'hidden_access' in args ?
      { ...args, hidden_access: false } :
      args,
  );

  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
};

/** base64url of hmac-sha256 over the encoded payload, exactly as the api server recomputes it. */
export const signGrantBody = (body: string, key: Buffer): string => (
  crypto.createHmac('sha256', key).update(body).digest('base64url')
);

/**
 * The grant to hand a client component, or undefined when there is no key to sign with.
 *
 * `arguments` has to be the object the client will send, byte for byte, or the hash will not match
 * and the read will quietly go uncached. Build both from one shared helper rather than two
 * literals -- see components/generic/Ranking/shared.ts.
 */
export const mintCacheGrant = (request: CacheGrantRequest): string | undefined => {
  const key = getKey();

  if (!key || !(request.cache > 0)) {
    return undefined;
  }

  const body = Buffer.from(JSON.stringify({
    c: request.class,
    f: request.function,
    h: hashArguments(request.arguments),
    s: Math.floor(request.cache),
    e: Date.now() + GRANT_LIFETIME_MS,
    ...(request.public ? { p: 1 } : {}),
  })).toString('base64url');

  return `${body}.${signGrantBody(body, key)}`;
};
