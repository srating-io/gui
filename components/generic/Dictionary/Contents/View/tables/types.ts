export interface FieldConfig {
  key: string;
  label?: string;
  multiline?: boolean;
  disabled?: boolean;
  rows?: number;
}

export interface SectionConfig {
  title: string;
  description?: string;
  fields: (string | FieldConfig)[];
}

export interface ResolvedSection {
  title: string;
  description?: string;
  fields: FieldConfig[];
}
