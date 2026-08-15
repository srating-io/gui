'use server';

import { useServerAPI } from '@/components/serverAPI';

import ContentsClientWrapper from '@/components/generic/Games/Contents/ClientWrapper';
import ContentsServer from '@/components/generic/Games/Contents/Server';
import { ClientSkeleton as ContentsClientSkeleton } from '@/components/generic/Games/Contents/Client';
import DateBar from '@/components/generic/DateBar';
import SubNavBar from '@/components/generic/Games/SubNavBar';
import { Suspense } from 'react';
import FloatingButtons from '@/components/generic/Games/FloatingButtons';
import Refresher from '@/components/generic/Games/Refresher';
import Organization from '@/components/helpers/Organization';
import { Dates } from '@esmalley/ts-utils';
import Surface from '../Surface';
import { Game } from '@srating-io/types';


export type getDecorateGames = {
  date?: string;
  season?: number;
  division_id?: string;
};

class Games extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData() {
    const organization_id = this.getOrganizationID();
    const sportText = Organization.getSportText({ organization_id });

    return {
      title: `sRating | ${sportText} live scores`,
      description: `Live ${sportText} scores and odds`,
      openGraph: {
        title: `sRating.io ${sportText} live scores`,
        description: `Live ${sportText} scores and odds`,
      },
      twitter: {
        card: 'summary',
        title: `Live ${sportText} scores and odds`,
      },
    };
  }

  async getDates({ season, organization_id, division_id }) {
    const revalidateSeconds = 43200; // 60 * 60 * 12; // cache for 12 hours

    const dates: string[] = await useServerAPI({
      class: 'game',
      function: 'getSeasonDates',
      arguments: {
        organization_id,
        division_id,
        season,
      },
      cache: revalidateSeconds,
    });

    return dates;
  }

  async getGames({ date, organization_id, division_id }) {
    const revalidateSeconds = 1200; // 60 * 20; // cache games for 20 mins

    const games: Game.getGamesResults = await useServerAPI({
      class: 'game',
      function: 'getGames',
      arguments: {
        organization_id,
        division_id,
        start_date: date,
      },
      cache: revalidateSeconds,
    });

    return games;
  }


  // todo this loading is all pretty quick... but when I start to add more data here, update this to split the loading and use suspense like the rest of the app

  async getDecorate(
    { season = this.getCurrentSeason(), division_id = this.getDivisionID(), date }:
    getDecorateGames,
  ) {
    const organization_id = this.getOrganizationID();
    const dates = await this.getDates({ season, organization_id, division_id });
    const selectedDate = date || Dates.getClosestDate(Dates.getTodayEST(), dates);
    const games = await this.getGames({ date: selectedDate, organization_id, division_id });

    return (
      <>
        <DateBar dates = {dates} date = {selectedDate} />
        <SubNavBar />
        <ContentsClientWrapper>
          <Suspense key={selectedDate} fallback = {<ContentsClientSkeleton games = {games} />}>
            <ContentsServer games = {games} date = {selectedDate} organization_id = {organization_id} division_id = {division_id} season={season} />
          </Suspense>
        </ContentsClientWrapper>
        <FloatingButtons />
        <Refresher date = {selectedDate} games = {games} />
      </>
    );
  }
}

export default Games;
