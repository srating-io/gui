import { ExplainerTarget } from '@/components/helpers/FantasyGroupExplainer';


/**
 * Dom ids on the cards the explainer points at. Named in one place because the pointer and the
 * target are files apart, and a "Show me" that scrolls nowhere is worse than no button at all.
 */
export const FANTASY_ANCHOR: Record<ExplainerTarget, string> = {
  entries: 'fantasy-my-entries',
  entries_and_fees: 'fantasy-entries-and-fees',
  draft_settings: 'fantasy-draft-settings',
  payouts: 'fantasy-payout-info',
  bracket: 'fantasy-bracket-info',
  rosters: 'fantasy-rosters',
};
