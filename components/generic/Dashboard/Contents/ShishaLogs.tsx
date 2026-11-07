'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dashboard-slice';
import {
  Columns, Inputs, MultiSelect, Paper, Select, TextInput, Typography, useTheme,
} from '@esmalley/react-material-ui';
import ArticleIcon from '@esmalley/react-material-icons/Article';
import RankTable from '@/components/generic/RankTable';
import { Empty } from '../Panel';
import { getColumns } from '../columns';
import { Audit } from '@srating-io/types';


/**
 * The api sends up to 2000 characters, which is a python stderr dump for the noisy rows. There is
 * no detail view to open, and one such row would otherwise be the height of the table, so the cell
 * shows the front of it -- where the exception line is.
 */
const MESSAGE_PREVIEW = 300;

const preview = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return value.length > MESSAGE_PREVIEW ? `${value.slice(0, MESSAGE_PREVIEW)}…` : value;
};

const columns = getColumns([
  {
    id: 'date_of_entry',
    label: 'When',
    tooltip: 'When the line was logged',
    width: 160,
  },
  {
    id: 'class',
    label: 'Class',
    tooltip: 'The handler or processor that logged it',
    sticky: true,
    width: 220,
  },
  {
    id: 'file',
    label: 'Process',
    tooltip: 'The forked file the process was running',
    width: 230,
  },
  {
    id: 'pid',
    label: 'PID',
    tooltip: 'Process id, so a restart can be told from a single run',
    numeric: true,
    width: 80,
  },
  {
    id: 'message',
    label: 'Message',
    width: 600,
  },
]);

const displayColumns = ['date_of_entry', 'class', 'file', 'pid', 'message'];


const ShishaLogs = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const logs = useAppSelector((state) => state.dashboardReducer.logs);
  const days = useAppSelector((state) => state.dashboardReducer.days);
  const log_classes = useAppSelector((state) => state.dashboardReducer.log_classes);
  const search = useAppSelector((state) => state.dashboardReducer.search);

  const inputHandler = new Inputs();

  const set = (key: 'days' | 'log_classes' | 'search', value: number | string | string[]) => {
    dispatch(setDataKey({ key, value }));
  };

  const dayOptions = [
    { value: 1, label: 'Last day' },
    { value: 2, label: 'Last 2 days' },
    { value: 7, label: 'Last week' },
    { value: 14, label: 'Last 2 weeks' },
    { value: 30, label: 'Last 30 days' },
  ];

  if (!logs || 'error' in logs) {
    return <Empty message = 'Nothing to show yet.' />;
  }

  // the counts come from the whole window, not just the rows returned, so the filter lists every
  // class that logged even when its rows fell past the limit
  const availableClasses = Object.keys(logs.class_x_rows).sort();

  const term = search.trim().toLowerCase();

  const filtered = logs.rows.filter((row: Audit.ShishaLog) => {
    if (log_classes.length && !log_classes.includes(row.class || 'unknown')) {
      return false;
    }

    if (term && !`${row.message || ''} ${row.class || ''} ${row.file || ''}`.toLowerCase().includes(term)) {
      return false;
    }

    return true;
  });

  const rows = filtered.map((row: Audit.ShishaLog) => {
    return {
      shisha_log_id: row.shisha_log_id,
      // already `Y-m-d H:i:s` from the api, which is what RankTable needs: it sorts the value it
      // renders, so anything friendlier would sort alphabetically
      date_of_entry: row.date_of_entry,
      class: row.class,
      file: row.file,
      pid: row.pid,
      message: preview(row.message),
    };
  });

  const title = logs.rows.length > rows.length ?
    `Logs (${rows.length} of ${logs.rows.length})` :
    `Logs (${logs.rows.length})`;

  return (
    <>
      <Paper
        title = 'Filters'
        style = {{ padding: 16 }}
      >
        <Columns numberOfColumns={3} breakPoint={700}>
          <Select
            inputHandler={inputHandler}
            label = 'Window'
            value = {days}
            options = {dayOptions}
            onChange = {(value) => set('days', Number(value))}
          />
          <MultiSelect
            inputHandler={inputHandler}
            displayMode='count'
            allOption
            allLabel='Any class'
            label = 'Class'
            value = {log_classes}
            options = {availableClasses.map((value) => ({ value, label: `${value} (${logs.class_x_rows[value]})` }))}
            onChange = {(value) => set('log_classes', value as string[])}
          />
          <TextInput
            inputHandler={inputHandler}
            label = 'Search'
            placeholder = 'message, class or file'
            value = {search}
            onChange = {(value) => set('search', String(value))}
          />
        </Columns>
      </Paper>
      <div style = {{ display: 'flex', alignItems: 'center' }}>
        <span style = {{ display: 'flex', marginRight: 8 }}><ArticleIcon style = {{ color: theme.info.main, fontSize: 24 }} /></span>
        <Typography type = 'h6'>{title}</Typography>
      </div>
      {
        rows.length ?
          <RankTable
            rows = {rows}
            columns = {columns}
            displayColumns = {displayColumns}
            rowKey = 'shisha_log_id'
            defaultSortOrder = 'desc'
            defaultSortOrderBy = 'date_of_entry'
            defaultEmpty = ''
            sessionStorageKey = 'dashboard_shisha_logs'
          />
          : <Empty message = 'No log lines match those filters.' />
      }
    </>
  );
};

export default ShishaLogs;
