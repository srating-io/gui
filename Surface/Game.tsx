'use server';

import { useServerAPI } from '@/components/serverAPI';

import HeaderClientWrapper from '@/components/generic/Game/Header/ClientWrapper';
import HeaderServer from '@/components/generic/Game/Header/Server';

import NavBar from '@/components/generic/Game/NavBar';

import BoxscoreClientWrapper from '@/components/generic/Game/Contents/Boxscore/ClientWrapper';
import { ClientSkeleton as BoxscoreClientSkeleton } from '@/components/generic/Game/Contents/Boxscore/Client';
import BoxscoreServer from '@/components/generic/Game/Contents/Boxscore/Server';

import ChartsClientWrapper from '@/components/generic/Game/Contents/Charts/ClientWrapper';
import { ClientSkeleton as ChartsClientSkeleton } from '@/components/generic/Game/Contents/Charts/Client';
import ChartsServer from '@/components/generic/Game/Contents/Charts/Server';

import PlaybyplayClientWrapper from '@/components/generic/Game/Contents/Playbyplay/ClientWrapper';
import { ClientSkeleton as PlaybyplayClientSkeleton } from '@/components/generic/Game/Contents/Playbyplay/Client';
import PlaybyplayServer from '@/components/generic/Game/Contents/Playbyplay/Server';

import MatchupClientWrapper from '@/components/generic/Game/Contents/Matchup/ClientWrapper';
import MatchupClient from '@/components/generic/Game/Contents/Matchup/Client';

import StatCompareClientWrapper from '@/components/generic/Game/Contents/StatCompare/ClientWrapper';
import { ClientSkeleton as StatCompareClientSkeleton } from '@/components/generic/Game/Contents/StatCompare/Client';
import StatCompareServer from '@/components/generic/Game/Contents/StatCompare/Server';

import PreviousMatchupsClientWrapper from '@/components/generic/Game/Contents/PreviousMatchups/ClientWrapper';
import { ClientSkeleton as PreviousMatchupsClientSkeleton } from '@/components/generic/Game/Contents/PreviousMatchups/Client';
import PreviousMatchupsServer from '@/components/generic/Game/Contents/PreviousMatchups/Server';

import OddsClientWrapper from '@/components/generic/Game/Contents/Odds/ClientWrapper';
import { ClientSkeleton as OddsClientSkeleton } from '@/components/generic/Game/Contents/Odds/Client';
import OddsServer from '@/components/generic/Game/Contents/Odds/Server';

import MomentumClientWrapper from '@/components/generic/Game/Contents/Momentum/ClientWrapper';
import { ClientSkeleton as MomentumClientSkeleton } from '@/components/generic/Game/Contents/Momentum/Client';
import MomentumServer from '@/components/generic/Game/Contents/Momentum/Server';

import { ClientSkeleton as StatsLoaderSkeleton } from '@/components/generic/Game/Contents/StatsLoader/Client';
import StatsLoaderServer from '@/components/generic/Game/Contents/StatsLoader/Server';
import PredictionLoader from '@/components/generic/Game/PreditionLoader';
import ReduxWrapper from '@/components/generic/Game/ReduxWrapper';
import ContentsWrapper from '@/components/generic/Game/ContentsWrapper';

import Organization from '@/components/helpers/Organization';
import HelperGame from '@/components/helpers/Game';
import { cache, Suspense } from 'react';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/generic/StructuredData';
import HelperStructuredData from '@/components/helpers/StructuredData';
import Surface from '../Surface';
import Slug from '@/components/helpers/Slug';
import Url from '@/components/helpers/Url';
import { General, Game as GameAPI } from '@srating-io/types';


export type getDecorateGame = {
  /**
   * The game's slug, or its id on a legacy url.
   */
  game: string;
  division_id?: string;
  view?: string;
  subview?: string;
};

const getGameData = cache(async (organization_id: string, game_id: string) => {
  const revalidateSeconds = 30;
  const games: GameAPI.getGamesResults = await useServerAPI({
    class: 'game',
    function: 'getGames',
    arguments: {
      game_id,
    },
    cache: revalidateSeconds,
  });

  const game = games[game_id];

  if (!game) {
    notFound();
  }

  const coach_team_seasons: General.CoachTeamSeasons = await useServerAPI({
    class: 'coach_team_season',
    function: 'read',
    arguments: {
      organization_id,
      team_id: [game.away_team_id, game.home_team_id],
      season: game.season,
    },
    cache: 60 * 60 * 12,
  });

  const coaches: General.Coaches = await useServerAPI({
    class: 'coach',
    function: 'read',
    arguments: {
      coach_id: Object.values(coach_team_seasons).map((r) => r.coach_id),
    },
    cache: 60 * 60 * 12,
  });

  return { game, coach_team_seasons, coaches };
});

class Game extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData({ game: segment }: { game: string }) {
    const organization_id = this.getOrganizationID();

    const row = await this.requireEntity<General.Game>('game', segment);

    // getGames returns the row joined to its teams, which is what the title needs; the resolve
    // above only tells us which game_id the slug meant
    const { game } = await this.getData({ game_id: row.game_id });

    const Game = new HelperGame({
      game,
    });

    const matchup = `${Game.getTeamName('away')} vs ${Game.getTeamName('home')}`;
    const sportText = Organization.getSportText({ organization_id });
    const date = game && game.start_datetime ? Game.getStartDate('M jS, Y') : '';

    const description = `${matchup}${date ? ` on ${date}` : ''}: ${sportText} projection, matchup breakdown, box score and trends.`;

    const path = this.getEntityPath('game', Slug.forRow('game', row) || segment);

