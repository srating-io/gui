'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Team, { getDecorateTeam } from '../../../../Surface/Team';


type Props = {
  params: Promise<{ sport: string; team: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const searchParameters = await searchParams;

  const { team } = parameters;
  const season = searchParameters?.season || undefined;

  const Surface = new Team({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ team, season });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;
  const { team } = parameters;


  const division_id = searchParameters?.division_id;
  const season = searchParameters?.season;
  const view = searchParameters?.view || 'schedule';

  const Surface = new Team({
    sport: parameters.sport,
  });

  const args: getDecorateTeam = {
    team,
    view,
  };

  if (division_id) {
    args.division_id = division_id;
  }

  if (season) {
    args.season = +season;
  }

  return Surface.getDecorate(args);
}
