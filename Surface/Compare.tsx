'use server';

import { Suspense } from 'react';

import { useServerAPI } from '@/components/serverAPI';
import Organization from '@/components/helpers/Organization';

import HeaderClientWrapper from '@/components/generic/Compare/Header/ClientWrapper';
import HeaderClient from '@/components/generic/Compare/Header/Client';

import NavBar from '@/components/generic/Compare/NavBar';
import Splash from '@/components/generic/Compare/Splash';

import TeamClientWrapper from '@/components/generic/Compare/Contents/Team/ClientWrapper';
import TeamServer from '@/components/generic/Compare/Contents/Team/Server';
import { ClientSkeleton as TeamClientSkeleton } from '@/components/generic/Compare/Contents/Team/Client';

import PlayerClientWrapper from '@/components/generic/Compare/Contents/Player/ClientWrapper';
import PlayerServer from '@/components/generic/Compare/Contents/Player/Server';
import { ClientSkeleton as PlayerClientSkeleton } from '@/components/generic/Compare/Contents/Player/Client';

import StatCompareClientWrapper from '@/components/generic/Compare/Contents/Trends/StatCompare/ClientWrapper';
import StatCompareServer from '@/components/generic/Compare/Contents/Trends/StatCompare/Server';
import { ClientSkeleton as StatCompareClientSkeleton } from '@/components/generic/Compare/Contents/Trends/StatCompare/Client';

import PreviousMatchupsClientWrapper from '@/components/generic/Compare/Contents/Trends/PreviousMatchups/ClientWrapper';
import PreviousMatchupsServer from '@/components/generic/Compare/Contents/Trends/PreviousMatchups/Server';
import { ClientSkeleton as PreviousMatchupsClientSkeleton } from '@/components/generic/Compare/Contents/Trends/PreviousMatchups/Client';

import PredictionLoader from '@/components/generic/Compare/Contents/Team/PredictionLoader';
import ContentsWrapper from '@/components/generic/Compare/ContentsWrapper';
import ReduxWrapper from '@/components/generic/Compare/ReduxWrapper';
import Surface from '../Surface';
import { General, Team } from '@srating-io/types';




export type getDecorateCompare = {
  home_team_id?: string;
  away_team_id?: string;
  division_id?: string;
  view: string;
  subview?: string;
  season?: number;
  neutral_site: boolean;
};

class Compare extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData() {
    const organization_id = this.getOrganizationID();
    const sportText = Organization.getSportText({ organization_id });

    return {
      title: 'sRating | Compare tool',
      description: `Compare any ${sportText} team statistics`,
      openGraph: {
        title: 'Compare tool',
        description: `Compare any ${sportText} team statistics`,
      },
      twitter: {
        card: 'summary',
        title: 'Compare tool',
        description: `Compare any ${sportText} team statistics`,
      },
    };
  }


  async getData({ season, home_team_id, away_team_id }: {season: number; home_team_id: string | undefined; away_team_id: string | undefined;}): Promise<{[team_id: string]: Team.loadTeamResults}> {
    const revalidateSeconds = 60 * 60 * 2; // 2 hours

    const organization_id = this.getOrganizationID();
    const division_id = this.getDivisionID();

    const teams = {};

    if (home_team_id) {
      const homeTeam: Team.loadTeamResults = await useServerAPI({
        class: 'team',
        function: 'loadTeam',
        arguments: {
          organization_id,
          division_id,
          team_id: home_team_id,
          season,
        },
        cache: revalidateSeconds,
      });

      teams[home_team_id] = homeTeam;
    }

    if (away_team_id) {
      const awayTeam: Team.loadTeamResults = await useServerAPI({
        class: 'team',
        function: 'loadTeam',
        arguments: {
          organization_id,
          division_id,
          team_id: away_team_id,
          season,
        },
        cache: revalidateSeconds,
      });

      teams[away_team_id] = awayTeam;
    }

    return teams;
  }



  async getDecorate(
    { home_team_id, away_team_id, division_id = this.getDivisionID(), season = this.getCurrentSeason(), view, subview, neutral_site = false }:
    getDecorateCompare,
  ) {
    const organization_id = this.getOrganizationID();

    const teams = await this.getData({ season, home_team_id, away_team_id });

    let currentView = view;
    if (!currentView) {
      currentView = 'team';
    }

    let currentSubView = subview;
    if (!currentSubView) {
      if (currentView === 'trends') {
        currentSubView = 'stat_compare';
      }
    }

    const getContent = () => {
      if (!home_team_id || !away_team_id) {
        return <Splash />;
      }

      if (currentView === 'team') {
        return (
          <TeamClientWrapper>
            <Suspense fallback = {<TeamClientSkeleton />}>
              <TeamServer organization_id={organization_id} division_id={division_id} home_team_id = {home_team_id} away_team_id = {away_team_id} season = {season} />
            </Suspense>
          </TeamClientWrapper>
        );
      }

      if (currentView === 'player') {
        return (
          <PlayerClientWrapper>
            <Suspense fallback = {<PlayerClientSkeleton />}>
              <PlayerServer organization_id={organization_id} division_id={division_id} home_team_id = {home_team_id} away_team_id = {away_team_id} season = {season} />
            </Suspense>
          </PlayerClientWrapper>
        );
      }

      if (currentView === 'trends' && currentSubView === 'stat_compare') {
        return (
          <StatCompareClientWrapper>
            <Suspense fallback = {<StatCompareClientSkeleton />}>
              <StatCompareServer organization_id={organization_id} division_id={division_id} home_team_id = {home_team_id} away_team_id = {away_team_id} season = {season} />
            </Suspense>
          </StatCompareClientWrapper>
        );
      }

      if (currentView === 'trends' && currentSubView === 'previous_matchups') {
        return (
          <PreviousMatchupsClientWrapper>
            <Suspense fallback = {<PreviousMatchupsClientSkeleton />}>
              <PreviousMatchupsServer organization_id={organization_id} division_id={division_id} home_team_id = {home_team_id} away_team_id = {away_team_id} season = {season} />
            </Suspense>
          </PreviousMatchupsClientWrapper>
        );
      }

      return <></>;
    };

    return (
      <ReduxWrapper
        organization_id={organization_id}
        division_id={division_id}
        home_team_id = {home_team_id}
        away_team_id = {away_team_id}
        season = {season}
        neutral_site = {neutral_site}
        teams = {teams}
        view = {view}
        subview = {subview}
      >
        <HeaderClientWrapper>
          <HeaderClient />
        </HeaderClientWrapper>
        <NavBar />
        <PredictionLoader />
        <ContentsWrapper>
          {getContent()}
        </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default Compare;
