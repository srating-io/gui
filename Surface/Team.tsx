'use server';


import HelperTeam from '@/components/helpers/Team';
import { useServerAPI } from '@/components/serverAPI';
import HeaderClientWrapper from '@/components/generic/Team/Header/ClientWrapper';
import HeaderServer from '@/components/generic/Team/Header/Server';
import NavBar from '@/components/generic/Team/NavBar';

import ScheduleClientWrapper from '@/components/generic/Team/Contents/Schedule/ClientWrapper';
import ScheduleServer from '@/components/generic/Team/Contents/Schedule/Server';
import SchedulePredictionLoader from '@/components/generic/Team/Contents/Schedule/PredictionLoader';

import StatsClientWrapper from '@/components/generic/Team/Contents/Stats/ClientWrapper';
import StatsServer from '@/components/generic/Team/Contents/Stats/Server';

import TrendsClientWrapper from '@/components/generic/Team/Contents/Trends/ClientWrapper';
import TrendsServer from '@/components/generic/Team/Contents/Trends/Server';
import { Suspense } from 'react';
import { ClientSkeleton as HeaderClientSkeleton } from '@/components/generic/Team/Header/Client';
import { ClientSkeleton as ScheduleClientSkeleton } from '@/components/generic/Team/Contents/Schedule/Client';
import { ClientSkeleton as StatsClientSkeleton } from '@/components/generic/Team/Contents/Stats/Client';
import { ClientSkeleton as TrendsClientSkeleton } from '@/components/generic/Team/Contents/Trends/Client';
import Organization from '@/components/helpers/Organization';
import { notFound } from 'next/navigation';
import ContentsWrapper from '@/components/generic/Team/ContentsWrapper';
import ReduxWrapper from '@/components/generic/Team/ReduxWrapper';
import Surface from '../Surface';
import { General } from '@srating-io/types';


export type getDecorateTeam ={
  team_id: string;
  view: string;
  season?: number;
  division_id?: string;
};

class Team extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData(
    { team_id, season = this.getCurrentSeason() }:
    { team_id: string; season: number | string | null | undefined },
  ) {
    const organization_id = this.getOrganizationID();

    let sportText = '';

    if (organization_id === Organization.getCBBID()) {
      sportText = 'basketball';
    } else if (organization_id === Organization.getCFBID()) {
      sportText = 'football';
    }

    const { team } = await this.getData({ team_id, season });

    const helperTeam = new HelperTeam({ team });

    return {
      title: `sRating | ${helperTeam.getName()}`,
      description: 'View predicted result, matchup, trends, odds',
      openGraph: {
        title: `${helperTeam.getName()} ${sportText}`,
        description: `${helperTeam.getName()} schedule, trends, statistics, roster`,
      },
      twitter: {
        card: 'summary',
        title: `${helperTeam.getName()} ${sportText}`,
        description: `${helperTeam.getName()} schedule, trends, statistics, roster`,
      },
    };
  }

  async getData({ team_id, season }) {
    const organization_id = this.getOrganizationID();

    const team: General.Team & {conference_id: string;} = await useServerAPI({
      class: 'team',
      function: 'get',
      arguments: {
        team_id,
      },
    });

    const team_season_conference: General.TeamSeasonConference = await useServerAPI({
      class: 'team_season_conference',
      function: 'get',
      arguments: {
        organization_id,
        team_id,
        season,
      },
    });

    if (team && team_season_conference) {
      team.conference_id = team_season_conference.conference_id;
    }

    return { team, team_season_conference };
  }


  async getDecorate(
    { team_id, view, season = this.getCurrentSeason(), division_id = this.getDivisionID() }:
    getDecorateTeam,
  ) {
    const { team, team_season_conference } = await this.getData({ team_id, season });
    if (!team || !team.team_id) {
      return notFound();
    }
    const organization_id = this.getOrganizationID();

    const getContent = () => {
      if (view === 'schedule') {
        return (
          <>
            <ScheduleClientWrapper>
              <Suspense key = {`${organization_id}-${season}`} fallback = {<ScheduleClientSkeleton />}>
                <ScheduleServer team_id = {team_id} season = {season} organization_id = {organization_id} division_id = {division_id} />
              </Suspense>
            </ScheduleClientWrapper>
            <SchedulePredictionLoader organization_id={organization_id} division_id={division_id} team_id = {team_id} season = {season} />
          </>
        );
      }

      if (view === 'stats') {
        return (
          <StatsClientWrapper>
            <Suspense fallback = {<StatsClientSkeleton />}>
              <StatsServer organization_id={organization_id} division_id={division_id} team_id = {team_id} season = {season} />
            </Suspense>
          </StatsClientWrapper>
        );
      }

      if (view === 'trends') {
        return (
          <TrendsClientWrapper>
            <Suspense fallback = {<TrendsClientSkeleton />}>
              <TrendsServer organization_id={organization_id} division_id={division_id} team_id = {team_id} season = {season} />
            </Suspense>
          </TrendsClientWrapper>
        );
      }

      return <></>;
    };

    return (
      <ReduxWrapper team = {team} team_season_conference = {team_season_conference} view = {view}>
        <HeaderClientWrapper>
          <Suspense key = {`${organization_id}-${season}`} fallback = {<HeaderClientSkeleton />}>
            <HeaderServer organization_id={organization_id} division_id={division_id} season = {season} team_id = {team_id} />
          </Suspense>
        </HeaderClientWrapper>
        <NavBar />
        <ContentsWrapper>
          {getContent()}
        </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default Team;
