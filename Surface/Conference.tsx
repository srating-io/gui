'use server';

import { useServerAPI } from '@/components/serverAPI';

import HeaderServer from '@/components/generic/Conference/Header/Server';
import HeaderClientWrapper from '@/components/generic/Conference/Header/ClientWrapper';

import StandingsClientWrapper from '@/components/generic/Conference/Contents/Standings/ClientWrapper';
import StandingsClient from '@/components/generic/Conference/Contents/Standings/Client';

import TrendsClientWrapper from '@/components/generic/Conference/Contents/Trends/ClientWrapper';
import TrendsServer from '@/components/generic/Conference/Contents/Trends/Server';
import { ClientSkeleton as TrendsClientSkeleton } from '@/components/generic/Conference/Contents/Trends/Client';

// import SubNavBar from '@/components/generic/Conference/SubNavBar';
import ReduxWrapper from '@/components/generic/Conference/ReduxWrapper';
import NavBar from '@/components/generic/Conference/NavBar';
import PredictionLoader from '@/components/generic/Conference/Contents/Standings/PredictionLoader';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ContentsWrapper from '@/components/generic/Conference/ContentsWrapper';
import StructuredData from '@/components/generic/StructuredData';
import HelperStructuredData from '@/components/helpers/StructuredData';
import Surface from '../Surface';
import Organization from '@/components/helpers/Organization';
import Slug from '@/components/helpers/Slug';
import Url from '@/components/helpers/Url';
import { Basketball, Football, General } from '@srating-io/types';


type Data = {
  conference: General.Conference;
  team_season_conferences: General.TeamSeasonConferences;
  teams: General.Teams;
  statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings;
  elos: General.Elos;
  division_id: string | null;
}

export type getDecorateConference = {
  /**
   * The conference's slug, or its id on a legacy url.
   */
  conference: string;
  view: string;
  season?: number;
  subview?: string;
};


class Conference extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData({ conference, season }: { conference: string; season?: number | string | null }) {
    const row = await this.requireEntity<General.Conference>('conference', conference);
    const currentSeason = this.getCurrentSeason();
    const displaySeason = season || currentSeason;
    const canonicalSeason = season && +season !== currentSeason ? season : undefined;

    const name = row ? row.name : 'Unknown';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });

    const description = `${name} ${sportText} ${displaySeason} standings, team ratings and conference trends.`;

    const path = this.getEntityPath('conference', Slug.forRow('conference', row) || conference);

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
   * SportsOrganization -- a conference is an organization of teams, not a team.
   */
  getStructuredData({ conference }: { conference: General.Conference }) {
    const sport = this.getSport() || '';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });
    const path = this.getEntityPath('conference', Slug.forRow('conference', conference) || conference.conference_id);

    return HelperStructuredData.graph([
      HelperStructuredData.conference({ name: conference.name, sport: sportText, path }),
      HelperStructuredData.breadcrumbs([
        { name: sportText, path: `/${sport}/ranking` },
        { name: conference.name, path },
      ]),
    ]);
  }

  async getConference({ conference_id }): Promise<General.Conference> {
    const conference: General.Conference = await useServerAPI({
      class: 'conference',
      function: 'get',
      arguments: {
        conference_id,
      },
    });

    return conference;
  }


  async getData(
    { organization_id, season, conference: resolvedConference, conference_id }:
    { organization_id: string; season: number | string; conference?: General.Conference; conference_id: string },
  ): Promise<Data> {
    const revalidateSeconds = 43200; // 60 * 60 * 12; // cache for 12 hours

    const conference = resolvedConference || await this.getConference({ conference_id });

    const team_season_conferences: General.TeamSeasonConferences = await useServerAPI({
      class: 'team_season_conference',
      function: 'read',
      arguments: {
        conference_id: conference.conference_id,
        season,
        organization_id,
      },
      cache: revalidateSeconds,
    });

    let division_id: string | null = null;
    // these should all be the same
    for (const team_season_conference_id in team_season_conferences) {
      const row = team_season_conferences[team_season_conference_id];
      division_id = row.division_id;
    }

    const teams: General.Teams = await useServerAPI({
      class: 'team',
      function: 'read',
      arguments: {
        team_id: Object.values(team_season_conferences).map((row) => row.team_id),
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
        season,
        current: '1',
      },
      cache: revalidateSeconds,
    });


    const elos: General.Elos = await useServerAPI({
      class: 'elo',
      function: 'read',
      arguments: {
        organization_id,
        division_id,
        team_id: Object.values(teams).map((row) => row.team_id),
        season,
        current: '1',
      },
      cache: revalidateSeconds,
    });

    return { conference, team_season_conferences, teams, statistic_rankings, elos, division_id };
  }


  async getDecorate(
    { conference: segment, season = this.getCurrentSeason(), view, subview }:
    getDecorateConference,
  ) {
    const organization_id = this.getOrganizationID();

    const resolved = await this.requireEntity<General.Conference>('conference', segment);
    const conference_id = resolved.conference_id;

    const data = await this.getData({ organization_id, conference: resolved, conference_id, season });
    const { conference, division_id } = data;

    if (!conference || !conference.conference_id) {
      return notFound();
    }

    const getContent = () => {
      if (view === 'standings') {
        return (
          <StandingsClientWrapper>
            <StandingsClient organization_id={organization_id} division_id={division_id} conference_id = {conference_id} season = {season} subView = {subview} />
          </StandingsClientWrapper>
        );
      }
      if (view === 'trends') {
        return (
          <TrendsClientWrapper>
            <Suspense fallback = {<TrendsClientSkeleton />}>
              <TrendsServer organization_id={organization_id} conference_id={conference_id} season = {season} />
            </Suspense>
          </TrendsClientWrapper>
        );
      }
      return <></>;
    };


    return (
      <>
        <StructuredData data = {this.getStructuredData({ conference: data.conference })} />
        <ReduxWrapper team_season_conferences = {data.team_season_conferences} teams = {data.teams} statistic_rankings = {data.statistic_rankings} elos = {data.elos} view = {view} subview = {subview}>
          <PredictionLoader organization_id={organization_id} conference_id={conference_id} season={season} />
          <HeaderClientWrapper>
            <HeaderServer organization_id={organization_id} division_id={division_id} conference_id = {conference_id} season = {season} />
          </HeaderClientWrapper>
          <NavBar />
          {/* <SubNavBar view = {view} /> */}
          <ContentsWrapper>
            {getContent()}
          </ContentsWrapper>
        </ReduxWrapper>
      </>
    );
  }
}

export default Conference;
