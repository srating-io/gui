
// this is NOT a client or server component
// it is both, do not mark it as one, these functions are shared... hence the name!

/**
 * The ranking:load arguments, built in one place.
 *
 * Both sides of a cache grant hash this object and the hashes have to match exactly: the server
 * component mints over it, and Loader sends it. Two literals that merely look alike would drift --
 * a number against a string, or a key the other side omits -- and the symptom is not an error, it
 * is caching that silently never hits. See components/cacheGrant.server.ts.
 */

export interface RankingView {
  organization_id: string;
  division_id: string;
  season: number | string;
  view: string;
  career: number | string;
  career_active: number | string;
}

const RANKING_FUNCTIONS: Record<string, string> = {
  player: 'getPlayerRanking',
  transfer: 'getTransferRanking',
  conference: 'getConferenceRanking',
  coach: 'getCoachRanking',
};

export const getRankingFunction = (view: string): string => (
  RANKING_FUNCTIONS[view] || 'getTeamRanking'
);

export const buildRankingArguments = ({
  organization_id,
  division_id,
  season,
  view,
  career,
  career_active,
}: RankingView) => {
  const fxn = getRankingFunction(view);

  const args: {
    organization_id: string;
    division_id: string;
    season: number;
    fxn: string;
    career?: number;
    career_active?: number;
  } = {
    organization_id,
    division_id,
    season: +season,
    fxn,
  };

  // ranking.load only forwards these for the player ranking, so sending them on any other view
  // would split the cache into entries holding identical data
  if (fxn === 'getPlayerRanking') {
    args.career = +career;
    args.career_active = +career_active;
  }

  return args;
};
