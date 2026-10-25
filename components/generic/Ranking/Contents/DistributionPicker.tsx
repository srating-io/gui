'use client';

import { TableColumnsType } from '@esmalley/react-material-ui';

import OptionPicker, { optionType } from '@/components/generic/OptionPicker';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { setDataKey } from '@/redux/features/ranking-slice';
import { useAppDispatch } from '@/redux/hooks';


/**
 * Every column the league distribution can be drawn on, for this sport.
 *
 * Rank columns are left out for the reason the chart itself avoids them: a rank is a permutation of
 * 1..N, so its histogram is one team per bar and says nothing but how many teams there are. That
 * takes `ap_rank`, `net_rank` and the rest of the external polls out; `rank` is already gone with
 * the disabled columns.
 */
const getDistributionColumns = ({ organization_id }: { organization_id: string }): TableColumnsType => {
  const columns = TableColumns.getColumns({ organization_id, view: 'team', graphable: true, disabled: false });

  for (const key in columns) {
    if (!columns[key].numeric || key.endsWith('_rank')) {
      delete columns[key];
    }
  }

  return columns;
};

/**
 * The stats that lead the menu, per sport.
 *
 * These are the two the scatter already crosses plus the two the page is organised around, so the
 * measures a reader arrived for are above the fold of a menu that is otherwise a hundred stats long.
 */
const getStandardColumns = ({ organization_id }: { organization_id: string }): string[] => {
  if (Organization.getCFBID() === organization_id) {
    return ['points', 'opponent_points', 'elo', 'yards_per_play'];
  }

  return ['offensive_rating', 'defensive_rating', 'elo', 'pace'];
};

/**
 * Which measure the league distribution is drawn on.
 *
 * The chart used to read the sorted column and fall back to the scatter's x axis, which meant the
 * only way to see a stat's spread was to leave the chart, sort the table by it and come back - and
 * the default sort is rank, so most readers only ever saw the one fallback measure.
 */
const DistributionPicker = (
  {
    organization_id, selected, selectedLabel, unusable,
  }:
  { organization_id: string, selected: string, selectedLabel: string, unusable: Set<string> },
) => {
  const dispatch = useAppDispatch();

  const allColumns = getDistributionColumns({ organization_id });
  const standardColumns = getStandardColumns({ organization_id });

  const options: optionType[] = [];
  const seen = new Set<string>();

  const push = (key: string) => {
    seen.add(key);
    options.push({
      value: key,
      label: allColumns[key].getLabel(),
      sublabel: allColumns[key].getTooltip(),
      // a column the league barely carries cannot make a shape, so the menu says so rather than
      // handing back an empty chart
      disabled: unusable.has(key),
    });
  };

  for (const key of standardColumns) {
    if (key in allColumns) {
      push(key);
    }
  }

  // on the label rather than the id: the reader is scanning "P COMP" and "P YDS", and sorting on
  // `passing_completions` and `passing_yards` underneath them puts QBR in the middle of the two
  const rest = Object.keys(allColumns).filter((key) => !seen.has(key));

  rest.sort((a, b) => allColumns[a].getLabel().localeCompare(allColumns[b].getLabel()));

  for (const key of rest) {
    push(key);
  }

  return (
    <OptionPicker
      selected = {[selected]}
      options = {options}
      isRadio = {true}
      showMenuCloseButton = {true}
      buttonName = {selectedLabel}
      actionHandler = {(value) => { dispatch(setDataKey({ key: 'distributionColumn', value: value as string })); }}
    />
  );
};

export default DistributionPicker;
export { getDistributionColumns };
