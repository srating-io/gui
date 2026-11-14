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
  /**
   * `window` is undefined on the server, so anything rendering on both sides of hydration has
   * to pass the path in. Reading `window` here returns the default sport on the server and the
   * real one on the client, which seeds a store the client then disagrees with.
   */
  public static getInitialOrganizationID(pathName?: string) {
    const path = pathName ?? (typeof window !== 'undefined' ? window.location.pathname : undefined);

    if (path) {
      const splat = path.split('/');
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

  public static getInitialDivisionID(pathName?: string) {
    const organization_id = Initializer.getInitialOrganizationID(pathName);

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

  public static getInitialSeason(pathName?: string) {
    const organization_id = Initializer.getInitialOrganizationID(pathName);

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

    // unreachable today, but match whatever DEFAULT_ORGANIZATION_ID is rather than a literal
    return DEFAULT_CFB_SEASON;
  }
}

export default Initializer;
