'use server';

import { Metadata, ResolvingMetadata } from 'next';
import FantasyEntry, { getDecorateFantasyEntry } from '../../../Surface/FantasyEntry';


type Props = {
  params: Promise<{ fantasy_entry_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const { fantasy_entry_id } = parameters;

  const Surface = new FantasyEntry();

  const { fantasy_group } = await Surface.getData({ fantasy_entry_id });

  if (fantasy_group) {
    Surface.setOrganizationID(fantasy_group.organization_id);
    Surface.setDivisionID(fantasy_group.division_id);
  }

  return Surface.getMetaData({ fantasy_entry_id });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;

  const { fantasy_entry_id } = parameters;
  const view = searchParameters?.view;

  const Surface = new FantasyEntry();

  const { fantasy_group } = await Surface.getData({ fantasy_entry_id });

  if (fantasy_group) {
    Surface.setOrganizationID(fantasy_group.organization_id);
    Surface.setDivisionID(fantasy_group.division_id);
  }

  const args: getDecorateFantasyEntry = {
    fantasy_entry_id,
  };

  if (view) {
    args.view = view;
  }

  return Surface.getDecorate(args);
}

