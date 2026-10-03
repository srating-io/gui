'use client';

import React from 'react';

import Tile from '@/components/generic/Team/Contents/Schedule/Tile';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Differentials from './Differentials';
import { useScrollContext } from '@/contexts/scrollContext';
import TableView from './TableView';
import { Color, Dates } from '@esmalley/ts-utils';
import Organization from '@/components/helpers/Organization';
import HelperGeneral from '@/components/helpers/General';
import Locked from '@/components/generic/Billing/Locked';
import { ChartSequenceStrip, SequenceCell } from '@/components/generic/Chart';
import Odds from '@/components/helpers/Odds';
import { setDataKey } from '@/redux/features/team-slice';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Skeleton, Typography } from '@esmalley/react-material-ui';
import { General, Team } from '@srating-io/types';


/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: '20px 5px 20px 5px' }}>
      {children}
    </div>
  );
};

const ClientSkeleton = () => {
  const skeletons: React.JSX.Element[] = [];
  for (let i = 0; i < 30; i++) {
    skeletons.push(<Skeleton key = {i} style = {{
      width: '100%', height: 40, margin: '5px 0px', padding: 0, transform: 'initial',
    }} />);
  }
  return (
    <Contents>
      {skeletons}
    </Contents>
  );
};

export type ScheduleGameWithPrediction = Team.getScheduleResults[string] & {
  prediction?: General.Prediction;
};

export type ScheduleResultsWithPrediction = {
  [K in keyof Team.getScheduleResults]: ScheduleGameWithPrediction;
};

