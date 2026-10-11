'use client';

import { useAppSelector } from '@/redux/hooks';
import { Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import Overview from './Overview';
import Errors from './Errors';
import ApiTraffic from './ApiTraffic';
import Revenue from './Revenue';
import Keys from './Keys';


const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ margin: '0px 16px 32px 16px' }}>
      {children}
    </div>
  );
};


/**
 * What a non-admin sees.
 *
 * Deliberately says nothing about why. The api refuses with the same message to a logged-out
 * visitor, a signed-in non-admin and a transport failure, and there is nothing here that should
 * help a caller tell those apart.
 */
const Denied = () => {
  const theme = useTheme();

  return (
    <Contents>
      <Paper style = {{ padding: 32, marginTop: 32 }}>
        <div style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography type = 'h6'>Nothing here</Typography>
          <Typography type = 'body2' style = {{ color: theme.text.secondary, marginTop: 8 }}>
            This page is not available.
          </Typography>
        </div>
      </Paper>
    </Contents>
  );
};


const Client = () => {
  const view = useAppSelector((state) => state.dashboardReducer.view);
  const denied = useAppSelector((state) => state.dashboardReducer.denied);

  if (denied) {
    return <Denied />;
  }

  return (
    <Contents>
      {view === 'errors' ? <Errors /> : ''}
      {view === 'traffic' ? <ApiTraffic /> : ''}
      {view === 'revenue' ? <Revenue /> : ''}
      {view === 'keys' ? <Keys /> : ''}
      {(!view || view === 'overview') ? <Overview /> : ''}
    </Contents>
  );
};

export { Client, Contents };
export default Client;
