'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dashboard-slice';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Columns, Inputs, MultiSelect, Paper, Select, Typography, useTheme } from '@esmalley/react-material-ui';
import BugReportIcon from '@esmalley/react-material-icons/BugReport';
import RankTable from '@/components/generic/RankTable';
import { Empty } from '../Panel';
import { getColumns } from '../columns';
import ErrorDetail from './ErrorDetail';
import { Audit } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';

/**
 * The browser error log.
 *
 * One row per distinct bug rather than per occurrence -- the api groups by a fingerprint it derives
 * from the normalized message and the top stack frames, so `occurrences` is the severity number
 * here, not the row count.
 *
 * Sorting happens twice, on purpose. `order_by` goes to the api and decides *which* page of bugs
 * comes back; the table's own header clicks then reorder that page. The panel title says which
 * page you are looking at so the two are not confused.
 */

/**
 * A timestamp the table can also sort by.
 *
 * `RankTable` sorts on the rendered field, so a friendly date would sort alphabetically -- April
 * ahead of January. Year first and a 24 hour clock sort correctly as plain text, and read fine in
 * an operational table.
 */
const stamp = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return Dates.format(Dates.parse(value, true), 'Y-m-d H:i');
};

const columns = getColumns([
  {
    id: 'occurrences',
    label: '#',
    tooltip: 'How many times this bug has fired',
    numeric: true,
    width: 60,
  },
  {
    id: 'name',
    label: 'Error',
    tooltip: 'The error class, and the message under it',
    sticky: true,
    width: 300,
  },
  {
    id: 'route',
    label: 'Route',
    tooltip: 'The route pattern it was last seen on',
    width: 180,
  },
  {
    id: 'source',
    label: 'Source',
    tooltip: 'Which reporter filed it',
    width: 130,
  },
  {
    id: 'release',
    label: 'Release',
    tooltip: 'The commit it was last seen in',
    width: 110,
  },
  {
    id: 'last_seen',
    label: 'Last seen',
    width: 150,
  },
  {
    id: 'resolved',
    label: 'State',
    width: 100,
  },
]);

const displayColumns = ['occurrences', 'name', 'route', 'source', 'release', 'last_seen', 'resolved'];


const Errors = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const errors = useAppSelector((state) => state.dashboardReducer.errors);
  const audit_gui_id = useAppSelector((state) => state.dashboardReducer.audit_gui_id);
  const resolved = useAppSelector((state) => state.dashboardReducer.resolved);
  const releases = useAppSelector((state) => state.dashboardReducer.releases);
  const sources = useAppSelector((state) => state.dashboardReducer.sources);
  const order_by = useAppSelector((state) => state.dashboardReducer.order_by);

  const inputHandler = new Inputs();

  if (audit_gui_id) {
    return <ErrorDetail />;
  }

  if (!errors || 'error' in errors) {
    return <Empty message = 'Nothing to show yet.' />;
  }

  const allBugs: Audit.AuditGui[] = (
    Array.isArray(errors) ? errors :
    ('rows' in (errors as any) && Array.isArray((errors as any).rows)) ? (errors as any).rows :
    Object.values(errors as Audit.AuditGuis)
  );

  const availableReleases = Array.from(new Set(allBugs.map((b) => b.release).filter(Boolean) as string[])).sort();
  const availableSources = Array.from(new Set(allBugs.map((b) => b.source).filter(Boolean) as string[])).sort();

  const filteredBugs = allBugs.filter((bug) => {
    if (resolved !== '' && String(bug.resolved) !== resolved) return false;
    if (releases.length && !releases.includes(bug.release)) return false;
    if (sources.length && !sources.includes(bug.source)) return false;
    return true;
  });

  const rows = filteredBugs.map((bug: Audit.AuditGui) => {
    return {
      audit_gui_id: bug.audit_gui_id,
      occurrences: bug.occurrences,
      name: `${bug.name}: ${bug.message}`,
      route: bug.route,
      source: bug.source,
      release: bug.release,
      last_seen: stamp(bug.last_seen),
      resolved: bug.resolved ? 'resolved' : 'open',
    };
  });

  const set = (key:'resolved' | 'releases' | 'sources' | 'order_by', value: string | string[]) => {
    dispatch(setDataKey({ key, value }));
  };

  const title = allBugs.length > rows.length ?
    `Errors (${rows.length} of ${allBugs.length})` :
    `Errors (${allBugs.length})`;

  return (
    <>
      <Paper
        title = 'Filters'
        style = {{ padding: 16 }}
      >
        <Columns numberOfColumns={4} breakPoint={700}>
          <Select
            inputHandler={inputHandler}
            label = 'Status'
            value = {resolved}
            options = {[
              { value: '0', label: 'Open' },
              { value: '1', label: 'Resolved' },
              { value: '', label: 'All' },
            ]}
            onChange = {(value) => set('resolved', String(value))}
          />
          <Select
            inputHandler={inputHandler}
            label = 'Order'
            value = {order_by}
            options = {[
              { value: 'last_seen', label: 'Most recent' },
              { value: 'occurrences', label: 'Most frequent' },
              { value: 'date_of_entry', label: 'Newest bug' },
            ]}
            onChange = {(value) => set('order_by', String(value))}
          />
          <MultiSelect
            inputHandler={inputHandler}
            label = 'Release'
            value = {releases}
            allOption
            allLabel='Any release'
            options = {availableReleases.map((value) => ({ value, label: value }))}
            onChange = {(value) => set('releases', value as string[])}
            />
          <MultiSelect
            inputHandler={inputHandler}
            displayMode='count'
            allOption
            label = 'Error type'
            value = {sources}
            // isRadio = {false}
            options = {availableSources.map((value) => ({ value, label: value }))}
            onChange = {(value) => set('sources', value as string[])}
          />
        </Columns>
      </Paper>
      <div style = {{ display: 'flex', alignItems: 'center' }}>
        <span style = {{ display: 'flex', marginRight: 8 }}><BugReportIcon style = {{ color: theme.error.main, fontSize: 24 }} /></span>
        <Typography type = 'h6'>{title}</Typography>
      </div>
      {
        rows.length ?
          <>
            <RankTable
              rows = {rows}
              columns = {columns}
              displayColumns = {displayColumns}
              rowKey = 'audit_gui_id'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = {order_by === 'occurrences' ? 'occurrences' : 'last_seen'}
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_errors'
              handleRowClick = {(id) => {
                navigation.dashboardView({ audit_gui_id: String(id) });
              }}
            />
          </>
          : <Empty message = 'No errors match those filters.' />
      }
    </>
  );
};

export default Errors;
