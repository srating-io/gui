/**
 * The root is the only place this works too, and it fails even more quietly than its server
 * counterpart: the `private-next-instrumentation-client-user` alias in next's
 * `create-compiler-aliases.js` resolves `<root>/src/instrumentation-client`, then
 * `<root>/instrumentation-client`, then gives up and aliases `private-next-empty-module`, which
 * is `false` -- an empty module. A file under `components/` compiles to nothing at all, taking
 * the `error` and `unhandledrejection` listeners with it.
 *
 * Re-exporting runs the module, which is what installs those listeners; `onRouterTransitionStart`
 * is the one binding next reads by name.
 */
export { onRouterTransitionStart } from '@/components/monitoring/instrumentation-client';
