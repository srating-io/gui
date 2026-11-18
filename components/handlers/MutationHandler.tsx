'use client';

import { setLoading } from '@/redux/features/loading-slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Organization from '../helpers/Organization';
import { updateOrganizationID } from '@/redux/features/organization-slice';
import { setDataKey } from '@/redux/features/games-slice';
import { getStore } from '@/app/StoreProvider';


const MutationHandler = () => {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization) || {};
  let previousUrl = '';
  let previousPathName = '';

  if (typeof window === 'undefined') {
    return null; // Prevents SSR issues
  }

  const observer = new MutationObserver(() => {
    if (window.location.href !== previousUrl) {
      previousUrl = window.location.href;

      const pathName = window.location.pathname;
      const pathChanged = pathName !== previousPathName;
      previousPathName = pathName;

      const splat = pathName.split('/');

      // only a new path can mean a new sport. The sport picker rewrites the query string before it
      // navigates, and re-reading the old path then would undo the sport it just picked
      let organization_id: string | null = null;
      if (pathChanged && splat.length > 1) {
        for (const id in organizations) {
          const pathCode = Organization.getPathCode(organizations[id]);

          if (pathCode === splat[1]) {
            organization_id = id;
          }
        }
        const store = getStore();

        if (
          organization_id &&
          store.getState().organizationReducer.organization_id !== organization_id
        ) {
          dispatch(updateOrganizationID(organization_id));
        }
      }

      dispatch(setLoading(false));
      dispatch(setDataKey({ key: 'refreshLoading', value: true }));
    }
  });
  const config = { subtree: true, childList: true };

  // start observing change
  observer.observe(document, config);

  return null;
};

export default MutationHandler;
