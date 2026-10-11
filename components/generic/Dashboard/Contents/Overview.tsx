'use client';

import { useAppSelector } from '@/redux/hooks';
import { Columns, Paper, Slab, useTheme } from '@esmalley/react-material-ui';
import BugReportIcon from '@esmalley/react-material-icons/BugReport';
import ApiIcon from '@esmalley/react-material-icons/Api';
import PaymentsIcon from '@esmalley/react-material-icons/Payments';
import VpnKeyIcon from '@esmalley/react-material-icons/VpnKey';
import { Empty, innerBreakPoint } from '../Panel';
import { Dashboard } from '@srating-io/types';

/**
 * The numbers worth seeing first.
 *
 * Stat tiles rather than charts: each of these is a single current value, and a chart of one
 * number is a worse way to read one number.
 */

const number = (value: number | undefined): string => (+(value || 0)).toLocaleString();

const Overview = () => {
  const theme = useTheme();
  const overview = useAppSelector((state) => state.dashboardReducer.overview);

  if (!overview || 'error' in overview) {
    return <Empty message = 'Nothing to show yet.' />;
  }

  const data = overview as Exclude<Dashboard.overviewResults, { error: string }>;

  const types = Object.keys(data.subscription.type_x_active).sort();

  return (
    <>
      <Paper
        titleIcon = {<BugReportIcon style = {{ color: theme.error.main, fontSize: 24 }} />}
        title = 'Browser errors'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
          <Slab
            label = 'Open bugs'
            primary = {number(data.audit_gui.unresolved)}
            primaryStyle = {{ fontWeight: 600 }}
          />
          <Slab
            label = 'Occurrences'
            primary = {number(data.audit_gui.occurrences)}
            info = 'Times the open bugs have fired in total'
          />
          <Slab
            label = 'Seen in 24h'
            primary = {number(data.audit_gui.last_24h)}
          />
        </Columns>
      </Paper>
      <Paper
        titleIcon = {<ApiIcon style = {{ color: theme.info.main, fontSize: 24 }} />}
        title = 'API'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
          <Slab
            label = 'Requests in 24h'
            primary = {number(data.audit_api.last_24h)}
            info = 'Public api only -- the website does not write these'
          />
          <Slab
            label = 'Failures in 24h'
            primary = {number(data.audit_error.last_24h)}
          />
          <Slab
            label = 'Failures in 7d'
            primary = {number(data.audit_error.last_7d)}
          />
        </Columns>
      </Paper>

      <Paper
        titleIcon = {<PaymentsIcon style = {{ color: theme.success.main, fontSize: 24 }} />}
        title = 'Subscriptions'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
          <Slab
            label = 'Active'
            primary = {number(data.subscription.active)}
            primaryStyle = {{ fontWeight: 600 }}
          />
          {
            types.map((type) => (
              <Slab
                key = {type}
                label = {`Active, ${type}`}
                primary = {number(data.subscription.type_x_active[type])}
              />
            ))
          }
          <Slab
            label = 'Unhandled webhooks'
            primary = {number(data.payment_router.unhandled)}
            info = 'Stripe events that arrived and were never applied'
          />
        </Columns>
      </Paper>

      <Paper
        titleIcon = {<VpnKeyIcon style = {{ color: theme.warning.main, fontSize: 24 }} />}
        title = 'Accounts and keys'
        style = {{ padding: 16, marginBottom: 16 }}
      >
        <Columns numberOfColumns={4} breakPoint = {innerBreakPoint}>
          <Slab
            label = 'Users'
            primary = {number(data.user.total)}
          />
          <Slab
            label = 'New in 7d'
            primary = {number(data.user.last_7d)}
          />
          <Slab
            label = 'API keys'
            primary = {number(data.api_key.total)}
          />
          <Slab
            label = 'Near their limit'
            primary = {number(data.api_key.near_limit)}
            info = 'At or past 80% of the usage limit'
          />
        </Columns>
      </Paper>
    </>
  );
};

export default Overview;
