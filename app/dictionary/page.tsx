'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Dictionary from '../../Surface/Dictionary';

type Props = {
  params: Promise<{ table?: string; table_id?: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const Surface = new Dictionary();
  return Surface.getMetaData({ table: undefined, table_id: undefined });
}

export default async function Page({ params, searchParams }: Props) {
  const searchParameters = await searchParams;
  const Surface = new Dictionary();

  const args = {
    table: searchParameters?.table,
    table_id: searchParameters?.table_id,
  };

  return Surface.getDecorate(args);
}
