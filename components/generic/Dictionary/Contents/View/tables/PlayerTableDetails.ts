import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class PlayerTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: ['first_name', 'last_name', 'position', 'number'],
      },
      {
        title: 'Physical Attributes',
        fields: ['height', 'weight'],
      },
      {
        title: 'Background & Draft',
        fields: ['hometown', 'college', 'class_year', 'draft_year', 'draft_round', 'draft_number'],
      },
    ];
  }
}
