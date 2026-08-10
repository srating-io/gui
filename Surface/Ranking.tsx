'use server';


import ContentsClientWrapper from '@/components/generic/Ranking/Contents/ClientWrapper';
// import ContentsServer from '@/components/generic/Ranking/Contents/Server';
import { Client, ClientSkeleton as ContentsClientSkeleton } from '@/components/generic/Ranking/Contents/Client';
// import { Suspense } from 'react';
import Base from '@/components/generic/Ranking/Base';
import Organization from '@/components/helpers/Organization';
import Loader from '@/components/generic/Ranking/Contents/Loader';
import Surface from '../Surface';

export type getDecorateRanking ={
  view: string;
  season?: number;
  division_id?: string;
};

class Ranking extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData({ view }) {
    const organization_id = this.getOrganizationID();

    let sportText = '';

    if (organization_id === Organization.getCBBID()) {
      sportText = 'College basketball';
    } else if (organization_id === Organization.getCFBID()) {
      sportText = 'College football';
    } else if (organization_id === Organization.getNBAID()) {
      sportText = 'NBA';
    }

    let title = `sRating | ${sportText} team ranking`;
    let description = 'View statistic ranking for all teams';

    if (view === 'player') {
      title = `sRating | ${sportText} player ranking`;
      description = 'View statistic ranking for every player';
    } else if (view === 'conference') {
      title = `sRating | ${sportText} conference ranking`;
      description = 'View statistic ranking for each conference';
    } else if (view === 'transfer') {
      title = `sRating | ${sportText} transfer portal ranking`;
      description = `${sportText} transfer portal tool, search, rank all players`;
    } else if (view === 'coach') {
      title = `sRating | ${sportText} coach ranking`;
      description = 'View statistic ranking for each coach';
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        card: 'summary',
        title: description,
      },
    };
  }


  async getDecorate(
    { season = this.getCurrentSeason(), view, division_id = this.getDivisionID() }:
    getDecorateRanking,
  ) {
    const organization_id = this.getOrganizationID();

    const generated = new Date().getTime();

    return (
      <>
        <Base organization_id = {organization_id} division_id = {division_id} season = {season} view = {view}>
          <Loader key ={organization_id + division_id + season + view} organization_id = {organization_id} division_id = {division_id} season = {season} view = {view} />
          <ContentsClientWrapper>
            <Client generated = {generated} organization_id = {organization_id} division_id = {division_id} season = {season} view = {view} />
            {/* <Suspense key={organization_id + division_id + season + view} fallback = {<ContentsClientSkeleton />}>
              <ContentsServer organization_id = {organization_id} division_id = {division_id} season = {season} view = {view} />
            </Suspense> */}
          </ContentsClientWrapper>
        </Base>
      </>
    );
  }
}

export default Ranking;
