import {
  DEFAULT_CBB_ID,
  DEFAULT_CBB_SEASON,
  DEFAULT_CFB_ID,
  DEFAULT_CFB_SEASON,
  DEFAULT_D1_DIVISION_ID,
  DEFAULT_FBS_DIVISION_ID,
  DEFAULT_NBA_DIVISION_ID,
  DEFAULT_NBA_ID,
  DEFAULT_NBA_SEASON,
  DEFAULT_ORGANIZATION_ID,
} from './Defaults';


class Initializer {
  public static getInitialOrganizationID() {
    if (typeof window !== 'undefined') {
      const pathName = window.location.pathname;
      const splat = pathName.split('/');
      if (splat.length > 1) {
        if (splat[1] === 'cfb') {
          return DEFAULT_CFB_ID;
        }

        if (splat[1] === 'cbb') {
          return DEFAULT_CBB_ID;
        }

        if (splat[1] === 'nba') {
          return DEFAULT_NBA_ID;
        }
      }
    }

    return DEFAULT_ORGANIZATION_ID;
  }

  public static getInitialDivisionID() {
    const organization_id = Initializer.getInitialOrganizationID();

    // default to FBS
    if (organization_id === DEFAULT_CFB_ID) {
      return DEFAULT_FBS_DIVISION_ID;
    }

    if (organization_id === DEFAULT_CBB_ID) {
      return DEFAULT_D1_DIVISION_ID;
    }

    if (organization_id === DEFAULT_NBA_ID) {
      return DEFAULT_NBA_DIVISION_ID;
    }

    return DEFAULT_D1_DIVISION_ID;
  }

  public static getInitialSeason() {
    const organization_id = Initializer.getInitialOrganizationID();

    // default to FBS
    if (organization_id === DEFAULT_CFB_ID) {
      return DEFAULT_CFB_SEASON;
    }

    if (organization_id === DEFAULT_CBB_ID) {
      return DEFAULT_CBB_SEASON;
    }

    if (organization_id === DEFAULT_NBA_ID) {
      return DEFAULT_NBA_SEASON;
    }

    return 2026;
  }
}

export default Initializer;
