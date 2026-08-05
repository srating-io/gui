'use server';

import { notFound } from 'next/navigation';
import ReduxWrapper from '@/components/generic/Fantasy/ReduxWrapper';
import Organization from '@/components/helpers/Organization';
import NavBar from '@/components/generic/Fantasy/NavBar';
import ContentsWrapper from '@/components/generic/Fantasy/ContentsWrapper';

import CreateClientWrapper from '@/components/generic/Fantasy/Contents/Create/ClientWrapper';
import { Client as CreateClient } from '@/components/generic/Fantasy/Contents/Create/Client';

import HomeClientWrapper from '@/components/generic/Fantasy/Contents/Home/ClientWrapper';
import { Client as HomeClient } from '@/components/generic/Fantasy/Contents/Home/Client';
import Surface from '../Surface';

export type getDecorateFantasy = {
  // player_id: string;
  view: string;
  // subview?: string | null;
  // season?: number;
  // division_id?: string;
  // trendsSeasons?: string[];
};

class Fantasy extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData() {
    const organization_id = this.getOrganizationID();

    let sportText = '';

    if (organization_id === Organization.getCBBID()) {
      sportText = 'college basketball';
    } else if (organization_id === Organization.getCFBID()) {
      sportText = 'college football';
    }

    return {
      title: `Fantasy ${sportText}`,
      description: `Fantasy leagues for ${sportText}`,
      openGraph: {
        title: `Fantasy ${sportText}`,
        description: `Fantasy leagues for ${sportText}`,
      },
      twitter: {
        card: 'summary',
        title: `Fantasy ${sportText}`,
        description: `Fantasy leagues for ${sportText}`,
      },
    };
  }


  async getDecorate(
    {
      view,
    }:
    getDecorateFantasy,
  ) {
    const organization_id = this.getOrganizationID();

    if (organization_id !== Organization.getCBBID()) {
      return notFound();
    }


    const getContents = () => {
      if (view === 'create') {
        return (
          <CreateClientWrapper>
            <CreateClient />
          </CreateClientWrapper>
        );
      }

      return (
        <HomeClientWrapper>
          <HomeClient />
        </HomeClientWrapper>
      );
    };


    return (
      <ReduxWrapper view = {view}>
        <NavBar />
        <ContentsWrapper>
          {getContents()}
        </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default Fantasy;
