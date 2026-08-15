'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Games, { getDecorateGames } from '../../../Surface/Games';


type Props = {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;

  const Surface = new Games({
    sport: parameters.sport,
  });

  return Surface.getMetaData();
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;

  const season = searchParameters?.season;
  const division_id = searchParameters?.division_id;
  const date = searchParameters?.date;


  const Surface = new Games({
    sport: parameters.sport,
  });

  const args: getDecorateGames = {};

  if (date) {
    args.date = date;
  }

  if (division_id) {
    args.division_id = division_id;
  }

  if (season) {
    args.season = +season;
  }

  return Surface.getDecorate(args);
}
