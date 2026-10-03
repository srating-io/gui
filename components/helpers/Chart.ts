import { Arithmetic } from '@esmalley/ts-utils';

export type Domain = [number, number];

/**
 * Math shared by the chart components.
 *
 * Everything here is pure and takes plain numbers, so it can be unit-reasoned about without a
 * React tree. The axis helpers return undefined rather than a guessed domain when they are handed
 * nothing usable, because letting recharts auto-scale is always better than inventing bounds.
 */
class Chart {
  /**
   * How much of a domain is padding, so a series never touches the top and bottom of the plot.
   *
   * Public so a chart that needs more room - one with captions in its corners, say - can ask for
   * this plus its own clearance rather than inventing a second padding scheme beside this one.
   */
  public static readonly PADDING = 0.05;

  /**
   * How many games a trailing mean covers by default.
   *
   * Five is about a fortnight of a basketball season - long enough to outvote one bad night, short
   * enough that a real change of form still moves it. Shared so the team and player charts cannot
   * drift apart, and so the series can name its own window in its legend entry.
   */
  public static readonly TRAILING_WINDOW = 5;

  /**
   * Write a trailing mean of `readKey` onto each row as `writeKey`.
   *
   * A line through single-game results is mostly noise: one bad night drags it somewhere the team
   * never actually was, and joining those points implies a path between games that did not happen.
   * Keeping the games as marks and drawing this through them separates the two readings - where
   * they were on the night, and where the season is heading.
   *
   * Rows are expected in date order, and are written to in place, which is what lets recharts
   * plot the mean off the same row objects as the marks. Rows with no value are skipped rather
   * than counted as a zero, so a missed game does not pull the mean down - which is why the
   * usable rows are gathered first: `Arithmetic.rollingMean` carries its window total, so a gap
   * handed to it would poison every game after it.
   */
  public static trailingMean(
    rows: object[],
    readKey: string,
    writeKey: string,
    window: number = Chart.TRAILING_WINDOW,
  ): void {
    const played: object[] = [];
    const values: number[] = [];

    for (const row of rows) {
      const value = row[readKey];

      if (value === null || value === undefined || Number.isNaN(+value)) {
        continue;
      }

      played.push(row);
      values.push(+value);
    }

    const means = Arithmetic.rollingMean(values, window);

    for (let i = 0; i < played.length; i++) {
      played[i][writeKey] = Arithmetic.round(means[i], 2);
    }
  }

  /**
   * Pad a min/max pair outward into a y-axis domain.
   *
   * The padding is 5% of the *range*. Taking it from the sum (min + max) instead ties the padding
   * to the magnitude of the numbers rather than their spread, which is wrong in both directions:
   * elo sits near 1500 and got a 155 point pad that flattened the line into the middle of the
   * plot, while a stat centred on zero got a pad of nothing, or a negative one that clipped the
   * series.
   *
   * `padding` is that percentage. Pass a bigger one for a plot that needs to keep its edges clear
   * of something - it is taken before the rounding, so the ends stay numbers an axis can label.
   */
  public static getDomain(min: number | null, max: number | null, padding: number = Chart.PADDING): Domain | undefined {
    if (
      min === null ||
      max === null ||
      !Number.isFinite(min) ||
      !Number.isFinite(max)
    ) {
      return undefined;
    }

    // a flat series has no range to take a percentage of, so fall back to the magnitude of the
    // value itself, and to 1 when the value is zero too
    const buffer = ((max - min) || Math.abs(max) || 1) * padding;

    // the buffer sets the precision: rounding elo's 7.75 pad to whole numbers is right, while the
    // same rounding on yards per play spanning 5.1 - 5.4 collapses the domain to a flat [5, 5] and
    // draws nothing
    let decimals = 2;

    if (buffer >= 10) {
      decimals = 0;
    } else if (buffer >= 1) {
      decimals = 1;
    }

    return [Arithmetic.round(min - buffer, decimals), Arithmetic.round(max + buffer, decimals)];
  }

  /**
   * Pad a min/max pair outward by a flat amount rather than a percentage.
   *
   * For a chart whose lines all sit on a known scale - a conference's worth of elo, say - a fixed
   * pad keeps every conference's chart framed the same way, where a percentage would breathe with
   * whichever conference happened to be tightly bunched.
   */
  public static padDomain(min: number | null, max: number | null, pad: number): Domain | undefined {
    if (
      min === null ||
      max === null ||
      !Number.isFinite(min) ||
      !Number.isFinite(max)
    ) {
      return undefined;
    }

    return [min - pad, max + pad];
  }

  /**
   * Widen a domain so it always covers at least [min, max].
   *
   * Used to hold elo on a fixed frame, so the same climb looks the same size on every team's
   * chart instead of being rescaled to whatever that one team happened to do.
   */
  public static expandDomain(domain: Domain | undefined, min: number, max: number): Domain {
    if (!domain) {
      return [min, max];
    }

    return [Math.min(domain[0], min), Math.max(domain[1], max)];
  }

  /**
   * Track the running min and max of a series, ignoring the gaps.
   *
   * Callers feed this every candidate value for a date, including the conference and league
   * comparison lines, so the axis fits everything that is actually drawn.
   */
  public static extend(domain: [number | null, number | null], value: unknown): [number | null, number | null] {
    if (
      value === null ||
      value === undefined ||
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return domain;
    }

    const [min, max] = domain;

    return [
      min === null || value < min ? value : min,
      max === null || value > max ? value : max,
    ];
  }
}

export default Chart;
