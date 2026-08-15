'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Coach, { getDecorateCoach } from '../../../../Surface/Coach';


type Props = {
  params: Promise<{ sport: string; coach_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  // const searchParameters = await searchParams;
  const { coach_id } = parameters;

  const Surface = new Coach({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ coach_id });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;
  const { coach_id } = parameters;

  const season = searchParameters?.season;
  const view = searchParameters.view || 'trends';

  const Surface = new Coach({
    sport: parameters.sport,
  });

  const args: getDecorateCoach = {
    coach_id,
    view,
  };

  if (season) {
    args.season = +season;
  }

  return Surface.getDecorate(args);
}