    return {
      title: `sRating | ${matchup}`,
      description,
      alternates: {
        canonical: path ? Url.canonical(path) : undefined,
      },
      openGraph: {
        title: matchup,
        description,
      },
      twitter: {
        card: 'summary',
        title: matchup,
        description,
      },
    };
  }

  /**
   * SportsEvent. The one schema here a search engine shows as a result card rather than a link, so
   * the scores are only attached once the game is final.
   */
  getStructuredData({ game }: { game: GameAPI.GameWithOddsAndTeams }) {
    const sport = this.getSport() || '';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });
    const Helper = new HelperGame({ game });

    const away = game.teams ? game.teams[game.away_team_id] : null;
    const home = game.teams ? game.teams[game.home_team_id] : null;

    const awayName = Helper.getTeamName('away');
    const homeName = Helper.getTeamName('home');
    const path = this.getEntityPath('game', Slug.forRow('game', game) || game.game_id);

    return HelperStructuredData.graph([
      HelperStructuredData.game({
        game,
        awayName,
        homeName,
        awayPath: away ? this.getEntityPath('team', Slug.forRow('team', away) || away.team_id) : null,
        homePath: home ? this.getEntityPath('team', Slug.forRow('team', home) || home.team_id) : null,
        sport: sportText,
        path,
      }),
      HelperStructuredData.breadcrumbs([
        { name: sportText, path: `/${sport}/games` },
        { name: `${awayName} at ${homeName}`, path },
      ]),
    ]);
  }

  async getData({ game_id }) {
    return getGameData(this.getOrganizationID(), game_id);
  }

  async getDecorate(
    { game: segment, division_id = this.getDivisionID(), view, subview }:
    getDecorateGame,
  ) {
    const organization_id = this.getOrganizationID();
    const resolved = await this.requireEntity<General.Game>('game', segment);
    const game_id = resolved.game_id;

    const { game, coach_team_seasons, coaches } = await this.getData({ game_id });

    if (!game || !game.game_id) {
      return notFound();
    }

    const { season } = game;

    const Game = new HelperGame({
      game,
    });

    let currentView = view;
    if (!currentView) {
      currentView = (Game.isInProgress() || Game.isFinal()) ? 'game_details' : 'matchup';
    }

    let currentSubView = subview;
    if (!currentSubView) {
      if (currentView === 'game_details') {
        currentSubView = 'boxscore';
      }

      if (currentView === 'trends') {
        currentSubView = 'stat_compare';
      }
    }

    const getContent = () => {
      if (currentView === 'game_details' && currentSubView === 'boxscore') {
        return (
          <BoxscoreClientWrapper>
            <Suspense fallback = {<BoxscoreClientSkeleton />}>
              <BoxscoreServer game = {game} />
            </Suspense>
          </BoxscoreClientWrapper>
        );
      } if (currentView === 'game_details' && currentSubView === 'charts') {
        return (
          <ChartsClientWrapper>
            <Suspense fallback = {<ChartsClientSkeleton />}>
              <ChartsServer game = {game} />
            </Suspense>
          </ChartsClientWrapper>
        );
      } if (currentView === 'game_details' && currentSubView === 'pbp') {
        return (
          <PlaybyplayClientWrapper>
            <Suspense fallback = {<PlaybyplayClientSkeleton />}>
              <PlaybyplayServer game = {game} />
            </Suspense>
          </PlaybyplayClientWrapper>
        );
      } if (currentView === 'matchup') {
        return (
          <MatchupClientWrapper>
            <MatchupClient game = {game} />
          </MatchupClientWrapper>
        );
      } if (currentView === 'trends' && currentSubView === 'stat_compare') {
        return (
          <StatCompareClientWrapper>
            <Suspense fallback = {<StatCompareClientSkeleton />}>
              <StatCompareServer game = {game} />
            </Suspense>
          </StatCompareClientWrapper>
        );
      } if (currentView === 'trends' && currentSubView === 'previous_matchups') {
        return (
          <PreviousMatchupsClientWrapper>
            <Suspense fallback = {<PreviousMatchupsClientSkeleton />}>
              <PreviousMatchupsServer game = {game} />
            </Suspense>
          </PreviousMatchupsClientWrapper>
        );
      } if (currentView === 'trends' && currentSubView === 'odds') {
        return (
          <OddsClientWrapper>
            <Suspense fallback = {<OddsClientSkeleton />}>
              <OddsServer game = {game} />
            </Suspense>
          </OddsClientWrapper>
        );
      } if (currentView === 'trends' && currentSubView === 'momentum') {
        return (
          <MomentumClientWrapper>
            <Suspense fallback = {<MomentumClientSkeleton />}>
              <MomentumServer game = {game} />
            </Suspense>
          </MomentumClientWrapper>
        );
      }
      return <></>;
    };

    return (
      <>
        <StructuredData data = {this.getStructuredData({ game })} />
        <ReduxWrapper game = {game} coach_team_seasons = {coach_team_seasons} coaches = {coaches} view = {currentView} subview = {currentSubView}>
          <Suspense key = {`${game_id}_statsloader`} fallback = {<StatsLoaderSkeleton />}>
            <StatsLoaderServer game_ids = {[game_id]} coach_ids = {Object.keys(coaches)} organization_id = {organization_id} division_id = {division_id} season = {season} />
          </Suspense>
          <HeaderClientWrapper game = {game} coaches = {coaches} coach_team_seasons = {coach_team_seasons}>
            <Suspense key = {`${game_id}_headerloader`}>
              <HeaderServer game_id = {game_id} />
            </Suspense>
          </HeaderClientWrapper>
          <NavBar />
          <PredictionLoader key = {`${game_id}_predictionloader`} game_id = {game_id} />
          <ContentsWrapper>
            {getContent()}
          </ContentsWrapper>
        </ReduxWrapper>
      </>
    );
  }
}

export default Game;
