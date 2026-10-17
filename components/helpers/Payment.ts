


class Payment {
  // constructor() {
  // }

  public static stripe_percentage = 0.029;

  public static stripe_transaction_cents = 30;

  public static srating_percentage = 0.03;

  public static get_amount_after_fees(amount: number) {
    if (amount === 0) {
      return 0;
    }
    let pennies = amount * 100;

    pennies = pennies - (pennies * (this.stripe_percentage)) - this.stripe_transaction_cents;

    pennies -= (pennies * this.srating_percentage);

    return +(pennies / 100).toFixed(2);
  }

  /**
   * The pool for a league, after fees.
   *
   * The processor takes its cut per charge, so the flat transaction fee comes off once per paid
   * entry. Running the whole pool through `get_amount_after_fees` takes it off once in total and
   * advertises a pool bigger than the one that exists.
   */
  public static get_pool_after_fees(entry_fee: number | null | undefined, paid_entries: number) {
    if (!entry_fee || paid_entries <= 0) {
      return 0;
    }

    return +(this.get_amount_after_fees(entry_fee) * paid_entries).toFixed(2);
  }

  /**
   * The split a payout rule describes, as `{rank, share}` rows with `share` a fraction of the pool.
   *
   * `json_payout_structure` is a free varchar and nothing in the codebase writes it, so the shape
   * is read defensively: an object keyed by place, or a list of rows naming a place and a share.
   * Values that sum to more than 1.5 are read as percentages. Anything unrecognized comes back
   * empty, so the caller shows nothing rather than a wrong number next to real money.
   */
  public static get_payout_split(json_payout_structure: unknown): {rank: number, share: number}[] {
    let structure = json_payout_structure;

    if (typeof structure === 'string') {
      try {
        structure = JSON.parse(structure);
      } catch {
        return [];
      }
    }

    if (!structure || typeof structure !== 'object') {
      return [];
    }

    const split: {rank: number, share: number}[] = [];

    if (Array.isArray(structure)) {
      for (const row of structure) {
        if (!row || typeof row !== 'object') {
          continue;
        }
        const rank = +(row.rank ?? row.place ?? row.position);
        const share = +(row.share ?? row.percentage ?? row.percent ?? row.amount);

        if (Number.isFinite(rank) && Number.isFinite(share)) {
          split.push({ rank, share });
        }
      }
    } else {
      for (const key in structure) {
        const rank = +key;
        const share = +structure[key];

        if (Number.isFinite(rank) && Number.isFinite(share)) {
          split.push({ rank, share });
        }
      }
    }

    const total = split.reduce((sum, row) => sum + row.share, 0);

    if (total > 1.5) {
      for (const row of split) {
        row.share /= 100;
      }
    }

    return split.sort((a, b) => a.rank - b.rank);
  }
}

export default Payment;
