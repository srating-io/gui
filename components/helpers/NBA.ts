

import { DEFAULT_NBA_SEASON } from './Defaults';

/**
 * This class helps simplify the NBA logic
 */
class NBA {
  /**
   * Get the current default season
   */
  public static getCurrentSeason(): number {
    return DEFAULT_NBA_SEASON;
  }
}

export default NBA;
