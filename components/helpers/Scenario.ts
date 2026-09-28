import { Arrayifier } from '@esmalley/ts-utils';
import Odds from './Odds';


export type ScenarioFilters = {
  bet: number;
  priceMin: number;
  priceMax: number;
  /** Minimum projected win percentage, 0-100. */
  confidence: number;
};

export type ScenarioPick = {
  game_id: string;
  game;
  side: string;
  price: number;
  /** The market price on the other side, for display next to the pick. */
  oppositePrice: number;
  probability: number;
  /** Profit if this one comes in, for the filter's stake. */
  profit: number;
  decimal: number;
  settled: boolean;
  /** null until the game is settled. */
  won: boolean | null;
  start_timestamp: number;
};

export type ScenarioSummary = {
  games: number;
  staked: number;
  returned: number;
  net: number;
  wins: number;
  /** net / staked, or 0 when nothing was staked. */
  roi: number;
};

export type RoundRobinSummary = ScenarioSummary & {
  size: number;
  combos: number;
};

/**
 * Hypothetical returns over a slate of projections.
 *
 * Pure and deterministic: the same inputs always produce the same numbers, including the
 * assumed-win-rate projections, which run off a seeded generator rather than Math.random.
 * Callers memoise on their inputs; nothing here touches React or the store.
 */
class Scenario {
  /** The largest round robin most sources accept, so longer slates are trimmed to the best of these. */
  public static getMaxLegs(): number {
    return 20;
  }

  private static getRoi(net: number, staked: number): number {
    return staked > 0 ? net / staked : 0;
  }

  /**
   * A small seeded generator, so an assumed-win-rate projection is stable for a given slate
   * instead of changing every time the component renders.
   *
   * Lehmer / MINSTD. Both constants stay inside the safe integer range when multiplied, and
   * the quality is far beyond what averaging a few hundred trials needs.
   */
  private static getRandom(seed: number): () => number {
    const modulus = 2147483647;
    let a = (Math.abs(Math.round(seed)) % (modulus - 1)) + 1;

    return () => {
      a = (a * 48271) % modulus;
      return a / modulus;
    };
  }

  /* eslint-disable no-bitwise */
  // A combination is held as a bit mask over its legs so a trial can test the whole thing with
  // one integer compare. Twenty legs in tens is 184,756 combinations, and comparing those leg
  // by leg instead would make the projected round robin roughly ten times slower. These two
  // helpers are the only place bits are touched.

  /** Add a leg to a mask. Legs are capped at getMaxLegs, well inside 32 bits. */
  private static withLeg(mask: number, index: number): number {
    return mask | (1 << index);
  }

  /** Did every leg of `combo` win, given the mask of legs that did? */
  private static isCovered(combo: number, winners: number): boolean {
    return (combo & winners) === combo;
  }
  /* eslint-enable no-bitwise */

  /**
   * The side the model favours, priced at the pre-game market line.
   * Returns null when there is no projection or the market never priced both sides.
   */
  public static getPick({ game, bet }: { game; bet: number; }): ScenarioPick | null {
    const prediction = game && game.prediction;

    if (!prediction) {
      return null;
    }

    const home = prediction.home_percentage;
    const away = prediction.away_percentage;

    if (home === null || home === undefined || away === null || away === undefined) {
      return null;
    }

    const pre = game.odds && game.odds.pre;

    if (!pre) {
      return null;
    }

    const side = home >= away ? 'home' : 'away';
    const other = side === 'home' ? 'away' : 'home';

    const price = Odds.getProfitPer100(pre[`money_line_${side}`]) === null ? null : Number(pre[`money_line_${side}`]);
    const otherPrice = Odds.getProfitPer100(pre[`money_line_${other}`]) === null ? null : Number(pre[`money_line_${other}`]);

    // Both sides have to be priced, otherwise the filters are comparing against half a market.
    if (price === null || otherPrice === null) {
      return null;
    }

    const profitPer100 = Odds.getProfitPer100(price);
    const decimal = Odds.getDecimalPrice(price);

    if (profitPer100 === null || decimal === null) {
      return null;
    }

    const settled = game.status === 'final';
    const homeScore = game.home_score;
    const awayScore = game.away_score;

    let won: boolean | null = null;

    if (settled && homeScore !== null && awayScore !== null) {
      won = side === 'home' ? homeScore > awayScore : awayScore > homeScore;
    }

    return {
      game_id: game.game_id,
      game,
      side,
      price,
      oppositePrice: otherPrice,
      probability: side === 'home' ? home : away,
      profit: (bet * profitPer100) / 100,
      decimal,
      settled,
      won,
      start_timestamp: game.start_timestamp,
    };
  }

