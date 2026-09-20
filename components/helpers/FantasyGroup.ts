/* eslint-disable no-restricted-syntax */

import { getStore } from '@/app/StoreProvider';
import { Fantasy } from '@srating-io/types';


/**
 * This class helps simplify the FantasyGroup logic
 */
class FantasyGroup {
  constructor({ fantasy_group }) {
    this.fantasy_group = fantasy_group;
  }

  private fantasy_group: Fantasy.FantasyGroup;

  getFantasyGroup() {
    return this.fantasy_group;
  }

  /**
   * Is this fantasy group a draft?
   */
  isDraft(): boolean {
    if (
      this.getFantasyGroup() &&
      this.getFantasyGroup().fantasy_group_type_terminology_id === '7ca1ccce-e033-11f0-bc34-529c3ffdbb93'
    ) {
      return true;
    }

    return false;
  }

  /**
   * Is this fantasy group a bracket?
   */
  isNCAABracket(): boolean {
    if (
      this.getFantasyGroup() &&
      this.getFantasyGroup().fantasy_group_type_terminology_id === '3e72a9f3-e034-11f0-bc34-529c3ffdbb93'
    ) {
      return true;
    }

    return false;
  }

  getCurrentPick(
    {
      fantasy_draft_orders,
    }:
    {
      fantasy_draft_orders: Fantasy.FantasyDraftOrders;
    },
  ) {
    const draft_order = this.getDraftOrder({ fantasy_draft_orders });

    for (let i = 0; i < draft_order.length; i++) {
      const row = draft_order[i];

      if (
        !row.fantasy_entry_player_id &&
        !row.picked
      ) {
        return row;
      }
    }

    return null;
  }

  /**
   * Is the current user a member of this fantasy_group?
   */
  isMember(
    {
      fantasy_group_users,
    }:
    {
      fantasy_group_users: Fantasy.FantasyGroupUsers
    },
  ): boolean {
    // todo the problem with this is it might be stale if the comppnent uses this does not re-render updating the store
    const store = getStore();

    const { user_id } = store.getState().userReducer.user;

    for (const fantasy_group_user_id in fantasy_group_users) {
      const row = fantasy_group_users[fantasy_group_user_id];

      if (row.user_id === user_id) {
        return true;
      }
    }
    return false;
  }

  getDraftOrder(
    {
      fantasy_entrys,
      fantasy_draft_orders,
    }:
    {
      fantasy_entrys?: Fantasy.FantasyEntrys;
      fantasy_draft_orders?: Fantasy.FantasyDraftOrders;
    },
  ) {
    type Data = {
      fantasy_draft_order_id?: string;
      fantasy_group_id: string;
      fantasy_entry_id: string;
      pick: number;
      round: number;
      eligible?: string;
      expires?: string;
      picked?: number;
      fantasy_entry_player_id?: string;
    }
    if (!fantasy_draft_orders && !fantasy_entrys) {
      return [];
    }

    const fantasy_group = this.getFantasyGroup();

    // if we already created the draft order, just sort the rows and return it
    if (fantasy_draft_orders && Object.values(fantasy_draft_orders).length) {
      return Object.values(fantasy_draft_orders).sort((a, b) => {
        if (a.round < b.round) {
          return -1;
        }

        if (a.round > b.round) {
          return 1;
        }

        // same round
        if (a.pick < b.pick) {
          return -1;
        }

        if (b.pick > a.pick) {
          return 1;
        }

        return 0;
      });
    }

    // the draft order is not finalized yet, return a preview
    if (fantasy_entrys && Object.values(fantasy_entrys).length) {
      const preview_draft_order: Data[] = [];
      const sorted_entries = Object.values(fantasy_entrys).sort((a, b) => {
        return a.date_of_entry > b.date_of_entry ? 1 : -1;
      });

      const rounds = 8;
      let pick = 1;

      for (let round = 1; round <= rounds; round++) {
        // Create a copy of the entries to manipulate for this round
        const round_entries = [...sorted_entries];

        // if it is snake and If it's an even round (2, 4, 6, 8), reverse the order
        if (
          fantasy_group.draft_type_terminology_id === '443459f0-eefe-11f0-a514-529c3ffdbb93' &&
          round % 2 === 0
        ) {
          round_entries.reverse();
        }

        // Create a draft order row for each entry in this round
        for (const fantasy_entry of round_entries) {
          preview_draft_order.push({
            fantasy_group_id: fantasy_group.fantasy_group_id,
            fantasy_entry_id: fantasy_entry.fantasy_entry_id,
            pick,
            round,
          });
          pick++;
        }
      }

      return preview_draft_order;
    }
    return [];
  }
}

export default FantasyGroup;
