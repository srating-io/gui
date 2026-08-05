'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Game, { getDecorateGame } from '../../../../Surface/Game';


type Props = {
  params: Promise<{ sport: string; game_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const { game_id } = await params;

  const Surface = new Game({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ game_id });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;

  const { game_id } = parameters;
  const division_id = searchParameters?.division_id;
  const view = searchParameters?.view;
  const subview = searchParameters?.subview;

  const Surface = new Game({
    sport: parameters.sport,
  });

  const args: getDecorateGame = {
    game_id,
  };

  if (view) {
    args.view = view;
  }

  if (subview) {
    args.subview = subview;
  }

  if (division_id) {
    args.division_id = division_id;
  }

  return Surface.getDecorate(args);
}

