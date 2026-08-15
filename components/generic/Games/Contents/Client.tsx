'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { getHeaderHeight } from '@/components/generic/Games/SubNavBar';
import Tile, { getTileBaseStyle } from '@/components/generic/Games/Tile';
import { useScrollContext } from '@/contexts/scrollContext';
import { getDateBarHeight } from '../../DateBar';
import ConferenceChips from '../../ConferenceChips';
import { Paper, Skeleton, Typography } from '@esmalley/react-material-ui';
import { Game, General } from '@srating-io/types';

const Contents = ({ children, childStyle = {} }) => {
  const gameContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 60,
    ...childStyle,
  };

  return (
    <div style = {{ padding: '0px 2.5px', marginTop: getHeaderHeight() + getDateBarHeight() }}>
      <div style = {{
        display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap',
      }}>
        <ConferenceChips />
      </div>
      <div style = {gameContainerStyle}>
        {children}
      </div>
    </div>
  );
};

const ClientSkeleton = ({ games }) => {
  const tiles: React.JSX.Element[] = [];

  for (const game_id in games) {
    const game = games[game_id];

    const divStyle = getTileBaseStyle();

    if (game.neutral_site && divStyle.height) {
      divStyle.height += 21;
    }

    tiles.push(
      <Paper elevation={3} style = {divStyle} key = {`paper_${game_id}`}>
        <Skeleton style = {{ height: divStyle.height, transform: 'initial' }} />
      </Paper>,
    );
  }

  return (
    <Contents>
      {tiles}
    </Contents>
  );
};

/*
Not needed, the regular skeleton just looks better even if the # of them change
const ClientSkeletonUnknown = () => {
  const heightToRemove = 400;
  return (
    <Contents childStyle={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - ${heightToRemove}px)`,
    }}>
      <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
    </Contents>
  );
};
*/

