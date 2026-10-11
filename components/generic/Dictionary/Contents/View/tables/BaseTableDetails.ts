import { Textor } from '@esmalley/ts-utils';
import { FieldConfig, ResolvedSection, SectionConfig } from './types';
import { formatLabel } from './utils';

export class BaseTableDetails {
  public readonly table: string;

  constructor(table: string) {
    this.table = table;
  }

  /**
   * Title displayed for this row (defaults to the table ID).
   */
  public getTitle(id: string): string {
    return id;
  }

  /**
   * Caption displayed above the title.
   */
  public getCaption(): string {
    return `${Textor.toSentenceCase(this.table.replaceAll('_', ' '))} ID`;
  }

  /**
   * Keys that should not be rendered as form inputs.
   */
  public getExcludedKeys(): string[] {
    return [`${this.table}_id`, 'deleted', 'created_at', 'updated_at'];
  }

  /**
   * Table-specific sections. Subclasses override this to specify groupings.
   */
  public getSections(): SectionConfig[] {
    return [];
  }

  /**
   * Normalizes a field string or config into a full FieldConfig.
   */
  protected normalizeField(field: string | FieldConfig): FieldConfig {
    if (typeof field === 'string') {
      return {
        key: field,
        label: formatLabel(field),
      };
    }
    return {
      label: field.label || formatLabel(field.key),
      ...field,
    };
  }

  /**
   * Resolves sections for the given formData.
   * If a subclass defines sections, formData fields are mapped into those sections.
   * Any remaining unmapped fields are gathered into "Additional Info".
   * For unknown/unconfigured tables, an intelligent dynamic grouping is generated.
   */
  public resolveSections(formData: Record<string, unknown>): ResolvedSection[] {
    const excluded = new Set(this.getExcludedKeys());
    const availableKeys = Object.keys(formData).filter((k) => !excluded.has(k));
    const definedSections = this.getSections();

    if (definedSections.length > 0) {
      const consumedKeys = new Set<string>();
      const resolved: ResolvedSection[] = [];

      for (const section of definedSections) {
        const fields: FieldConfig[] = [];
        for (const f of section.fields) {
          const config = this.normalizeField(f);
          if (config.key in formData && !excluded.has(config.key)) {
            fields.push(config);
            consumedKeys.add(config.key);
          }
        }
        if (fields.length > 0) {
          resolved.push({
            title: section.title,
            description: section.description,
            fields,
          });
        }
      }

      // Collect any extra fields present in formData but not specified in getSections()
      const remainingKeys = availableKeys.filter((k) => !consumedKeys.has(k));
      if (remainingKeys.length > 0) {
        resolved.push({
          title: 'Additional Info',
          fields: remainingKeys.map((k) => this.normalizeField(k)),
        });
      }

      return resolved;
    }

    // Dynamic grouping fallback for tables without explicit section definitions
    const basicInfoKeys = ['name', 'first_name', 'last_name', 'alt_name', 'code', 'char6', 'description', 'title'];
    const systemKeys = ['guid', 'inactive', 'active', 'status', 'version'];

    const basicFields: FieldConfig[] = [];
    const systemFields: FieldConfig[] = [];
    const detailFields: FieldConfig[] = [];

    for (const key of availableKeys) {
      const config = this.normalizeField({
        key,
        multiline: key === 'description' || typeof formData[key] === 'object',
      });

      if (basicInfoKeys.includes(key)) {
        basicFields.push(config);
      } else if (systemKeys.includes(key)) {
        systemFields.push(config);
      } else {
        detailFields.push(config);
      }
    }

    const sections: ResolvedSection[] = [];
    if (basicFields.length > 0) {
      sections.push({ title: 'Basic Info', fields: basicFields });
    }
    if (detailFields.length > 0) {
      sections.push({ title: 'Details', fields: detailFields });
    }
    if (systemFields.length > 0) {
      sections.push({ title: 'System', fields: systemFields });
    }

    return sections;
  }
}
