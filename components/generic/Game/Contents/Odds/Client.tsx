'use client';


import HelperGame from '@/components/helpers/Game';
import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game//NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';

// import SportsScoreIcon from '@esmalley/react-material-icons/SportsScore';
// import TrendingUpIcon from '@esmalley/react-material-icons/TrendingUp';
// import TrendingDownIcon from '@esmalley/react-material-icons/TrendingDown';
// import ArrowForwardIcon from '@esmalley/react-material-icons/ArrowForward';
// import FunctionsIcon from '@esmalley/react-material-icons/Functions';
// import LockOpenIcon from '@esmalley/react-material-icons/LockOpen';
// import LockIcon from '@esmalley/react-material-icons/Lock';
import { Color } from '@esmalley/ts-utils';
import { LinearProgress, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import Analysis from '@/components/generic/Analysis/Analysis';
import { useAppSelector } from '@/redux/hooks';

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: '0px 10px' }}>
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


const Client = ({ game, oddsStats }) => {
  const theme = useTheme();

  // The game page keeps its fresher scores and prediction in its own slice; the accuracy
  // payload is shared with the projections page.
  const gamePrediction = useAppSelector((state) => state.gameReducer.gamePrediction);
  const gamePredictionLoading = useAppSelector((state) => state.gameReducer.gamePredictionLoading);
  const accuracy = useAppSelector((state) => state.picksReducer.accuracy);
  const Game = new HelperGame({
    game,
  });


  const awayRows: React.JSX.Element[] = [];
  const homeRows: React.JSX.Element[] = [];

  const getWinRows = (caption, number_of_wins, number_of_games) => {
    const percentage = +(((number_of_wins / number_of_games) || 0) * 100).toFixed(0);

    return (
      <tr key = {caption} style = {{ textAlign: 'left' }}>
        <td style = {{ textAlign: 'left' }}><Typography type='caption' style = {{ color: theme.info.main }}>{caption}</Typography></td>
        <td style = {{ paddingLeft: '10px' }}><Typography type='caption' style = {{ color: theme.text.secondary }}>{`${number_of_wins}/${number_of_games}`}</Typography></td>
        <td><Typography type='caption' style = {{ color: Color.lerpColor(theme.error.main, theme.success.light, percentage / 100) }}>{`(${percentage}%)`}</Typography></td>
      </tr>
    );
  };



  if (oddsStats && oddsStats[game.away_team_id]) {
    const awayOS = oddsStats[game.away_team_id];
    awayRows.push(getWinRows('Favored:', awayOS.favored_wins, awayOS.favored_games));
    awayRows.push(getWinRows('Underdog:', awayOS.underdog_wins, awayOS.underdog_games));
  }

  if (oddsStats && oddsStats[game.home_team_id]) {
    const homeOS = oddsStats[game.home_team_id];
    homeRows.push(getWinRows('Favored:', homeOS.favored_wins, homeOS.favored_games));
    homeRows.push(getWinRows('Underdog:', homeOS.underdog_wins, homeOS.underdog_games));
  }

  // https://gemini.google.com/app/4d6ea89566f3d71e
  // todo show oddes history like this example

  return (
    <Contents>
      <Paper style = {{ maxWidth: 600, margin: 'auto', marginTop: 8 }}>
        <Typography type = 'h6' style = {{ textAlign: 'center' }}>{`${game.season - 1}-${game.season} season`}</Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
          <div>
            <Typography type = 'body1'>{Game.getTeamName('away')}</Typography>
            <table>
              <tbody>
                {awayRows}
              </tbody>
            </table>
          </div>
          <div>
            <Typography type = 'body1'>{Game.getTeamName('home')}</Typography>
            <table>
              <tbody>
                {homeRows}
              </tbody>
            </table>
          </div>
        </div>
      </Paper>
      <Analysis
        game = {game}
        liveRows = {gamePrediction}
        accuracy = {accuracy}
        loading = {gamePredictionLoading}
        maxWidth = {600}
      />
    </Contents>
  );
};

export { Client, ClientSkeleton };
