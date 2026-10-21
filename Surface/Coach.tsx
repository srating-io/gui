'use server';

import { useServerAPI } from '@/components/serverAPI';
import HeaderServer from '@/components/generic/Coach/Header/Server';
import HeaderClientWrapper from '@/components/generic/Coach/Header/ClientWrapper';
import { ClientSkeleton as HeaderClientSkeleon } from '@/components/generic/Coach/Header/Client';

import SeasonsClient from '@/components/generic/Coach/Contents/Seasons/Client';
import SeasonsClientWrapper from '@/components/generic/Coach/Contents/Seasons/ClientWrapper';

import TrendsServer from '@/components/generic/Coach/Contents/Trends/Server';
import TrendsClientWrapper from '@/components/generic/Coach/Contents/Trends/ClientWrapper';
import { ClientSkeleton as TrendsClientSkeleon } from '@/components/generic/Coach/Contents/Trends/Client';

// import SubNavBar from '@/components/generic/Coach/SubNavBar';
import ReduxWrapper from '@/components/generic/Coach/ReduxWrapper';
import NavBar from '@/components/generic/Coach/NavBar';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ContentsWrapper from '@/components/generic/Coach/ContentsWrapper';
import StructuredData from '@/components/generic/StructuredData';
import HelperStructuredData from '@/components/helpers/StructuredData';
import Surface from '../Surface';
import Organization from '@/components/helpers/Organization';
import Slug from '@/components/helpers/Slug';
import Url from '@/components/helpers/Url';
import { Basketball, Football, General } from '@srating-io/types';

type Data = {
  coach: General.Coach;
  coach_team_seasons: General.CoachTeamSeasons;
  teams: General.Teams;
  statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings;
  division_id: string | null;
}

export type getDecorateCoach = {
  /**
   * The coach's slug, or their id on a legacy url.
   */
  coach: string;
  view: string;
  season?: number;
};

class Coach extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData({ coach, season }: { coach: string; season?: number | string | null }) {
    const row = await this.requireEntity<General.Coach>('coach', coach);
    const currentSeason = this.getCurrentSeason();
    const canonicalSeason = season && +season !== currentSeason ? season : undefined;

    const name = row ? `${row.first_name} ${row.last_name}` : 'Unknown';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });

    const description = `${name} ${sportText} coaching record by season, team history and rating trends.`;

    const path = this.getEntityPath('coach', Slug.forRow('coach', row) || coach);

    return {
      title: `sRating | ${name}`,
      description,
      alternates: {
        canonical: path ? Url.canonical(path, canonicalSeason) : undefined,
      },
      openGraph: {
        title: name,
        description,
      },
      twitter: {
        card: 'summary',
        title: name,
        description,
      },
    };
  }

  /**
   * Person, with the role spelled out -- a coach and a player are both schema.org Persons, and
   * jobTitle is the only thing telling them apart.
   */
  getStructuredData({ coach }: { coach: General.Coach }) {
    const sport = this.getSport() || '';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });
    const name = `${coach.first_name} ${coach.last_name}`;
    const path = this.getEntityPath('coach', Slug.forRow('coach', coach) || coach.coach_id);

    return HelperStructuredData.graph([
      HelperStructuredData.person({ name, path, jobTitle: 'Head Coach' }),
      HelperStructuredData.breadcrumbs([
        { name: sportText, path: `/${sport}/ranking` },
        { name, path },
      ]),
    ]);
  }

  async getCoach({ coach_id }) {
    const coach: General.Coach = await useServerAPI({
      class: 'coach',
      function: 'get',
      arguments: {
        coach_id,
      },
    });

    return coach;
  }


  async getData({ organization_id, coach: resolvedCoach, coach_id, season }: { organization_id: string; coach?: General.Coach; coach_id: string; season: number | string }): Promise<Data> {
    const revalidateSeconds = 43200; // 60 * 60 * 12; // cache for 12 hours

    const coach = resolvedCoach || await this.getCoach({ coach_id });

    const coach_team_seasons: General.CoachTeamSeasons = await useServerAPI({
      class: 'coach_team_season',
      function: 'read',
      arguments: {
        coach_id: coach.coach_id,
      },
      cache: revalidateSeconds,
    });

    const team_season_conference: General.TeamSeasonConference = await useServerAPI({
      class: 'team_season_conference',
      function: 'get',
      arguments: {
        organization_id,
        team_id: Object.values(coach_team_seasons).map((row) => row.team_id),
        season,
      },
      cache: revalidateSeconds,
    });

    const division_id = team_season_conference.division_id || null;

    const teams: General.Teams = await useServerAPI({
      class: 'team',
      function: 'read',
      arguments: {
        team_id: Object.values(coach_team_seasons).map((row) => row.team_id),
      },
      cache: revalidateSeconds,
    });

    const statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings = await useServerAPI({
      class: 'statistic_ranking',
      function: 'readStats',
      arguments: {
        organization_id,
        division_id,
        team_id: Object.values(teams).map((row) => row.team_id),
        season: Object.values(coach_team_seasons).map((row) => row.season),
        current: '1',
      },
      cache: revalidateSeconds,
    });

    return { coach, coach_team_seasons, teams, statistic_rankings, division_id };
  }


  async getDecorate(
    { coach: segment, season = this.getCurrentSeason(), view }:
    getDecorateCoach,
  ) {
    const organization_id = this.getOrganizationID();

    const resolved = await this.requireEntity<General.Coach>('coach', segment);
    const coach_id = resolved.coach_id;

    const data = await this.getData({ organization_id, coach: resolved, coach_id, season });
    const { coach, division_id } = data;

    if (!coach || !coach.coach_id) {
      return notFound();
    }


    const getContent = () => {
      if (view === 'trends') {
        return (
          <TrendsClientWrapper>
            <Suspense fallback = {<TrendsClientSkeleon />}>
              <TrendsServer organization_id={organization_id} division_id={division_id} coach_id = {coach_id} />
            </Suspense>
          </TrendsClientWrapper>
        );
      }
      if (view === 'seasons') {
        return (
          <SeasonsClientWrapper>
            <SeasonsClient organization_id={organization_id} division_id={division_id} coach_team_seasons = {data.coach_team_seasons} teams = {data.teams} statistic_rankings = {data.statistic_rankings} />
          </SeasonsClientWrapper>
        );
      }
      return <></>;
    };

    return (
      <>
        <StructuredData data = {this.getStructuredData({ coach: data.coach })} />
        <ReduxWrapper coach = {data.coach} coach_team_seasons = {data.coach_team_seasons} teams = {data.teams} statistic_rankings = {data.statistic_rankings} view = {view}>
          <HeaderClientWrapper>
            <Suspense fallback = {<HeaderClientSkeleon />}>
              <HeaderServer organization_id={organization_id} division_id={division_id} coach_id = {coach_id} season = {season} />
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

export default Coach;
