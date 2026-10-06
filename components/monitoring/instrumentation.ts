import type { Instrumentation } from 'next';

import { useServerAPI } from '@/components/serverAPI';

/**
 * Server instrumentation.
 *
 * Next calls `onRequestError` for anything thrown while rendering a server component or running a
 * route handler. That is the other half of the picture: `global-error.tsx` shows the visitor a
 * `digest` and calls it a "Reference", but until now nothing wrote that digest down anywhere, so it
 * referenced nothing. Logging it here is what lets a reported digest be matched to the error that
 * produced it.
 *
 * Through `useServerAPI` rather than the browser reporter: we are already on the server, and the
 * secret it carries is what the api server wants, where a browser has to supply a kryptos.
 */

/**
 * `notFound()` and `redirect()` are implemented as throws, and this app leans on `notFound()` for
 * ordinary routing -- `Surface.tsx` calls it whenever a sport, division or season does not resolve.
 * Without this filter every 404 would be filed as a bug.
 */
const CONTROL_FLOW = [
  'NEXT_HTTP_ERROR_FALLBACK',
  'NEXT_REDIRECT',
  'NEXT_NOT_FOUND',
  'DYNAMIC_SERVER_USAGE',
];

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  try {
    const source = (error && typeof error === 'object' ? error : {}) as Record<string, unknown>;
    const digest = typeof source.digest === 'string' ? source.digest : '';

    if (CONTROL_FLOW.some((entry) => digest.indexOf(entry) === 0)) {
      return;
    }

    const text = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : '');

    await useServerAPI({
      class: 'audit_gui',
      function: 'log',
      arguments: {
        source: 'request-error',
        release: process.env.COMMIT_HASH || 'unknown',
        name: text(source.name),
        message: text(source.message) || String(error),
        digest,
        route: context.routePath || request.path || '',
        stack: text(source.stack),
        json_context: JSON.stringify({
          routerKind: context.routerKind,
          routeType: context.routeType,
          renderSource: context.renderSource,
          method: request.method,
        }),
      },
    });
  } catch (e) {
    // the request already failed; failing again here would only replace its error with ours
    console.error('[audit_gui] onRequestError failed', e);
  }
};
