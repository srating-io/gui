import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class DivisionTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: ['name', 'code'],
      },
      {
        title: 'System',
        fields: ['guid', 'inactive'],
      },
    ];
  }
}
