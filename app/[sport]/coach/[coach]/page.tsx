'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Coach, { getDecorateCoach } from '../../../../Surface/Coach';


type Props = {
  params: Promise<{ sport: string; coach: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const searchParameters = await searchParams;
  const { coach } = parameters;
  const season = searchParameters?.season || undefined;

  const Surface = new Coach({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ coach, season });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;
  const { coach } = parameters;

  const season = searchParameters?.season;
  const view = searchParameters.view || 'trends';

  const Surface = new Coach({
    sport: parameters.sport,
  });

  const args: getDecorateCoach = {
    coach,
    view,
  };

  if (season) {
    args.season = +season;
  }

  return Surface.getDecorate(args);
}
