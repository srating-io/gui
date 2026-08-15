'use server';

import { Metadata, ResolvingMetadata } from 'next';
import Compare, { getDecorateCompare } from '../../../Surface/Compare';

type Props = {
  params: Promise<{ sport: string; }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;

  const Surface = new Compare({
    sport: parameters.sport,
  });

  return Surface.getMetaData();
}

export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  const searchParameters = await searchParams;

  const home_team_id = searchParameters?.home_team_id;
  const away_team_id = searchParameters?.away_team_id;
  const division_id = searchParameters?.division_id;
  const season = searchParameters?.season;
  const view = searchParameters?.view || 'team';
  const subview = searchParameters?.subview;
  let neutral_site: boolean = false;

  if (
    searchParameters &&
    searchParameters.neutral_site !== undefined &&
    (
      searchParameters.neutral_site === 'true' ||
      +searchParameters.neutral_site === 1
    )
  ) {
    neutral_site = true;
  }

  const Surface = new Compare({
    sport: parameters.sport,
  });

  const args: getDecorateCompare = {
    view,
    neutral_site,
  };

  if (home_team_id) {
    args.home_team_id = home_team_id;
  }

  if (away_team_id) {
    args.away_team_id = away_team_id;
  }

  if (division_id) {
    args.division_id = division_id;
  }

  if (season) {
    args.season = +season;
  }

  if (subview) {
    args.subview = subview;
  }

  return Surface.getDecorate(args);
}

