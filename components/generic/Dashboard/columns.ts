import { TableColumn, TableColumnsType } from '@esmalley/react-material-ui';

/**
 * Column descriptors for the dashboard tables.
 *
 * `TableColumn` carries a lot of fields that only mean something to the statistic tables -- ranks,
 * organizations, graphability, compare sides. None of that applies here, so this fills them in once
 * and each panel declares only what differs.
 *
 * Note what is *not* here: `getDisplayValue` and `getValue`. They are on `TableColumn`, but the only
 * component in this app that calls them is `CompareStatistic`. `RankTable` renders `row[column.id]`
 * and sorts on the same field, so a dashboard row has to arrive display ready -- dates formatted,
 * flags turned into words, derived numbers already computed. Each panel maps the api payload into
 * that shape before handing it over, which is also what keeps redux's frozen arrays out of `sort`.
 */

type Spec = {
  id: string;
  label: string;
  tooltip?: string;
  numeric?: boolean;
  sticky?: boolean;
  width?: number;
};

const column = (spec: Spec): TableColumn => ({
  id: spec.id,
  numeric: spec.numeric === true,
  sticky: spec.sticky === true,
  organization_ids: [],
  graphable: false,
  ...(spec.width ? { widths: { default: spec.width } } : {}),
  getLabel: () => spec.label,
  getTooltip: () => spec.tooltip || spec.label,
  getViews: () => ['dashboard'],
});

/**
 * Build a column set from specs, keyed by id, which is the shape the tables want.
 */
export const getColumns = (specs: Spec[]): TableColumnsType => {
  const columns: TableColumnsType = {};

  for (const spec of specs) {
    columns[spec.id] = column(spec);
  }

  return columns;
};

export default getColumns;
