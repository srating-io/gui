'use client';

import { useAppSelector } from '@/redux/hooks';
import { Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import VpnKeyIcon from '@esmalley/react-material-icons/VpnKey';
import RankTable from '@/components/generic/RankTable';
import { Empty } from '../Panel';
import { getColumns } from '../columns';
import { Dashboard } from '@srating-io/types';
import { Arithmetic, Dates } from '@esmalley/ts-utils';

/**
 * Every api key, its quota and who owns it.
 *
 * The key itself is never fetched. It is the credential, and nothing this panel answers needs it --
 * the api selects every other column by name and leaves that one behind.
 */

/** Year first, so the column sorts as text the way it reads. See `../columns`. */
const day = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return Dates.format(Dates.parse(value, true), 'Y-m-d');
};

/** Where a key stands against its quota. An unmetered key has no percentage to show. */
const share = (row: Dashboard.DashboardApiKey): number => {
  if (!row.usage_limit) {
    return 0;
  }

  return Arithmetic.round((+(row.usage || 0) / +row.usage_limit) * 100, 2);
};

const columns = getColumns([
  { id: 'api_key_id', label: 'ID', numeric: true, width: 80 },
  { id: 'username', label: 'Owner', sticky: true, width: 230 },
  { id: 'pricing_name', label: 'Plan', width: 160 },
  { id: 'pricing_type', label: 'Type', width: 90 },
  { id: 'usage', label: 'Usage', numeric: true, width: 110 },
  { id: 'usage_limit', label: 'Limit', numeric: true, width: 110 },
  {
    id: 'share',
    label: '% used',
    tooltip: 'Usage against the limit. Blank when the key is not metered.',
    numeric: true,
    width: 100,
  },
  {
    id: 'access',
    label: 'Access',
    tooltip: 'Which capability bits are set on the key',
    width: 150,
  },
  {
    id: 'expires',
    label: 'Expires',
    width: 130,
  },
  {
    id: 'last_reset',
    label: 'Last reset',
    width: 130,
  },
]);

/** Which capability bits are set, as words. */
const access = (row: Dashboard.DashboardApiKey): string => {
  const bits: string[] = [];

  if (row.read) {
    bits.push('read');
  }

  if (row.write) {
    bits.push('write');
  }

  if (row.hidden_access) {
    bits.push('hidden');
  }

  return bits.length ? bits.join(', ') : 'none';
};

const displayColumns = [
  'api_key_id',
  'username',
  'pricing_name',
  'pricing_type',
  'usage',
  'usage_limit',
  'share',
  'access',
  'expires',
  'last_reset',
];


const Keys = () => {
  const theme = useTheme();

  const keys = useAppSelector((state) => state.dashboardReducer.keys);

  if (!keys || 'error' in keys) {
    return <Empty message = 'Nothing to show yet.' />;
  }

  const data = keys as Exclude<Dashboard.apiKeysResults, { error: string }>;

  const rows = data.rows.map((key) => ({
    api_key_id: key.api_key_id,
    username: key.username,
    pricing_name: key.pricing_name,
    pricing_type: key.pricing_type,
    usage: key.usage,
    usage_limit: key.usage_limit,
    share: key.usage_limit ? share(key) : 0,
    access: access(key),
    expires: day(key.expires),
    last_reset: day(key.last_reset),
  }));

  return (
    <Paper
      elevation={0}
      titleIcon={<VpnKeyIcon style = {{ color: theme.warning.main, fontSize: 24 }} />}
      title = {`API keys (${data.rows.length})`}
    >
      {
        rows.length ?
          <RankTable
            rows = {rows}
            columns = {columns}
            displayColumns = {displayColumns}
            rowKey = 'api_key_id'
            defaultSortOrder = 'desc'
            defaultSortOrderBy = 'share'
            defaultEmpty = ''
            sessionStorageKey = 'dashboard_keys'
          />
          : <Empty message = 'No api keys.' />
      }
    </Paper>
  );
};

export default Keys;
