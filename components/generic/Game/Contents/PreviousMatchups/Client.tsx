'use client';

import { useState } from 'react';

import HelperGame from '@/components/helpers/Game';

import PreviousMatchupTile from '@/components/generic/Game/Contents/PreviousMatchups/Tile';
import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { Chip, LinearProgress, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

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

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 160;
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


const Client = ({ game, previousMatchups }: {game: General.Game, previousMatchups: General.Games}) => {
  const [showAllPreviousMatchups, setShowAllPreviousMatchups] = useState(false);

  const Game = new HelperGame({
    game,
  });


  const previousMatchupContainers: React.JSX.Element[] = [];
  const summaryPRContainers: React.JSX.Element[] = [];

  if (previousMatchups && !Object.keys(previousMatchups).length) {
    previousMatchupContainers.push(<Paper elevation = {3} style = {{ padding: 10 }}><Typography type = 'body1'>Could not find any previous games :(</Typography></Paper>);
  } else if (previousMatchups) {
    const sorted_matchups: General.Game[] = Object.values(previousMatchups).sort((a, b) => {
      return a.start_date > b.start_date ? -1 : 1;
    });

    let away_wins = 0;
    let home_wins = 0;

    let home_points = 0;
    let away_points = 0;

    let lastThree_away_wins = 0;
    let lastThree_home_wins = 0;

    let lastThree_home_points = 0;
    let lastThree_away_points = 0;

    for (let i = 0; i < sorted_matchups.length; i++) {
      const sortedGame = sorted_matchups[i];

      const lastThree = sorted_matchups.length > 3 && i < 3;

      const awayScore = sortedGame.away_score || 0;
      const homeScore = sortedGame.home_score || 0;

      if (awayScore > homeScore) {
        if (sortedGame.away_team_id === game.away_team_id) {
          away_wins++;
          away_points += awayScore - homeScore;
          if (lastThree) {
            lastThree_away_wins++;
            lastThree_away_points += awayScore - homeScore;
          }
        } else if (sortedGame.away_team_id === game.home_team_id) {
          home_wins++;
          home_points += awayScore - homeScore;
          if (lastThree) {
            lastThree_home_wins++;
            lastThree_home_points += awayScore - homeScore;
          }
        }
      } else if (awayScore < homeScore) {
        if (sortedGame.home_team_id === game.away_team_id) {
          away_wins++;
          away_points += homeScore - awayScore;
          if (lastThree) {
            lastThree_away_wins++;
            lastThree_away_points += homeScore - awayScore;
          }
        } else if (sortedGame.home_team_id === game.home_team_id) {
          home_wins++;
          home_points += homeScore - awayScore;
          if (lastThree) {
            lastThree_home_wins++;
            lastThree_home_points += homeScore - awayScore;
          }
        }
      }
      if (i < 3 || showAllPreviousMatchups) {
        previousMatchupContainers.push(<PreviousMatchupTile key = {`PreviousMatchupTile_${sortedGame.game_id}`} game = {sorted_matchups[i]} />);
      }
    }

    if (sorted_matchups.length > 3 && !showAllPreviousMatchups) {
      previousMatchupContainers.push(<Chip
        key = 'showAllPreviousMatchups'
        value = {'showAllPreviousMatchups'}
        style = {{ margin: '5px 5px 10px 5px' }}
        onClick = {() => { setShowAllPreviousMatchups(true); }}
        title = '+ Match-ups'
      />);
    }

    if (sorted_matchups.length > 5) {
      if (lastThree_home_wins >= lastThree_away_wins) {
        summaryPRContainers.push(<Typography type = 'body2'>{Game.getTeamName('home')} has won {lastThree_home_wins} of last 3 by an average of {(lastThree_home_points / lastThree_home_wins).toFixed(2)} pts.</Typography>);
      } else {
        summaryPRContainers.push(<Typography type = 'body2'>{Game.getTeamName('away')} has won {lastThree_away_wins} of last 3 by an average of {(lastThree_away_points / lastThree_away_wins).toFixed(2)} pts.</Typography>);
      }
    }

    if (home_wins >= away_wins) {
      summaryPRContainers.push(<Typography type = 'body2'>{Game.getTeamName('home')} has won {home_wins} of last {sorted_matchups.length} by an average of {(home_points / home_wins).toFixed(2)} pts.</Typography>);
    } else {
      summaryPRContainers.push(<Typography type = 'body2'>{Game.getTeamName('away')} has won {away_wins} of last {sorted_matchups.length} by an average of {(away_points / away_wins).toFixed(2)} pts.</Typography>);
    }
  }


  return (
    <Contents>
      <Typography type = 'body1'>Previous match-ups</Typography>
      {summaryPRContainers}
      {
        previousMatchups !== null ?
        <div style = {{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          {previousMatchupContainers}
        </div>
          : ''
      }
    </Contents>
  );
};

export { Client, ClientSkeleton };
