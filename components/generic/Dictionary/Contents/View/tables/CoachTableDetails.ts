import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class CoachTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: ['first_name', 'last_name'],
      },
    ];
  }
}