  /**
   * How often the projection called the winner across a slate.
   *
   * Deliberately independent of the market: a game the model called correctly still counts
   * when nobody ever posted a line on it, which is why this does not go through getPick.
   * Games without a projection are skipped rather than counted as misses.
   */
  public static getAccuracy({ games }: { games; }): { correct: number; total: number; } {
    let correct = 0;
    let total = 0;

    for (const game_id in games) {
      const game = games[game_id];
      const prediction = game && game.prediction;

      if (!prediction || game.status !== 'final') {
        continue;
      }

      const home = prediction.home_percentage;
      const away = prediction.away_percentage;

      if (home === null || home === undefined || away === null || away === undefined) {
        continue;
      }

      if (game.home_score === null || game.away_score === null) {
        continue;
      }

      total++;

      const calledHome = home >= away;

      if (calledHome ? game.home_score > game.away_score : game.away_score > game.home_score) {
        correct++;
      }
    }

    return { correct, total };
  }

  /**
   * Split a slate into the picks that clear the filters and the ones that do not.
   */
  public static getPicks(
    { games, filters }:
    { games; filters: ScenarioFilters; },
  ): { eligible: ScenarioPick[]; rejected: ScenarioPick[]; } {
    const eligible: ScenarioPick[] = [];
    const rejected: ScenarioPick[] = [];

    for (const game_id in games) {
      const pick = Scenario.getPick({ game: games[game_id], bet: filters.bet });

      if (pick === null) {
        continue;
      }

      const clears = (
        pick.price >= filters.priceMin &&
        pick.price <= filters.priceMax &&
        (pick.probability * 100) >= filters.confidence
      );

      if (clears) {
        eligible.push(pick);
      } else {
        rejected.push(pick);
      }
    }

    return { eligible, rejected };
  }

  /**
   * What the settled picks actually returned.
   */
  public static getSettled({ picks, bet }: { picks: ScenarioPick[]; bet: number; }): ScenarioSummary {
    const settled = picks.filter((pick) => pick.settled && pick.won !== null);

    let returned = 0;
    let wins = 0;

    for (const pick of settled) {
      if (pick.won) {
        wins++;
        returned += bet + pick.profit;
      }
    }

    const staked = settled.length * bet;

    return {
      games: settled.length,
      staked,
      returned,
      net: returned - staked,
      wins,
      roi: Scenario.getRoi(returned - staked, staked),
    };
  }

  /**
   * What the picks would return at an assumed win rate, averaged over repeated trials.
   *
   * winRate is a fraction. At 1 this is the every-pick-lands case and needs no trials.
   */
  public static getProjected(
    { picks, bet, winRate, trials = 500 }:
    { picks: ScenarioPick[]; bet: number; winRate: number; trials?: number; },
  ): ScenarioSummary {
    const staked = picks.length * bet;

    if (!picks.length) {
      return { games: 0, staked: 0, returned: 0, net: 0, wins: 0, roi: 0 };
    }

    if (winRate >= 1) {
      const returned = picks.reduce((total, pick) => total + bet + pick.profit, 0);

      return {
        games: picks.length,
        staked,
        returned,
        net: returned - staked,
        wins: picks.length,
        roi: Scenario.getRoi(returned - staked, staked),
      };
    }

    const random = Scenario.getRandom(picks.length * 7919 + Math.round(winRate * 1000));

    let totalReturned = 0;
    let totalWins = 0;

    for (let trial = 0; trial < trials; trial++) {
      for (const pick of picks) {
        if (random() < winRate) {
          totalWins++;
          totalReturned += bet + pick.profit;
        }
      }
    }

    const returned = totalReturned / trials;

    return {
      games: picks.length,
      staked,
      returned,
      net: returned - staked,
      wins: totalWins / trials,
      roi: Scenario.getRoi(returned - staked, staked),
    };
  }

  /**
   * The legs a round robin is built from: the shortest prices first, capped at getMaxLegs.
   */
  public static getLegs(picks: ScenarioPick[]): ScenarioPick[] {
    const ordered = picks.slice().sort((a, b) => a.decimal - b.decimal);

    return ordered.slice(0, Scenario.getMaxLegs());
  }

