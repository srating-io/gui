'use server';

import { notFound } from 'next/navigation';
import CBB from './components/helpers/CBB';
import CFB from './components/helpers/CFB';
import Division from './components/helpers/Division';
import Organization from './components/helpers/Organization';
import { DEFAULT_NBA_SEASON } from './components/helpers/Defaults';

type SurfaceArguments = {
  sport?: string;
  organization_id?: string;
  division_id?: string;
}

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
      console.log('todo NBA helper?')

      return DEFAULT_NBA_SEASON;
    }

    // if there is no season then go to 404 page
    return notFound();
  }

  async getDecorate(args: unknown): Promise<null | React.JSX.Element | React.JSX.Element[]> {
    return null;
  }
}

export default Surface;
