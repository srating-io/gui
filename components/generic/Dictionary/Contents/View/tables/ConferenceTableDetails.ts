import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class ConferenceTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: ['name', 'code'],
      },
      {
        title: 'Hierarchy',
        fields: ['parent_conference_id'],
      },
      {
        title: 'System',
        fields: ['guid', 'inactive'],
      },
    ];
  }
}