const Client = ({ games, team_id }: {games: ScheduleResultsWithPrediction, team_id: string}) => {
  const predictions = useAppSelector((state) => state.teamReducer.schedulePredictions);
  const scheduleView = useAppSelector((state) => state.teamReducer.scheduleView);
  const showScheduleDifferentials = useAppSelector((state) => state.teamReducer.showScheduleDifferentials);
  const visibleScheduleDifferentials = useAppSelector((state) => state.teamReducer.visibleScheduleDifferentials);
  const scheduleStats = useAppSelector((state) => state.teamReducer.scheduleStats);
  const isLoadingPredictions = useAppSelector((state) => state.teamReducer.schedulePredictionsLoading);
  const isLoadingStats = useAppSelector((state) => state.teamReducer.scheduleStatsLoading);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  // const scrollTop = useAppSelector((state) => state.teamReducer.scrollTop);

  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const scrollRef = useScrollContext();

  // const [firstRender, setFirstRender] = useState(true);


  // useEffect(() => {
  //   if (firstRender && scrollRef && scrollRef.current) {
  //     // todo something in nextjs is setting scrolltop to zero right after this, so trick it by putting this at the end of the execution :)
  //     // https://github.com/vercel/next.js/issues/20951
  //     setTimeout(() => {
  //       if (scrollRef && scrollRef.current) {
  //         scrollRef.current.scrollTop = scrollTop;
  //       }
  //     }, 1);
  //   }
  //   setFirstRender(false);
  // });

  for (const prediction_id in predictions) {
    const row = predictions[prediction_id];
    if (row.game_id in games) {
      // eslint-disable-next-line no-param-reassign
      games[row.game_id].prediction = row;
    }
  }

  const sorted_games = Object.values(games || {}).sort((a, b) => (a.start_date < b.start_date ? -1 : 1));

  const getGameHref = (game: ScheduleGameWithPrediction) => {
    return `/${Organization.getPath({ organizations, organization_id: game.organization_id })}/games/${game.game_id}`;
  };

  /**
   * Opening a game from anywhere on this page has to park the scroll position first, or coming
   * back lands at the top of a thirty-row schedule instead of on the game that was clicked.
   */
  const handleGameClick = (game: ScheduleGameWithPrediction) => {
    if (scrollRef && scrollRef.current) {
      dispatch(setDataKey({ key: 'scrollTop', value: scrollRef.current.scrollTop }));
    }

    navigation.game(getGameHref(game));
  };

  /**
   * The season as one line: how strong each opponent was, and what happened.
   *
   * Reading this off the tiles below means thirty separate glances, and the thing worth seeing -
   * that a run of losses came against the hardest stretch of the schedule, or that the good record
   * was built on nobody - is a pattern across them rather than anything in any one.
   *
   * Played games carry the result; the ones still to come carry the same win percentage the tile
   * below would show, or the same lock when it is not paid for. A blank cell there would make the
   * strip stop at today, when the half of it worth reading is what the rest of the season looks
   * like next to what has already been survived.
   */
  const getStripCells = (): SequenceCell[] => {
    const cells: SequenceCell[] = [];

    for (const game of sorted_games) {
      const opponent_id = game.home_team_id === team_id ? game.away_team_id : game.home_team_id;
      const opponentName = game.teams[opponent_id] ? game.teams[opponent_id].name : 'Unknown';

      const numberOfTeams = Organization.getNumberOfTeams({
        organization_id: game.organization_id,
        division_id: game.division_id,
        season: game.season,
      });

      const statistic_ranking = (scheduleStats[game.game_id] && scheduleStats[game.game_id].current[opponent_id]) || null;
      const rank = statistic_ranking ? statistic_ranking.rank : null;

      // 1 is the top of the league, so the strong end of the ramp is the hard games
      const intensity = rank && numberOfTeams > 1 ?
        1 - ((Math.min(rank, numberOfTeams) - 1) / (numberOfTeams - 1)) :
        null;

      const homeScore = game.home_score;
      const awayScore = game.away_score;
      const played = homeScore !== null && awayScore !== null && game.status === 'final';

      const won = played && (
        (game.home_team_id === team_id && homeScore > awayScore) ||
        (game.away_team_id === team_id && awayScore > homeScore)
      );

      let mark: React.ReactNode = '';
      let markColor: string | undefined;
      let outcome: 'good' | 'bad' | null = null;
      let detail = '';
      const title = Dates.format(Dates.parse(game.start_datetime), 'n/j');

      if (played) {
        const result = won ? 'W' : 'L';
        mark = result;
        outcome = won ? 'good' : 'bad';
        detail = ` — ${result} ${homeScore}-${awayScore}`;
      } else if (isLoadingPredictions) {
        // sized to the "100%" it is standing in for, so the row of marks does not resettle when the
        // real numbers land
        mark = <Skeleton style = {{
          width: 24, height: 10, margin: '0px auto', padding: 0, transform: 'initial',
        }} />;
      } else {
        const winPercentage = Odds.getWinPercentage(game.prediction, game.home_team_id === team_id);

        if (winPercentage === null) {
          mark = <Locked iconFontSize = {'12px'} style = {{ minHeight: 14, minWidth: 14 }} />;
          detail = ' — subscribe for the win %';
        } else {
          mark = `${winPercentage}%`;
          markColor = Color.lerpColor(HelperGeneral.getWorstColor(), HelperGeneral.getBestColor(), winPercentage / 100);
          detail = ` — ${winPercentage}% to win`;
        }
      }

      cells.push({
        key: game.game_id,
        intensity,
        loading: isLoadingStats,
        title,
        mark,
        markColor,
        outcome,
        href: getGameHref(game),
        onSelect: () => handleGameClick(game),
        tooltip: `${Dates.format(game.start_datetime, 'M jS')} ${game.home_team_id === team_id ? 'vs' : '@'} ${opponentName}${rank ? ` (${rank})` : ''}${detail}`,
      });
    }

    return cells;
  };

  const gameContainers: React.JSX.Element[] = [];
  let lastMonth: number | null = null;
  let lastYear: number | null = null;
  let nextUpcomingGame: boolean | null = null;

  if (scheduleView === 'default') {
    for (let i = 0; i < sorted_games.length; i++) {
      const game = sorted_games[i];

      if (!lastMonth || lastMonth < +Dates.format(game.start_datetime, 'n') || (lastYear && lastYear < +Dates.format(game.start_datetime, 'Y'))) {
        lastMonth = +Dates.format(game.start_datetime, 'n');
        lastYear = +Dates.format(game.start_datetime, 'Y');
        gameContainers.push(<Typography key = {i} style = {{ padding: 5 }} type = 'body1'>{Dates.format(game.start_datetime, 'F')}</Typography>);
      }

      if (!nextUpcomingGame && (game.status === 'pre' || game.status === 'live')) {
        nextUpcomingGame = true;
        gameContainers.push(<Tile key = {game.game_id} game = {game} team = {game.teams[team_id]} />);
      } else {
        gameContainers.push(<Tile key = {game.game_id} game = {game} team = {game.teams[team_id]} />);
      }

      if (showScheduleDifferentials || visibleScheduleDifferentials.indexOf(game.game_id) > -1) {
        gameContainers.push(<Differentials key = {`differentials-${game.game_id}`} game = {game} team_id = {team_id} />);
      }
    }
  } else if (scheduleView === 'table') {
    gameContainers.push(<TableView sorted_games = {sorted_games} team_id = {team_id} />);
  }

  return (
    <Contents>
      <div style = {{ marginBottom: 16 }}>
        <ChartSequenceStrip
          cells = {getStripCells()}
          title = 'Season at a glance'
          scaleLow = 'weaker'
          scaleHigh = 'stronger opponent'
        />
      </div>
      {gameContainers}
    </Contents>
  );
};

export { Client, ClientSkeleton };
