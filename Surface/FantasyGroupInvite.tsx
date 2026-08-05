'use server';


import Organization from '@/components/helpers/Organization';

import { useServerAPI } from '@/components/serverAPI';

import ContentsWrapper from '@/components/generic/FantasyGroupInvite/ContentsWrapper';
import { Client } from '@/components/generic/FantasyGroupInvite/Client';
import { Dates } from '@esmalley/ts-utils';
import { Typography } from '@esmalley/react-material-ui';
import Surface from '../Surface';
import { General } from '@srating-io/types';

export type getDecorateFantasyGroupInvite = {
  fantasy_group_invite_id: string;
  code?: string;
};

class FantasyGroupInvite extends Surface {
  // constructor() {
  //   super();
  // }

  async getData(
    {
      fantasy_group_invite_id,
    }:
    {
      fantasy_group_invite_id: string;
    },
  ) {
    type Data = {
      fantasy_group_invite?: General.FantasyGroupInvite;
      fantasy_group?: General.FantasyGroup;
      fantasy_entrys?: General.FantasyEntrys;
    };

    const data: Data = {};

    data.fantasy_group_invite = await useServerAPI({
      class: 'fantasy_group_invite',
      function: 'get',
      arguments: {
        fantasy_group_invite_id,
      },
    });

    if (
      data.fantasy_group_invite &&
      data.fantasy_group_invite.fantasy_group_id
    ) {
      data.fantasy_group = await useServerAPI({
        class: 'fantasy_group',
        function: 'get',
        arguments: {
          fantasy_group_id: data.fantasy_group_invite.fantasy_group_id,
        },
      });

      data.fantasy_entrys = await useServerAPI({
        class: 'fantasy_entry',
        function: 'read',
        arguments: {
          fantasy_group_id: data.fantasy_group_invite.fantasy_group_id,
        },
      });
    }

    return data;
  }


  async getMetaData() {
    const organization_id = this.getOrganizationID();

    let sportText = 'unknown';

    if (organization_id === Organization.getCBBID()) {
      sportText = 'college basketball';
    } else if (organization_id === Organization.getCFBID()) {
      sportText = 'college football';
    }


    return {
      title: 'Fantasy league invite',
      description: `Fantasy league for ${sportText}`,
      openGraph: {
        title: 'Fantasy league invite',
        description: `Fantasy league for ${sportText}`,
      },
      twitter: {
        card: 'summary',
        title: 'Fantasy league invite',
        description: `Fantasy league for ${sportText}`,
      },
    };
  }


  async getDecorate(
    {
      fantasy_group_invite_id,
      code,
    }:
    getDecorateFantasyGroupInvite,
  ) {
    const { fantasy_group_invite, fantasy_group, fantasy_entrys } = await this.getData({ fantasy_group_invite_id });

    if (
      !fantasy_group_invite ||
      !fantasy_group_invite.fantasy_group_invite_id ||
      !fantasy_group ||
      !code ||
      fantasy_group_invite.code !== code ||
      Dates.format(fantasy_group_invite.expires, 'Y-m-d') < Dates.format(new Date(), 'Y-m-d')
    ) {
      return (
        <div style = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 200,
        }}>
          <Typography type = 'h6'>Sorry this invite has expired</Typography>
        </div>
      );
    }

    if (
      fantasy_group?.locked === 1
    ) {
      return (
        <div style = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 200,
        }}>
          <Typography type = 'h6'>Sorry this group is locked</Typography>
        </div>
      );
    }

    return (
      <ContentsWrapper>
        <Client fantasy_group = {fantasy_group} fantasy_entrys={fantasy_entrys} fantasy_group_invite_id={fantasy_group_invite_id} code = {code} />
      </ContentsWrapper>
    );
  }
}

export default FantasyGroupInvite;
