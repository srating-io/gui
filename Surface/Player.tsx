/* eslint-disable no-param-reassign */

'use server';

import StructuredData from '@/components/generic/StructuredData';
import HelperStructuredData from '@/components/helpers/StructuredData';
import Surface from '../Surface';
import { useServerAPI } from '@/components/serverAPI';

import PlayerHelper from '@/components/helpers/Player';
import HelperTeam from '@/components/helpers/Team';
import Organization from '@/components/helpers/Organization';
import { notFound } from 'next/navigation';
import ReduxWrapper from '@/components/generic/Player/ReduxWrapper';

import HeaderClientWrapper from '@/components/generic/Player/Header/ClientWrapper';
import HeaderServer from '@/components/generic/Player/Header/Server';

import { ClientSkeleton as GamelogClientSkeleton } from '@/components/generic/Player/Contents/Gamelog/Client';
import GamelogClientWrapper from '@/components/generic/Player/Contents/Gamelog/ClientWrapper';
import GamelogServer from '@/components/generic/Player/Contents/Gamelog/Server';

import { ClientSkeleton as StatsClientSkeleton } from '@/components/generic/Player/Contents/Stats/Client';
import StatsClientWrapper from '@/components/generic/Player/Contents/Stats/ClientWrapper';
import StatsServer from '@/components/generic/Player/Contents/Stats/Server';

import { ClientSkeleton as TrendsClientSkeleton } from '@/components/generic/Player/Contents/Trends/Client';
import TrendsClientWrapper from '@/components/generic/Player/Contents/Trends/ClientWrapper';
import TrendsServer from '@/components/generic/Player/Contents/Trends/Server';

import { Suspense } from 'react';
import { ClientSkeleton as HeaderClientSkeleton } from '@/components/generic/Player/Header/Client';
import NavBar from '@/components/generic/Player/NavBar';
import ContentsWrapper from '@/components/generic/Player/ContentsWrapper';
import Slug from '@/components/helpers/Slug';
import Url from '@/components/helpers/Url';
import { General } from '@srating-io/types';

export type getDecoratePlayer = {
  /**
   * The player's slug, or their id on a legacy url.
   */
  player: string;
  player_team_season_id?: string;
  view: string;
  subview?: string | null;
  season?: number;
  division_id?: string;
  trendsSeasons?: string[];
};

