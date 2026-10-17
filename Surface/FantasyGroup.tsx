'use server';

import { notFound } from 'next/navigation';
import ReduxWrapper from '@/components/generic/FantasyGroup/ReduxWrapper';
import Organization from '@/components/helpers/Organization';
import ContentsWrapper from '@/components/generic/FantasyGroup/ContentsWrapper';
import NavBar from '@/components/generic/FantasyGroup/NavBar';
import { useServerAPI } from '@/components/serverAPI';

import HomeClientWrapper from '@/components/generic/FantasyGroup/Contents/Home/ClientWrapper';
import { Client as HomeClient } from '@/components/generic/FantasyGroup/Contents/Home/Client';

import DraftClientWrapper from '@/components/generic/FantasyGroup/Contents/Draft/ClientWrapper';
import { Client as DraftClient } from '@/components/generic/FantasyGroup/Contents/Draft/Client';
import Surface from '../Surface';
import { Fantasy } from '@srating-io/types';

export type getDecorateFantasyGroup = {
  fantasy_group_id: string;
  view?: string;
  // subview?: string | null;
  // season?: number;
  // division_id?: string;
  // trendsSeasons?: string[];
};

class FantasyGroup extends Surface {
  // constructor() {
  //   super();
  // }

  async getData({ fantasy_group_id }) {
    const revalidateSeconds = 5 * 60;

    const fantasy_group: Fantasy.FantasyGroup = await useServerAPI({
      class: 'fantasy_group',
      function: 'get',
      arguments: {
        fantasy_group_id,
      },
      cache: revalidateSeconds,
    });

    // This runs with the unrestricted server secret and no session, so everything it returns is
    // readable by anyone holding the id - in the rendered html, in the flight payload and in the
    // page title. Membership is only checked in the client load, so a private group gets stripped
    // back to what the page needs to boot and the client fills the rest in for a member.
    if (fantasy_group && +fantasy_group.private === 1) {
      return {
        fantasy_group: {
          fantasy_group_id: fantasy_group.fantasy_group_id,
          organization_id: fantasy_group.organization_id,
          division_id: fantasy_group.division_id,
          season: fantasy_group.season,
          private: fantasy_group.private,
        } as Fantasy.FantasyGroup,
      };
    }

    return { fantasy_group };
  }


  async getMetaData({ fantasy_group_id }) {
    const organization_id = this.getOrganizationID();

    const { fantasy_group } = await this.getData({ fantasy_group_id });

    const sportText = Organization.getSportText({ organization_id });

    // a private group's name is redacted above, so say nothing rather than render "undefined"
    if (!fantasy_group || !fantasy_group.name) {
      return {
        title: `Fantasy league for ${sportText}`,
        description: `Fantasy league for ${sportText}`,
        openGraph: {
          title: 'Fantasy league',
          description: `Fantasy league for ${sportText}`,
        },
        twitter: {
          card: 'summary',
          title: 'Fantasy league',
          description: `Fantasy league for ${sportText}`,
        },
      };
    }

    return {
      title: `${fantasy_group.name} fantasy group for ${sportText}`,
      description: `${fantasy_group.name} fantasy group for ${sportText}`,
      openGraph: {
        title: `Fantasy league (${fantasy_group.name})`,
        description: `Fantasy league for ${sportText}`,
      },
      twitter: {
        card: 'summary',
        title: `Fantasy league (${fantasy_group.name})`,
        description: `Fantasy league for ${sportText}`,
      },
    };
  }


  async getDecorate(
    {
      fantasy_group_id,
      view,
    }:
    getDecorateFantasyGroup,
  ) {
    const { fantasy_group } = await this.getData({ fantasy_group_id });

    if (!fantasy_group || !fantasy_group.fantasy_group_id) {
      return notFound();
    }

    const getContents = () => {
      if (view === 'draft') {
        return (
          <DraftClientWrapper>
            <DraftClient fantasy_group_id={fantasy_group_id} />
          </DraftClientWrapper>
        );
      }

      return (
        <HomeClientWrapper>
          <HomeClient />
        </HomeClientWrapper>
      );
    };


    return (
      <ReduxWrapper fantasy_group = {fantasy_group}>
        <NavBar />
        <ContentsWrapper>
          {getContents()}
        </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default FantasyGroup;
