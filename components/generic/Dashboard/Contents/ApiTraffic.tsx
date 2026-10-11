'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dashboard-slice';
import { Columns, Paper, Select, Typography, useTheme } from '@esmalley/react-material-ui';
import ApiIcon from '@esmalley/react-material-icons/Api';
import WarningIcon from '@esmalley/react-material-icons/Warning';
import SpeedIcon from '@esmalley/react-material-icons/Speed';
import VpnKeyIcon from '@esmalley/react-material-icons/VpnKey';
import { ChartLine, getCategorical } from '@/components/generic/Chart';
import RankTable from '@/components/generic/RankTable';
import { Empty } from '../Panel';
import { getColumns } from '../columns';
import { Audit, Dashboard } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';

/**
 * Public api traffic.
 *
 * Requests and failures get a chart each rather than two series on one. Both are counts per day,
 * but a healthy day has thousands of the first and a handful of the second -- on a shared axis the
 * failures would be a flat line along the floor, and a second y-axis would invent a correspondence
 * between the two scales that the data does not contain.
 */

/** Year first and a 24 hour clock, so the column sorts as text the way it reads. See `../columns`. */
const stamp = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return Dates.format(Dates.parse(value, true), 'Y-m-d H:i');
};

/** `{'Y-m-d': n}` into the points recharts wants, oldest first, labelled month-day. */
const toSeries = (date_x_total: {[date: string]: number}, key: string): object[] => (
  Object.keys(date_x_total)
    .sort()
    .map((date) => ({ date: date.slice(5), [key]: date_x_total[date] }))
);

/** `{key: n}` into rows for a two column table. */
const toRows = (key_x_total: {[key: string]: number}, idKey: string): object[] => (
  Object.keys(key_x_total).map((id) => ({ [idKey]: id, total: key_x_total[id] }))
);

const classColumns = getColumns([
  { id: 'class', label: 'Class', sticky: true, width: 240 },
  { id: 'total', label: 'Requests', numeric: true, width: 120 },
]);

const keyColumns = getColumns([
  { id: 'api_key_id', label: 'Key', tooltip: 'The api_key_id that made the calls', sticky: true, width: 160 },
  { id: 'total', label: 'Requests', numeric: true, width: 120 },
]);

const failureColumns = getColumns([
  { id: 'class', label: 'Class', sticky: true, width: 180 },
  { id: 'function', label: 'Function', width: 180 },
  { id: 'total', label: 'Failures', numeric: true, width: 100 },
]);

const requestColumns = getColumns([
  { id: 'audit_api_id', label: 'ID', numeric: true, width: 90 },
  { id: 'class', label: 'Class', sticky: true, width: 170 },
  { id: 'function', label: 'Function', width: 170 },
  { id: 'api_key_id', label: 'Key', tooltip: 'The api_key_id that made the call', numeric: true, width: 80 },
  { id: 'date_of_entry', label: 'When', width: 150 },
]);

const errorColumns = getColumns([
  { id: 'audit_error_id', label: 'ID', numeric: true, width: 90 },
  { id: 'class', label: 'Class', sticky: true, width: 150 },
  { id: 'function', label: 'Function', width: 150 },
  { id: 'error', label: 'Error', width: 320 },
  { id: 'date_of_entry', label: 'When', width: 150 },
]);