class Player extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData(
    { player, season }:
    { player: string; season: number | string | null | undefined },
  ) {
    const row = await this.requireEntity<General.Player>('player', player);

    const name = new PlayerHelper({ player: row }).getName();
    const position = row && row.position ? `${row.position} ` : '';
    const seasonText = season ? `${season} ` : '';

    const description = `${name} ${position}${seasonText}game log, season and career stats, and rating trends.`;

    const path = this.getEntityPath('player', Slug.forRow('player', row) || player);

    return {
      title: `sRating | ${name}`,
      description,
      alternates: {
        // ?view=, ?subview= and ?season= are tabs over the same player, not separate pages
        canonical: path ? Url.canonical(path) : undefined,
      },
      openGraph: {
        title: `${name} stats`,
        description,
      },
      twitter: {
        card: 'summary',
        title: `${name} stats`,
        description,
      },
    };
  }

  /**
   * Person plus the trail back through the team the player is on.
   */
  getStructuredData(
    { player, team }:
    { player: General.Player; team: General.Team | null },
  ) {
    const sport = this.getSport() || '';
    const sportText = Organization.getSportText({ organization_id: this.getOrganizationID() });
    const name = new PlayerHelper({ player }).getName();
    const path = this.getEntityPath('player', Slug.forRow('player', player) || player.player_id);
    const teamName = team ? new HelperTeam({ team }).getName() : null;
    const teamPath = team ? this.getEntityPath('team', Slug.forRow('team', team) || team.team_id) : null;

    return HelperStructuredData.graph([
      HelperStructuredData.person({
        name,
        path,
        jobTitle: player.position || null,
        team: teamName,
        teamPath,
      }),
      HelperStructuredData.breadcrumbs([
        { name: sportText, path: `/${sport}/ranking` },
        ...(teamName && teamPath ? [{ name: teamName, path: teamPath }] : []),
        { name, path },
      ]),
    ]);
  }

  async getData({ player: resolvedPlayer, player_id }: { player?: General.Player; player_id: string }) {
    const revalidateSeconds = 12 * 60 * 60; // 12 hours
    const organization_id = this.getOrganizationID();

    const player: General.Player = resolvedPlayer || await useServerAPI({
      class: 'player',
      function: 'get',
      arguments: {
        player_id,
      },
      cache: revalidateSeconds,
    });

    const player_team_seasons: General.PlayerTeamSeasons = await useServerAPI({
      class: 'player_team_season',
      function: 'read',
      arguments: {
        organization_id,
        player_id,
      },
      cache: revalidateSeconds,
    });

    const teams: General.Teams = await useServerAPI({
      class: 'team',
      function: 'read',
      arguments: {
        team_id: Object.values(player_team_seasons).map((r) => r.team_id),
      },
      cache: revalidateSeconds,
    });

    return { player, player_team_seasons, teams };
  }


  async getDecorate(
    { player: segment, player_team_season_id, view, season, division_id = this.getDivisionID(), trendsSeasons }:
    getDecoratePlayer,
  ) {
    const organization_id = this.getOrganizationID();

    const resolved = await this.requireEntity<General.Player>('player', segment);
    const player_id = resolved.player_id;

    const data = await this.getData({ player: resolved, player_id });
    const { player, player_team_seasons, teams } = data;

    let team: General.Team | null = null;
    let player_team_season: General.PlayerTeamSeason | null = null;

    let lastSeason: null | number = null;
    let viewSeason = season;


    for (const id in player_team_seasons) {
      const row = player_team_seasons[id];

      if (!lastSeason || lastSeason < row.season) {
        lastSeason = row.season;
      }
    }

    if (lastSeason && (!viewSeason || (viewSeason && +viewSeason > lastSeason))) {
      viewSeason = lastSeason;
    }

    for (const id in player_team_seasons) {
      const row = player_team_seasons[id];

      if (
        (player_team_season_id && id === player_team_season_id) ||
        (
          !player_team_season_id &&
          viewSeason && +row.season === +viewSeason
        )
      ) {
        player_team_season = row;

        if (row.team_id in teams) {
          team = teams[row.team_id];
        }
      }
    }

    if (!player_team_season_id && player_team_season) {
      player_team_season_id = player_team_season.player_team_season_id;
    }

    if (!player || !player.player_id || !team || !viewSeason || !player_team_season_id) {
      return notFound();
    }

    const getContent = () => {
      if (view === 'stats') {
        return (
          <StatsClientWrapper>
            <Suspense fallback = {<StatsClientSkeleton />}>
              <StatsServer organization_id={organization_id} division_id={division_id} season = {viewSeason} player_id = {player_id} player_team_season_id = {player_team_season_id} />
            </Suspense>
          </StatsClientWrapper>
        );
      }

      if (view === 'gamelog') {
        return (
          <GamelogClientWrapper>
            <Suspense fallback = {<GamelogClientSkeleton />}>
              <GamelogServer organization_id={organization_id} division_id={division_id} seasons = {Object.values(player_team_seasons).map((r) => r.season)} player_id = {player_id} />
            </Suspense>
          </GamelogClientWrapper>
        );
      }

      if (view === 'trends') {
        return (
          <TrendsClientWrapper>
            <Suspense fallback = {<TrendsClientSkeleton />}>
              <TrendsServer organization_id={organization_id} division_id={division_id} season = {viewSeason} player_id = {player_id} trendsSeasons = {trendsSeasons} />
            </Suspense>
          </TrendsClientWrapper>
        );
      }

      return <></>;
    };


    return (
      <>
        <StructuredData data = {this.getStructuredData({ player, team })} />
        <ReduxWrapper player = {player} player_team_season = {player_team_season} player_team_seasons = {player_team_seasons} team = {team} teams = {teams} season = {+viewSeason} view = {view} >
          <HeaderClientWrapper>
            <Suspense fallback = {<HeaderClientSkeleton />}>
              <HeaderServer organization_id={organization_id} division_id={division_id} player_id = {player_id} team_id={team.team_id} player_team_season_id = {player_team_season_id} season = {viewSeason} />
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

export default Player;
