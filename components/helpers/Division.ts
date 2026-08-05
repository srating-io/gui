import { getStore } from '@/app/StoreProvider';
import { DEFAULT_D1_DIVISION_ID, DEFAULT_D2_DIVISION_ID, DEFAULT_D3_DIVISION_ID, DEFAULT_FBS_DIVISION_ID, DEFAULT_FCS_DIVISION_ID, DEFAULT_NBA_DIVISION_ID } from './Defaults';



/**
 * This class helps simplify the division logic
 */
class Division {
  /**
   * Get the division ID for FBS
   */
  public static getFBS(): string {
    return DEFAULT_FBS_DIVISION_ID;
  }

  /**
   * Get the division ID for FCS
   */
  public static getFCS(): string {
    return DEFAULT_FCS_DIVISION_ID;
  }

  /**
   * Get the division ID for D1
   */
  public static getD1(): string {
    return DEFAULT_D1_DIVISION_ID;
  }

  /**
   * Get the division ID for D2
   */
  public static getD2(): string {
    return DEFAULT_D2_DIVISION_ID;
  }

  /**
   * Get the division ID for D3
   */
  public static getD3(): string {
    return DEFAULT_D3_DIVISION_ID;
  }

  /**
   * Get the NBA division ID
   */
  public static getNBA(): string {
    return DEFAULT_NBA_DIVISION_ID;
  }

  /**
   * Is the current division FBS?
   */
  public static isFBS(): boolean {
    const store = getStore();
    return (store.getState().organizationReducer.division_id === this.getFBS());
  }

  /**
   * Is the current division FCS?
   */
  public static isFCS(): boolean {
    const store = getStore();
    return (store.getState().organizationReducer.division_id === this.getFCS());
  }

  /**
   * Is the current division D1?
   */
  public static isD1(): boolean {
    const store = getStore();
    return (store.getState().organizationReducer.division_id === this.getD1());
  }

  /**
   * Is the current division D2?
   */
  public static isD2(): boolean {
    const store = getStore();
    return (store.getState().organizationReducer.division_id === this.getD2());
  }

  /**
   * Is the current division D3?
   */
  public static isD3(): boolean {
    const store = getStore();
    return (store.getState().organizationReducer.division_id === this.getD3());
  }
}

export default Division;
