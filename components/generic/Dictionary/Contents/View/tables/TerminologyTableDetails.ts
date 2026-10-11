import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class TerminologyTableDetails extends BaseTableDetails {
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
        title: 'Classification',
        fields: ['type'],
      },
    ];
  }
}
