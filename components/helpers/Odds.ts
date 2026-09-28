import { General } from '@srating-io/types';


export type BestPrice = {
  key: string;
  title: string;
  price: number;
};

export type FairProbabilities = {
  away: number;
  home: number;
};

export type CalibrationAccuracy = {
  bucket: number;
  total: number;
  correct: number;
  accuracy: number;
};

/**
 * Math over market lines and model projections.
 *
 * Every getter returns null when it cannot produce a trustworthy answer. Nothing here falls
 * back to 0, because a zero edge is a real result and must not be confused with missing data.
 *
 * The HelperGame getters (getPreML, getPreSpread, getPreOver...) return the string '-' when
 * the underlying value is absent, so every entry point normalises through toNumber first.
 */
class Odds {
  /**
   * Coerce a raw value to a usable number.
   * Handles the '-' sentinel returned by HelperGame, plus null, undefined, empty and NaN.
   */
  private static toNumber(value: unknown): number | null {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === '-'
    ) {
      return null;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      return null;
    }

    return parsed;
  }

  /**
   * Convert an American price to the probability it implies, 0 to 1.
   * This still contains the overround, use getFairProbabilities to strip it.
   */
  public static getImpliedProbability(price: unknown): number | null {
    const value = Odds.toNumber(price);

    if (value === null || value === 0) {
      return null;
    }

    if (value > 0) {
      return 100 / (value + 100);
    }

    return -value / (-value + 100);
  }

  /**
   * Convert an American price to its decimal equivalent, the total return per 1 staked.
   */
  public static getDecimalPrice(price: unknown): number | null {
    const value = Odds.toNumber(price);

    if (value === null || value === 0) {
      return null;
    }

    if (value > 0) {
      return 1 + (value / 100);
    }

    return 1 + (100 / -value);
  }

  /**
   * Strip the overround from a two sided market so the pair sums to 1.
   *
   * Comparing the model against raw implied probabilities overstates its edge by roughly half
   * the overround on every game, so this normalisation is what the edge is built on.
   */
  public static getFairProbabilities(
    { away, home }:
    { away: unknown; home: unknown; },
  ): FairProbabilities | null {
    const impliedAway = Odds.getImpliedProbability(away);
    const impliedHome = Odds.getImpliedProbability(home);

    if (impliedAway === null || impliedHome === null) {
      return null;
    }

    const total = impliedAway + impliedHome;

    if (total <= 0) {
      return null;
    }

    return {
      away: impliedAway / total,
      home: impliedHome / total,
    };
  }

  /**
   * Model probability minus the vig free market probability, in percentage points.
   * Positive means the model rates the side higher than the market does.
   */
  public static getEdge(
    { modelProbability, fairProbability }:
    { modelProbability: unknown; fairProbability: unknown; },
  ): number | null {
    const model = Odds.toNumber(modelProbability);
    const fair = Odds.toNumber(fairProbability);

    if (model === null || fair === null) {
      return null;
    }

    if (model < 0 || model > 1 || fair < 0 || fair > 1) {
      return null;
    }

    return (model - fair) * 100;
  }

  /**
   * Gross profit on a 100 stake at the given price, before any probability is applied.
   *
   * The two signs are not symmetric: +150 returns 150 on a 100 stake, while -150 returns
   * 66.67. Treating them the same understates every underdog, so this is the one place the
   * conversion lives.
   */
  public static getProfitPer100(price: unknown): number | null {
    const value = Odds.toNumber(price);

    if (value === null || value === 0) {
      return null;
    }

    return value > 0 ? value : (10000 / -value);
  }

  /**
   * Expected return per 100 staked at the given price, judged by the model probability.
   */
  public static getReturnPer100(
    { price, modelProbability }:
    { price: unknown; modelProbability: unknown; },
  ): number | null {
    const profit = Odds.getProfitPer100(price);
    const model = Odds.toNumber(modelProbability);

    if (profit === null || model === null) {
      return null;
    }

    if (model < 0 || model > 1) {
      return null;
    }

    return (model * profit) - ((1 - model) * 100);
  }

  /**
   * Quarter Kelly allocation, as a fraction from 0 to 1.
   *
   * Deliberately fractional rather than full Kelly, which is an aggressive number to put in
   * front of someone, and clamped so a bad probability cannot produce a nonsense fraction.
   */
  public static getAllocationFraction(
    { price, modelProbability, multiplier = 0.25 }:
    { price: unknown; modelProbability: unknown; multiplier?: number; },
  ): number | null {
    const decimal = Odds.getDecimalPrice(price);
    const model = Odds.toNumber(modelProbability);

    if (decimal === null || model === null) {
      return null;
    }

    if (model < 0 || model > 1) {
      return null;
    }

    const b = decimal - 1;

    if (b <= 0) {
      return null;
    }

    const fraction = ((b * model) - (1 - model)) / b;

    if (fraction <= 0) {
      return 0;
    }

    return Math.min(fraction * multiplier, 1);
  }

  /**
   * Every market source that priced a side, most favourable first.
   * For American prices the numerically highest value is always the best return.
   */
  public static getPrices(
    { bookmakers, side }:
    { bookmakers: General.Bookmakers | null; side: string; },
  ): BestPrice[] {
    if (!bookmakers) {
      return [];
    }

    const prices: BestPrice[] = [];

    for (const key in bookmakers) {
      const row = bookmakers[key];

      if (!row) {
        continue;
      }

      const price = Odds.toNumber(row[`money_line_${side}`]);

      if (price === null || price === 0) {
        continue;
      }

      prices.push({ key, title: row.title || key, price });
    }

    return prices.sort((a, b) => b.price - a.price);
  }

  /**
   * The best available price for a side across every market source.
   */
  public static getBestPrice(
    { bookmakers, side }:
    { bookmakers: General.Bookmakers | null; side: string; },
  ): BestPrice | null {
    return Odds.getPrices({ bookmakers, side })[0] || null;
  }

  /**
   * How far apart the market sources are on a side, in percentage points of implied probability.
   *
   * A wide spread means the number is soft and the edge deserves less trust, so this belongs
   * next to the edge rather than buried.
   */
  public static getPriceDispersion(
    { bookmakers, side }:
    { bookmakers: General.Bookmakers | null; side: string; },
  ): number | null {
    if (!bookmakers) {
      return null;
    }

    const probabilities: number[] = [];

    for (const key in bookmakers) {
      const row = bookmakers[key];

      if (!row) {
        continue;
      }

      const probability = Odds.getImpliedProbability(row[`money_line_${side}`]);

      if (probability === null) {
        continue;
      }

      probabilities.push(probability);
    }

    if (probabilities.length < 2) {
      return null;
    }

    return (Math.max(...probabilities) - Math.min(...probabilities)) * 100;
  }

  /**
   * Projected winning margin from the home perspective. Positive means home is projected to win.
   */
  public static getProjectedMargin(prediction: General.Prediction | null | undefined): number | null {
    if (!prediction) {
      return null;
    }

    const home = Odds.toNumber(prediction.home_score);
    const away = Odds.toNumber(prediction.away_score);

    if (home === null || away === null) {
      return null;
    }

    return home - away;
  }

  /**
   * Projected combined score.
   */
  public static getProjectedTotal(prediction: General.Prediction | null | undefined): number | null {
    if (!prediction) {
      return null;
    }

    const home = Odds.toNumber(prediction.home_score);
    const away = Odds.toNumber(prediction.away_score);

    if (home === null || away === null) {
      return null;
    }

    return home + away;
  }

  /**
   * Projected spread minus the market spread, in points.
   *
   * The market spread is signed from the home perspective, so -4.5 means home favoured by 4.5
   * and a projected margin of +7.2 is a projected spread of -7.2.
   * A positive result means the model rates home higher than the market does.
   */
  public static getMarginDelta(
    { prediction, marketSpreadHome }:
    { prediction: General.Prediction | null | undefined; marketSpreadHome: unknown; },
  ): number | null {
    const margin = Odds.getProjectedMargin(prediction);
    const market = Odds.toNumber(marketSpreadHome);

    if (margin === null || market === null) {
      return null;
    }

    return (-margin) - market;
  }

  /**
   * Projected total minus the market total. Positive means the model projects higher scoring.
   */
  public static getTotalDelta(
    { prediction, marketTotal }:
    { prediction: General.Prediction | null | undefined; marketTotal: unknown; },
  ): number | null {
    const total = Odds.getProjectedTotal(prediction);
    const market = Odds.toNumber(marketTotal);

    if (total === null || market === null) {
      return null;
    }

    return total - market;
  }

  /**
   * Which confidence band a projected probability falls into.
   *
   * The accuracy endpoint only buckets the favoured side, so anything under 50% has no bucket.
   */
  public static getCalibrationBucket(probability: unknown): number | null {
    const value = Odds.toNumber(probability);

    if (value === null || value < 0.5 || value > 1) {
      return null;
    }

    return Math.min(90, Math.floor(value * 10) * 10);
  }

  /**
   * How often the model has been right in the band this projection falls into.
   * Returns null rather than 0 when the band is empty, so callers can hide the row.
   */
  public static getCalibrationAccuracy(
    { buckets, probability }:
    { buckets: object | null | undefined; probability: unknown; },
  ): CalibrationAccuracy | null {
    const bucket = Odds.getCalibrationBucket(probability);

    if (bucket === null || !buckets) {
      return null;
    }

    const total = Odds.toNumber(buckets[`${bucket}_total`]);
    const correct = Odds.toNumber(buckets[`${bucket}_correct`]);

    if (total === null || correct === null || total <= 0) {
      return null;
    }

    return {
      bucket,
      total,
      correct,
      accuracy: correct / total,
    };
  }

  /**
   * Render a signed number, or '-' when it is missing.
   * A value that rounds to zero prints unsigned rather than as '+0.0' or '-0.0'.
   */
  public static formatSigned(value: unknown, precision: number = 1): string {
    const parsed = Odds.toNumber(value);

    if (parsed === null) {
      return '-';
    }

    const fixed = parsed.toFixed(precision);

    if (Number(fixed) === 0) {
      return (0).toFixed(precision);
    }

    return Number(fixed) > 0 ? `+${fixed}` : fixed;
  }

  /**
   * Render a probability 0..1 as a whole percentage, or '-' when it is missing.
   */
  public static formatProbability(value: unknown, precision: number = 0): string {
    const parsed = Odds.toNumber(value);

    if (parsed === null) {
      return '-';
    }

    return `${(parsed * 100).toFixed(precision)}%`;
  }

  /**
   * Render an American price the way the market posts it, or '-' when it is missing.
   */
  public static formatPrice(value: unknown): string {
    const parsed = Odds.toNumber(value);

    if (parsed === null || parsed === 0) {
      return '-';
    }

    return parsed > 0 ? `+${parsed}` : `${parsed}`;
  }
}

export default Odds;
