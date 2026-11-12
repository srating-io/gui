'use client';

import { useAppSelector } from '@/redux/hooks';
import { hasSurvivorDateBar } from '@/components/helpers/FantasySlate';

/**
 * Whether the survivor date bar is on screen, read off the same slice the bar renders from.
 *
 * This cannot be settled on the server. `getData` strips a private group back to five columns, so
 * the surface sees no start date and no slate type and says there is no bar, while the room -- which
 * has the member's own load behind it -- renders one. The nav bar then pins where the date bar
 * already is and the two sit on top of each other.
 *
 * `seasonDates` is empty on every view but survivor, so passing it is also what settles the view.
 */
export function useSurvivorDateBar(fantasy_group_id: string, seasonDates: string[]): boolean {
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);

  // the slice is shared across leagues, and until it holds this one the room is still a spinner
  if (!fantasy_group || fantasy_group.fantasy_group_id !== fantasy_group_id) {
    return false;
  }

  return hasSurvivorDateBar(fantasy_group, seasonDates);
}
