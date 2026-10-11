import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class FantasyPayoutRuleTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: [
          'name',
          'code',
          { key: 'description', multiline: true, rows: 3 },
        ],
      },
      {
        title: 'Payout Structure',
        fields: [
          'ordinal',
          'custom',
          { key: 'json_payout_structure', multiline: true, rows: 5 },
        ],
      },
      {
        title: 'System',
        fields: ['guid', 'inactive'],
      },
    ];
  }
}
