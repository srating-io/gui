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
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Surface from '../Surface';
import { General, Game as GameAPI } from '@srating-io/types';


export type getDecorateGame = {
  game_id: string;
  division_id?: string;
  view?: string;
  subview?: string;
};

class Game extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData({ game_id }) {
    // const organization_id = this.getOrganizationID();

    // const sportText = Organization.getSportText({ organization_id });

    const { game } = await this.getData({ game_id });

    const Game = new HelperGame({
      game,
    });

    return {
      title: `sRating | ${Game.getTeamName('away')} vs ${Game.getTeamName('home')}`,
      description: 'View predicted result, matchup, trends, odds',
      openGraph: {
        title: `${Game.getTeamName('away')} vs ${Game.getTeamName('home')}`,
        description: 'View predicted result, matchup, trends, odds',
      },
      twitter: {
        card: 'summary',
        title: `${Game.getTeamName('away')} vs ${Game.getTeamName('home')}`,
        description: 'View predicted result, matchup, trends, odds',
      },
    };
  }

  async getData({ game_id }) {
    const organization_id = this.getOrganizationID();

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
  }

  async getDecorate(
    { game_id, division_id = this.getDivisionID(), view, subview }:
    getDecorateGame,
  ) {
    const organization_id = this.getOrganizationID();
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
    );
  }
}

export default Game;
