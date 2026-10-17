'use server';

import { notFound } from 'next/navigation';
import ReduxWrapper from '@/components/generic/FantasyEntry/ReduxWrapper';
import Organization from '@/components/helpers/Organization';
import ContentsWrapper from '@/components/generic/FantasyEntry/ContentsWrapper';

import { useServerAPI } from '@/components/serverAPI';

import HomeClientWrapper from '@/components/generic/FantasyEntry/Contents/Home/ClientWrapper';
import { Client as HomeClient } from '@/components/generic/FantasyEntry/Contents/Home/Client';
import NavBar from '@/components/generic/FantasyEntry/NavBar';
import Surface from '../Surface';
import { Fantasy } from '@srating-io/types';

export type getDecorateFantasyEntry = {
  fantasy_entry_id: string;
  view?: string;
  // subview?: string | null;
  // season?: number;
  // division_id?: string;
  // trendsSeasons?: string[];
};

class FantasyEntry extends Surface {
  // constructor() {
  //   super();
  // }

  async getData({ fantasy_entry_id }) {
    const fantasy_entry: Fantasy.FantasyEntry = await useServerAPI({
      class: 'fantasy_entry',
      function: 'get',
      arguments: {
        fantasy_entry_id,
      },
    });

    const fantasy_group: Fantasy.FantasyGroup = await useServerAPI({
      class: 'fantasy_group',
      function: 'get',
      arguments: {
        fantasy_group_id: fantasy_entry?.fantasy_group_id,
      },
    });

    // Both calls run with the unrestricted server secret and no session, so anyone holding the id
    // could read the entry and its league out of the html and the page title. Membership is only
    // checked in the client load, so a private league is stripped back to what the page needs to
    // boot and the client fills the rest in for a member.
    if (fantasy_group && +fantasy_group.private === 1) {
      return {
        fantasy_entry: {
          fantasy_entry_id: fantasy_entry.fantasy_entry_id,
          fantasy_group_id: fantasy_entry.fantasy_group_id,
          user_id: fantasy_entry.user_id,
        } as Fantasy.FantasyEntry,
        fantasy_group: {
          fantasy_group_id: fantasy_group.fantasy_group_id,
          organization_id: fantasy_group.organization_id,
          division_id: fantasy_group.division_id,
          season: fantasy_group.season,
          private: fantasy_group.private,
        } as Fantasy.FantasyGroup,
      };
    }

    return { fantasy_entry, fantasy_group };
  }


  async getMetaData({ fantasy_entry_id }) {
    const organization_id = this.getOrganizationID();

    const { fantasy_entry } = await this.getData({ fantasy_entry_id });

    const sportText = Organization.getSportText({ organization_id });

    // a private league's entry name is redacted above, so say nothing rather than "undefined"
    if (!fantasy_entry || !fantasy_entry.name) {
      return {
        title: `Fantasy entry for ${sportText}`,
        description: `Fantasy entry for ${sportText}`,
        openGraph: {
          title: 'Fantasy league entry',
          description: `Fantasy league entry for ${sportText}`,
        },
        twitter: {
          card: 'summary',
          title: 'Fantasy league entry',
          description: `Fantasy league entry for ${sportText}`,
        },
      };
    }

    return {
      title: `${fantasy_entry?.name} fantasy entry for ${sportText}`,
      description: `${fantasy_entry?.name} fantasy entry for ${sportText}`,
      openGraph: {
        title: `Fantasy league entry (${fantasy_entry?.name})`,
        description: `Fantasy league entry for ${sportText}`,
      },
      twitter: {
        card: 'summary',
        title: `Fantasy league entry (${fantasy_entry?.name})`,
        description: `Fantasy league entry for ${sportText}`,
      },
    };
  }


  async getDecorate(
    {
      fantasy_entry_id,
      view,
    }:
    getDecorateFantasyEntry,
  ) {
    const { fantasy_entry, fantasy_group } = await this.getData({ fantasy_entry_id });

    if (
      !fantasy_entry ||
      !fantasy_entry.fantasy_entry_id ||
      !fantasy_group ||
      !fantasy_group.fantasy_group_id
    ) {
      return notFound();
    }

    const getContents = () => {
      return (
        <HomeClientWrapper>
          <HomeClient fantasy_entry_id={fantasy_entry_id} />
        </HomeClientWrapper>
      );
    };


    return (
      <ReduxWrapper
        fantasy_entry = {fantasy_entry}
        fantasy_group = {fantasy_group}
      >
        <NavBar />
        <ContentsWrapper>
          {getContents()}
        </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default FantasyEntry;
