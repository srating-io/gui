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
import Division from '@/components/helpers/Division';
import Week from '@/components/helpers/Week';
import { Dates } from '@esmalley/ts-utils';
import Surface from '../Surface';
import { Game } from '@srating-io/types';


export type getDecorateGames = {
  date?: string;
  season?: number;
  division_id?: string;
  /** 'week' opts the date bar into cfb week buckets, anything else is day mode */
  mode?: string;
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
      description: `Live ${sportText} scores and stats`,
      openGraph: {
        title: `sRating.io ${sportText} live scores`,
        description: `Live ${sportText} scores and stats`,
      },
      twitter: {
        card: 'summary',
        title: `Live ${sportText} scores and stats`,
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

  async getGames({ dates, organization_id, division_id }) {
    const revalidateSeconds = 1200; // 60 * 20; // cache games for 20 mins

    const games: Game.getGamesResults = await useServerAPI({
      class: 'game',
      function: 'getGames',
      arguments: {
        organization_id,
        division_id,
        start_date: dates,
      },
      cache: revalidateSeconds,
    });

    return games;
  }


  // todo this loading is all pretty quick... but when I start to add more data here, update this to split the loading and use suspense like the rest of the app

  async getDecorate(
    { season = this.getCurrentSeason(), division_id = this.getDivisionID(), date, mode }:
    getDecorateGames,
  ) {
    const organization_id = this.getOrganizationID();
    const dates = await this.getDates({ season, organization_id, division_id });

    // week mode is a cfb, fbs idea: the bucket labels and the championship week heuristic are both
    // fbs specific, so a url asking for it anywhere else just gets days
    const weekModeAvailable = (
      organization_id === Organization.getCFBID() &&
      division_id === Division.getFBS()
    );
    const weekMode = (weekModeAvailable && mode === 'week');

    const anchorDate = date || Dates.getClosestDate(Dates.getTodayEST(), dates);
    const weeks = weekModeAvailable ? Week.getWeeks(dates) : [];
    const selectedWeek = weekMode ? Week.getClosestWeek(weeks, anchorDate) : null;

    // the week's first date is the anchor, so one week has exactly one url
    const selectedDate = selectedWeek ? selectedWeek.dates[0] : anchorDate;
    const selectedDates = selectedWeek ? selectedWeek.dates : [selectedDate];
    const selectedKey = selectedDates.join(',');

    const games = await this.getGames({ dates: selectedDates, organization_id, division_id });

    return (
      <>
        <DateBar
          dates = {dates}
          date = {selectedDate}
          mode = {weekMode ? 'week' : 'day'}
          weeks = {weeks}
          showModeToggle = {weekModeAvailable}
        />
        <SubNavBar />
        <ContentsClientWrapper>
          <Suspense key={selectedKey} fallback = {<ContentsClientSkeleton games = {games} />}>
            <ContentsServer games = {games} dates = {selectedDates} organization_id = {organization_id} division_id = {division_id} season={season} />
          </Suspense>
        </ContentsClientWrapper>
        <FloatingButtons />
        <Refresher dates = {selectedDates} games = {games} />
      </>
    );
  }
}

export default Games;
