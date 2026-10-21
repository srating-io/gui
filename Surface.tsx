'use server';

import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';
import CBB from './components/helpers/CBB';
import CFB from './components/helpers/CFB';
import Division from './components/helpers/Division';
import Organization from './components/helpers/Organization';
import NBA from './components/helpers/NBA';
import Slug, { SlugType } from './components/helpers/Slug';
import Url from './components/helpers/Url';
import { useServerAPI } from './components/serverAPI';
import { General } from '@srating-io/types';

type SurfaceArguments = {
  sport?: string;
  organization_id?: string;
  division_id?: string;
}

/**
 * What the url's entity segment turned out to be.
 *
 * `redirect` is set when the visitor is on a url that is no longer the canonical one for this row,
 * which is a retired slug. The id case is handled in proxy.ts before the app is reached, so it only
 * lands here when the row has no slug to redirect to yet.
 */
export type ResolvedEntity<T> = {
  row: T | null;
  redirect: string | null;
}

/**
 * Both `getMetaData()` and `getDecorate()` resolve the same segment on the same request, and the
 * api is called with `cache: 'no-store'`, so without this the lookup runs twice per page view --
 * four times on the pages that then fetch the row again. React's cache dedupes it to one.
 */
const getBySlug = cache(async (type: SlugType, slug: string, organization_id: string | null) => {
  // a game slug is only unique inside its organization, so the scope is part of the lookup
  const args = organization_id ? { slug, organization_id } : { slug };

  return useServerAPI({
    class: type,
    function: 'get',
    arguments: args,
  });
});

const getById = cache(async (type: SlugType, id: string) => {
  return useServerAPI({
    class: type,
    function: 'get',
    arguments: { [`${type}_id`]: id },
  });
});

/**
 * A slug the row used to answer to. Only reached when the live lookup missed, so it costs nothing
 * on a url that is current.
 */
const getRetired = cache(async (type: SlugType, slug: string, organization_id: string | null) => {
  const args: Record<string, string> = { type, slug };

  if (organization_id) {
    args.organization_id = organization_id;
  }

  return useServerAPI({
    class: 'slug_redirect',
    function: 'get',
    arguments: args,
  });
});

class Surface {
  constructor(args?: SurfaceArguments) {
    if (args && args.sport) {
      this.sport = args.sport;
    }

    // if we are not getting the sport from the url, then it was probably passed in from a different object
    if (args && args.organization_id) {
      this.setOrganizationID(args.organization_id);
    }

    if (args && args.division_id) {
      this.setDivisionID(args.division_id);
    }
  }

  private sport: string | null = null;

  private organization_id: string;

  private division_id: string;

  public setOrganizationID(organization_id: string) {
    this.organization_id = organization_id;
    if (this.organization_id === Organization.getCBBID()) {
      this.sport = 'cbb';
    }
    if (this.organization_id === Organization.getCFBID()) {
      this.sport = 'cfb';
    }
    if (this.organization_id === Organization.getNBAID()) {
      this.sport = 'nba';
    }
  }

  public setDivisionID(division_id: string) {
    this.division_id = division_id;
  }

  getSport() {
    return this.sport;
  }

  getOrganizationID(): string {
    if (this.organization_id) {
      return this.organization_id;
    }

    if (this.getSport() === 'cbb') {
      return Organization.getCBBID();
    }

    if (this.getSport() === 'cfb') {
      return Organization.getCFBID();
    }

    if (this.getSport() === 'nba') {
      return Organization.getNBAID();
    }

    // if there is no organization_id then go to 404 page
    return notFound();
  }

  getDivisionID(): string {
    if (this.division_id) {
      return this.division_id;
    }

    if (this.getSport() === 'cbb') {
      return Division.getD1();
    }

    if (this.getSport() === 'cfb') {
      return Division.getFBS();
    }

    if (this.getSport() === 'nba') {
      return Division.getNBA();
    }

    // if there is no division_id then go to 404 page
    return notFound();
  }

  getCurrentSeason(): number {
    if (this.getSport() === 'cbb') {
      return CBB.getCurrentSeason();
    }

    if (this.getSport() === 'cfb') {
      return CFB.getCurrentSeason();
    }

    if (this.getSport() === 'nba') {
      return NBA.getCurrentSeason();
    }

    // if there is no season then go to 404 page
    return notFound();
  }

  /**
   * Turn the url's entity segment into the row behind it.
   *
   * The segment is a slug now and an id on the legacy urls, and one param accepts both -- a slug
   * can never look like a uuid, so the two are told apart without a second route.
   */
  protected async resolveEntity<T>(
    type: SlugType,
    value: string,
  ): Promise<ResolvedEntity<T>> {
    if (!value) {
      return { row: null, redirect: null };
    }

    // a game slug is unique per organization, the rest are unique outright
    const scope = type === 'game' ? this.getOrganizationID() : null;

    if (Slug.isId(value)) {
      // proxy.ts already 308s an id that has a slug, so arriving here means it has none yet
      const row: Record<string, unknown> = await getById(type, value);

      return { row: row && row[`${type}_id`] ? row as T : null, redirect: null };
    }

    const row: Record<string, unknown> = await getBySlug(type, value, scope);

    if (row && row[`${type}_id`]) {
      return { row: row as T, redirect: null };
    }

    const retired: General.SlugRedirect = await getRetired(type, value, scope);

    if (!retired || !retired.entity_id) {
      return { row: null, redirect: null };
    }

    const current: Record<string, unknown> = await getById(type, retired.entity_id);

    if (!current || !current.slug) {
      return { row: null, redirect: null };
    }

    return {
      row: null,
      redirect: this.getEntityPath(type, current.slug as string),
    };
  }

  /**
   * The canonical path for a row of this kind in the current sport.
   */
  protected getEntityPath(type: SlugType, slug: string): string {
    return Url[type]({ sport: this.getSport(), slug });
  }

  /**
   * Resolve the segment or stop rendering: a retired slug 308s, anything unknown 404s.
   */
  protected async requireEntity<T>(
    type: SlugType,
    value: string,
  ): Promise<T> {
    const { row, redirect: to } = await this.resolveEntity<T>(type, value);

    if (to) {
      // 308 rather than 307: the old slug is gone for good, and a temporary redirect would leave
      // the ranking on a url that no longer exists
      return permanentRedirect(to);
    }

    if (!row) {
      return notFound();
    }

    return row;
  }

  async getDecorate(args: unknown): Promise<null | React.JSX.Element | React.JSX.Element[]> {
    return null;
  }
}

export default Surface;
