import { BaseTableDetails } from './BaseTableDetails';
import { ConferenceTableDetails } from './ConferenceTableDetails';
import { DivisionTableDetails } from './DivisionTableDetails';
import { OrganizationTableDetails } from './OrganizationTableDetails';
import { TerminologyTableDetails } from './TerminologyTableDetails';
import { TeamTableDetails } from './TeamTableDetails';
import { CoachTableDetails } from './CoachTableDetails';
import { FantasyPayoutRuleTableDetails } from './FantasyPayoutRuleTableDetails';
import { PlayerTableDetails } from './PlayerTableDetails';
import { GameTableDetails } from './GameTableDetails';

export class TableDetailsFactory {
  private static registry: Record<string, new (table: string) => BaseTableDetails> = {
    conference: ConferenceTableDetails,
    division: DivisionTableDetails,
    organization: OrganizationTableDetails,
    terminology: TerminologyTableDetails,
    team: TeamTableDetails,
    coach: CoachTableDetails,
    fantasy_payout_rule: FantasyPayoutRuleTableDetails,
    player: PlayerTableDetails,
    game: GameTableDetails,
  };

  public static get(table: string): BaseTableDetails {
    const TableClass = this.registry[table] || BaseTableDetails;
    return new TableClass(table);
  }

  public static register(table: string, tableClass: new (table: string) => BaseTableDetails): void {
    this.registry[table] = tableClass;
  }
}

export const getTableDetails = (table: string): BaseTableDetails => {
  return TableDetailsFactory.get(table);
};
