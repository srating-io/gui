import { report, setRoute } from '@/components/monitoring/report';

/**
 * Client instrumentation. Next runs this after the document loads and before hydration, which is
 * the only point early enough to catch an error thrown on the way into the app.
 *
 * React error boundaries -- `global-error.tsx` included -- only see throws during render. Anything
 * in an event handler, a timer, or a promise never reaches one, and that is most of what actually
 * breaks in production. These two listeners are what catch it.
 */

if (typeof window !== 'undefined') {
  try {
    window.addEventListener('error', (event) => {
      // `event.error` is the thrown value; for a cross origin script there is none and only the
      // message survives, which the reporter will drop as unactionable
      report(event.error || { message: event.message }, 'window-error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      report(event.reason, 'unhandled-rejection');
    });
  } catch {
    // instrumentation that breaks the page it is instrumenting is worse than none
  }
}

/**
 * Next hands this the resolved url being navigated to, which `setRoute` collapses back into a
 * pattern so that an error on two different teams files as one bug rather than two.
 *
 * Next warns if this file takes more than 16ms, and isolates anything thrown here from the
 * navigation itself.
 */
export function onRouterTransitionStart(url: string) {
  try {
    setRoute(url);
  } catch {
    // the route is context, not the report
  }
}
