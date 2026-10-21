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
import Slug from '@/components/helpers/Slug';
import { notFound } from 'next/navigation';
import ContentsWrapper from '@/components/generic/Team/ContentsWrapper';
import ReduxWrapper from '@/components/generic/Team/ReduxWrapper';
import StructuredData from '@/components/generic/StructuredData';
import HelperStructuredData from '@/components/helpers/StructuredData';
import Surface from '../Surface';
import Url from '@/components/helpers/Url';
import { General } from '@srating-io/types';


export type getDecorateTeam ={
  /**
   * The team's slug, or its id on a legacy url.
   */
  team: string;
  view: string;
  season?: number;
  division_id?: string;
};

class Team extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData(
    { team, season }:
    { team: string; season: number | string | null | undefined },
  ) {
    const organization_id = this.getOrganizationID();
    const currentSeason = this.getCurrentSeason();
    const displaySeason = season || currentSeason;
    const canonicalSeason = season && +season !== currentSeason ? season : undefined;

    let sportText = '';

    if (organization_id === Organization.getCBBID()) {
      sportText = 'basketball';
    } else if (organization_id === Organization.getCFBID()) {
      sportText = 'football';
    }

    const row = await this.requireEntity<General.Team>('team', team);

    const helperTeam = new HelperTeam({ team: row });
    const name = helperTeam.getName();

    // every entity page used to share one description, which is a duplicate-content signal across
    // a few thousand pages. this one names the team, the sport and the season
    const description = `${name} ${sportText} ${displaySeason} season: schedule, results, roster, team stats and rating trends.`;

    const path = this.getEntityPath('team', Slug.forRow('team', row) || team);

    return {
      title: `sRating | ${name}`,
      description,
      alternates: {
        // without this, ?view= and ?division_id= each index as a near duplicate of the same page
        canonical: path ? Url.canonical(path, canonicalSeason) : undefined,
      },
      openGraph: {
        title: `${name} ${sportText}`,
        description,
      },
      twitter: {
        card: 'summary',
        title: `${name} ${sportText}`,
        description,
      },
    };
  }

  /**
   * SportsTeam plus the trail back to the sport's ranking page.
   */
  getStructuredData({ team, season }: { team: General.Team; season: number | string }) {
    const sport = this.getSport() || '';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });
    const name = new HelperTeam({ team }).getName();
    const path = this.getEntityPath('team', Slug.forRow('team', team) || team.team_id);

    return HelperStructuredData.graph([
      HelperStructuredData.team({
        name,
        sport: sportText,
        path,
        colors: [team.primary_color, team.secondary_color],
      }),
      HelperStructuredData.breadcrumbs([
        { name: sportText, path: `/${sport}/ranking` },
        { name: `${name} ${season}`, path },
      ]),
    ]);
  }

  async getData({ team: resolvedTeam, team_id, season }: { team?: General.Team; team_id: string; season: number | string }) {
    const organization_id = this.getOrganizationID();

    const team: General.Team & {conference_id: string;} = resolvedTeam ?
      { ...resolvedTeam, conference_id: '' } :
      await useServerAPI({
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
    { team: segment, view, season = this.getCurrentSeason(), division_id = this.getDivisionID() }:
    getDecorateTeam,
  ) {
    const resolved = await this.requireEntity<General.Team>('team', segment);
    const team_id = resolved.team_id;

    const { team, team_season_conference } = await this.getData({ team: resolved, team_id, season });
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
          <>
            <TrendsClientWrapper>
              <Suspense fallback = {<TrendsClientSkeleton />}>
                <TrendsServer organization_id={organization_id} division_id={division_id} team_id = {team_id} season = {season} />
              </Suspense>
            </TrendsClientWrapper>
            {/* the accuracy chart reads the same client-side predictions the schedule tab does */}
            <SchedulePredictionLoader organization_id={organization_id} division_id={division_id} team_id = {team_id} season = {season} />
          </>
        );
      }

      return <></>;
    };

    return (
      <>
        <StructuredData data = {this.getStructuredData({ team, season })} />
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
      </>
    );
  }
}

export default Team;
