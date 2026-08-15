'use server';

import { Metadata, ResolvingMetadata } from 'next';
import FantasyGroupInvite from '../../../Surface/FantasyGroupInvite';

type Props = {
  params: Promise<{ fantasy_group_invite_id: string; }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const { fantasy_group_invite_id } = parameters;

  const Surface = new FantasyGroupInvite();

  const { fantasy_group } = await Surface.getData({ fantasy_group_invite_id });

  if (fantasy_group) {
    Surface.setOrganizationID(fantasy_group.organization_id);
    Surface.setDivisionID(fantasy_group.division_id);
  }

  return Surface.getMetaData();
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;

  const { fantasy_group_invite_id } = parameters;
  const code = searchParameters?.code;

  const Surface = new FantasyGroupInvite();

  const { fantasy_group } = await Surface.getData({ fantasy_group_invite_id });

  if (fantasy_group) {
    Surface.setOrganizationID(fantasy_group.organization_id);
    Surface.setDivisionID(fantasy_group.division_id);
  }

  return Surface.getDecorate({
    fantasy_group_invite_id,
    code,
  });
}
