'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Ranking, { getDecorateRanking } from '../../../Surface/Ranking';


type Props = {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const getView = ({ searchParameters }) => {
  const view: string = typeof searchParameters?.view === 'string' ? searchParameters?.view : 'team';

  return view;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  const searchParameters = await searchParams;
  const view = getView({ searchParameters });

  const Surface = new Ranking({
    sport: parameters.sport,
  });

  return Surface.getMetaData({ view });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;
  const season = searchParameters?.season || undefined;
  const view = getView({ searchParameters });
  const division_id = searchParameters?.division_id || undefined;
  const career = searchParameters?.career || undefined;
  const career_active = searchParameters?.career_active || undefined;

  const Surface = new Ranking({
    sport: parameters.sport,
  });

  const args: getDecorateRanking = {
    view,
    division_id,
  };

  if (season) {
    args.season = +season;
  }

  if (career) {
    args.career = +career;
  }

  if (career_active) {
    args.career_active = +career_active;
  }

  return Surface.getDecorate(args);
}
