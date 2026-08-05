'use client';

import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';
import { Basketball } from '@srating-io/types';

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: 20 }}>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = getNavHeaderHeight() + getSubNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};

const Client = ({ play_by_plays /* tag */ }) => {
  const theme = useTheme();
  const rows: Basketball.PlaybyPlays = play_by_plays;

  const sortedPBP: Basketball.PlaybyPlay[] = Object.values(rows).sort((a, b) => {
    return +a.order > +b.order ? -1 : 1;
  });

  return (
    <Contents>
      {
        sortedPBP.map((play_by_play) => {
          return (
            <div key = {play_by_play.play_by_play_id} style = {{ margin: '5px 0px' }}>
              <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{play_by_play.current_period}H {play_by_play.away_score}-{play_by_play.home_score} {play_by_play.clock}</Typography>
              <Typography type = 'body1'>{play_by_play.description}</Typography>
            </div>
          );
        })
      }
      {rows !== null && sortedPBP.length === 0 ? <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>No play by play data yet...</Typography> : ''}
    </Contents>
  );
};

export { Client, ClientSkeleton };
