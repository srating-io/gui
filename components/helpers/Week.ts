import { Dates } from '@esmalley/ts-utils';


export type CFBWeek = {
  /** Stable identifier: '0'...'15', 'champ', 'bowls', 'natty' */
  key: string;
  label: string;
  /** Every date in the season that falls in this bucket, ascending */
  dates: string[];
};

const MS_PER_DAY = 86400000;

/**
 * This class helps simplify the college football week logic
 *
 * Mirrors get_college_football_week() in sports-scraper/processors/processESPN.py, with week 0
 * split out of week 1. They are separate implementations because that one is python in another
 * repo, so a change to the week rule has to be made in both places.
 *
 * Nothing here reads the store or calls a hook, so the server surface and the client bar can both
 * use it.
 */
class Week {
  /**
   * Labor day, the first monday of september
   */
  public static getLaborDay(year: number): Date {
    const sept1 = Dates.parse(`${year}-09-01`);
    // 1 is monday; no offset when september opens on one
    const offset = (8 - sept1.getDay()) % 7;

    return Dates.add(sept1, offset, 'days');
  }

  /**
   * The first saturday of december. Whichever bucket holds it is championship week.
   */
  public static getFirstSaturdayOfDecember(year: number): Date {
    const dec1 = Dates.parse(`${year}-12-01`);
    // 6 is saturday
    const offset = (13 - dec1.getDay()) % 7;

    return Dates.add(dec1, offset, 'days');
  }

  /**
   * Whole days between two dates
   *
   * Math.round, not trunc: two local midnights seven days apart are 169 hours apart across a dst
   * change, and every cfb season crosses one in november. Dates.diff().days truncates, so it would
   * report 6 there and shift every late season week by one.
   */
  private static getDayDiff(from: Date | string, to: Date | string): number {
    const a = Dates.getStartOfDay(to).getTime();
    const b = Dates.getStartOfDay(from).getTime();

    return Math.round((a - b) / MS_PER_DAY);
  }

  /**
   * The week a date falls in, counting tuesday through monday buckets off labor day
   *
   * Week 1 is the tuesday to monday window ending on labor day, so a labor day monday night opener
   * lands in week 1. Anything earlier is week 0. Week 2 opens the tuesday after labor day.
   */
  public static getWeekNumber(date: Date | string, laborDay: Date): number {
    const delta = Week.getDayDiff(laborDay, date);

    if (delta <= 0) {
      return delta >= -6 ? 1 : 0;
    }

    return 2 + Math.floor((delta - 1) / 7);
  }

  /**
   * Group a season's game dates into labelled buckets
   *
   * The season's fall year comes from dates[0], which is in august or september. That is what makes
   * january bowl dates land in the right season instead of being measured off the wrong labor day.
   */
  public static getWeeks(dates: string[]): CFBWeek[] {
    if (!dates.length) {
      return [];
    }

    const year = Number(dates[0].slice(0, 4));

    if (!Number.isFinite(year) || !year) {
      return [];
    }

    const laborDay = Week.getLaborDay(year);
    const champNumber = Week.getWeekNumber(Week.getFirstSaturdayOfDecember(year), laborDay);

    const numbered: { [week: number]: string[] } = {};
    const postseason: string[] = [];

    for (let i = 0; i < dates.length; i++) {
      const week = Week.getWeekNumber(dates[i], laborDay);

      if (week > champNumber) {
        postseason.push(dates[i]);
        continue;
      }

      if (!(week in numbered)) {
        numbered[week] = [];
      }

      numbered[week].push(dates[i]);
    }

    const weeks: CFBWeek[] = [];
    const numbers = Object.keys(numbered).map((n) => Number(n)).sort((a, b) => a - b);

    for (let i = 0; i < numbers.length; i++) {
      const week = numbers[i];

      weeks.push({
        key: week === champNumber ? 'champ' : String(week),
        label: week === champNumber ? 'Champ Wk' : `Wk ${week}`,
        dates: numbered[week],
      });
    }

    // dates is ascending and the week number rises with it, so everything past championship week is
    // a contiguous tail: the last of it is the title game, the rest are bowls with the playoff
    // folded in
    if (postseason.length > 1) {
      weeks.push({
        key: 'bowls',
        label: 'Bowls',
        dates: postseason.slice(0, postseason.length - 1),
      });
    }

    if (postseason.length) {
      weeks.push({
        key: 'natty',
        label: 'Natty',
        dates: [postseason[postseason.length - 1]],
      });
    }

    return weeks;
  }

  /**
   * The bucket holding a date, or null
   */
  public static findWeekByDate(weeks: CFBWeek[], date: string | null): CFBWeek | null {
    if (!date) {
      return null;
    }

    for (let i = 0; i < weeks.length; i++) {
      if (weeks[i].dates.indexOf(date) > -1) {
        return weeks[i];
      }
    }

    return null;
  }

  /**
   * The bucket holding a date, or the nearest one when that date has no games
   */
  public static getClosestWeek(weeks: CFBWeek[], date: string | null): CFBWeek | null {
    if (!weeks.length) {
      return null;
    }

    const exact = Week.findWeekByDate(weeks, date);

    if (exact) {
      return exact;
    }

    if (!date) {
      return weeks[0];
    }

    let closest = weeks[0];
    let closestDistance = Infinity;

    for (let i = 0; i < weeks.length; i++) {
      for (let d = 0; d < weeks[i].dates.length; d++) {
        const distance = Math.abs(Week.getDayDiff(weeks[i].dates[d], date));

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = weeks[i];
        }
      }
    }

    return closest;
  }

  /**
   * The date range a bucket covers, for a tooltip
   */
  public static getRangeLabel(week: CFBWeek): string {
    if (!week.dates.length) {
      return '';
    }

    const first = Dates.format(Dates.parse(`${week.dates[0]}T12:00:00Z`), 'M j');
    const last = Dates.format(Dates.parse(`${week.dates[week.dates.length - 1]}T12:00:00Z`), 'M j');

    return first === last ? first : `${first} - ${last}`;
  }
}

export default Week;
