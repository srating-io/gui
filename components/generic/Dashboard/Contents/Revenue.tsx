'use client';

import { useAppSelector } from '@/redux/hooks';
import { Columns, Paper, Slab, Typography, useTheme } from '@esmalley/react-material-ui';
import PaymentsIcon from '@esmalley/react-material-icons/Payments';
import ReceiptIcon from '@esmalley/react-material-icons/Receipt';
import TrendingUpIcon from '@esmalley/react-material-icons/TrendingUp';
import WarningIcon from '@esmalley/react-material-icons/Warning';
import { ChartLine, getCategorical } from '@/components/generic/Chart';
import RankTable from '@/components/generic/RankTable';
import Panel, { Empty, innerBreakPoint } from '../Panel';
import { getColumns } from '../columns';
import { Dashboard } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';

/**
 * Subscriptions and what is about to renew.
 *
 * Read entirely from our own tables, never from Stripe. That means these figures are what the
 * database believes -- which is the useful thing for an operational view, because a disagreement
 * with Stripe is itself something worth noticing -- but they are not an accounting source.
 */

/** Year first, so the column sorts as text the way it reads. See `../columns`. */
const day = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return Dates.format(Dates.parse(value, true), 'Y-m-d');
};

const subscriptionColumns = getColumns([
  { id: 'username', label: 'User', sticky: true, width: 240 },
  { id: 'pricing_name', label: 'Plan', width: 180 },
  { id: 'pricing_type', label: 'Type', width: 100 },
  { id: 'expires', label: 'Expires', width: 140 },
  { id: 'renewed', label: 'Renewed', width: 140 },
  { id: 'date_of_entry', label: 'Started', width: 140 },
]);

/** The api payload with its three timestamps formatted, which is what `RankTable` renders. */
const toRows = (subscriptions: Dashboard.RevenueSubscription[]): object[] => (
  subscriptions.map((subscription) => ({
    subscription_id: subscription.subscription_id,
    username: subscription.username,
    pricing_name: subscription.pricing_name,
    pricing_type: subscription.pricing_type,
    expires: day(subscription.expires),
    renewed: day(subscription.renewed),
    date_of_entry: day(subscription.date_of_entry),
  }))
);

const planColumns = getColumns([
  { id: 'name', label: 'Plan', sticky: true, width: 240 },
  { id: 'type', label: 'Type', width: 110 },
  { id: 'code', label: 'Code', width: 160 },
  { id: 'active', label: 'Active', numeric: true, width: 100 },
  { id: 'usage_limit', label: 'Usage limit', numeric: true, width: 120 },
]);


const Revenue = () => {
  const theme = useTheme();
  const palette = getCategorical(theme);

  const revenue = useAppSelector((state) => state.dashboardReducer.revenue);

  if (!revenue || 'error' in revenue) {
    return <Empty message = 'Nothing to show yet.' />;
  }

  const data = revenue as Exclude<Dashboard.revenueResults, { error: string }>;

  const types = Object.keys(data.type_x_active).sort();

  const active = types.reduce((total, type) => total + data.type_x_active[type], 0);

  const createdSeries = Object.keys(data.date_x_created)
    .sort()
    .map((date) => ({ date: date.slice(5), created: data.date_x_created[date] }));

  const renewalRows = toRows(data.renewals);
  const trialRows = toRows(data.trials);

  const planRows = Object.keys(data.pricing).map((pricing_id) => {
    const pricing = data.pricing[pricing_id];

    return {
      pricing_id,
      name: pricing.name,
      type: pricing.type,
      code: pricing.code,
      usage_limit: pricing.usage_limit,
      active: data.pricing_id_x_active[pricing_id] || 0,
    };
  });

  return (
    <>
      <Paper
        titleIcon = {<PaymentsIcon style = {{ color: theme.success.main, fontSize: 24 }} />}
        title = 'Active subscriptions'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
          <Slab label = 'Active' primary = {active.toLocaleString()} primaryStyle = {{ fontWeight: 600 }} />
          {
            types.map((type) => (
              <Slab
                key = {type}
                label = {type}
                primary = {data.type_x_active[type].toLocaleString()}
              />
            ))
          }
        </Columns>
      </Paper>

      {
        data.unhandled_payment_routers ?
          <Paper
            titleIcon = {<WarningIcon style = {{ color: theme.warning.main, fontSize: 24 }} />}
            title = 'Unhandled webhooks'
            style = {{ padding: 16, marginBottom: 16 }}
          >
            <Typography type = 'body2'>
              {`${data.unhandled_payment_routers} Stripe event${data.unhandled_payment_routers === 1 ? '' : 's'} arrived and was never applied.`}
            </Typography>
          </Paper>
          : ''
      }

      <Paper
        elevation={0}
        titleIcon = {<TrendingUpIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'New subscriptions per day'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        {
          createdSeries.length ?
            <ChartLine
              rows = {createdSeries}
              lines = {[{
                dataKey: 'created',
                name: 'Started',
                type: 'monotone',
                stroke: palette[0],
                strokeWidth: 2,
                dot: false,
                connectNulls: true,
              }]}
              XAxisDataKey = 'date'
              YAxisLabel = 'Started'
              YAxisProps = {{ allowDecimals: false, width: 70 }}
            />
            : <Empty message = 'No subscriptions started in the last 30 days.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<ReceiptIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'Renewing in the next 30 days'
        style = {{ marginBottom: 16 }}
      >
        {
          renewalRows.length ?
            <RankTable
              rows = {renewalRows}
              columns = {subscriptionColumns}
              displayColumns = {['username', 'pricing_name', 'pricing_type', 'expires', 'renewed']}
              rowKey = 'subscription_id'
              defaultSortOrder = 'asc'
              defaultSortOrderBy = 'expires'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_renewals'
            />
            : <Empty message = 'Nothing due in the next 30 days.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<PaymentsIcon style = {{ color: theme.warning.main, fontSize: 24 }} />}
        title = 'Active trials'
        style = {{ marginBottom: 16 }}
      >
        {
          trialRows.length ?
            <RankTable
              rows = {trialRows}
              columns = {subscriptionColumns}
              displayColumns = {['username', 'pricing_name', 'date_of_entry', 'expires']}
              rowKey = 'subscription_id'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = 'date_of_entry'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_trials'
            />
            : <Empty message = 'No trials running.' />
        }
      </Paper>

      <Paper
        elevation={0}
        titleIcon = {<ReceiptIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'Plans'
        style = {{ marginBottom: 16 }}
      >
        {
          planRows.length ?
            <RankTable
              rows = {planRows}
              columns = {planColumns}
              displayColumns = {['name', 'type', 'code', 'active', 'usage_limit']}
              rowKey = 'pricing_id'
              defaultSortOrder = 'desc'
              defaultSortOrderBy = 'active'
              defaultEmpty = ''
              sessionStorageKey = 'dashboard_plans'
            />
            : <Empty message = 'No plans configured.' />
        }
      </Paper>
    </>
  );
};

export default Revenue;