  /**
   * Every combination of `size` legs, as a bit mask plus the payout if that combination lands.
   *
   * The masks let a trial test a whole combination with one integer compare, which is what
   * keeps the projected round robin affordable: twenty legs in tens is 184,756 combinations.
   */
  private static getCombos(
    { legs, size, bet }:
    { legs: ScenarioPick[]; size: number; bet: number; },
  ): { masks: Uint32Array; payouts: Float64Array; } {
    const indexes = legs.map((leg, index) => index);
    const combinations = Arrayifier.getCombinations(indexes, size) as number[][];

    const masks = new Uint32Array(combinations.length);
    const payouts = new Float64Array(combinations.length);

    for (let i = 0; i < combinations.length; i++) {
      let mask = 0;
      let payout = bet;

      for (let j = 0; j < combinations[i].length; j++) {
        const index = combinations[i][j];
        mask = Scenario.withLeg(mask, index);
        payout *= legs[index].decimal;
      }

      masks[i] = mask;
      payouts[i] = payout;
    }

    return { masks, payouts };
  }

  /**
   * Every round robin figure the caller needs, off one build of the combinations.
   *
   * Building them is the expensive part - twenty legs in tens is 184,756 - so the settled
   * result and each projected win rate share a single build rather than repeating it.
   */
  public static getRoundRobin(
    { legs, size, bet, winRates, trials = 500 }:
    { legs: ScenarioPick[]; size: number; bet: number; winRates: number[]; trials?: number; },
  ): { settled: RoundRobinSummary; projected: { winRate: number; summary: RoundRobinSummary; }[]; } {
    const empty: RoundRobinSummary = {
      games: legs.length, staked: 0, returned: 0, net: 0, wins: 0, roi: 0, size, combos: 0,
    };

    if (size < 2 || legs.length <= size) {
      return {
        settled: empty,
        projected: winRates.map((winRate) => ({ winRate, summary: empty })),
      };
    }

    const combos = Scenario.getCombos({ legs, size, bet });

    return {
      settled: Scenario.getSettledRoundRobin({ legs, size, bet, combos }),
      projected: winRates.map((winRate) => ({
        winRate,
        summary: Scenario.getProjectedRoundRobin({ legs, size, bet, winRate, trials, combos }),
      })),
    };
  }

  /**
   * What a settled round robin actually returned.
   */
  private static getSettledRoundRobin(
    { legs, size, bet, combos }:
    { legs: ScenarioPick[]; size: number; bet: number; combos: { masks: Uint32Array; payouts: Float64Array; }; },
  ): RoundRobinSummary {
    const { masks, payouts } = combos;

    let winMask = 0;

    for (let i = 0; i < legs.length; i++) {
      if (legs[i].settled && legs[i].won) {
        winMask = Scenario.withLeg(winMask, i);
      }
    }

    let returned = 0;
    let wins = 0;

    for (let i = 0; i < masks.length; i++) {
      if (Scenario.isCovered(masks[i], winMask)) {
        wins++;
        returned += payouts[i];
      }
    }

    const staked = masks.length * bet;

    return {
      games: legs.length,
      staked,
      returned,
      net: returned - staked,
      wins,
      roi: Scenario.getRoi(returned - staked, staked),
      size,
      combos: masks.length,
    };
  }

  /**
   * What a round robin would return at an assumed win rate, averaged over repeated trials.
   */
  private static getProjectedRoundRobin(
    { legs, size, bet, winRate, trials, combos }:
    {
      legs: ScenarioPick[]; size: number; bet: number; winRate: number; trials: number;
      combos: { masks: Uint32Array; payouts: Float64Array; };
    },
  ): RoundRobinSummary {
    const { masks, payouts } = combos;
    const staked = masks.length * bet;

    if (winRate >= 1) {
      let returned = 0;

      for (let i = 0; i < payouts.length; i++) {
        returned += payouts[i];
      }

      return {
        games: legs.length,
        staked,
        returned,
        net: returned - staked,
        wins: masks.length,
        roi: Scenario.getRoi(returned - staked, staked),
        size,
        combos: masks.length,
      };
    }

    const random = Scenario.getRandom(legs.length * 104729 + size * 7919 + Math.round(winRate * 1000));

    let totalReturned = 0;
    let totalWins = 0;

    for (let trial = 0; trial < trials; trial++) {
      let winMask = 0;

      for (let i = 0; i < legs.length; i++) {
        if (random() < winRate) {
          winMask = Scenario.withLeg(winMask, i);
        }
      }

      for (let i = 0; i < masks.length; i++) {
        if (Scenario.isCovered(masks[i], winMask)) {
          totalWins++;
          totalReturned += payouts[i];
        }
      }
    }

    const returned = totalReturned / trials;

    return {
      games: legs.length,
      staked,
      returned,
      net: returned - staked,
      wins: totalWins / trials,
      roi: Scenario.getRoi(returned - staked, staked),
      size,
      combos: masks.length,
    };
  }
}

export default Scenario;
