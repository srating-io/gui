import { Auth } from '@srating-io/types';

/**
 * Whether the signed in user holds the admin role.
 *
 * This decides one thing: whether to put the dashboard entry in front of someone it would work for.
 * It is not a gate. Every dashboard endpoint runs its own `isAdmin()` server side and answers
 * `{ error: 'access denied' }` whatever the browser believes, and `/dashboard` itself renders its
 * shell for anyone who types it -- the data is what is withheld.
 *
 * The role id is an identifier, not a credential. It is already on the wire in every
 * `session.check` response, because `user.getHiddenColumns()` withholds only `uuid` and `password`.
 */
export const ADMIN_ROLE_TYPE_TERMINOLOGY_ID = 'da6da551-c03c-11f1-bf0c-46e166b0a263';

export const isAdmin = (user: Auth.User | null): boolean => (
  !!user && user.role_type_terminology_id === ADMIN_ROLE_TYPE_TERMINOLOGY_ID
);

export default isAdmin;
