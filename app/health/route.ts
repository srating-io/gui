/**
 * Liveness for the status prober.
 *
 * Deliberately does not call the internal api. The prober checks that separately, and if this
 * route went through it then one database outage would turn every service on the page red at once
 * and say nothing about which one actually broke.
 *
 * So this answers one question only: is Next rendering, and which build is it. `COMMIT_HASH` comes
 * from next.config.ts, which makes a stale pm2 app visible -- the page can be up and serving the
 * previous release after a failed `build-live` swap.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({
    'ok': true,
    'service': 'gui',
    'release': process.env.COMMIT_HASH ?? null,
    'released_at': process.env.COMMIT_DATE ?? null,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
