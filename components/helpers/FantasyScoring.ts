import { TERMINOLOGY_ID } from '@srating-io/common';
import { Basketball } from '@srating-io/types';

/**
 * Roto scores an entry by comparing it with the rest of the league, so a single player in a
 * single game has no score of their own. Callers hide the column rather than show a zero.
 */
export const isRotoScoring = (draft_scoring_terminology_id: string | null): boolean => {
  return draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.ROTO;
};

/**
 * What one game was worth to an entry. The season totals come down already scored, but a per
 * game figure does not, so it is worked out here from the same formulas the writer uses.
 */
export const getBoxscoreScore = (
  boxscore: Basketball.PlayerBoxscore,
  draft_scoring_terminology_id: string | null,
): number | null => {
  if (!boxscore) {
    return null;
  }

  const points = +(boxscore.points || 0);
  const rebounds = +(boxscore.total_rebounds || 0);
  const assists = +(boxscore.assists || 0);
  const steals = +(boxscore.steals || 0);
  const blocks = +(boxscore.blocks || 0);
  const turnovers = +(boxscore.turnovers || 0);

  if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.FANTASY_POINTS) {
    return +(points + (rebounds * 1.2) + (assists * 1.5) + (steals * 3) + (blocks * 3) - turnovers).toFixed(1);
  }

  if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.EFFICIENCY_RATING) {
    const missed_field_goals = +(boxscore.field_goal_attempts || 0) - +(boxscore.field_goal || 0);
    const missed_free_throws = +(boxscore.free_throw_attempts || 0) - +(boxscore.free_throws || 0);

    return +(points + rebounds + assists + steals + blocks - missed_field_goals - missed_free_throws - turnovers).toFixed(1);
  }

  return null;
};
