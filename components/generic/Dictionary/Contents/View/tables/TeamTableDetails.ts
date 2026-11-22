import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class TeamTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: ['name', 'name_short', 'code', 'char6'],
      },
      {
        title: 'Colors',
        fields: ['primary_color', 'secondary_color'],
      },
    ];
  }
}
