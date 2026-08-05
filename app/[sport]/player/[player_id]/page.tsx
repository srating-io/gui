'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Player, { getDecoratePlayer } from '../../../../Surface/Player';


type Props = {
  params: Promise<{ sport: string; player_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const searchParameters = await searchParams;

  const { player_id } = parameters;
  const season = searchParameters?.season || undefined;

  const Surface = new Player({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ player_id, season });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;
  const { player_id } = parameters;

  const division_id = searchParameters?.division_id;
  const player_team_season_id = searchParameters?.player_team_season_id;
  const season = searchParameters?.season;
  const view = searchParameters?.view || 'stats';
  const subview = searchParameters?.subview;
  const trendsSeasons = searchParameters?.trendsSeasons as string[] | undefined;

  const Surface = new Player({
    sport: parameters.sport,
  });

  const args: getDecoratePlayer = {
    player_id,
    player_team_season_id,
    view,
  };

  if (subview) {
    args.subview = subview as string;
  }

  if (season) {
    args.season = +season;
  }

  if (division_id) {
    args.division_id = division_id;
  }

  if (trendsSeasons && trendsSeasons.length) {
    args.trendsSeasons = trendsSeasons;
  }

  return Surface.getDecorate(args);
}
