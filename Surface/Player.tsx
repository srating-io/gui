/* eslint-disable no-param-reassign */

'use server';

import Surface from '../Surface';
import { useServerAPI } from '@/components/serverAPI';

import PlayerHelper from '@/components/helpers/Player';
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
import { General } from '@srating-io/types';

export type getDecoratePlayer = {
  player_id: string;
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
    { player_id, season = this.getCurrentSeason() }:
    { player_id: string; season: number | string | null | undefined },
  ) {
    const { player } = await this.getData({ player_id });

    const name = new PlayerHelper({ player }).getName();

    return {
      title: `sRating | ${name}`,
      description: 'View player game log, stats, trends',
      openGraph: {
        title: `${name} stats`,
        description: `${name} game log, stats, trends`,
      },
      twitter: {
        card: 'summary',
        title: `${name} stats`,
        description: `${name} game log, stats, trends`,
      },
    };
  }

  async getData({ player_id }) {
    const revalidateSeconds = 12 * 60 * 60; // 12 hours
    const organization_id = this.getOrganizationID();

    const player: General.Player = await useServerAPI({
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
    { player_id, player_team_season_id, view, season, division_id = this.getDivisionID(), trendsSeasons }:
    getDecoratePlayer,
  ) {
    const organization_id = this.getOrganizationID();

    const data = await this.getData({ player_id });
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
    );
  }
}

export default Player;