const Client = ({ games, date }: { games: Game.getGamesResults; date: string; }) => {
  const skip_sort_game_ids = useAppSelector((state) => state.favoriteReducer.skip_sort_game_ids);
  const favorite_team_ids = useAppSelector((state) => state.favoriteReducer.team_ids);
  const favorite_game_ids = useAppSelector((state) => state.favoriteReducer.game_ids);
  const selectedConferences = useAppSelector((state) => state.displayReducer.conferences);

  // todo think of a better way to do this top 25 filter stuff, so I dont need to re-render so much
  // putting it in the page load will slow it down quite a bit (maybe)
  const gamesFilter = useAppSelector((state) => state.displayReducer.gamesFilter);
  const gameStats = useAppSelector((state) => state.gamesReducer.gameStats);
  const gameStatsLoading = useAppSelector((state) => state.gamesReducer.gameStatsLoading);
  const displayRank = useAppSelector((state) => state.displayReducer.rank);

  const statuses = useAppSelector((state) => state.displayReducer.statuses);
  const scores = useAppSelector((state) => state.gamesReducer.scores);
  const datesChecked = useAppSelector((state) => state.gamesReducer.dates_checked);
  const scrollTop = useAppSelector((state) => state.gamesReducer.scrollTop);

  const [firstRender, setFirstRender] = useState(true);

  const scrollRef = useScrollContext();

  useEffect(() => {
    if (firstRender && scrollRef && scrollRef.current) {
      // todo something in nextjs is setting scrolltop to zero right after this, so trick it by putting this at the end of the execution :)
      // https://github.com/vercel/next.js/issues/20951
      setTimeout(() => {
        if (scrollRef && scrollRef.current) {
          scrollRef.current.scrollTop = scrollTop;
        }
      }, 1);
    }
    setFirstRender(false);
  });

  for (const game_id in scores) {
    if (game_id in games) {
      Object.assign(games[game_id], scores[game_id]);
    }
  }

  const isTeamFavorite = (id: string) => {
    if (
      favorite_team_ids.length &&
      favorite_team_ids.indexOf(id) > -1
    ) {
      return true;
    }

    return false;
  };

  const isGamePinned = (id: string) => {
    if (
      skip_sort_game_ids.indexOf(id) === -1 &&
      favorite_game_ids.length &&
      favorite_game_ids.indexOf(id) > -1
    ) {
      return true;
    }

    return false;
  };

  const gameContainers: React.JSX.Element[] = [];

  const sorted_games = Object.values(games);

  sorted_games.sort((a, b) => {
    const aIsPinned = (
      skip_sort_game_ids.indexOf(a.game_id) === -1 &&
      favorite_game_ids.length &&
      favorite_game_ids.indexOf(a.game_id) > -1
    );

    const bIsPinned = (
      skip_sort_game_ids.indexOf(b.game_id) === -1 &&
      favorite_game_ids.length &&
      favorite_game_ids.indexOf(b.game_id) > -1
    );

    if (
      favorite_team_ids.length &&
      (
        favorite_team_ids.indexOf(a.home_team_id) > -1 ||
        favorite_team_ids.indexOf(a.away_team_id) > -1
      ) &&
      (
        favorite_team_ids.indexOf(b.home_team_id) === -1 &&
        favorite_team_ids.indexOf(b.away_team_id) === -1
      )
    ) {
      return -1;
    }

    if (
      favorite_team_ids.length &&
      (
        favorite_team_ids.indexOf(b.home_team_id) > -1 ||
        favorite_team_ids.indexOf(b.away_team_id) > -1
      ) &&
      (
        favorite_team_ids.indexOf(a.home_team_id) === -1 &&
        favorite_team_ids.indexOf(a.away_team_id) === -1
      )
    ) {
      return 1;
    }

    if (aIsPinned && !bIsPinned) {
      return -1;
    }

    if (!aIsPinned && bIsPinned) {
      return 1;
    }

    if (
      a.status === 'live' &&
      b.status !== 'live'
    ) {
      return -1;
    }

    if (
      a.status !== 'live' &&
      b.status === 'live'
    ) {
      return 1;
    }

    if (
      a.status === 'final' &&
      b.status === 'pre'
    ) {
      return 1;
    }

    if (
      a.status === 'pre' &&
      b.status === 'final'
    ) {
      return -1;
    }
    return a.start_datetime > b.start_datetime ? 1 : -1;
  });


  for (let i = 0; i < sorted_games.length; i++) {
    const sortedGame = sorted_games[i];

    // remove games where a team is TBA

    if (
      !sortedGame.teams ||
      !sortedGame.teams[sortedGame.away_team_id] ||
      !sortedGame.teams[sortedGame.home_team_id]
    ) {
      continue;
    }

    if (
      selectedConferences.length &&
      selectedConferences.indexOf(sortedGame.teams[sortedGame.away_team_id].conference_id || '') === -1 &&
      selectedConferences.indexOf(sortedGame.teams[sortedGame.home_team_id].conference_id || '') === -1
    ) {
      continue;
    }

    if (statuses.indexOf(sortedGame.status) === -1) {
      continue;
    }

    const awayCurrent = (gameStats && gameStats[sortedGame.game_id] && gameStats[sortedGame.game_id].current[sortedGame.away_team_id]) || null;
    const awayHistorical = (gameStats && gameStats[sortedGame.game_id] && gameStats[sortedGame.game_id].historical[sortedGame.away_team_id]) || null;
    const homeCurrent = (gameStats && gameStats[sortedGame.game_id] && gameStats[sortedGame.game_id].current[sortedGame.home_team_id]) || null;
    const homeHistorical = (gameStats && gameStats[sortedGame.game_id] && gameStats[sortedGame.game_id].historical[sortedGame.home_team_id]) || null;

    const awayStats = sortedGame.status === 'final' ? awayHistorical : awayCurrent;
    const homeStats = sortedGame.status === 'final' ? homeHistorical : homeCurrent;

    let awayRank = Infinity;
    let homeRank = Infinity;
    if (
      awayStats &&
      displayRank in awayStats &&
      awayStats[displayRank] !== null
    ) {
      awayRank = awayStats[displayRank];
    }
    if (
      homeStats &&
      displayRank in homeStats &&
      homeStats[displayRank] !== null
    ) {
      homeRank = homeStats[displayRank];
    }

    // if both teams are greater than 25, skip them, unless one of the teams is a favorite or pinned game
    if (
      gamesFilter === 'top_25' &&
      awayRank > 25 &&
      homeRank > 25 &&
      (
        !favorite_team_ids.length ||
        (!isTeamFavorite(sortedGame.away_team_id) && !isTeamFavorite(sortedGame.home_team_id))
      ) &&
      (!isGamePinned(sortedGame.game_id))
    ) {
      continue;
    }

    // if both teams are greater than 50, skip them, unless one of the teams is a favorite or pinned game
    if (
      gamesFilter === 'top_50' &&
      awayRank > 50 &&
      homeRank > 50 &&
      (
        !favorite_team_ids.length ||
        (!isTeamFavorite(sortedGame.away_team_id) && !isTeamFavorite(sortedGame.home_team_id))
      ) &&
      (!isGamePinned(sortedGame.game_id))
    ) {
      continue;
    }

    gameContainers.push(<Tile key={i} game={sortedGame} isLoadingWinPercentage = {!datesChecked[date]} />);
  }

  if ((gamesFilter === 'top_25' || gamesFilter === 'top_50') && gameStatsLoading) {
    return (
      <ClientSkeleton games={games} />
    );
  }


  return (
    <Contents>
      {
        gameContainers.length ?
          gameContainers :
          <Typography type = 'h5'>No games found :( please adjust filter. </Typography>
      }
    </Contents>
  );
};

export { Client, ClientSkeleton };
