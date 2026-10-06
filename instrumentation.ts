/**
 * Next only looks for this file in two places: the project root and `src/`. Nowhere else, and
 * there is no setting for it -- `getPossibleInstrumentationHookFilenames` in next's
 * `build/utils.js` globs `<root>/instrumentation.<ext>` and `<root>/src/instrumentation.<ext>`,
 * and `isInstrumentationHookFile` accepts the same two. A file under `components/` is never
 * looked at, so `onRequestError` would simply never register and every server error would go
 * unlogged, silently -- nothing warns about an instrumentation file next did not find.
 *
 * So the hook stays where next can see it and the implementation lives with the rest of the
 * monitoring code. This file is the shim that connects the two.
 */
export { onRequestError } from '@/components/monitoring/instrumentation';
