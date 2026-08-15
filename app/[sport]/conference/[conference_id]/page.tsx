'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Conference, { getDecorateConference } from '../../../../Surface/Conference';


type Props = {
  params: Promise<{ sport: string; conference_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const { conference_id } = parameters;

  const Surface = new Conference({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ conference_id });
}

export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;

  const { conference_id } = parameters;
  const season = searchParameters?.season;
  const view = searchParameters?.view || 'standings';
  const subview = searchParameters?.subview;


  const Surface = new Conference({
    sport: parameters.sport,
  });

  const args: getDecorateConference = {
    conference_id,
    view,
  };

  if (subview) {
    args.subview = subview;
  }

  if (season) {
    args.season = +season;
  }

  return Surface.getDecorate(args);
}