const ApiTraffic = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const palette = getCategorical(theme);

  const traffic = useAppSelector((state) => state.dashboardReducer.traffic);
  const days = useAppSelector((state) => state.dashboardReducer.days);

  if (!traffic || 'error' in traffic) {
    return <Empty message = 'Nothing to show yet.' />;
  }

  const data = traffic as Exclude<Dashboard.apiTrafficResults, { error: string }>;

  const requestSeries = toSeries(data.date_x_requests, 'requests');
  const errorSeries = toSeries(data.date_x_errors, 'failures');
  const classRows = toRows(data.class_x_requests, 'class');
  const keyRows = toRows(data.api_key_id_x_requests, 'api_key_id');

  // a class appears once per function that failed in it, so neither field alone is a row key
  const failureRows = data.error_counts.map((count) => ({
    call: `${count.class}.${count.function}`,
    class: count.class,
    function: count.function,
    total: count.total,
  }));

  const requestRows = data.recent_requests.map((request: Audit.AuditApi) => ({
    audit_api_id: request.audit_api_id,
    class: request.class,
    function: request.function,
    api_key_id: request.api_key_id,
    date_of_entry: stamp(request.date_of_entry),
  }));

  const errorRows = data.recent_errors.map((error: Audit.AuditError) => ({
    audit_error_id: error.audit_error_id,
    class: error.class,
    function: error.function,
    error: error.error,
    date_of_entry: stamp(error.date_of_entry),
  }));

  const windowPicker = (
    <Select
      label = 'Window'
      value = {String(days)}
      options = {[
        { value: '1', label: '1 day' },
        { value: '7', label: '7 days' },
        { value: '14', label: '14 days' },
        { value: '30', label: '30 days' },
      ]}
      onChange = {(value) => dispatch(setDataKey({ key: 'days', value: +(value || 7) }))}
    />
  );

  return (
    <>
      <Paper
        elevation={0}
        titleIcon = {<ApiIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'Requests per day'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        {
          requestSeries.length ?
          <>
          <Columns numberOfColumns={3}>
            <div></div>
            <div></div>
            <Select
              label = 'Window'
              value = {String(days)}
              options = {[
                { value: '1', label: '1 day' },
                { value: '7', label: '7 days' },
                { value: '14', label: '14 days' },
                { value: '30', label: '30 days' },
              ]}
              onChange = {(value) => dispatch(setDataKey({ key: 'days', value: +(value || 7) }))}
            />
          </Columns>
            <ChartLine
              rows = {requestSeries}
              lines = {[{
                dataKey: 'requests',
                name: 'Requests',
                type: 'monotone',
                stroke: palette[0],
                strokeWidth: 2,
                dot: false,
                connectNulls: true,
              }]}
              XAxisDataKey = 'date'
              YAxisLabel = 'Requests'
              YAxisProps = {{ allowDecimals: false, width: 70 }}
            />
          </>
            : <Empty message = 'No public api requests in this window.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<WarningIcon style = {{ color: theme.error.main, fontSize: 24 }} />}
        title = 'Failures per day'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        {
          errorSeries.length ?
            <ChartLine
              rows = {errorSeries}
              lines = {[{
                dataKey: 'failures',
                name: 'Failures',
                type: 'monotone',
                // red is kept out of the categorical set precisely so it can mean this
                stroke: theme.error.main,
                strokeWidth: 2,
                dot: false,
                connectNulls: true,
              }]}
              XAxisDataKey = 'date'
              YAxisLabel = 'Failures'
              YAxisProps = {{ allowDecimals: false, width: 70 }}
            />
            : <Empty message = 'No api failures in this window. Good.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<SpeedIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'Busiest classes'
        style = {{ marginBottom: 16 }}
      >
        {
          classRows.length ?
            <RankTable
              rows = {classRows}
              columns = {classColumns}
              displayColumns = {['class', 'total']}
              rowKey = 'class'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = 'total'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_traffic_classes'
            />
            : <Empty message = 'Nothing in this window.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<VpnKeyIcon style = {{ color: theme.warning.main, fontSize: 24 }} />}
        title = 'Busiest keys'
        style = {{ marginBottom: 16 }}
      >
        {
          keyRows.length ?
            <RankTable
              rows = {keyRows}
              columns = {keyColumns}
              displayColumns = {['api_key_id', 'total']}
              rowKey = 'api_key_id'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = 'total'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_traffic_keys'
            />
            : <Empty message = 'Nothing in this window.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<WarningIcon style = {{ color: theme.warning.main, fontSize: 24 }} />}
        title = 'Failures by call'
        style = {{ marginBottom: 16 }}
      >
        {
          failureRows.length ?
            <RankTable
              rows = {failureRows}
              columns = {failureColumns}
              displayColumns = {['class', 'function', 'total']}
              rowKey = 'call'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = 'total'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_traffic_failures'
            />
            : <Empty message = 'No failures in this window.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<ApiIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'Most recent requests'
        style = {{ marginBottom: 16 }}
      >
        {
          requestRows.length ?
            <>
              <RankTable
                rows = {requestRows}
                columns = {requestColumns}
                displayColumns = {['audit_api_id', 'class', 'function', 'api_key_id', 'date_of_entry']}
                rowKey = 'audit_api_id'
                defaultSortOrder = 'desc'
                defaultSortOrderBy = 'audit_api_id'
                defaultEmpty = ''
                sessionStorageKey = 'dashboard_traffic_recent'
              />
              <Typography type = 'body2' style = {{ color: theme.text.secondary, marginTop: 8 }}>
                The website does not write these -- only calls that presented an api key.
              </Typography>
            </>
            : <Empty message = 'No requests recorded.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<WarningIcon style = {{ color: theme.error.main, fontSize: 24 }} />}
        title = 'Most recent failures'
        style = {{ marginBottom: 16 }}
      >
        {
          errorRows.length ?
            <RankTable
              rows = {errorRows}
              columns = {errorColumns}
              displayColumns = {['audit_error_id', 'class', 'function', 'error', 'date_of_entry']}
              rowKey = 'audit_error_id'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = 'audit_error_id'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_traffic_recent_errors'
            />
            : <Empty message = 'No failures recorded.' />
        }
      </Paper>
    </>
  );
};

export default ApiTraffic;
